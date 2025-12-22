#!/usr/bin/env node

/**
 * Firestoreからテストデータを削除するスクリプト
 *
 * 使用方法:
 * 1. Firebase Console → Project Settings → Service Accounts
 * 2. "Generate New Private Key" をクリック
 * 3. ダウンロードしたJSONファイルを serviceAccountKey.json として保存
 * 4. node scripts/deleteTestData.js を実行
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// サービスアカウントキーのパスを確認
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ エラー: serviceAccountKey.json が見つかりません');
  console.error('');
  console.error('📝 以下の手順でサービスアカウントキーを取得してください:');
  console.error('');
  console.error('1. Firebase Console を開く: https://console.firebase.google.com/');
  console.error('2. プロジェクトを選択');
  console.error('3. ⚙️ Settings → Project Settings');
  console.error('4. Service Accounts タブ');
  console.error('5. "Generate New Private Key" ボタンをクリック');
  console.error('6. ダウンロードしたJSONファイルを以下に配置:');
  console.error('   parkpedia/serviceAccountKey.json');
  console.error('');
  process.exit(1);
}

// Firebase Admin SDKを初期化
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// テストデータのパターン
const TEST_PARK_NAMES = ['中央公園', '桜の森公園', 'こどもの森公園', '水と緑の広場', '展望台公園'];

const TEST_USER_NAMES = [
  '田中太郎',
  '佐藤花子',
  '山田次郎',
  '高橋美咲',
  '鈴木一郎',
  '伊藤舞',
  '中村健太',
  '小林愛子',
  '渡辺真由美',
  '佐々木大輔',
  '松本優子',
  '加藤直樹',
  '木村由紀',
  '林浩二',
  '井上さくら',
];

// ユーザー入力を取得する関数
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

// テスト公園を検索
async function findTestParks() {
  console.log('🔍 テスト公園を検索中...');
  const testParks = [];

  const parksSnapshot = await db.collection('parks').get();

  parksSnapshot.forEach(doc => {
    const data = doc.data();

    // テスト公園の条件をチェック
    const isTestPark =
      TEST_PARK_NAMES.includes(data.name) ||
      (data.userId && data.userId.startsWith('sample-user-')) ||
      (data.address && data.address.endsWith('1-1-1'));

    if (isTestPark) {
      testParks.push({
        id: doc.id,
        name: data.name,
        address: data.address,
        userId: data.userId,
      });
    }
  });

  return testParks;
}

// テストレビューを検索
async function findTestReviews() {
  console.log('🔍 テストレビューを検索中...');
  const testReviews = [];

  const reviewsSnapshot = await db.collection('reviews').get();

  reviewsSnapshot.forEach(doc => {
    const data = doc.data();

    // テストレビューの条件をチェック
    const isTestReview =
      TEST_USER_NAMES.includes(data.userName) ||
      (data.userId && data.userId.startsWith('sample-user-'));

    if (isTestReview) {
      testReviews.push({
        id: doc.id,
        userName: data.userName,
        userId: data.userId,
        parkId: data.parkId,
        rating: data.rating,
      });
    }
  });

  return testReviews;
}

// テストお気に入りを検索
async function findTestFavorites() {
  console.log('🔍 テストお気に入りを検索中...');
  const testFavorites = [];

  const favoritesSnapshot = await db.collection('favorites').get();

  favoritesSnapshot.forEach(doc => {
    const data = doc.data();

    // テストお気に入りの条件をチェック
    const isTestFavorite = data.userId && data.userId.startsWith('sample-user-');

    if (isTestFavorite) {
      testFavorites.push({
        id: doc.id,
        userId: data.userId,
        parkId: data.parkId,
        type: data.type,
      });
    }
  });

  return testFavorites;
}

// テスト報告を検索
async function findTestReports() {
  console.log('🔍 テスト報告を検索中...');
  const testReports = [];

  try {
    const reportsSnapshot = await db.collection('reports').get();

    reportsSnapshot.forEach(doc => {
      const data = doc.data();

      // テスト報告の条件をチェック
      const isTestReport =
        (data.reportedBy && data.reportedBy.startsWith('sample-user-')) ||
        (data.reportedUser && data.reportedUser.startsWith('sample-user-'));

      if (isTestReport) {
        testReports.push({
          id: doc.id,
          reportedBy: data.reportedBy,
          reportedUser: data.reportedUser,
        });
      }
    });
  } catch (error) {
    // reportsコレクションが存在しない場合はスキップ
  }

  return testReports;
}

// テストブロックユーザーを検索
async function findTestBlockedUsers() {
  console.log('🔍 テストブロックユーザーを検索中...');
  const testBlocked = [];

  try {
    const blockedSnapshot = await db.collection('blockedUsers').get();

    blockedSnapshot.forEach(doc => {
      const data = doc.data();

      // テストブロックの条件をチェック
      const isTestBlocked =
        (data.userId && data.userId.startsWith('sample-user-')) ||
        (data.blockedUserId && data.blockedUserId.startsWith('sample-user-'));

      if (isTestBlocked) {
        testBlocked.push({
          id: doc.id,
          userId: data.userId,
          blockedUserId: data.blockedUserId,
        });
      }
    });
  } catch (error) {
    // blockedUsersコレクションが存在しない場合はスキップ
  }

  return testBlocked;
}

// データを削除
async function deleteData(collectionName, items) {
  if (items.length === 0) {
    return;
  }

  console.log(`\n🗑️  ${collectionName} から ${items.length}件のテストデータを削除中...`);

  const batch = db.batch();
  let batchCount = 0;
  let totalDeleted = 0;

  for (const item of items) {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.delete(docRef);
    batchCount++;
    totalDeleted++;

    // Firestoreのバッチは500件まで
    if (batchCount === 500) {
      await batch.commit();
      batchCount = 0;
    }
  }

  // 残りのバッチをコミット
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`  ✅ ${totalDeleted}件のデータを削除しました`);
}

// メイン処理
async function main() {
  console.log('');
  console.log('🧹 Firebase テストデータ削除スクリプト');
  console.log('='.repeat(50));
  console.log('');

  try {
    // テストデータを検索
    const testParks = await findTestParks();
    const testReviews = await findTestReviews();
    const testFavorites = await findTestFavorites();
    const testReports = await findTestReports();
    const testBlocked = await findTestBlockedUsers();

    console.log('');
    console.log('📊 削除対象のテストデータ:');
    console.log('='.repeat(50));

    // テスト公園の表示
    if (testParks.length > 0) {
      console.log(`\n🏞️  公園: ${testParks.length}件`);
      testParks.forEach(park => {
        console.log(`  - ${park.name} (${park.address})`);
      });
    } else {
      console.log('\n🏞️  公園: 0件（削除対象なし）');
    }

    // テストレビューの表示
    if (testReviews.length > 0) {
      console.log(`\n💬 レビュー: ${testReviews.length}件`);
      testReviews.forEach(review => {
        console.log(`  - ${review.userName} (評価: ${'⭐'.repeat(review.rating)})`);
      });
    } else {
      console.log('\n💬 レビュー: 0件（削除対象なし）');
    }

    // テストお気に入りの表示
    if (testFavorites.length > 0) {
      console.log(`\n❤️  お気に入り: ${testFavorites.length}件`);
    } else {
      console.log('\n❤️  お気に入り: 0件（削除対象なし）');
    }

    // テスト報告の表示
    if (testReports.length > 0) {
      console.log(`\n🚩 報告: ${testReports.length}件`);
    } else {
      console.log('\n🚩 報告: 0件（削除対象なし）');
    }

    // テストブロックユーザーの表示
    if (testBlocked.length > 0) {
      console.log(`\n🚫 ブロックユーザー: ${testBlocked.length}件`);
    } else {
      console.log('\n🚫 ブロックユーザー: 0件（削除対象なし）');
    }

    const totalItems =
      testParks.length +
      testReviews.length +
      testFavorites.length +
      testReports.length +
      testBlocked.length;

    if (totalItems === 0) {
      console.log('');
      console.log('✨ 削除対象のテストデータが見つかりませんでした。');
      console.log('');
      process.exit(0);
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`合計: ${totalItems}件のテストデータが見つかりました`);
    console.log('');

    // 確認
    console.log('⚠️  警告: この操作は取り消せません！');
    console.log('');
    const answer = await askQuestion('これらのデータを削除しますか？ (yes/no): ');

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('');
      console.log('❌ 削除がキャンセルされました。');
      console.log('');
      process.exit(0);
    }

    // 削除実行
    console.log('');
    console.log('🗑️  削除を開始します...');

    await deleteData('parks', testParks);
    await deleteData('reviews', testReviews);
    await deleteData('favorites', testFavorites);
    await deleteData('reports', testReports);
    await deleteData('blockedUsers', testBlocked);

    console.log('');
    console.log('✨ すべてのテストデータの削除が完了しました！');
    console.log('');
    console.log('📊 削除結果:');
    console.log(`  - 公園: ${testParks.length}件`);
    console.log(`  - レビュー: ${testReviews.length}件`);
    console.log(`  - お気に入り: ${testFavorites.length}件`);
    console.log(`  - 報告: ${testReports.length}件`);
    console.log(`  - ブロックユーザー: ${testBlocked.length}件`);
    console.log(`  - 合計: ${totalItems}件`);
    console.log('');
    console.log('🔍 Firebase Consoleで確認してください:');
    console.log(
      '  https://console.firebase.google.com/project/' + serviceAccount.project_id + '/firestore'
    );
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ エラーが発生しました:', error);
    console.error('');
    process.exit(1);
  }
}

// スクリプト実行
main()
  .then(() => {
    console.log('✅ 処理が正常に完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 処理中にエラーが発生しました:', error);
    process.exit(1);
  });
