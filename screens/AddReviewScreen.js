// レビュー追加画面
// 星評価とコメントを入力してFirestoreに保存

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { uploadMultipleImages } from '../utils/imageUploader';

export default function AddReviewScreen({ route, navigation }) {
  // 編集モードかどうか（route.paramsから取得）
  const isEditMode = route?.params?.isEditMode || false;
  const reviewData = route?.params?.reviewData || null;
  const { parkId, parkName } = route.params || {};
  
  // 状態管理
  const [rating, setRating] = useState(reviewData?.rating || 0);
  const [comment, setComment] = useState(reviewData?.comment || '');
  const [photos, setPhotos] = useState(reviewData?.photos || []);
  const [submitting, setSubmitting] = useState(false);
  
  const MAX_PHOTOS = 5;

  // ログインチェック（編集モードの場合はスキップ）
  useEffect(() => {
    if (isEditMode) return; // 編集モードの場合はスキップ
    
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
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [navigation, isEditMode]);

  // 写真を選択
  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('エラー', `写真は最大${MAX_PHOTOS}枚までアップロードできます`);
      return;
    }

    // 権限をリクエスト
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限が必要', '写真を選択するにはライブラリへのアクセス権限が必要です');
      return;
    }

    // 画像を選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  // 写真を削除
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // 公園の評価を更新する関数
  const updateParkRating = async (parkId) => {
    try {
      if (__DEV__) {
        console.log('評価更新開始:', parkId);
      }

      // 該当公園のすべてのレビューを取得
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('parkId', '==', parkId));
      const querySnapshot = await getDocs(q);
      
      if (__DEV__) {
        console.log('レビュー数:', querySnapshot.size);
      }
      
      if (querySnapshot.empty) {
        // レビューがない場合は評価を0に設定
        const parkRef = doc(db, 'parks', parkId);
        await updateDoc(parkRef, {
          rating: 0,
          reviewCount: 0,
        });
        if (__DEV__) {
          console.log('評価を0に設定しました');
        }
        return;
      }
      
      // 平均評価を計算
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
      
      if (__DEV__) {
        console.log('計算された評価:', averageRating, 'レビュー数:', reviewCount);
      }
      
      // 公園の評価を更新
      const parkRef = doc(db, 'parks', parkId);
      await updateDoc(parkRef, {
        rating: Math.round(averageRating * 10) / 10, // 小数点第1位まで
        reviewCount: reviewCount,
      });
      
      if (__DEV__) {
        console.log('評価更新完了:', Math.round(averageRating * 10) / 10, reviewCount);
      }
    } catch (error) {
      // エラーを詳細にログ出力
      console.error('公園の評価更新エラー:', error);
      console.error('エラー詳細:', {
        code: error.code,
        message: error.message,
        parkId: parkId,
      });
      
      // エラーをユーザーに通知（開発環境のみ）
      if (__DEV__) {
        Alert.alert(
          '評価更新エラー',
          `評価の自動更新に失敗しました: ${error.message}\n\n手動で更新する必要がある場合があります。`,
          [{ text: 'OK' }]
        );
      }
      
      // エラーが発生してもレビュー投稿は成功とする
      throw error; // 呼び出し元で処理できるようにエラーを再スロー
    }
  };

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

      // 画像をFirebase Storageにアップロード
      let uploadedImageUrls = [];
      if (photos.length > 0) {
        try {
          uploadedImageUrls = await uploadMultipleImages(photos, 'reviews');
        } catch (uploadError) {
          console.error('画像アップロードエラー:', uploadError);
          Alert.alert('警告', '画像のアップロードに失敗しましたが、レビューは保存されます。');
          // アップロードに失敗してもレビューは保存する
        }
      }

      // 編集モードか新規作成かで処理を分岐
      if (isEditMode && reviewData?.id) {
        // 編集モード: 既存のレビューを更新
        const reviewRef = doc(db, 'reviews', reviewData.id);
        await updateDoc(reviewRef, {
          rating: rating,
          comment: comment.trim(),
          photos: uploadedImageUrls.length > 0 ? uploadedImageUrls : (reviewData.photos || []), // 新しい画像がない場合は既存の画像を保持
          updatedAt: serverTimestamp(),
          // parkId, userId, userName, createdAtは変更しない
        });
      } else {
        // 新規作成モード: 新しいレビューを作成
        await addDoc(collection(db, 'reviews'), {
          parkId: parkId,
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || '匿名ユーザー',
          rating: rating,
          comment: comment.trim(),
          photos: uploadedImageUrls, // Firebase StorageのURLの配列
          createdAt: serverTimestamp(),
        });
      }

      // 公園の評価を更新
      try {
        await updateParkRating(parkId);
      } catch (ratingError) {
        // 評価更新に失敗してもレビューは保存されているので、警告のみ表示
        console.error('評価更新に失敗しましたが、レビューは保存されました:', ratingError);
        if (__DEV__) {
          Alert.alert(
            '警告',
            'レビューは投稿されましたが、評価の自動更新に失敗しました。\n\nしばらくしてからアプリを再起動してください。',
            [{ text: 'OK' }]
          );
        }
      }

      Alert.alert(
        '成功',
        isEditMode ? 'レビューを更新しました' : 'レビューを投稿しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      if (__DEV__) {
        console.error('レビュー投稿エラー:', error);
      }
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

        {/* 写真アップロード */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionLabel}>
            写真を追加 ({photos.length}/{MAX_PHOTOS})
          </Text>
          <View style={styles.photoWarning}>
            <Text style={styles.photoWarningText}>
              ⚠️ 投稿ルールのお願い
            </Text>
            <Text style={styles.photoWarningSubtext}>
              トラブル防止のため、人物の顔が特定できる写真の投稿は避けてください。
            </Text>
          </View>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImage}
            disabled={photos.length >= MAX_PHOTOS}
          >
            <Text style={styles.photoButtonText}>ファイルを選択</Text>
          </TouchableOpacity>
          
          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'レビューを更新' : 'レビューを投稿'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  content: {
    padding: 24,
  },
  parkNameContainer: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  parkNameLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  parkName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 6,
  },
  star: {
    fontSize: 38,
  },
  ratingText: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
    marginTop: 6,
  },
  commentSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 150,
    backgroundColor: '#F9FAFB',
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  photoWarning: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
  },
  photoWarningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  photoWarningSubtext: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  photoButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  photoItem: {
    width: 100,
    height: 100,
    marginRight: 12,
    marginBottom: 12,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});






