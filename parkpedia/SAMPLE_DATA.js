// サンプル公園データ
// Firebase Console > Firestore Database に追加するサンプルデータ

// 使用方法:
// 1. Firebase Consoleにログイン
// 2. Firestore Databaseを開く
// 3. 「parks」コレクションを作成
// 4. 以下のデータを各ドキュメントとして追加

export const sampleParks = [
  {
    name: '中央公園',
    address: '東京都千代田区丸の内1-1-1',
    description: '都心にありながら、広々とした緑の空間が楽しめる公園です。週末には多くの家族連れで賑わいます。',
    latitude: 35.6812,
    longitude: 139.7671,
    rating: 4.5,
    createdAt: new Date(),
    userId: 'sample-user-id-1', // 実際のユーザーIDに置き換えてください
  },
  {
    name: '桜の森公園',
    address: '東京都港区六本木1-1-1',
    description: '春には美しい桜が咲き誇る人気の公園。夜桜も楽しめます。',
    latitude: 35.6628,
    longitude: 139.7314,
    rating: 4.8,
    createdAt: new Date(),
    userId: 'sample-user-id-2',
  },
  {
    name: 'こどもの森公園',
    address: '東京都渋谷区神宮前1-1-1',
    description: '子供向けの遊具が充実した公園。安全に配慮された設備で、安心して遊ばせられます。',
    latitude: 35.6700,
    longitude: 139.7025,
    rating: 4.2,
    createdAt: new Date(),
    userId: 'sample-user-id-3',
  },
  {
    name: '水と緑の広場',
    address: '東京都新宿区新宿1-1-1',
    description: '噴水と緑豊かな広場が特徴の公園。カフェやレストランも近くにあります。',
    latitude: 35.6909,
    longitude: 139.7003,
    rating: 4.3,
    createdAt: new Date(),
    userId: 'sample-user-id-4',
  },
  {
    name: '展望台公園',
    address: '東京都台東区上野1-1-1',
    description: '高台に位置し、都心の景色を一望できる公園。夕日の美しさでも有名です。',
    latitude: 35.7138,
    longitude: 139.7774,
    rating: 4.6,
    createdAt: new Date(),
    userId: 'sample-user-id-5',
  },
];

// Firestoreに追加する際の注意事項:
// 1. createdAtフィールドはFirestoreのTimestamp型として保存してください
// 2. userIdフィールドは実際の認証済みユーザーのIDに置き換えてください
// 3. 各公園に対して、reviewsコレクションにサンプルレビューも追加できます

// サンプルレビューデータ
export const sampleReviews = [
  {
    parkId: 'park-id-1', // 実際の公園ドキュメントIDに置き換えてください
    userId: 'sample-user-id-1',
    userName: '田中太郎',
    rating: 5,
    comment: 'とても広々としていて、週末の散歩に最適です。家族連れにもおすすめ！',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-1',
    userId: 'sample-user-id-2',
    userName: '佐藤花子',
    rating: 4,
    comment: '清潔で管理が行き届いています。ベンチも多く、ゆっくりと休憩できます。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-2', // 桜の森公園のID
    userId: 'sample-user-id-3',
    userName: '鈴木一郎',
    rating: 5,
    comment: '桜の季節は最高です！夜桜も美しく、毎年訪れています。',
    createdAt: new Date(),
  },
];








