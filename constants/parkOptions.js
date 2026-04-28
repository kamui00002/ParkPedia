// 公園タグ・フィルターの定数定義（一元管理）

// 対象年齢の選択肢
export const AGE_OPTIONS = ['0-2歳', '3-5歳', '6歳以上'];

// 遊具の選択肢（既存6 + 新規10）
export const EQUIPMENT_OPTIONS = [
  'すべり台',
  'ブランコ',
  '砂場',
  '鉄棒',
  'ジャングルジム',
  '水遊び',
  'シーソー',
  'うんてい',
  'ターザンロープ',
  'スプリング遊具',
  'ロープネット',
  '複合遊具',
  'ボルダリング',
  '回転遊具',
  'トンネル',
  'ハンモック',
];

// 施設の選択肢（既存6 + 新規12）
export const FACILITIES = [
  { id: 'toilet', label: 'トイレあり' },
  { id: 'diaper', label: 'オムツ交換台' },
  { id: 'parking', label: '駐車場あり' },
  { id: 'shade', label: '日陰が多い' },
  { id: 'stroller', label: 'ベビーカーOK' },
  { id: 'ball', label: 'ボール遊び可' },
  { id: 'bench', label: 'ベンチあり' },
  { id: 'drinking_water', label: '水飲み場' },
  { id: 'bicycle_parking', label: '駐輪場あり' },
  { id: 'barrier_free', label: 'バリアフリー' },
  { id: 'nursing_room', label: '授乳室あり' },
  { id: 'vending_machine', label: '自販機あり' },
  { id: 'dog_ok', label: 'ペット可' },
  { id: 'bbq', label: 'BBQ可' },
  { id: 'wifi', label: 'Wi-Fiあり' },
  { id: 'lighting', label: '夜間照明あり' },
  { id: 'playground_fence', label: '柵付き遊び場' },
  { id: 'multipurpose_toilet', label: '多目的トイレ' },
];

// 地面の種類
export const GROUND_OPTIONS = ['芝生', '土', 'ゴムチップ', 'コンクリート', 'ウッドチップ'];

// 景色・自然
export const SCENERY_OPTIONS = ['桜あり', '紅葉あり', '花壇', '池・川', '森林'];

// スポーツ施設
export const SPORTS_OPTIONS = [
  'バスケットゴール',
  'サッカーゴール',
  'テニスコート',
  'スケートパーク',
];

// FilterDrawer用のカテゴリ統合配列
export const FILTER_CATEGORIES = [
  {
    id: 'age',
    name: '対象年齢',
    options: AGE_OPTIONS,
  },
  {
    id: 'equipment',
    name: '遊具',
    options: EQUIPMENT_OPTIONS,
  },
  {
    id: 'facilities',
    name: '設備',
    options: FACILITIES.map(f => f.label),
  },
  {
    id: 'ground',
    name: '地面',
    options: GROUND_OPTIONS,
  },
  {
    id: 'scenery',
    name: '景色・自然',
    options: SCENERY_OPTIONS,
  },
  {
    id: 'sports',
    name: 'スポーツ施設',
    options: SPORTS_OPTIONS,
  },
  {
    id: 'distance',
    name: '距離で絞り込み',
    options: ['500m以内', '1km以内', '5km以内'],
    type: 'single',
  },
  {
    id: 'rating',
    name: '評価で絞り込み',
    options: ['⭐4.5以上', '⭐4.0以上'],
    type: 'single',
  },
];
