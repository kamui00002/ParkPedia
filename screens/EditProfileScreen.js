// プロフィール編集画面

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { uploadImageToStorage } from '../utils/imageUploader';
import { handleError } from '../utils/errorHandler';

export default function EditProfileScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPhotoUri, setNewPhotoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigation.goBack();
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
        setPhotoURL(data.photoURL || '');
      }
    } catch (error) {
      handleError(error, 'EditProfileScreen.loadProfile', Alert.alert);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', 'フォトライブラリへのアクセスを許可してください');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setNewPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (displayName.length > 50) {
      Alert.alert('エラー', '表示名は50文字以内にしてください');
      return;
    }
    if (bio.length > 500) {
      Alert.alert('エラー', '自己紹介は500文字以内にしてください');
      return;
    }

    try {
      setSaving(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('エラー', 'ログインが必要です');
        return;
      }

      let updatedPhotoURL = photoURL;
      if (newPhotoUri) {
        updatedPhotoURL = await uploadImageToStorage(newPhotoUri, 'profiles');
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: updatedPhotoURL,
        updatedAt: serverTimestamp(),
      });

      Alert.alert('保存完了', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      handleError(error, 'EditProfileScreen.handleSave', Alert.alert);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const currentPhotoUri = newPhotoUri || photoURL;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>プロフィール編集</Text>

        {/* プロフィール写真 */}
        <View style={styles.photoSection}>
          {currentPhotoUri ? (
            <Image source={{ uri: currentPhotoUri }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>👤</Text>
            </View>
          )}
          <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
            <Text style={styles.changePhotoButtonText}>写真を変更</Text>
          </TouchableOpacity>
        </View>

        {/* 表示名 */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>表示名（最大50文字）</Text>
          <TextInput
            style={styles.textInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="表示名を入力"
            placeholderTextColor="#9CA3AF"
            maxLength={50}
            autoCapitalize="none"
          />
          <Text style={styles.charCount}>{displayName.length}/50</Text>
        </View>

        {/* 自己紹介 */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>自己紹介（最大500文字）</Text>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="自己紹介を入力"
            placeholderTextColor="#9CA3AF"
            maxLength={500}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/500</Text>
        </View>

        {/* 保存ボタン */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>保存する</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBF8',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#ECFDF5',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
  },
  changePhotoButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  changePhotoButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064E3B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bioInput: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
