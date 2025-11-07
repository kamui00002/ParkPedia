// ホーム画面
// Firestoreから公園リストを取得して表示、検索機能付き

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function HomeScreen({ navigation }) {
  // 状態管理
  const [parks, setParks] = useState([]);
  const [filteredParks, setFilteredParks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 公園データの取得
  useEffect(() => {
    console.log('🚀 HomeScreen マウント - fetchParksを呼び出し');
    fetchParks();
  }, []);

  // デバッグ: parks状態の変化を監視
  useEffect(() => {
    console.log('📊 parks状態が更新されました:', parks.length, '件');
    if (parks.length > 0) {
      console.log('📋 最初の公園データ:', parks[0]);
    }
  }, [parks]);

  // デバッグ: filteredParks状態の変化を監視
  useEffect(() => {
    console.log('🔍 filteredParks状態が更新されました:', filteredParks.length, '件');
  }, [filteredParks]);

  // 検索クエリが変更されたときにフィルタリング
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredParks(parks);
    } else {
      const filtered = parks.filter((park) =>
        park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParks(filtered);
    }
  }, [searchQuery, parks]);

  // Firestoreから公園データを取得
  const fetchParks = async () => {
    try {
      console.log('🔍 公園データを取得開始...');
      
      // 認証状態を確認
      const currentUser = auth.currentUser;
      console.log('👤 現在のユーザー:', currentUser ? currentUser.email : '未ログイン');
      console.log('🆔 ユーザーID:', currentUser ? currentUser.uid : 'なし');
      
      // Firestore接続を確認
      console.log('💾 Firestore DB:', db ? '接続済み' : '未接続');
      console.log('🆔 プロジェクトID:', db.app.options.projectId);
      
      setLoading(true);
      const parksRef = collection(db, 'parks');
      console.log('📂 コレクション参照:', parksRef.path);
      console.log('📂 コレクションID:', parksRef.id);
      
      console.log('📡 Firestoreにクエリ送信...');
      const querySnapshot = await getDocs(parksRef);
      
      console.log('📦 取得したドキュメント数:', querySnapshot.size);
      console.log('📋 クエリメタデータ:', {
        fromCache: querySnapshot.metadata.fromCache,
        hasPendingWrites: querySnapshot.metadata.hasPendingWrites
      });
      
      if (querySnapshot.size === 0) {
        console.warn('⚠️ データが0件です。以下を確認してください:');
        console.warn('  1. Firebase Consoleで「parks」コレクションにデータが存在するか');
        console.warn('  2. コレクション名が「parks」で正しいか');
        console.warn('  3. Firestoreセキュリティルールで読み取りが許可されているか');
        console.warn('  4. 認証が必要な場合、ログインしているか');
      }
      
      const parksData = [];
      querySnapshot.forEach((doc) => {
        console.log('📄 ドキュメントID:', doc.id);
        console.log('📝 データ:', doc.data());
        parksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // JavaScriptで新しい順にソート（クライアント側ソート）
      parksData.sort((a, b) => {
        // createdAtがTimestamp型の場合
        if (a.createdAt && b.createdAt) {
          const aTime = a.createdAt.seconds || a.createdAt.toMillis?.() / 1000 || 0;
          const bTime = b.createdAt.seconds || b.createdAt.toMillis?.() / 1000 || 0;
          return bTime - aTime; // 降順（新しい順）
        }
        // createdAtがDate型の場合
        if (a.createdAt instanceof Date && b.createdAt instanceof Date) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        // createdAtがない場合は順番を変えない
        return 0;
      });
      
      console.log('✅ 公園データ取得完了:', parksData.length, '件');
      console.log('📋 ソート後のデータ:', JSON.stringify(parksData, null, 2));
      
      if (parksData.length === 0) {
        console.warn('⚠️ 警告: 公園データが0件です。Firestoreにデータが存在するか確認してください。');
      }
      
      setParks(parksData);
      setFilteredParks(parksData);
      
      console.log('✅ 状態更新完了 - parks:', parksData.length, '件');
    } catch (error) {
      console.error('❌ 公園データの取得エラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      
      // よくあるエラーの説明
      if (error.code === 'permission-denied') {
        console.error('🚫 権限エラー: Firestoreセキュリティルールで読み取りが拒否されました');
        Alert.alert('権限エラー', 'データの読み取り権限がありません。Firestoreセキュリティルールを確認してください。');
      } else if (error.code === 'unavailable') {
        console.error('🌐 接続エラー: Firestoreに接続できません');
        Alert.alert('接続エラー', 'Firestoreに接続できません。インターネット接続を確認してください。');
      } else {
        Alert.alert('エラー', `公園データの取得に失敗しました: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 公園カードのレンダリング
  const renderParkCard = ({ item }) => {
    console.log('🎴 公園カードをレンダリング:', item.id, item.name);
    return (
      <TouchableOpacity
        style={styles.parkCard}
        onPress={() => navigation.navigate('ParkDetail', { parkId: item.id, park: item })}
      >
        <Text style={styles.parkName}>{item.name || '名前なし'}</Text>
      {item.address && (
        <Text style={styles.parkAddress}>📍 {item.address}</Text>
      )}
      {item.description && (
        <Text style={styles.parkDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      {item.rating && (
        <Text style={styles.parkRating}>⭐ {item.rating.toFixed(1)}</Text>
      )}
      </TouchableOpacity>
    );
  };

  // デバッグ: レンダリング時の状態をログ出力
  console.log('🎨 レンダリング - loading:', loading, 'parks:', parks.length, 'filteredParks:', filteredParks.length);

  if (loading) {
    console.log('⏳ ローディング画面を表示中...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="公園名または住所で検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* 公園リスト */}
      <FlatList
        data={filteredParks}
        renderItem={renderParkCard}
        keyExtractor={(item) => {
          const key = item.id || item.name || 'unknown';
          console.log('🔑 keyExtractor:', key);
          return key;
        }}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '検索結果が見つかりませんでした' : '公園がまだ登録されていません'}
            </Text>
            <Text style={[styles.emptyText, { marginTop: 10, fontSize: 12 }]}>
              デバッグ: parks={parks.length}件, filteredParks={filteredParks.length}件
            </Text>
          </View>
        }
        onLayout={() => console.log('📐 FlatListがレイアウトされました')}
      />

      {/* 公園追加ボタン */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // ログインチェック
          const currentUser = auth.currentUser;
          if (currentUser) {
            // ログイン済みの場合は公園追加画面に遷移
            navigation.navigate('AddPark');
          } else {
            // 未ログインの場合はアラートを表示してログイン画面に遷移
            Alert.alert(
              'ログインが必要です',
              '公園を追加するにはログインが必要です。',
              [
                {
                  text: 'キャンセル',
                  style: 'cancel',
                },
                {
                  text: 'ログイン',
                  onPress: () => navigation.navigate('Login'),
                },
              ]
            );
          }
        }}
      >
        <Text style={styles.addButtonText}>+ 公園を追加</Text>
      </TouchableOpacity>
    </View>
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  parkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  parkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  parkAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  parkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  parkRating: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

