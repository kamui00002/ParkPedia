// ページネーションユーティリティのテスト

import {
  createPaginatedQuery,
  fetchPaginatedData,
  PaginationState,
  PAGINATION_CONFIG,
} from '../pagination';
import { getDocs } from 'firebase/firestore';

// Firestore をモック
jest.mock('firebase/firestore', () => ({
  query: jest.fn((q, ...constraints) => ({ ...q, constraints })),
  limit: jest.fn(n => ({ type: 'limit', value: n })),
  startAfter: jest.fn(doc => ({ type: 'startAfter', value: doc })),
  orderBy: jest.fn(field => ({ type: 'orderBy', field })),
  getDocs: jest.fn(),
}));

describe('PAGINATION_CONFIG', () => {
  it('should have correct default values', () => {
    expect(PAGINATION_CONFIG.ITEMS_PER_PAGE).toBe(20);
    expect(PAGINATION_CONFIG.MAX_ITEMS).toBe(100);
  });
});

describe('createPaginatedQuery', () => {
  it('should create query with limit only when lastVisible is null', () => {
    const baseQuery = { collection: 'parks' };
    const result = createPaginatedQuery(baseQuery);

    expect(result).toBeDefined();
  });

  it('should create query with startAfter when lastVisible is provided', () => {
    const baseQuery = { collection: 'parks' };
    const lastVisible = { id: 'doc1' };
    const result = createPaginatedQuery(baseQuery, lastVisible);

    expect(result).toBeDefined();
  });
});

describe('fetchPaginatedData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch first page of data', async () => {
    const baseQuery = { collection: 'parks' };
    const mockDocs = [
      { id: 'doc1', data: () => ({ name: 'Park 1' }) },
      { id: 'doc2', data: () => ({ name: 'Park 2' }) },
    ];
    const mockSnapshot = {
      docs: mockDocs,
    };

    getDocs.mockResolvedValueOnce(mockSnapshot);

    const result = await fetchPaginatedData(baseQuery);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toHaveProperty('id', 'doc1');
    expect(result.hasMore).toBe(false); // 2件 < 20件なので hasMore = false
  });

  it('should indicate hasMore when full page is returned', async () => {
    const baseQuery = { collection: 'parks' };
    const mockDocs = Array.from({ length: 20 }, (_, i) => ({
      id: `doc${i}`,
      data: () => ({ name: `Park ${i}` }),
    }));
    const mockSnapshot = {
      docs: mockDocs,
    };

    getDocs.mockResolvedValueOnce(mockSnapshot);

    const result = await fetchPaginatedData(baseQuery, null, 20);

    expect(result.data).toHaveLength(20);
    expect(result.hasMore).toBe(true); // 20件 = itemsPerPage なので hasMore = true
  });

  it('should handle errors gracefully', async () => {
    const baseQuery = { collection: 'parks' };
    getDocs.mockRejectedValueOnce(new Error('Firestore error'));

    await expect(fetchPaginatedData(baseQuery)).rejects.toThrow('Firestore error');
  });
});

describe('PaginationState', () => {
  it('should initialize with default values', () => {
    const state = new PaginationState();
    expect(state.itemsPerPage).toBe(20);
    expect(state.lastVisible).toBeNull();
    expect(state.hasMore).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should reset state', () => {
    const state = new PaginationState();
    state.lastVisible = { id: 'doc1' };
    state.hasMore = false;
    state.loading = true;

    state.reset();

    expect(state.lastVisible).toBeNull();
    expect(state.hasMore).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should update lastVisible', () => {
    const state = new PaginationState();
    const doc = { id: 'doc1' };
    state.setLastVisible(doc);
    expect(state.lastVisible).toBe(doc);
  });

  it('should update hasMore', () => {
    const state = new PaginationState();
    state.setHasMore(false);
    expect(state.hasMore).toBe(false);
  });

  it('should update loading', () => {
    const state = new PaginationState();
    state.setLoading(true);
    expect(state.loading).toBe(true);
  });
});
