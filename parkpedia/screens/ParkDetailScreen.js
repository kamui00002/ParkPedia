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
} from 'react-native';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ParkDetailScreen({ route, navigation }) {
  const { parkId, park: initialPark } = route.params;
  
  // 状態管理
  const [park, setPark] = useState(initialPark || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkDetails();
    fetchReviews();
  }, [parkId]);

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
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 公園基本情報 */}
      <View style={styles.parkInfo}>
        <Text style={styles.parkName}>{park.name}</Text>
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

      {/* レビュー一覧 */}
      <View style={styles.reviewsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>レビュー</Text>
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => navigation.navigate('AddReview', { parkId, parkName: park.name })}
          >
            <Text style={styles.addReviewButtonText}>レビューを書く</Text>
          </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  parkInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  parkName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  parkAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  parkDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ratingLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  ratingValue: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addReviewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyReviews: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

