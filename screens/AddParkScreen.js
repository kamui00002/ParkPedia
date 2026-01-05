// 公園追加画面
// 公園情報を入力してFirestoreに保存

import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import CustomHeader from '../components/CustomHeader';
import { uploadMultipleImages } from '../utils/imageUploader';
import { handleError } from '../utils/errorHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 対象年齢の選択肢
const AGE_OPTIONS = ['0-2歳', '3-5歳', '6歳以上'];

// 遊具の選択肢
const EQUIPMENT_OPTIONS = ['すべり台', 'ブランコ', '砂場', '鉄棒', 'ジャングルジム', '水遊び'];

// 施設の選択肢
const FACILITIES = [
  { id: 'toilet', label: 'トイレあり' },
  { id: 'diaper', label: 'オムツ交換台' },
  { id: 'parking', label: '駐車場あり' },
  { id: 'shade', label: '日陰が多い' },
  { id: 'stroller', label: 'ベビーカーOK' },
  { id: 'ball', label: 'ボール遊び可' },
];

export default function AddParkScreen({ navigation, route }) {
  // 編集モードのチェック
  const isEditMode = route.params?.isEditMode || false;
  const existingParkData = route.params?.parkData || null;
  // 状態管理
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAges, setSelectedAges] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 地図選択用の状態
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 35.6812,
    longitude: 139.7671,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapRef = useRef(null);

  const MAX_PHOTOS = 8;

  // 編集モードの場合、既存データを読み込む
  useEffect(() => {
    if (isEditMode && existingParkData) {
      setName(existingParkData.name || '');
      setAddress(existingParkData.address || '');
      setDescription(existingParkData.description || '');
      setSelectedAges(existingParkData.tags?.age || []);
      setSelectedEquipment(existingParkData.tags?.equipment || []);

      // 施設データを復元
      const facilityIds = [];
      if (existingParkData.facilities && Array.isArray(existingParkData.facilities)) {
        existingParkData.facilities.forEach(label => {
          const facility = FACILITIES.find(f => f.label === label);
          if (facility) {
            facilityIds.push(facility.id);
          }
        });
      }
      setSelectedFacilities(facilityIds);

      // 画像データを復元
      if (existingParkData.images && Array.isArray(existingParkData.images)) {
        setPhotos(existingParkData.images);
      }
    }
  }, [isEditMode, existingParkData]);

  // ログインチェック
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert(
        'ログインが必要です',
        `公園を${isEditMode ? '編集' : '追加'}するにはログインが必要です。`,
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

  // 対象年齢の選択/解除
  const toggleAge = age => {
    setSelectedAges(prev => {
      if (prev.includes(age)) {
        return prev.filter(item => item !== age);
      } else {
        return [...prev, age];
      }
    });
  };

  // 遊具の選択/解除
  const toggleEquipment = equipment => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(item => item !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  };

  // 施設の選択/解除
  const toggleFacility = facilityId => {
    setSelectedFacilities(prev => {
      if (prev.includes(facilityId)) {
        return prev.filter(id => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  // 地図モーダルを開く
  const openMapPicker = async () => {
    setLoadingLocation(true);
    try {
      // 位置情報の権限をリクエスト
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要', '位置情報へのアクセス権限が必要です');
        setLoadingLocation(false);
        return;
      }

      // 現在地を取得
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      // エラー時はデフォルト位置（東京）を使用
    }
    setLoadingLocation(false);
    setShowMapModal(true);
  };

  // 地図上でタップした位置を選択
  const handleMapPress = event => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  // 選択した位置から住所を取得して設定
  const confirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('エラー', '地図上で位置を選択してください');
      return;
    }

    setLoadingLocation(true);
    try {
      // 逆ジオコーディングで住所を取得
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      if (addressResult) {
        // 日本の住所形式に整形
        const addressParts = [];
        if (addressResult.region) addressParts.push(addressResult.region);
        if (addressResult.city) addressParts.push(addressResult.city);
        if (addressResult.district) addressParts.push(addressResult.district);
        if (addressResult.street) addressParts.push(addressResult.street);
        if (addressResult.streetNumber) addressParts.push(addressResult.streetNumber);

        const formattedAddress =
          addressParts.length > 0 ? addressParts.join('') : addressResult.name || '';

        setAddress(formattedAddress);
      }
    } catch {
      Alert.alert('エラー', '住所の取得に失敗しました');
    }
    setLoadingLocation(false);
    setShowMapModal(false);
  };

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      // allowsMultipleSelectionが有効な場合、allowsEditingは無効にする必要がある
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      if (photos.length + newPhotos.length > MAX_PHOTOS) {
        Alert.alert('エラー', `写真は最大${MAX_PHOTOS}枚までアップロードできます`);
        return;
      }
      setPhotos([...photos, ...newPhotos]);
    }
  };

  // 写真を削除
  const removePhoto = index => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // 公園データをFirestoreに保存または更新
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
      const facilities = selectedFacilities.map(id => {
        const facility = FACILITIES.find(f => f.id === id);
        return facility ? facility.label : id;
      });

      // 画像をFirebase Storageにアップロード
      let uploadedImageUrls = [];
      let mainImageUrl = null;

      // 新規画像（httpやhttpsで始まらないローカルURI）のみをアップロード
      const newPhotos = photos.filter(photo => !photo.startsWith('http'));
      const existingPhotos = photos.filter(photo => photo.startsWith('http'));

      if (newPhotos.length > 0) {
        try {
          const newUploadedUrls = await uploadMultipleImages(newPhotos, 'parks');
          uploadedImageUrls = [...existingPhotos, ...newUploadedUrls];
        } catch (uploadError) {
          if (__DEV__) console.error('画像アップロードエラー:', uploadError);
          Alert.alert('警告', '画像のアップロードに失敗しましたが、公園は保存されます。');
          uploadedImageUrls = existingPhotos;
        }
      } else {
        uploadedImageUrls = existingPhotos;
      }

      mainImageUrl = uploadedImageUrls[0] || null;

      if (isEditMode && existingParkData?.id) {
        // 編集モード: 既存の公園を更新
        const parkData = {
          name: name.trim(),
          address: address.trim(),
          description: description.trim(),
          tags: {
            age: selectedAges,
            equipment: selectedEquipment,
          },
          facilities: facilities,
          mainImage: mainImageUrl,
          images: uploadedImageUrls,
          updatedAt: serverTimestamp(),
        };

        const parkRef = doc(db, 'parks', existingParkData.id);
        await updateDoc(parkRef, parkData);

        Alert.alert('成功', '公園を更新しました！', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Admin');
            },
          },
        ]);
      } else {
        // 新規追加モード（updatedAtは含めない - Firestoreルールで禁止）
        const parkData = {
          name: name.trim(),
          address: address.trim(),
          description: description.trim(),
          tags: {
            age: selectedAges,
            equipment: selectedEquipment,
          },
          facilities: facilities,
          mainImage: mainImageUrl,
          images: uploadedImageUrls,
          rating: 0,
          reviewCount: 0,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'parks'), parkData);

        Alert.alert('成功', '公園を追加しました！', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ]);
      }
    } catch (error) {
      // 統一されたエラーハンドリング
      handleError(
        error,
        `AddParkScreen.handleSubmit.${isEditMode ? 'update' : 'create'}`,
        Alert.alert
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomHeader
        navigation={navigation}
        searchQuery=""
        onSearchChange={() => {}}
        currentScreen="addPark"
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 公園名入力 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            公園名 <Text style={styles.required}>*</Text>
          </Text>
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
          <Text style={styles.label}>
            住所 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="例: 東京都渋谷区代々木神園町2-1"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.mapPickerButton}
            onPress={openMapPicker}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Text style={styles.mapPickerButtonText}>📍 マップから選ぶ</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 説明入力 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            説明 <Text style={styles.required}>*</Text>
          </Text>
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

        {/* 写真アップロード */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            写真 ({photos.length}/{MAX_PHOTOS})
          </Text>
          <Text style={styles.photoHint}>最初の写真がメイン画像になります。</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImage}
            disabled={photos.length >= MAX_PHOTOS}
          >
            <Text style={styles.photoButtonText}>ファイル選択</Text>
          </TouchableOpacity>
          {photos.length === 0 && <Text style={styles.photoStatus}>選択されていません</Text>}

          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  {index === 0 && (
                    <View style={styles.mainImageBadge}>
                      <Text style={styles.mainImageText}>メイン</Text>
                    </View>
                  )}
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

        {/* 対象年齢選択 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>対象年齢</Text>
          <View style={styles.optionsContainer}>
            {AGE_OPTIONS.map(age => {
              const isSelected = selectedAges.includes(age);
              return (
                <TouchableOpacity
                  key={age}
                  style={styles.checkboxOption}
                  onPress={() => toggleAge(age)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxOptionText}>{age}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 遊具選択 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>遊具</Text>
          <View style={styles.optionsContainer}>
            {EQUIPMENT_OPTIONS.map(equipment => {
              const isSelected = selectedEquipment.includes(equipment);
              return (
                <TouchableOpacity
                  key={equipment}
                  style={styles.checkboxOption}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxOptionText}>{equipment}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 施設選択 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>設備</Text>
          <View style={styles.optionsContainer}>
            {FACILITIES.map(facility => {
              const isSelected = selectedFacilities.includes(facility.id);
              return (
                <TouchableOpacity
                  key={facility.id}
                  style={styles.checkboxOption}
                  onPress={() => toggleFacility(facility.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxOptionText}>{facility.label}</Text>
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
            <Text style={styles.submitButtonText}>{isEditMode ? '公園を更新' : '公園を追加'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 地図選択モーダル */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapModalCancel}>
              <Text style={styles.mapModalCancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>位置を選択</Text>
            <TouchableOpacity
              onPress={confirmLocation}
              style={styles.mapModalConfirm}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Text style={styles.mapModalConfirmText}>決定</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.mapHintText}>地図をタップして位置を選択してください</Text>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="選択した位置"
                draggable
                onDragEnd={e => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  content: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  optionsContainer: {
    marginTop: 10,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  checkboxOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
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
  photoHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  photoStatus: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
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
  mainImageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mainImageText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  // 地図ピッカー関連のスタイル
  mapPickerButton: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  mapPickerButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  mapModalCancel: {
    padding: 4,
  },
  mapModalCancelText: {
    color: '#6B7280',
    fontSize: 16,
  },
  mapModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapModalConfirm: {
    padding: 4,
  },
  mapModalConfirmText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  mapHintText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
  },
  map: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});
