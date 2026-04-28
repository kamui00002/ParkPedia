// バッジ定義（全20種類以上）
// condition(stats) が true のときにバッジを獲得済みとする
// stats: { reviewCount, photoReviewCount, parkCount, visitedCount, helpfulCount, favoriteCount }

export const BADGES = [
  // --- レビュー系 ---
  {
    id: 'firstReview',
    name: 'はじめての投稿',
    description: '最初のレビューを投稿しました',
    icon: '⭐',
    category: 'review',
    condition: stats => stats.reviewCount >= 1,
  },
  {
    id: 'reviewer',
    name: 'レビュアー',
    description: 'レビューを5件投稿しました',
    icon: '📝',
    category: 'review',
    condition: stats => stats.reviewCount >= 5,
  },
  {
    id: 'veteranReviewer',
    name: 'ベテランレビュアー',
    description: 'レビューを10件投稿しました',
    icon: '🏅',
    category: 'review',
    condition: stats => stats.reviewCount >= 10,
  },
  {
    id: 'masterReviewer',
    name: 'マスターレビュアー',
    description: 'レビューを50件投稿しました',
    icon: '👑',
    category: 'review',
    condition: stats => stats.reviewCount >= 50,
  },

  // --- 写真系 ---
  {
    id: 'photographer',
    name: 'フォトグラファー',
    description: '写真付きレビューを10件投稿しました',
    icon: '📷',
    category: 'photo',
    condition: stats => stats.photoReviewCount >= 10,
  },
  {
    id: 'proPhotographer',
    name: 'プロフォトグラファー',
    description: '写真付きレビューを50件投稿しました',
    icon: '🎞️',
    category: 'photo',
    condition: stats => stats.photoReviewCount >= 50,
  },

  // --- 公園登録系 ---
  {
    id: 'firstPark',
    name: '初公園登録',
    description: '初めて公園を登録しました',
    icon: '🌳',
    category: 'park',
    condition: stats => stats.parkCount >= 1,
  },
  {
    id: 'parkHunter',
    name: '公園ハンター',
    description: '5つの公園を登録しました',
    icon: '🗺️',
    category: 'park',
    condition: stats => stats.parkCount >= 5,
  },
  {
    id: 'parkMaster',
    name: '公園マスター',
    description: '10つの公園を登録しました',
    icon: '🏞️',
    category: 'park',
    condition: stats => stats.parkCount >= 10,
  },

  // --- 訪問系 ---
  {
    id: 'firstVisit',
    name: '初訪問',
    description: '初めて公園を訪問しました',
    icon: '👣',
    category: 'visit',
    condition: stats => stats.visitedCount >= 1,
  },
  {
    id: 'adventurer',
    name: '冒険家',
    description: '10の公園を訪問しました',
    icon: '🧭',
    category: 'visit',
    condition: stats => stats.visitedCount >= 10,
  },
  {
    id: 'grandTourer',
    name: 'グランドツアラー',
    description: '50の公園を訪問しました',
    icon: '🌏',
    category: 'visit',
    condition: stats => stats.visitedCount >= 50,
  },

  // --- コミュニティ系 ---
  {
    id: 'helpful',
    name: '参考になった',
    description: 'レビューが5件参考になりました',
    icon: '👍',
    category: 'community',
    condition: stats => stats.helpfulCount >= 5,
  },
  {
    id: 'influencer',
    name: 'インフルエンサー',
    description: 'レビューが10件参考になりました',
    icon: '✨',
    category: 'community',
    condition: stats => stats.helpfulCount >= 10,
  },
  {
    id: 'favoriteCollector',
    name: 'お気に入りコレクター',
    description: '10の公園をお気に入りに追加しました',
    icon: '💚',
    category: 'community',
    condition: stats => stats.favoriteCount >= 10,
  },

  // --- 特別系 ---
  {
    id: 'firstFavorite',
    name: '初お気に入り',
    description: '初めて公園をお気に入りに追加しました',
    icon: '💛',
    category: 'community',
    condition: stats => stats.favoriteCount >= 1,
  },
  {
    id: 'explorer',
    name: 'エクスプローラー',
    description: '5の公園を訪問しました',
    icon: '🔍',
    category: 'visit',
    condition: stats => stats.visitedCount >= 5,
  },
  {
    id: 'photoStarter',
    name: '写真デビュー',
    description: '写真付きレビューを1件投稿しました',
    icon: '📸',
    category: 'photo',
    condition: stats => stats.photoReviewCount >= 1,
  },
  {
    id: 'reviewerPlus',
    name: 'レビュアー+',
    description: 'レビューを20件投稿しました',
    icon: '🌟',
    category: 'review',
    condition: stats => stats.reviewCount >= 20,
  },
  {
    id: 'superFan',
    name: 'スーパーファン',
    description: '20の公園をお気に入りに追加しました',
    icon: '🎖️',
    category: 'community',
    condition: stats => stats.favoriteCount >= 20,
  },
  {
    id: 'localGuide',
    name: 'ローカルガイド',
    description: '公園登録3件、レビュー5件を達成しました',
    icon: '📍',
    category: 'community',
    condition: stats => stats.parkCount >= 3 && stats.reviewCount >= 5,
  },
];
