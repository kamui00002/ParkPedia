/**
 * ParkPedia - Park関連の型定義
 * 公園、レビュー、ユーザー、お気に入りなどのデータ型を定義
 */

import { Timestamp } from 'firebase/firestore';

/**
 * 公園情報の型定義
 */
export interface Park {
  id: string;
  name: string;
  address: string;
  description: string;
  latitude?: number;
  longitude?: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  rating: number;
  reviewCount: number;
  mainImage?: string;
  images?: string[];
  tags?: {
    age?: string[];
    equipment?: string[];
  };
  facilities?: string[];
}

/**
 * レビュー情報の型定義
 */
export interface Review {
  id: string;
  parkId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  title?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * ユーザー情報の型定義
 */
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
}

/**
 * お気に入り/訪問履歴の型定義
 */
export interface Favorite {
  id: string;
  userId: string;
  parkId: string;
  type: 'favorite' | 'visited' | 'wantToVisit';
  createdAt: Timestamp;
  visitedAt?: Timestamp;
}

/**
 * 報告情報の型定義
 */
export interface Report {
  id: string;
  reviewId: string;
  parkId: string;
  reportedBy: string;
  reportedByEmail?: string;
  reviewComment?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Timestamp;
}

/**
 * ブロックユーザー情報の型定義
 */
export interface BlockedUser {
  id: string;
  blockedBy: string;
  blockedUserId: string;
  createdAt: Timestamp;
}

/**
 * 最近見た公園の型定義（AsyncStorage用）
 */
export interface RecentPark {
  id: string;
  name: string;
  mainImage?: string;
  address: string;
  viewedAt: string;
}

/**
 * 画像カテゴリの型定義
 */
export type ImageCategory = '全て' | '遊具' | '設備' | '風景' | 'その他';

/**
 * 対象年齢の選択肢
 */
export type AgeOption = '0-2歳' | '3-5歳' | '6歳以上';

/**
 * 遊具の選択肢
 */
export type EquipmentOption =
  | 'すべり台'
  | 'ブランコ'
  | '砂場'
  | '鉄棒'
  | 'ジャングルジム'
  | '水遊び';

/**
 * 施設情報の型定義
 */
export interface FacilityInfo {
  id: string;
  label: string;
}
