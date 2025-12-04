# ⚡ ParkPedia - パフォーマンス最適化プラン

**作成日**: 2025年12月4日  
**目標**: 読み込み時間90%削減、コスト80%削減

---

## 📊 現状分析

### パフォーマンス指標

| 項目 | 現状 | 目標 | 改善率 |
|------|------|------|--------|
| アプリ起動時間 | 5-10秒 | 1秒以内 | 80-90% |
| マイページ読み込み | 3-5秒 | 0.5秒 | 83-90% |
| 画像読み込み | 2-3秒 | 0.3秒 | 85-90% |
| メモリ使用量 | 200-300MB | 100MB | 50-67% |

### コスト試算（月間1万ユーザーの場合）

| 項目 | 現状 | 最適化後 | 削減率 |
|------|------|----------|--------|
| Firestore読み取り | 11,800,000回 | 1,200,000回 | **90%** |
| Storage使用量 | 400GB | 10GB | **97.5%** |
| 月額コスト | $10-15 | $0-2 | **80-100%** |

---

## 🔥 最優先修正（Week 1-2）

### 1. N+1クエリの解消（MyPageScreen）

**問題**: お気に入り30件で30回のシリアルクエリ

**現在のコード**:
```javascript
// ❌ 悪い例
for (const parkId of favoriteParkIds) {
  const parkRef = doc(db, 'parks', parkId);
  const parkSnap = await getDoc(parkRef);  // 30回クエリ！
  if (parkSnap.exists()) {
    favoriteParksData.push({ id: parkSnap.id, ...parkSnap.data() });
  }
}
```

**最適化後のコード**:
```javascript
// ✅ 良い例 - in演算子を使用
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const fetchParksInBatch = async (parkIds) => {
  if (parkIds.length === 0) return [];
  
  const chunks = chunkArray(parkIds, 10);  // Firestoreの in は最大10件
  const allParks = [];
  
  for (const chunk of chunks) {
    const q = query(
      collection(db, 'parks'),
      where('__name__', 'in', chunk)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      allParks.push({ id: doc.id, ...doc.data() });
    });
  }
  
  return allParks;
};

// 使用例
const favoriteParksData = await fetchParksInBatch(favoriteParkIds);
```

**効果**:
- クエリ数: 30回 → 3回 (90%削減)
- 読み込み時間: 3秒 → 0.5秒
- 月間コスト: $4 → $0.4

---

### 2. ページネーションの実装（HomeScreen）

**問題**: 全公園を一度に取得（1000件の場合2MB）

**最適化コード**:

`screens/HomeScreen.js`:
```javascript
const ITEMS_PER_PAGE = 20;

const HomeScreen = () => {
  const [parks, setParks] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchParks = useCallback(async (loadMore = false) => {
    if (loading || (!hasMore && loadMore)) return;
    
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'parks'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );
      
      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }
      
      const newParks = [];
      snapshot.forEach(doc => {
        newParks.push({ id: doc.id, ...doc.data() });
      });
      
      setParks(prev => loadMore ? [...prev, ...newParks] : newParks);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(newParks.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('データ取得エラー:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastVisible]);
  
  useEffect(() => {
    fetchParks();
  }, []);
  
  return (
    <FlatList
      data={parks}
      renderItem={({ item }) => <ParkCard park={item} />}
      onEndReached={() => fetchParks(true)}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      refreshing={loading && !lastVisible}
      onRefresh={() => {
        setLastVisible(null);
        setHasMore(true);
        fetchParks();
      }}
    />
  );
};
```

**効果**:
- データ転送: 2MB → 40KB (95%削減)
- 起動時間: 5-10秒 → 1秒
- メモリ: 200MB → 50MB

---

### 3. 画像の最適化とStorage移行

**問題**: 5MB画像がローカルURIのままFirestoreに保存

**最適化コード**:

```bash
# 必要なパッケージをインストール
expo install expo-image-manipulator firebase/storage
```

`utils/imageOptimizer.js` (新規作成):
```javascript
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export const optimizeAndUploadImage = async (uri, folder = 'parks') => {
  try {
    // 1. 画像をリサイズ・圧縮
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],  // 幅800pxに
      { 
        compress: 0.7, 
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    
    // 2. サムネイルも生成
    const thumbnailResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200 } }],
      { 
        compress: 0.6, 
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    
    // 3. Firebase Storageにアップロード
    const currentUser = auth.currentUser;
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const filename = `${timestamp}_${randomId}.jpg`;
    
    // メイン画像
    const storageRef = ref(storage, `images/${folder}/${currentUser.uid}/${filename}`);
    const response = await fetch(manipResult.uri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    // サムネイル
    const thumbRef = ref(storage, `images/${folder}/${currentUser.uid}/thumb_${filename}`);
    const thumbResponse = await fetch(thumbnailResult.uri);
    const thumbBlob = await thumbResponse.blob();
    await uploadBytes(thumbRef, thumbBlob);
    const thumbURL = await getDownloadURL(thumbRef);
    
    return {
      url: downloadURL,
      thumbnailUrl: thumbURL,
    };
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    throw new Error('画像のアップロードに失敗しました');
  }
};
```

**AddParkScreen.js の修正**:
```javascript
import { optimizeAndUploadImage } from '../utils/imageOptimizer';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });
  
  if (!result.canceled) {
    try {
      setUploading(true);
      
      // Firebase Storageにアップロード
      const { url, thumbnailUrl } = await optimizeAndUploadImage(
        result.assets[0].uri,
        'parks'
      );
      
      setPhotos([...photos, { url, thumbnailUrl }]);
    } catch (error) {
      Alert.alert('エラー', error.message);
    } finally {
      setUploading(false);
    }
  }
};
```

