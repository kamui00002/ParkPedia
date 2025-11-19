import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function AddParkScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  // 施設の選択肢
  const facilitiesOptions = [
    '遊具',
    'トイレ',
    'ベンチ',
    '水飲み場',
    '芝生広場',
    '駐車場',
    'カフェ',
    '自動販売機',
  ];

  // 施設の選択/解除
  const toggleFacility = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  // 公園を追加
  const handleAddPark = async () => {
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
    if (!auth.currentUser) {
      Alert.alert('エラー', '公園を追加するにはログインが必要です', [
        {
          text: 'ログイン',
          onPress: () => navigation.navigate('Login')
        },
        { text: 'キャンセル' }
      ]);
      return;
    }

    setLoading(true);
    try {
      // Firestoreに公園を追加
      await addDoc(collection(db, 'parks'), {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        facilities: selectedFacilities,
        rating: 0,
        reviewCount: 0,
        createdBy: auth.currentUser.uid,
        createdByEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      Alert.alert('成功', '公園を追加しました！', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('公園追加エラー:', error);
      Alert.alert('エラー', '公園の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* タイトル */}
        <View style={styles.header}>
          <Text style={styles.title}>新しい公園を追加</Text>
          <Text style={styles.subtitle}>地域の公園情報を共有しましょう</Text>
        </View>

        {/* 公園名 */}
        <View style={styles.section}>
          <Text style={styles.label}>公園名 *</Text>
          <TextInput
            style={styles.input}
            placeholder="例: 代々木公園"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 住所 */}
        <View style={styles.section}>
          <Text style={styles.label}>住所 *</Text>
          <TextInput
            style={styles.input}
            placeholder="例: 東京都渋谷区代々木神園町2-1"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* 説明 */}
        <View style={styles.section}>
          <Text style={styles.label}>説明 *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="公園の特徴や雰囲気を教えてください"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{description.length} / 500文字</Text>
        </View>

        {/* 施設 */}
        <View style={styles.section}>
          <Text style={styles.label}>施設</Text>
          <Text style={styles.helperText}>該当する施設を選択してください</Text>
          <View style={styles.facilitiesContainer}>
            {facilitiesOptions.map((facility) => (
              <TouchableOpacity
                key={facility}
                style={[
                  styles.facilityChip,
                  selectedFacilities.includes(facility) && styles.facilityChipSelected
                ]}
                onPress={() => toggleFacility(facility)}
              >
                <Text
                  style={[
                    styles.facilityText,
                    selectedFacilities.includes(facility) && styles.facilityTextSelected
                  ]}
                >
                  {selectedFacilities.includes(facility) ? '✓ ' : ''}{facility}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 注意事項 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>📝 ご注意</Text>
          <Text style={styles.noticeText}>• 正確な情報を入力してください</Text>
          <Text style={styles.noticeText}>• 不適切な内容は削除される場合があります</Text>
          <Text style={styles.noticeText}>• 写真は後から追加できます</Text>
        </View>

        {/* 追加ボタン */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleAddPark}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>公園を追加</Text>
          )}
        </TouchableOpacity>

        {/* キャンセルボタン */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>キャンセル</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    minHeight: 120,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityChip: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  facilityChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  facilityText: {
    fontSize: 14,
    color: '#666',
  },
  facilityTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noticeSection: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
