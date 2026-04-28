// ホーム画面
// Firestoreから公園リストを取得して表示、検索機能付き

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { fetchPaginatedData, PAGINATION_CONFIG } from '../utils/pagination';
import { db, auth } from '../firebaseConfig';
import CustomHeader from '../components/CustomHeader';
import FilterDrawer from '../components/FilterDrawer';
import ParkMapView from '../components/ParkMapView';
import AdBanner from '../components/AdBanner';
import { AD_ENABLED } from '../adConfig';
import * as Location from 'expo-location';
import { handleError } from '../utils/errorHandler';

export default function HomeScreen({ navigation }) {
  // 状態管理
  const [parks, setParks] = useState([]);
  const [filteredParks, setFilteredParks] = useState([]);
  const [recommendedParks, setRecommendedParks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    age: [],
    equipment: [],
    facilities: [],
    ground: [],
    scenery: [],
    sports: [],
    distance: [],
    rating: [],
  });
  // 子どもプロフィール自動フィルター
  const [autoAgeFilterApplied, setAutoAgeFilterApplied] = useState(false);

  // ページネーション用の状態
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ビュー切替状態
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // 距離を計算する関数（ハーバーサイン公式）
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // 地球の半径（km）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離（km）
  }, []);

  // 現在地を取得
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // 位置情報の権限をリクエスト
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        // 現在地を取得
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        if (__DEV__) console.error('位置情報の取得エラー:', error);
      }
    };

    getCurrentLocation();
  }, []);

  // おすすめ公園を計算
  const calculateRecommendedParks = useCallback(
    (parksData, currentLocation) => {
      if (parksData.length === 0) {
        return [];
      }

      try {
        // 公園データに距離を追加
        const parksWithDistance = parksData.map(park => {
          let distance = null;
          if (currentLocation && park.latitude && park.longitude) {
            distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              park.latitude,
              park.longitude
            );
          }
          return { ...park, calculatedDistance: distance };
        });

        // スコアを計算（評価、距離、新しさを考慮）
        const scoredParks = parksWithDistance.map(park => {
          let score = 0;

          // 評価スコア（0-5点）
          score += (park.rating || 0) * 1.0;

          // 距離スコア（近いほど高い、最大3点）
          if (park.calculatedDistance !== null) {
            if (park.calculatedDistance < 1) {
              score += 3; // 1km以内
            } else if (park.calculatedDistance < 3) {
              score += 2; // 3km以内
            } else if (park.calculatedDistance < 5) {
              score += 1; // 5km以内
            }
          }

          // 新しさスコア（新しいほど高い、最大2点）
          if (park.createdAt) {
            const parkTime = park.createdAt.seconds || park.createdAt.toMillis?.() / 1000 || 0;
            const now = Date.now() / 1000;
            const daysSinceCreation = (now - parkTime) / (24 * 60 * 60);
            if (daysSinceCreation < 30) {
              score += 2; // 30日以内
            } else if (daysSinceCreation < 90) {
              score += 1; // 90日以内
            }
          }

          return { ...park, recommendationScore: score };
        });

        // スコアでソートして上位3件を返す
        return scoredParks
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 3);
      } catch (error) {
        if (__DEV__) console.error('おすすめ計算エラー:', error);
        // エラー時は評価の高い公園を返す
        return parksData.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
      }
    },
    [calculateDistance]
  );

  // 配列を正規化するヘルパー関数（データ取得時用）
  const normalizeArrayData = useCallback(data => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.filter(item => item && typeof item === 'string' && item.trim() !== '');
    }
    if (typeof data === 'string') {
      try {
        const trimmed = data.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed)
            ? parsed.filter(item => item && typeof item === 'string' && item.trim() !== '')
            : [];
        } else {
          return trimmed
            .split(',')
            .map(f => f.trim().replace(/^\[|\]$|"/g, ''))
            .filter(f => f !== '');
        }
      } catch {
        return data
          .split(',')
          .map(f => f.trim().replace(/^\[|\]$|"/g, ''))
          .filter(f => f !== '');
      }
    }
    return [];
  }, []);

  // データを正規化する関数
  const normalizeParkData = useCallback(
    parkData => {
      // parkData が doc 形式の場合
      const data = typeof parkData.data === 'function' ? parkData.data() : parkData;
      const id = parkData.id || data.id;

      // facilitiesを配列として正規化
      const normalizedFacilities = normalizeArrayData(data.facilities);

      // tagsも正規化
      const normalizedTags = {};
      if (data.tags) {
        if (data.tags.equipment) {
          normalizedTags.equipment = normalizeArrayData(data.tags.equipment);
        }
        if (data.tags.age) {
          normalizedTags.age = normalizeArrayData(data.tags.age);
        }
        if (data.tags.ground) {
          normalizedTags.ground = normalizeArrayData(data.tags.ground);
        }
        if (data.tags.scenery) {
          normalizedTags.scenery = normalizeArrayData(data.tags.scenery);
        }
        if (data.tags.sports) {
          normalizedTags.sports = normalizeArrayData(data.tags.sports);
        }
      }

      return {
        id,
        ...data,
        facilities: normalizedFacilities,
        tags:
          Object.keys(normalizedTags).length > 0 ? { ...data.tags, ...normalizedTags } : data.tags,
      };
    },
    [normalizeArrayData]
  );

  // Firestoreから公園データを取得する関数（ページネーション対応）
  const fetchParks = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLastVisible(null);
        setHasMore(true);
      } else {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
      }

      const parksRef = collection(db, 'parks');
      // サーバー側でソート（createdAt の降順）
      const baseQuery = query(parksRef, orderBy('createdAt', 'desc'));

      // ページネーション付きデータ取得
      const result = await fetchPaginatedData(
        baseQuery,
        reset ? null : lastVisible,
        PAGINATION_CONFIG.ITEMS_PER_PAGE
      );

      // データを正規化
      const normalizedData = result.data.map(parkData => {
        // fetchPaginatedData は既に { id, ...data } 形式で返す
        return normalizeParkData(parkData);
      });

      if (reset) {
        setParks(normalizedData);
        setFilteredParks(normalizedData);
      } else {
        setParks(prev => [...prev, ...normalizedData]);
        setFilteredParks(prev => [...prev, ...normalizedData]);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'HomeScreen.fetchParks', Alert.alert);
    } finally {
      setLoading(false);
    }
  }, []);

  // 公園データの取得（初回のみ）
  useEffect(() => {
    fetchParks(true); // 初回はリセットして取得
  }, []); // 空の依存配列で初回のみ実行

  // 子どもプロフィールの自動フィルター適用（初回のみ）
  useEffect(() => {
    const applyChildrenAgeFilter = async () => {
      if (autoAgeFilterApplied) return;
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const children = userDocSnap.data().children || [];
          if (children.length > 0) {
            setFilters(prev => ({ ...prev, age: children }));
          }
        }
      } catch (error) {
        if (__DEV__) console.error('子どもプロフィール読み込みエラー:', error);
      }
      setAutoAgeFilterApplied(true);
    };

    applyChildrenAgeFilter();
  }, [autoAgeFilterApplied]);

  // 画面がフォーカスされたときにデータを再取得（レビュー投稿後などに評価を反映）
  useFocusEffect(
    useCallback(() => {
      fetchParks(true); // リセットして再取得
    }, [fetchParks])
  );

  // おすすめ公園を再計算（parksまたはuserLocationが変更されたとき）
  useEffect(() => {
    if (parks.length > 0) {
      const recommended = calculateRecommendedParks(parks, userLocation);
      setRecommendedParks(recommended);
    }
  }, [parks, userLocation, calculateRecommendedParks]);

  // 検索クエリとフィルターが変更されたときにフィルタリング
  useEffect(() => {
    let filtered = parks;

    // 検索クエリでフィルタリング
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        park =>
          park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          park.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // フィルターでフィルタリング
    const hasFilters =
      filters.age.length > 0 ||
      filters.equipment.length > 0 ||
      filters.facilities.length > 0 ||
      filters.ground.length > 0 ||
      filters.scenery.length > 0 ||
      filters.sports.length > 0 ||
      filters.distance.length > 0 ||
      filters.rating.length > 0;

    if (hasFilters) {
      filtered = filtered.filter(park => {
        // 対象年齢のフィルター
        if (filters.age.length > 0) {
          const parkAges = park.tags?.age || [];
          const hasMatchingAge = filters.age.some(age => parkAges.includes(age));
          if (!hasMatchingAge) return false;
        }

        // 遊具のフィルター
        if (filters.equipment.length > 0) {
          const parkEquipment = park.tags?.equipment || park.facilities || [];
          const hasMatchingEquipment = filters.equipment.some(eq => parkEquipment.includes(eq));
          if (!hasMatchingEquipment) return false;
        }

        // 設備のフィルター
        if (filters.facilities.length > 0) {
          const parkFacilities = park.facilities || [];
          const hasMatchingFacility = filters.facilities.some(fac => parkFacilities.includes(fac));
          if (!hasMatchingFacility) return false;
        }

        // 地面のフィルター
        if (filters.ground.length > 0) {
          const parkGround = park.tags?.ground || [];
          const hasMatchingGround = filters.ground.some(g => parkGround.includes(g));
          if (!hasMatchingGround) return false;
        }

        // 景色・自然のフィルター
        if (filters.scenery.length > 0) {
          const parkScenery = park.tags?.scenery || [];
          const hasMatchingScenery = filters.scenery.some(s => parkScenery.includes(s));
          if (!hasMatchingScenery) return false;
        }

        // スポーツ施設のフィルター
        if (filters.sports.length > 0) {
          const parkSports = park.tags?.sports || [];
          const hasMatchingSports = filters.sports.some(s => parkSports.includes(s));
          if (!hasMatchingSports) return false;
        }

        // 距離のフィルター
        if (filters.distance.length > 0 && userLocation && park.latitude && park.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            park.latitude,
            park.longitude
          );

          const distanceFilter = filters.distance[0]; // 単一選択なので最初の要素
          let maxDistance = null;

          if (distanceFilter === '500m以内') {
            maxDistance = 0.5;
          } else if (distanceFilter === '1km以内') {
            maxDistance = 1;
          } else if (distanceFilter === '5km以内') {
            maxDistance = 5;
          }

          if (maxDistance !== null && distance > maxDistance) {
            return false;
          }
        } else if (
          filters.distance.length > 0 &&
          (!userLocation || !park.latitude || !park.longitude)
        ) {
          // 距離フィルターが選択されているが、現在地または公園の位置情報がない場合は除外
          return false;
        }

        // 評価のフィルター
        if (filters.rating.length > 0) {
          const ratingFilter = filters.rating[0]; // 単一選択なので最初の要素
          const parkRating = park.rating || 0;

          if (ratingFilter === '⭐4.5以上' && parkRating < 4.5) {
            return false;
          } else if (ratingFilter === '⭐4.0以上' && parkRating < 4.0) {
            return false;
          }
        }

        return true;
      });
    }

    setFilteredParks(filtered);
  }, [searchQuery, parks, filters, userLocation, calculateDistance]);

  // 星評価のレンダリング
  const renderStars = rating => {
    const fullStars = Math.floor(rating || 0);
    const emptyStars = 5 - fullStars;
    if (fullStars === 0 && emptyStars === 5) {
      return (
        <View style={styles.starContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={`empty-${i}`} style={styles.starEmpty}>
              ☆
            </Text>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.starContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.star}>
            ⭐
          </Text>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>
            ☆
          </Text>
        ))}
      </View>
    );
  };

  // 配列を正規化するヘルパー関数
  const normalizeArray = data => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.filter(item => item && typeof item === 'string' && item.trim() !== '');
    }
    if (typeof data === 'string') {
      try {
        const trimmed = data.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed)
            ? parsed.filter(item => item && typeof item === 'string' && item.trim() !== '')
            : [];
        } else {
          return trimmed
            .split(',')
            .map(f => f.trim().replace(/^\[|\]$|"/g, ''))
            .filter(f => f !== '');
        }
      } catch {
        return data
          .split(',')
          .map(f => f.trim().replace(/^\[|\]$|"/g, ''))
          .filter(f => f !== '');
      }
    }
    return [];
  };

  // お気に入りを追加/削除
  const toggleFavorite = async (parkId, e) => {
    e.stopPropagation();
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ログインが必要です', 'お気に入り機能を使用するにはログインが必要です');
        return;
      }

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'favorite')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // 追加
        await addDoc(favoritesRef, {
          userId: currentUser.uid,
          parkId: parkId,
          type: 'favorite',
          createdAt: serverTimestamp(),
        });
      } else {
        // 削除 - すべての削除処理が完了するまで待機
        const deletePromises = [];
        snapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
      }
    } catch (error) {
      if (__DEV__) console.error('お気に入り操作エラー:', error);
      Alert.alert('エラー', 'お気に入りの操作に失敗しました。もう一度お試しください。');
    }
  };

  // お気に入り状態を確認
  const checkIsFavorite = async parkId => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'favorite')
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch {
      return false;
    }
  };

  // 公園カードコンポーネント
  const ParkCard = React.memo(({ item, index, onToggleFavorite, onPress }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const averageRating = item.rating || 0;
    const reviewCount = item.reviewCount || 0;

    // お気に入り状態を確認
    useEffect(() => {
      let isMounted = true;
      checkIsFavorite(item.id).then(result => {
        if (isMounted) {
          setIsFavorite(result);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [item.id]);

    // すべてのタグを収集（facilities、tags.equipment、tags.age）
    const allTags = [];

    // facilitiesを追加
    const facilities = normalizeArray(item.facilities);
    allTags.push(...facilities);

    // tags.equipmentを追加
    if (item.tags && item.tags.equipment) {
      const equipment = normalizeArray(item.tags.equipment);
      allTags.push(...equipment);
    }

    // tags.ageを追加（最初の1つだけ）
    if (item.tags && item.tags.age && Array.isArray(item.tags.age) && item.tags.age.length > 0) {
      allTags.push(item.tags.age[0]);
    }

    // 重複を削除
    const uniqueTags = [...new Set(allTags)];

    const handleFavoritePress = async e => {
      e.stopPropagation();
      await onToggleFavorite(item.id, e);
      setIsFavorite(!isFavorite);
    };

    return (
      <TouchableOpacity
        style={styles.parkCard}
        onPress={() => onPress(item)}
        testID={`park-card-${index}`}
        accessible={true}
        accessibilityLabel={`park-card-${index}`}
        accessibilityRole="button"
      >
        {item.mainImage && (
          <View style={styles.parkImageContainer}>
            <Image source={{ uri: item.mainImage }} style={styles.parkImage} />
            <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
              <Text style={styles.favoriteButtonIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.parkCardContent}>
          <Text style={styles.parkName}>{String(item.name || '名前なし')}</Text>
          <View style={styles.ratingRow}>
            {renderStars(averageRating)}
            <Text style={styles.ratingText}>
              {averageRating.toFixed(1)} ({reviewCount}件)
            </Text>
          </View>
          {item.address && <Text style={styles.parkDistance}>{String(item.address)}</Text>}
          {uniqueTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {uniqueTags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{String(tag)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  });

  // 公園カードのレンダリング
  const renderParkCard = ({ item, index }) => (
    <ParkCard
      item={item}
      index={index}
      onToggleFavorite={toggleFavorite}
      onPress={park => navigation.navigate('ParkDetail', { parkId: park.id, park })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        navigation={navigation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentScreen="search"
        onMenuPress={() => setFilterDrawerVisible(true)}
      />
      <FilterDrawer
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* ビュー切替タブ */}
      {Platform.OS !== 'web' && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text
              style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}
            >
              リスト
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Text
              style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}
            >
              マップ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'map' && Platform.OS !== 'web' ? (
        <ParkMapView
          parks={filteredParks}
          userLocation={userLocation}
          onParkPress={park => navigation.navigate('ParkDetail', { parkId: park.id, park })}
        />
      ) : (
        /* 公園リスト */
        <FlatList
          testID="park-list"
          accessible={true}
          accessibilityLabel="park-list"
          accessibilityRole="list"
          data={filteredParks}
          renderItem={renderParkCard}
          keyExtractor={item => item.id || item.name || 'unknown'}
          contentContainerStyle={styles.listContainer}
          numColumns={1}
          onEndReached={() => {
            // ページネーション: 最後までスクロールしたら次のページを読み込む
            if (hasMore && !loading && !loadingMore) {
              fetchParks(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <>
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.loadingMoreText}>読み込み中...</Text>
                </View>
              )}
              {AD_ENABLED && <AdBanner />}
            </>
          }
          ListHeaderComponent={
            <>
              {/* おすすめ公園 */}
              {recommendedParks.length > 0 && (
                <View style={styles.recommendedSection}>
                  <Text style={styles.recommendedTitle}>おすすめ</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recommendedScroll}
                  >
                    {recommendedParks.map(park => {
                      const averageRating = park.rating || 0;
                      const reviewCount = park.reviewCount || 0;
                      return (
                        <TouchableOpacity
                          key={park.id}
                          style={styles.recommendedCard}
                          onPress={() =>
                            navigation.navigate('ParkDetail', { parkId: park.id, park })
                          }
                        >
                          {park.mainImage && (
                            <Image
                              source={{ uri: park.mainImage }}
                              style={styles.recommendedImage}
                            />
                          )}
                          <View style={styles.recommendedContent}>
                            <Text style={styles.recommendedName} numberOfLines={1}>
                              {String(park.name || '名前なし')}
                            </Text>
                            <View style={styles.recommendedRating}>
                              {renderStars(averageRating)}
                              <Text style={styles.recommendedRatingText}>
                                {averageRating.toFixed(1)} ({reviewCount}件)
                              </Text>
                            </View>
                            {park.address && (
                              <Text style={styles.recommendedAddress} numberOfLines={1}>
                                {String(park.address)}
                              </Text>
                            )}
                            {park.calculatedDistance !== null &&
                              park.calculatedDistance !== undefined && (
                                <Text style={styles.recommendedDistance}>
                                  📍{' '}
                                  {park.calculatedDistance < 1
                                    ? `${Math.round(park.calculatedDistance * 1000)}m`
                                    : `${park.calculatedDistance.toFixed(1)}km`}
                                </Text>
                              )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* 適用中のフィルター */}
              {(filters.age.length > 0 ||
                filters.equipment.length > 0 ||
                filters.facilities.length > 0 ||
                filters.ground.length > 0 ||
                filters.scenery.length > 0 ||
                filters.sports.length > 0 ||
                filters.distance.length > 0 ||
                filters.rating.length > 0) && (
                <View style={styles.activeFiltersSection}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.activeFiltersScroll}
                  >
                    {filters.age.map(filter => (
                      <View key={`age-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              age: filters.age.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.equipment.map(filter => (
                      <View key={`equipment-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              equipment: filters.equipment.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.facilities.map(filter => (
                      <View key={`facilities-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              facilities: filters.facilities.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.ground.map(filter => (
                      <View key={`ground-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              ground: filters.ground.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.scenery.map(filter => (
                      <View key={`scenery-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              scenery: filters.scenery.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.sports.map(filter => (
                      <View key={`sports-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              sports: filters.sports.filter(f => f !== filter),
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.distance.map(filter => (
                      <View key={`distance-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              distance: [],
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {filters.rating.map(filter => (
                      <View key={`rating-${filter}`} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{filter}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({
                              ...filters,
                              rating: [],
                            });
                          }}
                          style={styles.filterChipClose}
                        >
                          <Text style={styles.filterChipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? '検索結果が見つかりませんでした' : '公園がまだ登録されていません'}
              </Text>
            </View>
          }
        />
      )}

      {/* 公園追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // ログインチェック
          const currentUser = auth.currentUser;
          if (currentUser) {
            // ログイン済みの場合は公園追加画面に遷移
            navigation.navigate('AddPark');
          } else {
            // 未ログインの場合はアラートを表示してログイン画面に遷移
            Alert.alert('ログインが必要です', '公園を追加するにはログインが必要です。', [
              {
                text: 'キャンセル',
                style: 'cancel',
              },
              {
                text: 'ログイン',
                onPress: () => navigation.navigate('Login'),
              },
            ]);
          }
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBF8',
  },
  loadingText: {
    marginTop: 14,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  recommendedSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 14,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  recommendedScroll: {
    paddingHorizontal: 20,
  },
  recommendedCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 14,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  recommendedImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#E8F5EE',
  },
  recommendedContent: {
    padding: 14,
  },
  recommendedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  recommendedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendedRatingText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  recommendedAddress: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  recommendedDistance: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 6,
  },
  activeFiltersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  activeFiltersScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
  },
  filterChipText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
    marginRight: 8,
  },
  filterChipClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipCloseText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  listContainer: {
    padding: 20,
    paddingTop: 12,
  },
  parkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  parkImageContainer: {
    position: 'relative',
    width: '100%',
  },
  parkImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8F5EE',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  favoriteButtonIcon: {
    fontSize: 18,
  },
  parkCardContent: {
    padding: 20,
  },
  parkName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 8,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 14,
  },
  starEmpty: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  parkDistance: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0,
  },
  tagText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 74,
    right: 24,
    backgroundColor: '#10B981',
    borderRadius: 18,
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  loadingMoreContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5FBF8',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    padding: 3,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
});
