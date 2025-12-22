/**
 * ParkPedia - Component関連の型定義
 * アプリケーション内で使用される主要コンポーネントの型を定義
 */

import { ReactNode } from 'react';
import { Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';

// =====================================================
// ErrorBoundary Component
// =====================================================

/**
 * ErrorBoundary コンポーネントのProps
 * アプリケーション全体のエラーをキャッチしてクラッシュを防ぐ
 */
export interface ErrorBoundaryProps {
  /** エラーバウンダリ内にラップする子要素 */
  children: ReactNode;
}

/**
 * ErrorBoundary コンポーネントの状態
 */
export interface ErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;
  /** キャッチされたエラーオブジェクト（開発環境で表示） */
  error: Error | null;
}

// =====================================================
// CustomHeader Component
// =====================================================

/**
 * 画面識別子の型
 * 現在表示されている画面を示す
 */
export type CurrentScreen = 'search' | 'addPark' | 'mypage';

/**
 * CustomHeader コンポーネントのProps
 * アプリケーション全体で使用される共通ヘッダー
 */
export interface CustomHeaderProps {
  /** React Navigationのnavigationオブジェクト */
  navigation: NativeStackNavigationProp<RootStackParamList>;
  /** 検索フィールドの入力値 */
  searchQuery: string;
  /** 検索テキスト変更時のコールバック */
  onSearchChange: (text: string) => void;
  /** 現在表示されている画面（デフォルト: 'search'） */
  currentScreen?: CurrentScreen;
  /** メニューボタン押下時のコールバック（オプション） */
  onMenuPress?: () => void;
}

// =====================================================
// FilterDrawer Component
// =====================================================

/**
 * フィルターカテゴリーID
 */
export type FilterCategoryId = 'age' | 'equipment' | 'facilities' | 'distance' | 'rating';

/**
 * フィルター選択タイプ
 * - 'multiple': 複数選択可能（チェックボックス）
 * - 'single': 単一選択（ラジオボタン）
 */
export type FilterSelectionType = 'multiple' | 'single';

/**
 * フィルターカテゴリーの定義
 */
export interface FilterCategory {
  /** カテゴリーの一意識別子 */
  id: FilterCategoryId;
  /** カテゴリーの表示名 */
  name: string;
  /** 選択可能なオプションのリスト */
  options: string[];
  /** 選択タイプ（デフォルト: 'multiple'） */
  type?: FilterSelectionType;
}

/**
 * フィルター選択状態の型
 * 各カテゴリーIDをキーとして、選択されたオプションの配列を保持
 *
 * @example
 * {
 *   age: ['0-2歳', '3-5歳'],
 *   equipment: ['すべり台', 'ブランコ'],
 *   facilities: ['トイレあり'],
 *   distance: ['1km以内'],
 *   rating: ['⭐4.0以上']
 * }
 */
export interface FilterState {
  age?: string[];
  equipment?: string[];
  facilities?: string[];
  distance?: string[];
  rating?: string[];
}

/**
 * FilterDrawer コンポーネントのProps
 * サイドドロワーで表示される絞り込み検索UI
 */
export interface FilterDrawerProps {
  /** ドロワーの表示/非表示状態 */
  visible: boolean;
  /** ドロワーを閉じる時のコールバック */
  onClose: () => void;
  /** 現在のフィルター選択状態 */
  filters: FilterState;
  /** フィルター変更時のコールバック */
  onFilterChange: (newFilters: FilterState) => void;
}

// =====================================================
// AdBanner Component
// =====================================================

/**
 * AdBanner コンポーネントのProps
 * AdMobバナー広告を表示するコンポーネント
 * （現在はpropsを受け取らない）
 */
export interface AdBannerProps {
  // 現在はpropsなし
  // 将来的に広告サイズやIDを動的に変更する場合に追加可能
}

// =====================================================
// AdBannerPlaceholder Component
// =====================================================

/**
 * AdBannerPlaceholder コンポーネントのProps
 * 広告スペースのプレースホルダーを表示
 * （現在はpropsを受け取らない）
 */
export interface AdBannerPlaceholderProps {
  // 現在はpropsなし
  // 将来的に高さや色を動的に変更する場合に追加可能
}

// =====================================================
// Utility Types
// =====================================================

/**
 * アニメーション参照の型
 * FilterDrawerで使用されるスライドアニメーション
 */
export type SlideAnimationRef = React.MutableRefObject<Animated.Value>;
