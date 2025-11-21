// マイページ画面
// お気に入り、行ってみたいリスト、バッジ、レビューを表示

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import CustomHeader from '../components/CustomHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyPageScreen({ navigation, route }) {
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [wantToVisitParks, setWantToVisitParks] = useState([]);
  const [visitedParks, setVisitedParks] = useState([]);
  const [recentParks, setRecentParks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('ログインが必要です', 'マイページを表示するにはログインが必要です', [
        {
          text: 'ログイン',
          onPress: () => navigation.navigate('Login'),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [navigation]);

  // データ取得
  const fetchMyPageData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // お気に入り公園を取得
      const favoritesRef = collection(db, 'favorites');
      const favoritesQuery = query(favoritesRef, where('userId', '==', currentUser.uid), where('type', '==', 'favorite'));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      
      const favoriteParkIds = [];
      favoritesSnapshot.forEach((doc) => {
        favoriteParkIds.push(doc.data().parkId);
      });

      const favoriteParksData = [];
      for (const parkId of favoriteParkIds) {
        const parkRef = doc(db, 'parks', parkId);
        const parkSnap = await getDoc(parkRef);
        if (parkSnap.exists()) {
          favoriteParksData.push({ id: parkSnap.id, ...parkSnap.data() });
        }
      }
      setFavoriteParks(favoriteParksData);

      // 行ってみたいリストを取得
      const wantToVisitQuery = query(favoritesRef, where('userId', '==', currentUser.uid), where('type', '==', 'wantToVisit'));
      const wantToVisitSnapshot = await getDocs(wantToVisitQuery);
      
      const wantToVisitParkIds = [];
      wantToVisitSnapshot.forEach((doc) => {
        wantToVisitParkIds.push(doc.data().parkId);
      });

      const wantToVisitParksData = [];
      for (const parkId of wantToVisitParkIds) {
        const parkRef = doc(db, 'parks', parkId);
        const parkSnap = await getDoc(parkRef);
        if (parkSnap.exists()) {
          wantToVisitParksData.push({ id: parkSnap.id, ...parkSnap.data() });
        }
      }
      setWantToVisitParks(wantToVisitParksData);

      // 行った公園を取得
      const visitedQuery = query(favoritesRef, where('userId', '==', currentUser.uid), where('type', '==', 'visited'));
      const visitedSnapshot = await getDocs(visitedQuery);
      
      const visitedParkIds = [];
      visitedSnapshot.forEach((doc) => {
        visitedParkIds.push(doc.data().parkId);
      });

      const visitedParksData = [];
      for (const parkId of visitedParkIds) {
        const parkRef = doc(db, 'parks', parkId);
        const parkSnap = await getDoc(parkRef);
        if (parkSnap.exists()) {
          visitedParksData.push({ id: parkSnap.id, ...parkSnap.data() });
        }
      }
      setVisitedParks(visitedParksData);

      // 最近見た公園を取得
      const recentParksKey = `recentParks_${currentUser.uid}`;
      const recentParksJson = await AsyncStorage.getItem(recentParksKey);
      const recentParksData = recentParksJson ? JSON.parse(recentParksJson) : [];
      
      // 最近見た公園のIDから公園データを取得
      const recentParksWithData = [];
      for (const recentPark of recentParksData.slice(0, 10)) {
        const parkRef = doc(db, 'parks', recentPark.id);
        const parkSnap = await getDoc(parkRef);
        if (parkSnap.exists()) {
          recentParksWithData.push({ id: parkSnap.id, ...parkSnap.data() });
        }
      }
      setRecentParks(recentParksWithData);

      // 自分のレビューを取得
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', currentUser.uid));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsData = [];
      reviewsSnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      setMyReviews(reviewsData);

      // バッジを計算
      const earnedBadges = [];
      
      // はじめての投稿バッジ
      if (reviewsData.length > 0) {
        earnedBadges.push({
          id: 'firstPost',
          name: 'はじめての投稿',
          description: '最初のレビューを投稿してコミュニティに参加しました!',
          icon: '⭐',
        });
      }

      // フォトグラファーバッジ（写真付きレビューの数で判定）
      const photoReviewsCount = reviewsData.filter(r => r.photos && r.photos.length > 0).length;
      if (photoReviewsCount >= 10) {
        earnedBadges.push({
          id: 'photographer',
          name: 'フォトグラファー',
          description: '合計10枚の写真を投稿しました。',
          icon: '📷',
        });
      }

      setBadges(earnedBadges);
    } catch (error) {
      console.error('マイページデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyPageData();
    }, [fetchMyPageData])
  );

  // お気に入りから削除
  const removeFromFavorites = async (parkId) => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', currentUser.uid), where('parkId', '==', parkId), where('type', '==', 'favorite'));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setFavoriteParks(favoriteParks.filter(p => p.id !== parkId));
    } catch (error) {
      console.error('削除エラー:', error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  };

  // 行ってみたいリストから削除
  const removeFromWantToVisit = async (parkId) => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', currentUser.uid), where('parkId', '==', parkId), where('type', '==', 'wantToVisit'));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setWantToVisitParks(wantToVisitParks.filter(p => p.id !== parkId));
    } catch (error) {
      console.error('削除エラー:', error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  };

  // 行った公園から削除
  const removeFromVisited = async (parkId) => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', currentUser.uid), where('parkId', '==', parkId), where('type', '==', 'visited'));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setVisitedParks(visitedParks.filter(p => p.id !== parkId));
    } catch (error) {
      console.error('削除エラー:', error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // ログアウト後、ログイン画面に遷移
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('ログアウトエラー:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          },
        },
      ]
    );
  };

  // アカウント削除処理
  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。本当に削除しますか？',
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
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert('エラー', 'ユーザー情報が見つかりません');
                return;
              }

              setLoading(true);

              // 1. ユーザーに関連するデータをFirestoreから削除
              // お気に入り/行った/行ってみたいリストを削除
              const favoritesRef = collection(db, 'favorites');
              const favoritesQuery = query(favoritesRef, where('userId', '==', currentUser.uid));
              const favoritesSnapshot = await getDocs(favoritesQuery);

              for (const favoriteDoc of favoritesSnapshot.docs) {
                await deleteDoc(favoriteDoc.ref);
              }

              // レビューを削除
              const reviewsRef = collection(db, 'reviews');
              const reviewsQuery = query(reviewsRef, where('userId', '==', currentUser.uid));
              const reviewsSnapshot = await getDocs(reviewsQuery);

              for (const reviewDoc of reviewsSnapshot.docs) {
                await deleteDoc(reviewDoc.ref);
              }

              // 2. AsyncStorageから最近見た公園を削除
              const recentParksKey = `recentParks_${currentUser.uid}`;
              await AsyncStorage.removeItem(recentParksKey);

              // 3. Firebase Authenticationからユーザーアカウントを削除
              await deleteUser(currentUser);

              // 4. ログイン画面に遷移
              Alert.alert('完了', 'アカウントを削除しました', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error('アカウント削除エラー:', error);
              setLoading(false);

              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'エラー',
                  'セキュリティのため、アカウント削除には再ログインが必要です。一度ログアウトして再度ログインしてからお試しください。',
                  [
                    {
                      text: 'OK',
                    },
                  ]
                );
              } else {
                Alert.alert('エラー', 'アカウント削除に失敗しました: ' + error.message);
              }
            }
          },
        },
      ]
    );
  };

  // 公園カードをタップしたときの処理
  const handleParkCardPress = (park) => {
    navigation.navigate('ParkDetail', { parkId: park.id, park });
  };

  // 公園カードのレンダリング
  const renderParkCard = (park, onRemove, showRemoveButton = true) => (
    <TouchableOpacity 
      style={styles.parkCard}
      onPress={() => handleParkCardPress(park)}
      activeOpacity={0.7}
    >
      {park.mainImage && (
        <Image source={{ uri: park.mainImage }} style={styles.parkImage} />
      )}
      <View style={styles.parkCardContent}>
        <Text style={styles.parkName} numberOfLines={2}>{park.name || '名前なし'}</Text>
        {park.address && (
          <Text style={styles.parkAddress} numberOfLines={1}>{park.address}</Text>
        )}
        {showRemoveButton && onRemove && (
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            onRemove(park.id);
          }}>
            <Text style={styles.removeButton}>リストから削除</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // バッジカードのレンダリング
  const renderBadgeCard = (badge) => (
    <View style={styles.badgeCard}>
      <View style={styles.badgeIcon}>
        <Text style={styles.badgeIconText}>{badge.icon}</Text>
      </View>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader
          navigation={navigation}
          searchQuery=""
          onSearchChange={() => {}}
          currentScreen="mypage"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        navigation={navigation}
        searchQuery=""
        onSearchChange={() => {}}
        currentScreen="mypage"
      />
      <ScrollView style={styles.content}>
        {/* ユーザー情報セクション */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>
              {auth.currentUser?.email || 'ユーザー'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>ログアウト</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountButtonText}>アカウントを削除</Text>
          </TouchableOpacity>
        </View>

        {/* お気に入りした公園 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お気に入りした公園</Text>
          {favoriteParks.length === 0 ? (
            <Text style={styles.emptyText}>お気に入りした公園はありません</Text>
          ) : (
            <View style={styles.parksGrid}>
              {favoriteParks.map((park) => (
                <View key={park.id} style={styles.parkCardWrapper}>
                  {renderParkCard(park, removeFromFavorites)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 「行ってみたい!」リスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>「行ってみたい!」リスト</Text>
          {wantToVisitParks.length === 0 ? (
            <Text style={styles.emptyText}>「行ってみたい!」リストは空です</Text>
          ) : (
            <View style={styles.parksGrid}>
              {wantToVisitParks.map((park) => (
                <View key={park.id} style={styles.parkCardWrapper}>
                  {renderParkCard(park, removeFromWantToVisit)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 行った公園 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>行った公園</Text>
          {visitedParks.length === 0 ? (
            <Text style={styles.emptyText}>行った公園はありません</Text>
          ) : (
            <View style={styles.parksGrid}>
              {visitedParks.map((park) => (
                <View key={park.id} style={styles.parkCardWrapper}>
                  {renderParkCard(park, removeFromVisited)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 最近見た公園 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近見た公園</Text>
          {recentParks.length === 0 ? (
            <Text style={styles.emptyText}>最近見た公園はありません</Text>
          ) : (
            <View style={styles.parksGrid}>
              {recentParks.map((park) => (
                <View key={park.id} style={styles.parkCardWrapper}>
                  {renderParkCard(park, null, false)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 獲得したバッジ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>獲得したバッジ</Text>
          {badges.length === 0 ? (
            <Text style={styles.emptyText}>獲得したバッジはありません</Text>
          ) : (
            <View style={styles.badgesGrid}>
              {badges.map((badge) => (
                <View key={badge.id} style={styles.badgeCardWrapper}>
                  {renderBadgeCard(badge)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 自分の投稿レビュー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自分の投稿レビュー</Text>
          {myReviews.length === 0 ? (
            <Text style={styles.emptyText}>まだ投稿したレビューはありません。</Text>
          ) : (
            <View style={styles.reviewsList}>
              {myReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </Text>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userInfo: {
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#064E3B',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteAccountButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteAccountButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  parksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parkCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  parkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  parkImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  parkCardContent: {
    padding: 12,
  },
  parkName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 6,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  parkAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 16,
  },
  removeButton: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconText: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewRating: {
    fontSize: 15,
    marginBottom: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 20,
  },
});
