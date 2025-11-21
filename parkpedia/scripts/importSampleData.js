#!/usr/bin/env node

/**
 * SAMPLE_DATA.jsからFirestoreにデータをインポートするスクリプト
 *
 * 使用方法:
 * 1. Firebase Console → Project Settings → Service Accounts
 * 2. "Generate New Private Key" をクリック
 * 3. ダウンロードしたJSONファイルを serviceAccountKey.json として保存
 * 4. node scripts/importSampleData.js を実行
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

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
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// サンプルデータを直接定義
const sampleParks = [
  {
    name: '中央公園',
    address: '東京都千代田区丸の内1-1-1',
    description: '都心にありながら、広々とした緑の空間が楽しめる公園です。週末には多くの家族連れで賑わいます。',
    latitude: 35.6812,
    longitude: 139.7671,
    rating: 4.5,
    reviewCount: 4,
    facilities: ['トイレ', 'ベンチ', '水飲み場', '遊具'],
    tags: {
      age: ['0-3歳', '4-6歳', '7-12歳'],
      equipment: ['すべり台', 'ブランコ', '砂場'],
    },
  },
  {
    name: '桜の森公園',
    address: '東京都港区六本木1-1-1',
    description: '春には美しい桜が咲き誇る人気の公園。夜桜も楽しめます。',
    latitude: 35.6628,
    longitude: 139.7314,
    rating: 4.7,
    reviewCount: 3,
    facilities: ['トイレ', 'ベンチ', '駐車場'],
    tags: {
      age: ['全年齢'],
      equipment: ['芝生広場'],
    },
  },
  {
    name: 'こどもの森公園',
    address: '東京都渋谷区神宮前1-1-1',
    description: '子供向けの遊具が充実した公園。安全に配慮された設備で、安心して遊ばせられます。',
    latitude: 35.6700,
    longitude: 139.7025,
    rating: 4.7,
    reviewCount: 3,
    facilities: ['トイレ', '授乳室', 'おむつ替え台', 'ベンチ'],
    tags: {
      age: ['0-3歳', '4-6歳'],
      equipment: ['すべり台', 'ブランコ', '砂場', 'ジャングルジム'],
    },
  },
  {
    name: '水と緑の広場',
    address: '東京都新宿区新宿1-1-1',
    description: '噴水と緑豊かな広場が特徴の公園。カフェやレストランも近くにあります。',
    latitude: 35.6909,
    longitude: 139.7003,
    rating: 4.5,
    reviewCount: 2,
    facilities: ['トイレ', 'ベンチ', '水飲み場', '噴水'],
    tags: {
      age: ['全年齢'],
      equipment: ['芝生広場'],
    },
  },
  {
    name: '展望台公園',
    address: '東京都台東区上野1-1-1',
    description: '高台に位置し、都心の景色を一望できる公園。夕日の美しさでも有名です。',
    latitude: 35.7138,
    longitude: 139.7774,
    rating: 4.7,
    reviewCount: 3,
    facilities: ['トイレ', 'ベンチ', '展望台'],
    tags: {
      age: ['全年齢'],
      equipment: ['展望スポット'],
    },
  },
];

const sampleReviews = [
  // 中央公園のレビュー（おすすめセクションに表示される）
  {
    parkIndex: 0,
    userName: '田中太郎',
    rating: 5,
    comment: 'とても広々としていて、週末の散歩に最適です。家族連れにもおすすめ！',
  },
  {
    parkIndex: 0,
    userName: '佐藤花子',
    rating: 4,
    comment: '清潔で管理が行き届いています。ベンチも多く、ゆっくりと休憩できます。',
  },
  {
    parkIndex: 0,
    userName: '山田次郎',
    rating: 5,
    comment: '子供の遊具が充実していて、安全に遊べます。トイレも清潔です。',
  },
  {
    parkIndex: 0,
    userName: '高橋美咲',
    rating: 4,
    comment: 'ピクニックに最適な芝生エリアがあります。桜の季節は特に綺麗です。',
  },
  // 桜の森公園のレビュー
  {
    parkIndex: 1,
    userName: '鈴木一郎',
    rating: 5,
    comment: '桜の季節は最高です！夜桜も美しく、毎年訪れています。',
  },
  {
    parkIndex: 1,
    userName: '伊藤舞',
    rating: 5,
    comment: '写真スポットがたくさんあります。インスタ映え間違いなし！',
  },
  {
    parkIndex: 1,
    userName: '中村健太',
    rating: 4,
    comment: '春以外の季節でも緑が豊かで気持ちいい公園です。',
  },
  // こどもの森公園のレビュー
  {
    parkIndex: 2,
    userName: '小林愛子',
    rating: 5,
    comment: '2歳の子供が大喜びで遊んでいました！遊具が年齢別に分かれているのが良いです。',
  },
  {
    parkIndex: 2,
    userName: '渡辺真由美',
    rating: 4,
    comment: '砂場が広くて、子供たちが自由に遊べます。日陰も多くて助かります。',
  },
  {
    parkIndex: 2,
    userName: '佐々木大輔',
    rating: 5,
    comment: '安全柵がしっかりしていて、子供を安心して遊ばせられます。',
  },
  // 水と緑の広場のレビュー
  {
    parkIndex: 3,
    userName: '松本優子',
    rating: 4,
    comment: '噴水が涼しげで夏でも快適です。周辺にカフェもあって便利！',
  },
  {
    parkIndex: 3,
    userName: '加藤直樹',
    rating: 5,
    comment: 'ランチ後の散歩に最適。芝生でのんびりできます。',
  },
  // 展望台公園のレビュー
  {
    parkIndex: 4,
    userName: '木村由紀',
    rating: 5,
    comment: '夕日を見ながらの散歩は最高です！デートスポットとしてもおすすめ。',
  },
  {
    parkIndex: 4,
    userName: '林浩二',
    rating: 4,
    comment: '景色が素晴らしい。ただし階段が多いので、体力に自信がない方は注意。',
  },
  {
    parkIndex: 4,
    userName: '井上さくら',
    rating: 5,
    comment: '写真撮影に最適な場所です。夜景も綺麗に撮れます。',
  },
];

// データインポート関数
async function importData() {
  console.log('🚀 サンプルデータのインポートを開始します...');
  console.log('');

  try {
    // 公園データをインポート
    console.log('📍 公園データをインポート中...');
    const parkIds = [];

    for (let i = 0; i < sampleParks.length; i++) {
      const park = sampleParks[i];
      const parkData = {
        ...park,
        createdAt: admin.firestore.Timestamp.now(),
        userId: 'sample-user-' + (i + 1), // サンプルユーザーID
      };

      const docRef = await db.collection('parks').add(parkData);
      parkIds.push(docRef.id);
      console.log(`  ✅ ${park.name} (ID: ${docRef.id})`);
    }

    console.log('');
    console.log('💬 レビューデータをインポート中...');

    // レビューデータをインポート
    for (const review of sampleReviews) {
      const parkId = parkIds[review.parkIndex];
      const parkName = sampleParks[review.parkIndex].name;

      const reviewData = {
        parkId: parkId,
        userId: 'sample-user-' + Math.floor(Math.random() * 15 + 1),
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        photos: [],
        createdAt: admin.firestore.Timestamp.now(),
      };

      await db.collection('reviews').add(reviewData);
      console.log(`  ✅ ${parkName} - ${review.userName}のレビュー`);
    }

    console.log('');
    console.log('✨ データインポートが完了しました！');
    console.log('');
    console.log('📊 インポート結果:');
    console.log(`  - 公園: ${parkIds.length}件`);
    console.log(`  - レビュー: ${sampleReviews.length}件`);
    console.log('');
    console.log('🔍 Firebase Consoleで確認してください:');
    console.log('  https://console.firebase.google.com/project/' + serviceAccount.project_id + '/firestore');
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// データインポートを実行
importData()
  .then(() => {
    console.log('✅ 処理が正常に完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 処理中にエラーが発生しました:', error);
    process.exit(1);
  });
