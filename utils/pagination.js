// Firestore ページネーションユーティリティ
// パフォーマンス最適化: 大量データの効率的な読み込み

import { query, limit, startAfter, getDocs } from 'firebase/firestore';

/**
 * ページネーション設定
 */
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_ITEMS: 100,
};

/**
 * ページネーション付きクエリを作成
 * @param {Query} baseQuery - ベースクエリ
 * @param {DocumentSnapshot|null} lastVisible - 最後に表示したドキュメント
 * @param {number} itemsPerPage - 1ページあたりのアイテム数
 * @returns {Query} ページネーション付きクエリ
 */
export const createPaginatedQuery = (
  baseQuery,
  lastVisible = null,
  itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE
) => {
  let paginatedQuery = query(baseQuery, limit(itemsPerPage));

  if (lastVisible) {
    paginatedQuery = query(paginatedQuery, startAfter(lastVisible));
  }

  return paginatedQuery;
};

/**
 * ページネーション付きデータ取得
 * @param {Query} baseQuery - ベースクエリ
 * @param {DocumentSnapshot|null} lastVisible - 最後に表示したドキュメント
 * @param {number} itemsPerPage - 1ページあたりのアイテム数
 * @returns {Promise<{data: any[], lastVisible: DocumentSnapshot|null, hasMore: boolean}>}
 */
export const fetchPaginatedData = async (
  baseQuery,
  lastVisible = null,
  itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE
) => {
  try {
    const paginatedQuery = createPaginatedQuery(baseQuery, lastVisible, itemsPerPage);
    const snapshot = await getDocs(paginatedQuery);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const newLastVisible =
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    const hasMore = snapshot.docs.length === itemsPerPage;

    return {
      data,
      lastVisible: newLastVisible,
      hasMore,
    };
  } catch (error) {
    if (__DEV__) console.error('ページネーション取得エラー:', error);
    throw error;
  }
};

/**
 * リセット可能なページネーション状態
 */
export class PaginationState {
  constructor(itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE) {
    this.itemsPerPage = itemsPerPage;
    this.lastVisible = null;
    this.hasMore = true;
    this.loading = false;
  }

  reset() {
    this.lastVisible = null;
    this.hasMore = true;
    this.loading = false;
  }

  setLastVisible(lastVisible) {
    this.lastVisible = lastVisible;
  }

  setHasMore(hasMore) {
    this.hasMore = hasMore;
  }

  setLoading(loading) {
    this.loading = loading;
  }
}
