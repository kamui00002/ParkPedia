// Firestore ページネーションユーティリティ
// パフォーマンス最適化: 大量データの効率的な読み込み

import { Query, DocumentSnapshot, query, limit, startAfter, getDocs } from 'firebase/firestore';

/**
 * ページネーション設定
 */
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_ITEMS: 100,
} as const;

/**
 * ページネーション結果の型定義
 */
export interface PaginationResult<T = unknown> {
  data: T[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * ページネーション付きクエリを作成
 */
export const createPaginatedQuery = (
  baseQuery: Query,
  lastVisible: DocumentSnapshot | null = null,
  itemsPerPage: number = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Query => {
  let paginatedQuery = query(baseQuery, limit(itemsPerPage));

  if (lastVisible) {
    paginatedQuery = query(paginatedQuery, startAfter(lastVisible));
  }

  return paginatedQuery;
};

/**
 * ページネーション付きデータ取得
 */
export const fetchPaginatedData = async <T = unknown>(
  baseQuery: Query,
  lastVisible: DocumentSnapshot | null = null,
  itemsPerPage: number = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Promise<PaginationResult<T>> => {
  try {
    const paginatedQuery = createPaginatedQuery(baseQuery, lastVisible, itemsPerPage);
    const snapshot = await getDocs(paginatedQuery);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    const newLastVisible =
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    const hasMore = snapshot.docs.length === itemsPerPage;

    return {
      data,
      lastVisible: newLastVisible,
      hasMore,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('ページネーション取得エラー:', error);
    }
    throw error;
  }
};

/**
 * リセット可能なページネーション状態
 */
export class PaginationState {
  itemsPerPage: number;
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
  loading: boolean;

  constructor(itemsPerPage: number = PAGINATION_CONFIG.ITEMS_PER_PAGE) {
    this.itemsPerPage = itemsPerPage;
    this.lastVisible = null;
    this.hasMore = true;
    this.loading = false;
  }

  reset(): void {
    this.lastVisible = null;
    this.hasMore = true;
    this.loading = false;
  }

  setLastVisible(lastVisible: DocumentSnapshot | null): void {
    this.lastVisible = lastVisible;
  }

  setHasMore(hasMore: boolean): void {
    this.hasMore = hasMore;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
