// 管理者ページ
// レポートの確認・対応、レビュー・公園の削除など

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
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { checkIsAdmin } from '../utils/adminUtils';
import CustomHeader from '../components/CustomHeader';
import AdBanner from '../components/AdBanner';

export default function AdminScreen({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'parks', 'reviews'
  const [parks, setParks] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'parks') {
      fetchParks();
    } else if (isAdmin && activeTab === 'reviews') {
      fetchReviews();
    }
  }, [isAdmin, activeTab]);

  // 管理者権限をチェック
  const checkAdminStatus = async () => {
    try {
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      if (!adminStatus) {
        Alert.alert('アクセス拒否', '管理者権限が必要です', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('管理者チェックエラー:', error);
      Alert.alert('エラー', '管理者権限の確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // レポート一覧を取得
  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const reportsData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const reportData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // 公園名とレビュー内容を取得
        try {
          const parkDoc = await getDoc(doc(db, 'parks', reportData.parkId));
          if (parkDoc.exists()) {
            reportData.parkName = parkDoc.data().name;
          }

          const reviewDoc = await getDoc(doc(db, 'reviews', reportData.reviewId));
          if (reviewDoc.exists()) {
            const reviewData = reviewDoc.data();
            reportData.reviewComment = reviewData.comment;
            reportData.reviewRating = reviewData.rating;
            reportData.reviewUserName = reviewData.userName;
          }
        } catch (error) {
          console.error('関連データ取得エラー:', error);
        }

        reportsData.push(reportData);
      }

      setReports(reportsData);
    } catch (error) {
      console.error('レポート取得エラー:', error);
      Alert.alert('エラー', 'レポートの取得に失敗しました');
    }
  };

  // 公園一覧を取得
  const fetchParks = async () => {
    try {
      const parksRef = collection(db, 'parks');
      const querySnapshot = await getDocs(parksRef);

      const parksData = [];
      querySnapshot.forEach((docSnapshot) => {
        parksData.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      // 作成日時でソート
      parksData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || a.createdAt?.toMillis?.() / 1000 || 0;
        const bTime = b.createdAt?.seconds || b.createdAt?.toMillis?.() / 1000 || 0;
        return bTime - aTime;
      });

      setParks(parksData);
    } catch (error) {
      console.error('公園取得エラー:', error);
      Alert.alert('エラー', '公園の取得に失敗しました');
    }
  };

  // レビュー一覧を取得
  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const reviewsData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const reviewData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // 公園名を取得
        try {
          const parkDoc = await getDoc(doc(db, 'parks', reviewData.parkId));
          if (parkDoc.exists()) {
            reviewData.parkName = parkDoc.data().name;
          }
        } catch (error) {
          console.error('公園名取得エラー:', error);
        }

        reviewsData.push(reviewData);
      }

      setReviews(reviewsData);
    } catch (error) {
      console.error('レビュー取得エラー:', error);
      Alert.alert('エラー', 'レビューの取得に失敗しました');
    }
  };

  // レポートを解決済みにする
  const handleResolveReport = async (reportId) => {
    Alert.alert(
      'レポートを解決',
      'このレポートを解決済みにしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解決済みにする',
          onPress: async () => {
            try {
              const reportRef = doc(db, 'reports', reportId);
              await updateDoc(reportRef, {
                status: 'resolved',
                updatedAt: serverTimestamp(),
              });
              Alert.alert('成功', 'レポートを解決済みにしました');
              fetchReports();
            } catch (error) {
              console.error('レポート更新エラー:', error);
              Alert.alert('エラー', 'レポートの更新に失敗しました');
            }
          },
        },
      ]
    );
  };

  // レポートを却下する
  const handleDismissReport = async (reportId) => {
    Alert.alert(
      'レポートを却下',
      'このレポートを却下しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '却下する',
          onPress: async () => {
            try {
              const reportRef = doc(db, 'reports', reportId);
              await updateDoc(reportRef, {
                status: 'dismissed',
                updatedAt: serverTimestamp(),
              });
              Alert.alert('成功', 'レポートを却下しました');
              fetchReports();
            } catch (error) {
              console.error('レポート更新エラー:', error);
              Alert.alert('エラー', 'レポートの更新に失敗しました');
            }
          },
        },
      ]
    );
  };

  // レビューを削除
  const handleDeleteReview = async (reviewId, parkId) => {
    Alert.alert(
      'レビューを削除',
      'このレビューを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              // レビューを削除
              const reviewRef = doc(db, 'reviews', reviewId);
              await deleteDoc(reviewRef);

              // 公園の評価を更新
              await updateParkRating(parkId);

              Alert.alert('成功', 'レビューを削除しました');
              fetchReviews();
              fetchReports(); // レポートも更新
            } catch (error) {
              console.error('レビュー削除エラー:', error);
              Alert.alert('エラー', 'レビューの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  // 公園を削除
  const handleDeletePark = async (parkId) => {
    Alert.alert(
      '公園を削除',
      'この公園を削除しますか？関連するレビューもすべて削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 関連するレビューを削除
              const reviewsRef = collection(db, 'reviews');
              const q = query(reviewsRef, where('parkId', '==', parkId));
              const querySnapshot = await getDocs(q);

              const deletePromises = [];
              querySnapshot.forEach((reviewDoc) => {
                deletePromises.push(deleteDoc(doc(db, 'reviews', reviewDoc.id)));
              });

              await Promise.all(deletePromises);

              // 公園を削除
              const parkRef = doc(db, 'parks', parkId);
              await deleteDoc(parkRef);

              Alert.alert('成功', '公園を削除しました');
              fetchParks();
              fetchReports();
            } catch (error) {
              console.error('公園削除エラー:', error);
              Alert.alert('エラー', '公園の削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  // 公園の評価を更新（レビュー削除後）
  const updateParkRating = async (parkId) => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('parkId', '==', parkId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const parkRef = doc(db, 'parks', parkId);
        await updateDoc(parkRef, {
          rating: 0,
          reviewCount: 0,
        });
        return;
      }

      let totalRating = 0;
      let reviewCount = 0;

      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        if (reviewData.rating && typeof reviewData.rating === 'number') {
          totalRating += reviewData.rating;
          reviewCount++;
        }
      });

      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

      const parkRef = doc(db, 'parks', parkId);
      await updateDoc(parkRef, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviewCount,
      });
    } catch (error) {
      console.error('公園の評価更新エラー:', error);
    }
  };

  // レポートカードのレンダリング
  const renderReportCard = ({ item }) => {
    const reasonLabels = {
      inappropriate_content: '不適切なコンテンツ',
      spam: 'スパム',
      harassment: 'ハラスメント',
      other: 'その他',
    };

    const statusLabels = {
      pending: '対応待ち',
      resolved: '解決済み',
      dismissed: '却下',
    };

    const statusColors = {
      pending: '#F59E0B',
      resolved: '#10B981',
      dismissed: '#6B7280',
    };

    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportStatus} style={{ color: statusColors[item.status] || '#6B7280' }}>
            {statusLabels[item.status] || item.status}
          </Text>
          <Text style={styles.reportDate}>
            {item.createdAt?.toDate?.().toLocaleDateString('ja-JP') || '日付不明'}
          </Text>
        </View>
        <Text style={styles.reportLabel}>公園: {item.parkName || item.parkId}</Text>
        <Text style={styles.reportLabel}>理由: {reasonLabels[item.reason] || item.reason}</Text>
        {item.reviewComment && (
          <View style={styles.reviewPreview}>
            <Text style={styles.reviewPreviewLabel}>レビュー内容:</Text>
            <Text style={styles.reviewPreviewText}>{item.reviewComment}</Text>
            {item.reviewRating && (
              <Text style={styles.reviewRating}>
                {'⭐'.repeat(item.reviewRating)}{'☆'.repeat(5 - item.reviewRating)}
              </Text>
            )}
          </View>
        )}
        {item.status === 'pending' && (
          <View style={styles.reportActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={() => handleResolveReport(item.id)}
            >
              <Text style={styles.actionButtonText}>解決済み</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.dismissButton]}
              onPress={() => handleDismissReport(item.id)}
            >
              <Text style={styles.actionButtonText}>却下</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteReview(item.reviewId, item.parkId)}
            >
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>レビュー削除</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // 公園を編集
  const handleEditPark = (park) => {
    navigation.navigate('AddPark', {
      isEditMode: true,
      parkData: park,
    });
  };

  // 公園カードのレンダリング
  const renderParkCard = ({ item }) => (
    <View style={styles.parkCard}>
      <Text style={styles.parkName}>{item.name || '名前なし'}</Text>
      <Text style={styles.parkAddress}>{item.address || '住所なし'}</Text>
      <Text style={styles.parkInfo}>
        評価: {item.rating || 0} ({item.reviewCount || 0}件)
      </Text>
      <View style={styles.parkActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPark(item)}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePark(item.id)}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // レビューを編集
  const handleEditReview = (review) => {
    // 公園名を取得
    const parkName = review.parkName || '公園名不明';
    navigation.navigate('AddReview', {
      isEditMode: true,
      reviewData: review,
      parkId: review.parkId,
      parkName: parkName,
    });
  };

  // レビューカードのレンダリング
  const renderReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewParkName}>{item.parkName || item.parkId}</Text>
      <Text style={styles.reviewRating}>
        {'⭐'.repeat(item.rating || 0)}{'☆'.repeat(5 - (item.rating || 0))}
      </Text>
      {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
      <Text style={styles.reviewUserName}>- {item.userName || '匿名ユーザー'}</Text>
      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditReview(item)}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteReview(item.id, item.parkId)}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader
          navigation={navigation}
          searchQuery=""
          onSearchChange={() => {}}
          currentScreen="admin"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <CustomHeader
          navigation={navigation}
          searchQuery=""
          onSearchChange={() => {}}
          currentScreen="admin"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>管理者権限が必要です</Text>
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
        currentScreen="admin"
      />
      <ScrollView style={styles.scrollView}>
        {/* タブ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
              レポート ({reports.filter(r => r.status === 'pending').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'parks' && styles.activeTab]}
            onPress={() => setActiveTab('parks')}
          >
            <Text style={[styles.tabText, activeTab === 'parks' && styles.activeTabText]}>
              公園 ({parks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              レビュー ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* コンテンツ */}
        {activeTab === 'reports' && (
          <FlatList
            data={reports}
            renderItem={renderReportCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {activeTab === 'parks' && (
          <FlatList
            data={parks}
            renderItem={renderParkCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {activeTab === 'reviews' && (
          <FlatList
            data={reviews}
            renderItem={renderReviewCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        <AdBanner />
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#10B981',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  reviewPreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewPreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewPreviewText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 16,
  },
  reportActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  parkCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  parkName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  parkAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  parkInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewParkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 16,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  parkActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  resolveButton: {
    backgroundColor: '#10B981',
  },
  dismissButton: {
    backgroundColor: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