**効果**:
- 画像サイズ: 5MB → 150KB (97%削減)
- ストレージコスト: 400GB → 12GB
- 読み込み速度: 3倍向上

---

## 🚀 高優先修正（Week 3-4）

### 4. お気に入り状態の一括取得

**現在の問題**: 各公園カードで個別にクエリ（20枚=20クエリ）

**最適化コード**:

```javascript
// Context APIでお気に入り状態を共有
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoritesMap, setFavoritesMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  const fetchAllFavorites = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('type', '==', 'favorite')
      );
      const snapshot = await getDocs(q);
      
      const map = {};
      snapshot.forEach(doc => {
        map[doc.data().parkId] = doc.id;  // ドキュメントIDも保存
      });
      
      setFavoritesMap(map);
    } catch (error) {
      console.error('お気に入り取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllFavorites();
  }, []);
  
  const toggleFavorite = async (parkId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    if (favoritesMap[parkId]) {
      // 削除
      await deleteDoc(doc(db, 'favorites', favoritesMap[parkId]));
      setFavoritesMap(prev => {
        const newMap = { ...prev };
        delete newMap[parkId];
        return newMap;
      });
    } else {
      // 追加
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId: currentUser.uid,
        parkId,
        type: 'favorite',
        createdAt: serverTimestamp(),
      });
      setFavoritesMap(prev => ({ ...prev, [parkId]: docRef.id }));
    }
  };
  
  return (
    <FavoritesContext.Provider value={{ favoritesMap, loading, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
```

**App.js の修正**:
```javascript
import { FavoritesProvider } from './contexts/FavoritesContext';

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </FavoritesProvider>
  );
}
```

**ParkCard の修正**:
```javascript
import { useFavorites } from '../contexts/FavoritesContext';

const ParkCard = ({ park }) => {
  const { favoritesMap, toggleFavorite } = useFavorites();
  const isFavorite = !!favoritesMap[park.id];
  
  return (
    <TouchableOpacity onPress={() => toggleFavorite(park.id)}>
      <Text>{isFavorite ? '❤️' : '🤍'}</Text>
    </TouchableOpacity>
  );
};
```

**効果**:
- クエリ数: 20回/画面 → 1回/起動 (95%削減)

---

### 5. 複合インデックスの作成

**必要なインデックス**:

Firebase Console → Firestore Database → インデックス → 複合インデックスを作成

1. **reviews コレクション**
   - フィールド: `parkId` (昇順), `createdAt` (降順)

2. **parks コレクション** (フィルタリング用)
   - フィールド: `rating` (昇順), `createdAt` (降順)
   - フィールド: `facilities` (配列), `createdAt` (降順)

**または CLI で作成**:

`firestore.indexes.json` (新規作成):
```json
{
  "indexes": [
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "parkId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "parks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "rating", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

```bash
firebase deploy --only firestore:indexes --project parkpedia-app
```

---

## 📈 中期最適化（Week 5-8）

### 6. キャッシング戦略

**React Query の導入**:

```bash
npm install @tanstack/react-query
```

`App.js`:
```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5分間キャッシュ
      cacheTime: 10 * 60 * 1000,  // 10分間保持
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  );
}
```

**HomeScreen の修正**:
```javascript
import { useQuery } from '@tanstack/react-query';

const fetchParks = async () => {
  const parksRef = collection(db, 'parks');
  const q = query(parksRef, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  
  const parks = [];
  snapshot.forEach(doc => {
    parks.push({ id: doc.id, ...doc.data() });
  });
  
  return parks;
};

const HomeScreen = () => {
  const { data: parks, isLoading, refetch } = useQuery(
    ['parks'],
    fetchParks,
    {
      staleTime: 5 * 60 * 1000,
    }
  );
  
  // ...
};
```

**効果**:
- 重複クエリの完全削除
- 画面遷移時の高速化

---

### 7. オフライン対応

```javascript
// firebaseConfig.js
import { enableIndexedDbPersistence } from 'firebase/firestore';

try {
  await enableIndexedDbPersistence(db);
  console.log('✅ オフライン永続化が有効化されました');
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.log('⚠️ 複数のタブが開いています');
  } else if (err.code === 'unimplemented') {
    console.log('⚠️ ブラウザが非対応です');
  }
}
```

---

## 📊 成功指標

### パフォーマンス

- [ ] アプリ起動: 1秒以内
- [ ] マイページ: 0.5秒以内
- [ ] 画像読み込み: 0.3秒以内
- [ ] メモリ: 100MB以下

### コスト

- [ ] Firestore読み取り: 90%削減
- [ ] Storage使用量: 95%削減
- [ ] 月額コスト: $2以下

---

## 📋 実装チェックリスト

### Week 1-2: 最優先

- [ ] N+1クエリの解消（MyPageScreen）
- [ ] ページネーションの実装（HomeScreen）
- [ ] 画像最適化とStorage移行
- [ ] 動作確認とベンチマーク

### Week 3-4: 高優先

- [ ] お気に入り状態の一括取得
- [ ] Context API の実装
- [ ] 複合インデックスの作成
- [ ] パフォーマンステスト

### Week 5-8: 中期

- [ ] React Query の導入
- [ ] オフライン対応
- [ ] キャッシング戦略の実装
- [ ] 最終ベンチマーク

---

**すべての最適化完了後、パフォーマンスが劇的に向上します！**
