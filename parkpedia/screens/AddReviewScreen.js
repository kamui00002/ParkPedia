// レビュー追加画面
// 星評価とコメントを入力してFirestoreに保存

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function AddReviewScreen({ route, navigation }) {
  const { parkId, parkName } = route.params;
  
  // 状態管理
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // レビューを送信
  const handleSubmit = async () => {
    // バリデーション
    if (rating === 0) {
      Alert.alert('エラー', '星評価を選択してください');
      return;
    }

    if (comment.trim() === '') {
      Alert.alert('エラー', 'コメントを入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const user = auth.currentUser;

      // Firestoreにレビューを保存
      await addDoc(collection(db, 'reviews'), {
        parkId: parkId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '匿名ユーザー',
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        '成功',
        'レビューを投稿しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      Alert.alert('エラー', 'レビューの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // 星評価のレンダリング
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Text style={styles.star}>
            {i <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 公園名表示 */}
        <View style={styles.parkNameContainer}>
          <Text style={styles.parkNameLabel}>レビュー対象:</Text>
          <Text style={styles.parkName}>{parkName}</Text>
        </View>

        {/* 星評価選択 */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>評価</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              選択中: {rating} / 5
            </Text>
          )}
        </View>

        {/* コメント入力 */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>コメント</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="この公園についての感想を書いてください..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* 送信ボタン */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || comment.trim() === '' || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || comment.trim() === '' || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>レビューを投稿</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  parkNameContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  parkNameLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  parkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
  },
  ratingText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 5,
  },
  commentSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

