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
  updateDoc,
  increment,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../firebaseConfig';
import { handleError, logError } from '../utils/errorHandler';
import AdBanner from '../components/AdBanner';

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
  const [blockedUsers, setBlockedUsers] = useState([]); // ブロックされたユーザーのリスト
  const [helpfulVotes, setHelpfulVotes] = useState({}); // { reviewId: true/false }
  const [helpfulCounts, setHelpfulCounts] = useState({}); // { reviewId: count }
  const [reviewSortBy, setReviewSortBy] = useState('newest'); // 'newest' | 'helpful'

  const IMAGE_CATEGORIES = ['全て', '遊具', '設備', '風景', 'その他'];

  useEffect(() => {
    fetchParkDetails();
    fetchBlockedUsers();
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

  // ブロックユーザーが更新されたらレビューを再取得
  useEffect(() => {
    if (blockedUsers.length >= 0) {
      fetchReviews();
    }
  }, [blockedUsers]);

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
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.saveRecentPark');
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
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.checkFavoriteStatus');
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
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.checkVisitedStatus');
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
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.checkWantToVisitStatus');
    }
  };

  // ブロックされたユーザーのリストを取得
  const fetchBlockedUsers = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const blockedRef = collection(db, 'blockedUsers');
      const q = query(blockedRef, where('blockedBy', '==', currentUser.uid));
      const snapshot = await getDocs(q);

      const blocked = [];
      snapshot.forEach(doc => {
        blocked.push(doc.data().blockedUserId);
      });

      setBlockedUsers(blocked);
    } catch (error) {
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.fetchBlockedUsers');
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
        // 削除 - すべての削除処理が完了するまで待機
        const deletePromises = [];
        snapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
        setIsFavorite(false);
      }
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'ParkDetailScreen.toggleFavorite', Alert.alert);
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
          wantToVisitSnapshot.forEach(async doc => {
            await deleteDoc(doc.ref);
          });
          setIsWantToVisit(false);
        }
      } else {
        // 削除 - すべての削除処理が完了するまで待機
        const deletePromises = [];
        snapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
        setIsVisited(false);
      }
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'ParkDetailScreen.toggleVisited', Alert.alert);
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
        // 削除 - すべての削除処理が完了するまで待機
        const deletePromises = [];
        snapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
        setIsWantToVisit(false);
      }
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(error, 'ParkDetailScreen.toggleWantToVisit', Alert.alert);
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
      // 統一されたエラーハンドリング
      handleError(error, 'ParkDetailScreen.fetchParkDetails', Alert.alert);
    } finally {
      setLoading(false);
    }
  };

  // レビュー一覧を取得
  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('parkId', '==', parkId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const reviewsData = [];
      querySnapshot.forEach(doc => {
        const reviewData = { id: doc.id, ...doc.data() };
        // ブロックされたユーザーのレビューは除外
        if (!blockedUsers.includes(reviewData.userId)) {
          reviewsData.push(reviewData);
        }
      });

      setReviews(reviewsData);
    } catch (error) {
      // エラーログのみ記録（ユーザーには表示しない）
      logError(error, 'ParkDetailScreen.fetchReviews');
    }
  };

  // 参考になった投票状態を取得
  const fetchHelpfulStatus = async reviewIds => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || reviewIds.length === 0) return;

      const helpfulRef = collection(db, 'reviewHelpful');
      const q = query(
        helpfulRef,
        where('userId', '==', currentUser.uid),
        where('reviewId', 'in', reviewIds.slice(0, 10)) // Firestore in は最大10
      );
      const snapshot = await getDocs(q);

      const votes = {};
      snapshot.forEach(doc => {
        votes[doc.data().reviewId] = doc.id;
      });
      setHelpfulVotes(votes);
    } catch (error) {
      logError(error, 'ParkDetailScreen.fetchHelpfulStatus');
    }
  };

  // レビュー取得後に参考になった状態を取得
  useEffect(() => {
    if (reviews.length > 0) {
      const reviewIds = reviews.map(r => r.id);
      fetchHelpfulStatus(reviewIds);

      // カウントを初期化
      const counts = {};
      reviews.forEach(r => {
        counts[r.id] = r.helpfulCount || 0;
      });
      setHelpfulCounts(counts);
    }
  }, [reviews]);

  // 参考になったをトグル
  const handleHelpful = async reviewId => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ログインが必要です', 'この機能を使用するにはログインが必要です');
        return;
      }

      const helpfulRef = collection(db, 'reviewHelpful');
      const reviewRef = doc(db, 'reviews', reviewId);

      if (helpfulVotes[reviewId]) {
        // 取消: ドキュメント削除 + カウントデクリメント
        const helpfulDocRef = doc(db, 'reviewHelpful', helpfulVotes[reviewId]);
        await deleteDoc(helpfulDocRef);
        await updateDoc(reviewRef, { helpfulCount: increment(-1) });

        setHelpfulVotes(prev => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
        setHelpfulCounts(prev => ({
          ...prev,
          [reviewId]: Math.max((prev[reviewId] || 0) - 1, 0),
        }));
      } else {
        // 投票: ドキュメント追加 + カウントインクリメント
        const newDoc = await addDoc(helpfulRef, {
          reviewId,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(reviewRef, { helpfulCount: increment(1) });

        setHelpfulVotes(prev => ({ ...prev, [reviewId]: newDoc.id }));
        setHelpfulCounts(prev => ({
          ...prev,
          [reviewId]: (prev[reviewId] || 0) + 1,
        }));
      }
    } catch (error) {
      handleError(error, 'ParkDetailScreen.handleHelpful', Alert.alert);
    }
  };

  // ソートされたレビューを取得
  const getSortedReviews = () => {
    if (reviewSortBy === 'helpful') {
      return [...reviews].sort((a, b) => (helpfulCounts[b.id] || 0) - (helpfulCounts[a.id] || 0));
    }
    return reviews; // デフォルトは新着順（fetchReviewsで既にcreatedAt desc）
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

    // 地面の種類
    if (park.tags?.ground && Array.isArray(park.tags.ground)) {
      park.tags.ground.forEach(g => tags.push(g));
    }

    // 景色・自然
    if (park.tags?.scenery && Array.isArray(park.tags.scenery)) {
      park.tags.scenery.forEach(s => tags.push(s));
    }

    // スポーツ施設
    if (park.tags?.sports && Array.isArray(park.tags.sports)) {
      park.tags.sports.forEach(s => tags.push(s));
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
    Alert.alert('削除の確認', 'この公園を削除しますか？\n関連するレビューもすべて削除されます。', [
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
            querySnapshot.forEach(reviewDoc => {
              deletePromises.push(deleteDoc(doc(db, 'reviews', reviewDoc.id)));
            });

            // レビューを削除
            await Promise.all(deletePromises);

            // 公園を削除
            const parkRef = doc(db, 'parks', parkId);
            await deleteDoc(parkRef);

            Alert.alert('削除完了', '公園を削除しました', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Home');
                },
              },
            ]);
          } catch (error) {
            // 統一されたエラーハンドリング
            handleError(error, 'ParkDetailScreen.deletePark', Alert.alert);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // レビューを報告
  const handleReportReview = (reviewId, reviewComment) => {
    Alert.alert('レビューを報告', 'このレビューを不適切なコンテンツとして報告しますか？', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '報告する',
        style: 'destructive',
        onPress: async () => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              Alert.alert('ログインが必要です', '報告機能を使用するにはログインが必要です');
              return;
            }

            // reportsコレクションに報告を保存
            const reportsRef = collection(db, 'reports');
            await addDoc(reportsRef, {
              reviewId: reviewId,
              parkId: parkId,
              reportedBy: currentUser.uid,
              reportedByEmail: currentUser.email,
              reviewComment: reviewComment,
              reason: 'inappropriate_content',
              status: 'pending',
              createdAt: serverTimestamp(),
            });

            Alert.alert('報告完了', 'レビューを報告しました。運営チームが確認します。');
          } catch (error) {
            // 統一されたエラーハンドリング
            handleError(error, 'ParkDetailScreen.reportReview', Alert.alert);
          }
        },
      },
    ]);
  };

  // ユーザーをブロック
  const handleBlockUser = (userId, userName) => {
    Alert.alert(
      'ユーザーをブロック',
      `${userName || 'このユーザー'}をブロックしますか？
ブロックすると、このユーザーのレビューが表示されなくなります。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ブロック',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert('ログインが必要です', 'ブロック機能を使用するにはログインが必要です');
                return;
              }

              // blockedUsersコレクションに追加
              const blockedRef = collection(db, 'blockedUsers');
              await addDoc(blockedRef, {
                blockedBy: currentUser.uid,
                blockedUserId: userId,
                createdAt: serverTimestamp(),
              });

              // ローカル状態を更新
              setBlockedUsers([...blockedUsers, userId]);

              Alert.alert('ブロック完了', 'ユーザーをブロックしました');
            } catch (error) {
              // 統一されたエラーハンドリング
              handleError(error, 'ParkDetailScreen.blockUser', Alert.alert);
            }
          },
        },
      ]
    );
  };

  // レビューカードのレンダリング
  const renderReviewCard = ({ item }) => {
    const currentUser = auth.currentUser;
    const isOwnReview = currentUser && item.userId === currentUser.uid;
    const isHelpful = !!helpfulVotes[item.id];
    const count = helpfulCounts[item.id] || 0;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewRating}>
            {'⭐'.repeat(item.rating)}
            {'☆'.repeat(5 - item.rating)}
          </Text>
          <Text style={styles.reviewDate}>
            {item.createdAt?.toDate?.().toLocaleDateString('ja-JP') || '日付不明'}
          </Text>
        </View>
        {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
        <View style={styles.reviewFooter}>
          {item.userName && (
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
            >
              <Text style={[styles.reviewUserName, { color: '#059669' }]}>- {item.userName}</Text>
            </TouchableOpacity>
          )}
          {!isOwnReview && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => handleReportReview(item.id, item.comment)}
              >
                <Text style={styles.reportButtonText}>🚩 報告</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.blockButton}
                onPress={() => handleBlockUser(item.userId, item.userName)}
              >
                <Text style={styles.blockButtonText}>🚫 ブロック</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* 参考になったボタン */}
        <TouchableOpacity
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={() => !isOwnReview && handleHelpful(item.id)}
          disabled={isOwnReview}
        >
          <Text style={[styles.helpfulButtonText, isOwnReview && styles.helpfulButtonDisabled]}>
            👍 参考になった{count > 0 ? ` (${count})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
            <Text style={styles.parkName} numberOfLines={2}>
              {park.name}
            </Text>
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
              <Text
                style={[styles.actionButtonText, isWantToVisit && styles.actionButtonTextActive]}
              >
                行ってみたい
              </Text>
            </TouchableOpacity>
          </View>
          {park.address && <Text style={styles.parkAddress}>📍 {park.address}</Text>}
          {park.description && <Text style={styles.parkDescription}>{park.description}</Text>}

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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
            >
              {IMAGE_CATEGORIES.map(category => (
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
            >
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
                  <TouchableOpacity style={styles.expandMapButton} onPress={openMapInBrowser}>
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

          {/* ソート切り替え */}
          {reviews.length > 1 && (
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[styles.sortButton, reviewSortBy === 'newest' && styles.sortButtonActive]}
                onPress={() => setReviewSortBy('newest')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    reviewSortBy === 'newest' && styles.sortButtonTextActive,
                  ]}
                >
                  新着順
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, reviewSortBy === 'helpful' && styles.sortButtonActive]}
                onPress={() => setReviewSortBy('helpful')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    reviewSortBy === 'helpful' && styles.sortButtonTextActive,
                  ]}
                >
                  参考になった順
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyReviewsText}>
                まだレビューがありません。最初のレビューを書いてみませんか？
              </Text>
            </View>
          ) : (
            <FlatList
              data={getSortedReviews()}
              renderItem={renderReviewCard}
              keyExtractor={item => item.id}
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
            Alert.alert('ログインが必要です', 'レビューを投稿するにはログインが必要です。', [
              {
                text: 'ログイン',
                onPress: () => navigation.navigate('Login'),
              },
              {
                text: 'キャンセル',
                style: 'cancel',
              },
            ]);
          } else {
            navigation.navigate('AddReview', { parkId, parkName: park.name });
          }
        }}
      >
        <Text style={styles.fixedAddReviewButtonText}>レビューを投稿する</Text>
      </TouchableOpacity>

      {/* 🎯 広告プレースホルダー（画面下部固定） */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF8',
  },
  scrollView: {
    flex: 1,
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
  parkInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  parkHeader: {
    marginBottom: 8,
  },
  parkName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.6,
    marginBottom: 10,
    lineHeight: 36,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F5FBF8',
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    gap: 5,
  },
  actionButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  actionButtonIcon: {
    fontSize: 17,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#047857',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  parkAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  parkDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#ECFDF5',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 10,
    fontWeight: '500',
  },
  ratingValue: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
  },
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.4,
  },
  emptyReviews: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 23,
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 0,
  },
  reportButtonText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  blockButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 0,
  },
  blockButtonText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F5FBF8',
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    alignSelf: 'flex-start',
  },
  helpfulButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  helpfulButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  helpfulButtonDisabled: {
    color: '#9CA3AF',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    backgroundColor: '#F5FBF8',
    borderRadius: 12,
    padding: 3,
    alignSelf: 'flex-start',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  sortButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#F5FBF8',
    borderWidth: 0,
  },
  categoryTabActive: {
    backgroundColor: '#10B981',
  },
  categoryTabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  imageGallery: {
    paddingHorizontal: 20,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#E8F5EE',
  },
  facilitiesAndMapSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 8,
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
    gap: 8,
  },
  tag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0,
  },
  tagText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  mapSection: {
    marginTop: 20,
  },
  mapContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
    marginTop: 12,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  expandMapButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0,
  },
  expandMapButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },
  fixedAddReviewButton: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fixedAddReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBF8',
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 0,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
