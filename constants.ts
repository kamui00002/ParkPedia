import React from 'react';
import { Park, FilterOptions, PhotoCategory, User, Badge } from './types';
import { SparklesIcon, PencilSquareIcon, CameraIcon } from '@heroicons/react/24/solid';

export const FILTER_CATEGORIES: { id: keyof FilterOptions; name: string; options: string[] }[] = [
  {
    id: 'age',
    name: '対象年齢',
    options: ['0-2歳', '3-5歳', '6歳以上'],
  },
  {
    id: 'equipment',
    name: '遊具',
    options: ['すべり台', 'ブランコ', '砂場', '鉄棒', 'ジャングルジム', '水遊び'],
  },
  {
    id: 'facilities',
    name: '設備',
    options: ['トイレあり', 'オムツ交換台', '駐車場あり', '日陰が多い', 'ベビーカーOK', 'ボール遊び可'],
  },
];

export const PHOTO_CATEGORIES: { id: PhotoCategory; name: string }[] = [
  { id: 'equipment', name: '遊具' },
  { id: 'facilities', name: '設備' },
  { id: 'scenery', name: '風景' },
  { id: 'other', name: 'その他' },
];

export const PARKS: Park[] = [
  {
    id: 'park-1',
    name: 'ひまわり中央公園',
    address: '東京都世田谷区桜丘1-2-3',
    distance: '現在地から0.5km',
    latitude: 35.658581,
    longitude: 139.745438,
    mainImage: 'https://picsum.photos/seed/park1/800/600',
    images: [
      { url: 'https://picsum.photos/seed/park1_1/800/600', category: 'equipment' },
      { url: 'https://picsum.photos/seed/park1_2/800/600', category: 'scenery' },
      { url: 'https://picsum.photos/seed/park1_3/800/600', category: 'facilities' },
      { url: 'https://picsum.photos/seed/park1_4/800/600', category: 'other' },
    ],
    tags: {
      age: ['0-2歳', '3-5歳'],
      equipment: ['すべり台', '砂場', 'ブランコ'],
      facilities: ['トイレあり', 'オムツ交換台', '日陰が多い', 'ベビーカーOK'],
    },
    reviews: [
      {
        id: 'review-1-1',
        author: 'さくらママ',
        avatar: 'https://picsum.photos/seed/avatar1/100/100',
        rating: 5,
        comment: '広々としていて、小さい子向けの遊具が充実しています。トイレも綺麗で安心です。',
        photos: [
            { url: 'https://picsum.photos/seed/review1_1/400/300', category: 'equipment' },
            { url: 'https://picsum.photos/seed/review1_2/400/300', category: 'facilities' }
        ],
        helpfulCount: 12,
        createdAt: '2024-07-20',
      },
      {
        id: 'review-1-2',
        author: 'ゆうとパパ',
        avatar: 'https://picsum.photos/seed/avatar2/100/100',
        rating: 4,
        comment: '週末は少し混んでいますが、日陰のベンチが多いので休憩しやすいです。',
        photos: [],
        helpfulCount: 5,
        createdAt: '2024-07-18',
      },
    ],
  },
  {
    id: 'park-2',
    name: 'みどり冒険の森',
    address: '神奈川県横浜市緑区中山4-5-6',
    distance: '現在地から1.2km',
    latitude: 35.4659,
    longitude: 139.6223,
    mainImage: 'https://picsum.photos/seed/park2/800/600',
    images: [
      { url: 'https://picsum.photos/seed/park2_1/800/600', category: 'equipment' },
      { url: 'https://picsum.photos/seed/park2_2/800/600', category: 'scenery' },
    ],
    tags: {
      age: ['3-5歳', '6歳以上'],
      equipment: ['ジャングルジム', 'すべり台', '鉄棒', '水遊び'],
      facilities: ['駐車場あり', 'トイレあり', 'ボール遊び可'],
    },
    reviews: [
      {
        id: 'review-2-1',
        author: 'はるか',
        avatar: 'https://picsum.photos/seed/avatar3/100/100',
        rating: 4,
        comment: 'アスレチックが本格的で小学生の子供が大喜びでした！夏は水遊びもできて最高です。',
        photos: [{ url: 'https://picsum.photos/seed/review2_1/400/300', category: 'equipment' }],
        helpfulCount: 25,
        createdAt: '2024-07-15',
      },
    ],
  },
  {
    id: 'park-3',
    name: 'さざなみ海浜公園',
    address: '千葉県千葉市美浜区打瀬7-8-9',
    distance: '現在地から3.5km',
    latitude: 35.6047,
    longitude: 140.0358,
    mainImage: 'https://picsum.photos/seed/park3/800/600',
    images: [
      { url: 'https://picsum.photos/seed/park3_1/800/600', category: 'scenery' },
      { url: 'https://picsum.photos/seed/park3_2/800/600', category: 'scenery' },
      { url: 'https://picsum.photos/seed/park3_3/800/600', category: 'facilities' },
    ],
    tags: {
      age: ['3-5歳', '6歳以上'],
      equipment: ['ブランコ', '砂場', '水遊び'],
      facilities: ['駐車場あり', 'トイレあり', 'ベビーカーOK'],
    },
    reviews: [
      {
        id: 'review-3-1',
        author: 'みき',
        avatar: 'https://picsum.photos/seed/avatar4/100/100',
        rating: 5,
        comment: '海が近くて景色が最高！公園も綺麗に整備されていて、一日中遊べます。',
        photos: [
            { url: 'https://picsum.photos/seed/review3_1/400/300', category: 'scenery' },
            { url: 'https://picsum.photos/seed/review3_2/400/300', category: 'other' }
        ],
        helpfulCount: 18,
        createdAt: '2024-07-21',
      },
    ],
  },
];

export const MOCK_BADGES: Badge[] = [
    {
        id: 'badge-1',
        name: 'はじめての投稿',
        description: '最初のレビューを投稿してコミュニティに参加しました！',
        icon: SparklesIcon,
    },
    {
        id: 'badge-2',
        name: 'フォトグラファー',
        description: '合計10枚の写真を投稿しました。',
        icon: CameraIcon,
    },
    {
        id: 'badge-3',
        name: '公園探検家',
        description: '新しい公園を登録してマップを広げました。',
        icon: PencilSquareIcon,
    }
];

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'さくらママ',
    avatar: 'https://picsum.photos/seed/avatar1/100/100',
    badges: MOCK_BADGES.slice(0, 2),
};