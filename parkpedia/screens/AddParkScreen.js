// 公園追加画面
// 公園情報を入力してFirestoreに保存

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// 施設の選択肢
const FACILITIES = [
  { id: 'playground', label: '遊具' },
  { id: 'toilet', label: 'トイレ' },
  { id: 'bench', label: 'ベンチ' },
  { id: 'water', label: '水飲み場' },
  { id: 'lawn', label: '芝生広場' },
  { id: 'parking', label: '駐車場' },
];

export default function AddParkScreen({ navigation }) {
  // 状態管理
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ログインチェック
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert(
        'ログインが必要です',
        '公園を追加するにはログインが必要です。',
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
  }, []);

  // 施設の選択/解除
  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) => {
      if (prev.includes(facilityId)) {
        return prev.filter((id) => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  // 公園データをFirestoreに保存
  const handleSubmit = async () => {
    // バリデーション
    if (!name.trim()) {
      Alert.alert('エラー', '公園名を入力してください');
      return;
    }

    if (!address.trim()) {
      Alert.alert('エラー', '住所を入力してください');
      return;
    }

    if (!description.trim()) {
      Alert.alert('エラー', '説明を入力してください');
      return;
    }

    // ログインチェック
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('エラー', 'ログインが必要です');
      navigation.navigate('Login');
      return;
    }

    try {
      setSubmitting(true);

      // 施設のラベルを取得
      const facilities = selectedFacilities.map((id) => {
        const facility = FACILITIES.find((f) => f.id === id);
        return facility ? facility.label : id;
      });

      // Firestoreに保存
      const docRef = await addDoc(collection(db, 'parks'), {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        facilities: facilities,
        rating: 0, // 初期評価は0
        reviewCount: 0, // レビュー数は0
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      console.log('✅ 公園データを保存しました:', docRef.id);

      Alert.alert(
        '成功',
        '公園を追加しました！',
        [
          {
            text: 'OK',
            onPress: () => {
              // ホーム画面に戻る
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ 公園データの保存エラー:', error);
      Alert.alert('エラー', `公園の追加に失敗しました: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 公園名入力 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>公園名 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="例: 代々木公園"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        {/* 住所入力 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>住所 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="例: 東京都渋谷区代々木神園町2-1"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
          />
        </View>

        {/* 説明入力 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>説明 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="公園の特徴や魅力を書いてください..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* 施設選択 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>施設（複数選択可）</Text>
          <View style={styles.facilitiesContainer}>
            {FACILITIES.map((facility) => {
              const isSelected = selectedFacilities.includes(facility.id);
              return (
                <TouchableOpacity
                  key={facility.id}
                  style={[
                    styles.facilityButton,
                    isSelected && styles.facilityButtonSelected,
                  ]}
                  onPress={() => toggleFacility(facility.id)}
                >
                  <Text
                    style={[
                      styles.facilityButtonText,
                      isSelected && styles.facilityButtonTextSelected,
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}
                    {facility.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 送信ボタン */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>公園を追加</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 15,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  facilityButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  facilityButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  facilityButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  facilityButtonTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
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

