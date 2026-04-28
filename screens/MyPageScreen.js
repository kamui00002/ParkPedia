// マイページ画面
// お気に入り、行ってみたいリスト、バッジ、レビューを表示

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import CustomHeader from '../components/CustomHeader';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkIsAdmin } from '../utils/adminUtils';
import { handleError, logError } from '../utils/errorHandler';
import { AGE_OPTIONS } from '../constants/parkOptions';
import { calculateBadges } from '../utils/badgeCalculator';

export default function MyPageScreen({ navigation }) {
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [wantToVisitParks, setWantToVisitParks] = useState([]);
  const [visitedParks, setVisitedParks] = useState([]);
  const [recentParks, setRecentParks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [childrenAges, setChildrenAges] = useState([]);
  const [savingChildren, setSavingChildren] = useState(false);
  const [userProfile, setUserProfile] = useState({ displayName: '', bio: '', photoURL: '' });

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

      // 管理者権限をチェック
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);

      // ユーザードキュメントから子どもの年齢を読み込み
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setChildrenAges(userDocSnap.data().children || []);
        setUserProfile({
          displayName: userDocSnap.data().displayName || '',
          bio: userDocSnap.data().bio || '',
          photoURL: userDocSnap.data().photoURL || '',
        });
      }

      // お気に入り公園を取得
      const favoritesRef = collection(db, 'favorites');
      const favoritesQuery = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('type', '==', 'favorite')
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);

      const favoriteParkIds = [];
      favoritesSnapshot.forEach(doc => {
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
      const wantToVisitQuery = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('type', '==', 'wantToVisit')
      );
      const wantToVisitSnapshot = await getDocs(wantToVisitQuery);

      const wantToVisitParkIds = [];
      wantToVisitSnapshot.forEach(doc => {
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
      const visitedQuery = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('type', '==', 'visited')
      );
      const visitedSnapshot = await getDocs(visitedQuery);

      const visitedParkIds = [];
      visitedSnapshot.forEach(doc => {
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
      reviewsSnapshot.forEach(doc => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      setMyReviews(reviewsData);

      // 自分が登録した公園数を取得
      const parksRef = collection(db, 'parks');
      const parksQuery = query(parksRef, where('userId', '==', currentUser.uid));
      const parksSnapshot = await getDocs(parksQuery);
      const parkCount = parksSnapshot.size;

      // 参考になった数を合算（全レビューの helpfulCount フィールド）
      const totalHelpfulCount = reviewsData.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);

      // 統計データを収集してバッジを計算
      const stats = {
        reviewCount: reviewsData.length,
        photoReviewCount: reviewsData.filter(r => r.photos && r.photos.length > 0).length,
        parkCount: parkCount,
        visitedCount: visitedParksData.length,
        helpfulCount: totalHelpfulCount,
        favoriteCount: favoriteParksData.length,
      };
      const allBadges = calculateBadges(stats);
      setBadges(allBadges);
    } catch (error) {
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'MyPageScreen.fetchMyPageData');
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
  const removeFromFavorites = async parkId => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'favorite')
      );
      const snapshot = await getDocs(q);

      // すべての削除処理が完了するまで待機
      const deletePromises = [];
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);

      setFavoriteParks(favoriteParks.filter(p => p.id !== parkId));
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'MyPageScreen.removeFromFavorites', Alert.alert);
    }
  };

  // 行ってみたいリストから削除
  const removeFromWantToVisit = async parkId => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'wantToVisit')
      );
      const snapshot = await getDocs(q);

      // すべての削除処理が完了するまで待機
      const deletePromises = [];
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);

      setWantToVisitParks(wantToVisitParks.filter(p => p.id !== parkId));
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'MyPageScreen.removeFromFavorites', Alert.alert);
    }
  };

  // 行った公園から削除
  const removeFromVisited = async parkId => {
    try {
      const currentUser = auth.currentUser;
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('parkId', '==', parkId),
        where('type', '==', 'visited')
      );
      const snapshot = await getDocs(q);

      // すべての削除処理が完了するまで待機
      const deletePromises = [];
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);

      setVisitedParks(visitedParks.filter(p => p.id !== parkId));
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'MyPageScreen.removeFromFavorites', Alert.alert);
    }
  };

  // レビューを削除
  const deleteReview = async reviewId => {
    Alert.alert('レビューを削除', 'このレビューを削除しますか？この操作は取り消せません。', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            const reviewRef = doc(db, 'reviews', reviewId);
            await deleteDoc(reviewRef);

            // ステートから削除
            setMyReviews(myReviews.filter(r => r.id !== reviewId));

            Alert.alert('成功', 'レビューを削除しました');
          } catch (error) {
            // 統一されたエラーハンドリング
            handleError(error, 'MyPageScreen.deleteReview', Alert.alert);
          }
        },
      },
    ]);
  };

  // 子どもの年齢をトグル
  const toggleChildAge = age => {
    setChildrenAges(prev => {
      const newAges = prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age];
      saveChildrenAges(newAges);
      return newAges;
    });
  };

  // 子どもの年齢を保存
  const saveChildrenAges = async ages => {
    try {
      setSavingChildren(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        children: ages,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      logError(error, 'MyPageScreen.saveChildrenAges');
    } finally {
      setSavingChildren(false);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
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
            // 統一されたエラーハンドリング
            handleError(error, 'MyPageScreen.handleLogout', Alert.alert);
          }
        },
      },
    ]);
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

              // レビューを削除（Storage内の画像も削除）
              const reviewsRef = collection(db, 'reviews');
              const reviewsQuery = query(reviewsRef, where('userId', '==', currentUser.uid));
              const reviewsSnapshot = await getDocs(reviewsQuery);

              for (const reviewDoc of reviewsSnapshot.docs) {
                const reviewData = reviewDoc.data();

                // レビューの画像をStorageから削除
                if (reviewData.photos && reviewData.photos.length > 0) {
                  for (const photoUrl of reviewData.photos) {
                    try {
                      // URLからStorage参照を取得して削除
                      const photoRef = storageRef(storage, photoUrl);
                      await deleteObject(photoRef);
                    } catch (storageError) {
                      if (__DEV__) console.error('レビュー画像削除エラー:', storageError);
                      // 画像が既に削除されている場合などはエラーを無視
                    }
                  }
                }

                await deleteDoc(reviewDoc.ref);
              }

              // 公園投稿を削除（Storage内の画像も削除）
              const parksRef = collection(db, 'parks');
              const parksQuery = query(parksRef, where('userId', '==', currentUser.uid));
              const parksSnapshot = await getDocs(parksQuery);

              for (const parkDoc of parksSnapshot.docs) {
                const parkData = parkDoc.data();

                // 公園のメイン画像を削除
                if (parkData.mainImage) {
                  try {
                    const mainImageRef = storageRef(storage, parkData.mainImage);
                    await deleteObject(mainImageRef);
                  } catch (storageError) {
                    if (__DEV__) console.error('公園メイン画像削除エラー:', storageError);
                  }
                }

                // 公園の追加画像を削除
                if (parkData.images && parkData.images.length > 0) {
                  for (const imageUrl of parkData.images) {
                    try {
                      const imageRef = storageRef(storage, imageUrl);
                      await deleteObject(imageRef);
                    } catch (storageError) {
                      if (__DEV__) console.error('公園画像削除エラー:', storageError);
                    }
                  }
                }

                await deleteDoc(parkDoc.ref);
              }

              // ユーザーのブロックリストを削除
              const blockedUsersRef = collection(db, `users/${currentUser.uid}/blockedUsers`);
              const blockedUsersSnapshot = await getDocs(blockedUsersRef);

              for (const blockedUserDoc of blockedUsersSnapshot.docs) {
                await deleteDoc(blockedUserDoc.ref);
              }

              // ユーザードキュメントを削除（プロフィール情報を含む）
              const userDocRef = doc(db, 'users', currentUser.uid);
              const userDocSnapshot = await getDoc(userDocRef);

              if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();

                // プロフィール写真を削除
                if (userData.photoURL) {
                  try {
                    const profilePhotoRef = storageRef(storage, userData.photoURL);
                    await deleteObject(profilePhotoRef);
                  } catch (storageError) {
                    if (__DEV__) console.error('プロフィール写真削除エラー:', storageError);
                  }
                }

                await deleteDoc(userDocRef);
              }

              // レビュー報告（自分が報告したもの）を削除
              const reportsRef = collection(db, 'reports');
              const reportsQuery = query(reportsRef, where('reportedBy', '==', currentUser.uid));
              const reportsSnapshot = await getDocs(reportsQuery);

              for (const reportDoc of reportsSnapshot.docs) {
                await deleteDoc(reportDoc.ref);
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
              if (__DEV__) console.error('アカウント削除エラー:', error);
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
                // 統一されたエラーハンドリング
                handleError(error, 'MyPageScreen.deleteAccount', Alert.alert);
              }
            }
          },
        },
      ]
    );
  };

  // 公園カードをタップしたときの処理
  const handleParkCardPress = park => {
    navigation.navigate('ParkDetail', { parkId: park.id, park });
  };

  // 公園カードのレンダリング
  const renderParkCard = (park, onRemove, showRemoveButton = true) => (
    <TouchableOpacity
      style={styles.parkCard}
      onPress={() => handleParkCardPress(park)}
      activeOpacity={0.7}
    >
      {park.mainImage && <Image source={{ uri: park.mainImage }} style={styles.parkImage} />}
      <View style={styles.parkCardContent}>
        <Text style={styles.parkName} numberOfLines={2}>
          {park.name || '名前なし'}
        </Text>
        {park.address && (
          <Text style={styles.parkAddress} numberOfLines={1}>
            {park.address}
          </Text>
        )}
        {showRemoveButton && onRemove && (
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onRemove(park.id);
            }}
          >
            <Text style={styles.removeButton}>リストから削除</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // バッジカードのレンダリング（未獲得は opacity: 0.3）
  const renderBadgeCard = badge => (
    <View style={[styles.badgeCard, !badge.earned && styles.badgeCardUnearned]}>
      <View style={[styles.badgeIcon, !badge.earned && styles.badgeIconUnearned]}>
        <Text style={styles.badgeIconText}>{badge.icon}</Text>
      </View>
      <Text style={[styles.badgeName, !badge.earned && styles.badgeTextUnearned]}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeDescription, !badge.earned && styles.badgeTextUnearned]}>
        {badge.description}
      </Text>
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
          <View style={styles.profileHeader}>
            {userProfile.photoURL ? (
              <Image source={{ uri: userProfile.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>👤</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {userProfile.displayName || auth.currentUser?.email || 'ユーザー'}
              </Text>
              {userProfile.bio ? (
                <Text style={styles.userBio} numberOfLines={2}>
                  {userProfile.bio}
                </Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileButtonText}>プロフィール編集</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>ログアウト</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountButtonText}>アカウントを削除</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('Admin')}
            >
              <Text style={styles.adminButtonText}>🔧 管理者ページ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 子どもの年齢プロフィール */}
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>子どもの年齢</Text>
          <Text style={styles.childrenHint}>登録した年齢グループで公園を自動絞り込みします</Text>
          <View style={styles.childrenOptions}>
            {AGE_OPTIONS.map(age => {
              const isSelected = childrenAges.includes(age);
              return (
                <TouchableOpacity
                  key={age}
                  style={[styles.childAgeChip, isSelected && styles.childAgeChipSelected]}
                  onPress={() => toggleChildAge(age)}
                  disabled={savingChildren}
                >
                  <Text
                    style={[styles.childAgeChipText, isSelected && styles.childAgeChipTextSelected]}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* お気に入りした公園 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お気に入りした公園</Text>
          {favoriteParks.length === 0 ? (
            <Text style={styles.emptyText}>お気に入りした公園はありません</Text>
          ) : (
            <View style={styles.parksGrid}>
              {favoriteParks.map(park => (
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
              {wantToVisitParks.map(park => (
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
              {visitedParks.map(park => (
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
              {recentParks.map(park => (
                <View key={park.id} style={styles.parkCardWrapper}>
                  {renderParkCard(park, null, false)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* バッジ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>バッジ</Text>
          <View style={styles.badgesGrid}>
            {badges.map(badge => (
              <View key={badge.id} style={styles.badgeCardWrapper}>
                {renderBadgeCard(badge)}
              </View>
            ))}
          </View>
        </View>

        {/* 自分の投稿レビュー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自分の投稿レビュー</Text>
          {myReviews.length === 0 ? (
            <Text style={styles.emptyText}>まだ投稿したレビューはありません。</Text>
          ) : (
            <View style={styles.reviewsList}>
              {myReviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewRating}>
                      {'⭐'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteReview(review.id)}
                      style={styles.deleteReviewButton}
                    >
                      <Text style={styles.deleteReviewButtonText}>🗑️ 削除</Text>
                    </TouchableOpacity>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                  {review.createdAt && (
                    <Text style={styles.reviewDate}>
                      投稿日: {new Date(review.createdAt.toDate()).toLocaleDateString('ja-JP')}
                    </Text>
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
    backgroundColor: '#F5FBF8',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    marginRight: 14,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileImagePlaceholderText: {
    fontSize: 26,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  editProfileButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  editProfileButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteAccountButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 0,
  },
  deleteAccountButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  childrenSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  childrenHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 18,
  },
  childrenOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childAgeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5FBF8',
    borderWidth: 0,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  childAgeChipSelected: {
    backgroundColor: '#ECFDF5',
    shadowColor: '#059669',
    shadowOpacity: 0.1,
  },
  childAgeChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  childAgeChipTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBF8',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  parksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parkCardWrapper: {
    width: '48%',
    marginBottom: 14,
  },
  parkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  parkImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0FDF4',
  },
  parkCardContent: {
    padding: 12,
  },
  parkName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  parkAddress: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 15,
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
    marginBottom: 14,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeCardUnearned: {
    opacity: 0.3,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconUnearned: {
    backgroundColor: '#F3F4F6',
  },
  badgeTextUnearned: {
    color: '#9CA3AF',
  },
  badgeIconText: {
    fontSize: 30,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  deleteReviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  deleteReviewButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
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
