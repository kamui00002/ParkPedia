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
    reviewCount: 4,
    facilities: ['トイレ', 'ベンチ', '水飲み場', '遊具'],
    tags: {
      age: ['0-3歳', '4-6歳', '7-12歳'],
      equipment: ['すべり台', 'ブランコ', '砂場'],
    },
    createdAt: new Date(),
    userId: 'sample-user-id-1', // 実際のユーザーIDに置き換えてください
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
    createdAt: new Date(),
    userId: 'sample-user-id-2',
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
    createdAt: new Date(),
    userId: 'sample-user-id-3',
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
    createdAt: new Date(),
    userId: 'sample-user-id-4',
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
  // 中央公園のレビュー（おすすめセクションに表示される）
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
    parkId: 'park-id-1',
    userId: 'sample-user-id-6',
    userName: '山田次郎',
    rating: 5,
    comment: '子供の遊具が充実していて、安全に遊べます。トイレも清潔です。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-1',
    userId: 'sample-user-id-7',
    userName: '高橋美咲',
    rating: 4,
    comment: 'ピクニックに最適な芝生エリアがあります。桜の季節は特に綺麗です。',
    createdAt: new Date(),
  },
  // 桜の森公園のレビュー
  {
    parkId: 'park-id-2',
    userId: 'sample-user-id-3',
    userName: '鈴木一郎',
    rating: 5,
    comment: '桜の季節は最高です！夜桜も美しく、毎年訪れています。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-2',
    userId: 'sample-user-id-4',
    userName: '伊藤舞',
    rating: 5,
    comment: '写真スポットがたくさんあります。インスタ映え間違いなし！',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-2',
    userId: 'sample-user-id-8',
    userName: '中村健太',
    rating: 4,
    comment: '春以外の季節でも緑が豊かで気持ちいい公園です。',
    createdAt: new Date(),
  },
  // こどもの森公園のレビュー
  {
    parkId: 'park-id-3',
    userId: 'sample-user-id-5',
    userName: '小林愛子',
    rating: 5,
    comment: '2歳の子供が大喜びで遊んでいました！遊具が年齢別に分かれているのが良いです。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-3',
    userId: 'sample-user-id-9',
    userName: '渡辺真由美',
    rating: 4,
    comment: '砂場が広くて、子供たちが自由に遊べます。日陰も多くて助かります。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-3',
    userId: 'sample-user-id-10',
    userName: '佐々木大輔',
    rating: 5,
    comment: '安全柵がしっかりしていて、子供を安心して遊ばせられます。',
    createdAt: new Date(),
  },
  // 水と緑の広場のレビュー
  {
    parkId: 'park-id-4',
    userId: 'sample-user-id-11',
    userName: '松本優子',
    rating: 4,
    comment: '噴水が涼しげで夏でも快適です。周辺にカフェもあって便利！',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-4',
    userId: 'sample-user-id-12',
    userName: '加藤直樹',
    rating: 5,
    comment: 'ランチ後の散歩に最適。芝生でのんびりできます。',
    createdAt: new Date(),
  },
  // 展望台公園のレビュー
  {
    parkId: 'park-id-5',
    userId: 'sample-user-id-13',
    userName: '木村由紀',
    rating: 5,
    comment: '夕日を見ながらの散歩は最高です！デートスポットとしてもおすすめ。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-5',
    userId: 'sample-user-id-14',
    userName: '林浩二',
    rating: 4,
    comment: '景色が素晴らしい。ただし階段が多いので、体力に自信がない方は注意。',
    createdAt: new Date(),
  },
  {
    parkId: 'park-id-5',
    userId: 'sample-user-id-15',
    userName: '井上さくら',
    rating: 5,
    comment: '写真撮影に最適な場所です。夜景も綺麗に撮れます。',
    createdAt: new Date(),
  },
];











