// 他ユーザーのプロフィール表示画面

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function UserProfileScreen({ navigation, route }) {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // プロフィール取得
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setProfile(userDocSnap.data());
      }

      // レビュー一覧取得
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);

      const reviewsData = [];
      reviewsSnapshot.forEach(doc => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      // 新しい順にソート
      reviewsData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || 0;
        const bTime = b.createdAt?.toDate?.() || 0;
        return bTime - aTime;
      });
      setReviews(reviewsData);
    } catch (error) {
      if (__DEV__) console.error('UserProfileScreen.loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderReviewCard = ({ item }) => (
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
      {item.parkName && (
        <TouchableOpacity
          onPress={() => navigation.navigate('ParkDetail', { parkId: item.parkId })}
        >
          <Text style={styles.reviewParkName}>{item.parkName}</Text>
        </TouchableOpacity>
      )}
      {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
    </View>
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
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={renderReviewCard}
        ListHeaderComponent={
          <View>
            {/* プロフィールヘッダー */}
            <View style={styles.profileHeader}>
              {profile?.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>👤</Text>
                </View>
              )}
              <Text style={styles.displayName}>{profile?.displayName || 'ユーザー'}</Text>
              {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            </View>

            {/* レビューセクションタイトル */}
            <Text style={styles.sectionTitle}>レビュー ({reviews.length}件)</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>まだレビューはありません</Text>}
        contentContainerStyle={styles.listContent}
      />
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
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingBottom: 48,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    backgroundColor: '#ECFDF5',
  },
  profileImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileImagePlaceholderText: {
    fontSize: 36,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
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
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 15,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewParkName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 6,
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
