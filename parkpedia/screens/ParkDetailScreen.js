// 公園詳細画面
// 公園の詳細情報とレビュー一覧を表示

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../firebaseConfig';
import AdBannerPlaceholder from '../components/AdBannerPlaceholder';

export default function ParkDetailScreen({ route, navigation }) {
  const { parkId, park: initialPark } = route.params;
  
  // 状態管理
  const [park, setPark] = useState(initialPark || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImageCategory, setSelectedImageCategory] = useState('全て');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [isWantToVisit, setIsWantToVisit] = useState(false);
  
  const IMAGE_CATEGORIES = ['全て', '遊具', '設備', '風景', 'その他'];

  useEffect(() => {
    fetchParkDetails();
    fetchReviews();
  }, [parkId]);

  useEffect(() => {
    if (park) {
      checkFavoriteStatus();
      checkVisitedStatus();
      checkWantToVisitStatus();
      saveToRecentParks();
    }
  }, [park]);

  // 最近見た公園に保存
  const saveToRecentParks = async () => {
    if (!park) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const recentParksKey = `recentParks_${currentUser.uid}`;
      const recentParksJson = await AsyncStorage.getItem(recentParksKey);
      let recentParks = recentParksJson ? JSON.parse(recentParksJson) : [];

      // 既に存在する場合は削除
      recentParks = recentParks.filter(p => p.id !== parkId);
      
      // 先頭に追加
      recentParks.unshift({
        id: parkId,
        name: park.name,
        mainImage: park.mainImage,
        address: park.address,
        viewedAt: new Date().toISOString(),
      });

      // 最大20件まで保持
      recentParks = recentParks.slice(0, 20);

      await AsyncStorage.setItem(recentParksKey, JSON.stringify(recentParks));
    } catch (error) {
      console.error('最近見た公園の保存エラー:', error);
    }
  };

  // お気に入り状態を確認
  const checkFavoriteStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'favorite')
      );
      const snapshot = await getDocs(q);
      setIsFavorite(!snapshot.empty);
    } catch (error) {
      console.error('お気に入り状態確認エラー:', error);
    }
  };

  // 行った状態を確認
  const checkVisitedStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'visited')
      );
      const snapshot = await getDocs(q);
      setIsVisited(!snapshot.empty);
    } catch (error) {
      console.error('行った状態確認エラー:', error);
    }
  };

  // 行ってみたい状態を確認
  const checkWantToVisitStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'wantToVisit')
      );
      const snapshot = await getDocs(q);
      setIsWantToVisit(!snapshot.empty);
    } catch (error) {
      console.error('行ってみたい状態確認エラー:', error);
    }
  };

  // お気に入りを追加/削除
  const toggleFavorite = async () => {
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
        setIsFavorite(true);
      } else {
        // 削除
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
      Alert.alert('エラー', 'お気に入りの操作に失敗しました');
    }
  };

  // 行ったを追加/削除
  const toggleVisited = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ログインが必要です', 'チェックイン機能を使用するにはログインが必要です');
        return;
      }

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'visited')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // 追加
        await addDoc(favoritesRef, {
          userId: currentUser.uid,
          parkId: parkId,
          type: 'visited',
          visitedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        setIsVisited(true);
        // 行った場合は「行ってみたい」を削除
        if (isWantToVisit) {
          const wantToVisitQ = query(
            favoritesRef,
            where('userId', '==', currentUser.uid),
            where('parkId', '==', parkId),
            where('type', '==', 'wantToVisit')
          );
          const wantToVisitSnapshot = await getDocs(wantToVisitQ);
          wantToVisitSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
          setIsWantToVisit(false);
        }
      } else {
        // 削除
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsVisited(false);
      }
    } catch (error) {
      console.error('行った操作エラー:', error);
      Alert.alert('エラー', 'チェックインの操作に失敗しました');
    }
  };

  // 行ってみたいを追加/削除
  const toggleWantToVisit = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ログインが必要です', 'この機能を使用するにはログインが必要です');
        return;
      }

      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'wantToVisit')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // 追加
        await addDoc(favoritesRef, {
          userId: currentUser.uid,
          parkId: parkId,
          type: 'wantToVisit',
          createdAt: serverTimestamp(),
        });
        setIsWantToVisit(true);
      } else {
        // 削除
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsWantToVisit(false);
      }
    } catch (error) {
      console.error('行ってみたい操作エラー:', error);
      Alert.alert('エラー', '操作に失敗しました');
    }
  };

  // 公園の詳細情報を取得
  const fetchParkDetails = async () => {
    try {
      const parkRef = doc(db, 'parks', parkId);
      const parkSnap = await getDoc(parkRef);
      
      if (parkSnap.exists()) {
        setPark({ id: parkSnap.id, ...parkSnap.data() });
      }
    } catch (error) {
      console.error('公園詳細の取得エラー:', error);
      Alert.alert('エラー', '公園情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // レビュー一覧を取得
  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('parkId', '==', parkId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('レビューの取得エラー:', error);
    }
  };

  // 平均評価を計算
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // 画像をカテゴリでフィルタリング
  const getFilteredImages = () => {
    if (!park || !park.images || park.images.length === 0) {
      return [];
    }
    
    if (selectedImageCategory === '全て') {
      return park.images;
    }
    
    // カテゴリ情報がある場合はフィルタリング
    // 現時点では全ての画像を表示（将来的にカテゴリ情報を追加可能）
    return park.images;
  };

  // 設備・遊具のタグを取得
  const getAllTags = () => {
    const tags = [];
    
    // 対象年齢
    if (park.tags && park.tags.age && Array.isArray(park.tags.age)) {
      park.tags.age.forEach(age => tags.push(age));
    }
    
    // 遊具
    if (park.tags && park.tags.equipment && Array.isArray(park.tags.equipment)) {
      park.tags.equipment.forEach(eq => tags.push(eq));
    }
    
    // 設備
    if (park.facilities && Array.isArray(park.facilities)) {
      park.facilities.forEach(fac => tags.push(fac));
    }
    
    return tags;
  };

  // 地図HTMLを生成
  const getMapHtml = () => {
    let mapSrc = '';
    if (park.latitude && park.longitude) {
      mapSrc = `https://maps.google.com/maps?q=${park.latitude},${park.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } else if (park.address) {
      // 住所から地図を表示
      const encodedAddress = encodeURIComponent(park.address);
      mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    
    if (!mapSrc) return null;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: 0; }
          </style>
        </head>
        <body>
          <iframe
            src="${mapSrc}"
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </body>
      </html>
    `;
  };

  // 地図を拡大表示
  const openMapInBrowser = () => {
    if (park.latitude && park.longitude) {
      const url = `https://www.google.com/maps?q=${park.latitude},${park.longitude}`;
      Linking.openURL(url);
    } else if (park.address) {
      const encodedAddress = encodeURIComponent(park.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  // 投稿者かどうかを確認
  const isOwner = () => {
    const currentUser = auth.currentUser;
    return currentUser && park && park.userId === currentUser.uid;
  };

  // 公園を削除
  const handleDeletePark = () => {
    Alert.alert(
      '削除の確認',
      'この公園を削除しますか？\n関連するレビューもすべて削除されます。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              // 関連するレビューを削除
              const reviewsRef = collection(db, 'reviews');
              const q = query(reviewsRef, where('parkId', '==', parkId));
              const querySnapshot = await getDocs(q);
              
              const deletePromises = [];
              querySnapshot.forEach((reviewDoc) => {
                deletePromises.push(deleteDoc(doc(db, 'reviews', reviewDoc.id)));
              });

              // レビューを削除
              await Promise.all(deletePromises);

              // 公園を削除
              const parkRef = doc(db, 'parks', parkId);
              await deleteDoc(parkRef);

              Alert.alert(
                '削除完了',
                '公園を削除しました',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('Home');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('削除エラー:', error);
              Alert.alert('エラー', `削除に失敗しました: ${error.message}`);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // レビューカードのレンダリング
  const renderReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewRating}>
          {'⭐'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </Text>
        <Text style={styles.reviewDate}>
          {item.createdAt?.toDate?.().toLocaleDateString('ja-JP') || '日付不明'}
        </Text>
      </View>
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
      {item.userName && (
        <Text style={styles.reviewUserName}>- {item.userName}</Text>
      )}
    </View>
  );

  if (loading || !park) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const filteredImages = getFilteredImages();
  const allTags = getAllTags();
  const mapHtml = getMapHtml();

  return (
    <View style={styles.container}>
    <ScrollView style={styles.scrollView}>
      {/* 公園基本情報 */}
      <View style={styles.parkInfo}>
        <View style={styles.parkHeader}>
          <Text style={styles.parkName} numberOfLines={2}>{park.name}</Text>
          {isOwner() && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePark}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Text style={styles.deleteButtonText}>削除</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* アクションボタン */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
            onPress={toggleFavorite}
          >
            <Text style={styles.actionButtonIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text style={[styles.actionButtonText, isFavorite && styles.actionButtonTextActive]}>
              お気に入り
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isVisited && styles.actionButtonActive]}
            onPress={toggleVisited}
          >
            <Text style={styles.actionButtonIcon}>{isVisited ? '✅' : '☑️'}</Text>
            <Text style={[styles.actionButtonText, isVisited && styles.actionButtonTextActive]}>
              行った
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isWantToVisit && styles.actionButtonActive]}
            onPress={toggleWantToVisit}
          >
            <Text style={styles.actionButtonIcon}>{isWantToVisit ? '📌' : '📍'}</Text>
            <Text style={[styles.actionButtonText, isWantToVisit && styles.actionButtonTextActive]}>
              行ってみたい
            </Text>
          </TouchableOpacity>
        </View>
        {park.address && (
          <Text style={styles.parkAddress}>📍 {park.address}</Text>
        )}
        {park.description && (
          <Text style={styles.parkDescription}>{park.description}</Text>
        )}
        
        {/* 評価情報 */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>平均評価:</Text>
          <Text style={styles.ratingValue}>
            ⭐ {calculateAverageRating()} ({reviews.length}件のレビュー)
          </Text>
        </View>
      </View>

      {/* 画像ギャラリー */}
      {filteredImages.length > 0 && (
        <View style={styles.imageSection}>
          {/* カテゴリタブ */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
            {IMAGE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedImageCategory === category && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedImageCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedImageCategory === category && styles.categoryTabTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* 画像リスト */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
            {filteredImages.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 設備・遊具と地図 */}
      <View style={styles.facilitiesAndMapSection}>
        <View style={styles.facilitiesAndMapRow}>
          <View style={styles.facilitiesSection}>
            <Text style={styles.sectionTitle}>設備・遊具</Text>
            {allTags.length > 0 ? (
              <View style={styles.tagsContainer}>
                {allTags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>設備・遊具の情報がありません</Text>
            )}
          </View>

          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>地図</Text>
            {mapHtml ? (
              <View style={styles.mapContainer}>
                <WebView
                  source={{ html: mapHtml }}
                  style={styles.map}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
                <TouchableOpacity
                  style={styles.expandMapButton}
                  onPress={openMapInBrowser}
                >
                  <Text style={styles.expandMapButtonText}>拡大地図を表示</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.emptyText}>地図情報がありません</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* レビュー一覧 */}
      <View style={styles.reviewsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>レビュー({reviews.length}件)</Text>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyReviewsText}>
              まだレビューがありません。最初のレビューを書いてみませんか？
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReviewCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
      
      {/* 下部のスペース確保（固定ボタンと広告のスペース） */}
      <View style={{ height: 140 }} />
    </ScrollView>

    {/* 🎯 レビュー投稿ボタン（画面下部固定） */}
    <TouchableOpacity
      style={styles.fixedAddReviewButton}
      onPress={() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert(
            'ログインが必要です',
            'レビューを投稿するにはログインが必要です。',
            [
              {
                text: 'ログイン',
                onPress: () => navigation.navigate('Login'),
              },
              {
                text: 'キャンセル',
                style: 'cancel',
              },
            ]
          );
        } else {
          navigation.navigate('AddReview', { parkId, parkName: park.name });
        }
      }}
    >
      <Text style={styles.fixedAddReviewButtonText}>レビューを投稿する</Text>
    </TouchableOpacity>

    {/* 🎯 広告プレースホルダー（画面下部固定） */}
    <AdBannerPlaceholder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  parkInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  parkHeader: {
    marginBottom: 12,
  },
  parkName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: -0.3,
    marginBottom: 12,
    lineHeight: 34,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtonTextActive: {
    color: '#047857',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  parkAddress: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  parkDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ratingLabel: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 10,
  },
  ratingValue: {
    fontSize: 17,
    color: '#059669',
    fontWeight: '600',
  },
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: -0.3,
  },
  emptyReviews: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 15,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryTabs: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryTabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageGallery: {
    paddingHorizontal: 20,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  facilitiesAndMapSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 12,
  },
  facilitiesAndMapRow: {
    flexDirection: 'column',
  },
  facilitiesSection: {
    marginBottom: 24,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  mapSection: {
    marginTop: 24,
  },
  mapContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  expandMapButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  expandMapButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  fixedAddReviewButton: {
    position: 'absolute',
    bottom: 50, // 広告の上に配置
    left: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedAddReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});


