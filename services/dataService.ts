import { Park, Review } from '../types';

// 現在はローカルストレージを使用していますが、実際のアプリではFirebaseやSupabaseなどのバックエンドサービスを使用します

export class DataService {
    private static readonly PARKS_KEY = 'parkpedia_parks';
    private static readonly REVIEWS_KEY = 'parkpedia_reviews';

    // 公園データの取得
    static async getParks(): Promise<Park[]> {
        try {
            const storedParks = localStorage.getItem(this.PARKS_KEY);
            if (storedParks) {
                return JSON.parse(storedParks);
            }
            return [];
        } catch (error) {
            console.error('公園データの取得に失敗しました:', error);
            return [];
        }
    }

    // 公園データの保存
    static async saveParks(parks: Park[]): Promise<void> {
        try {
            localStorage.setItem(this.PARKS_KEY, JSON.stringify(parks));
        } catch (error) {
            console.error('公園データの保存に失敗しました:', error);
        }
    }

    // 新しい公園の追加
    static async addPark(park: Park): Promise<void> {
        try {
            const parks = await this.getParks();
            parks.unshift(park); // 新しい公園を先頭に追加
            await this.saveParks(parks);
        } catch (error) {
            console.error('公園の追加に失敗しました:', error);
        }
    }

    // レビューの追加
    static async addReview(parkId: string, review: Review): Promise<void> {
        try {
            const parks = await this.getParks();
            const parkIndex = parks.findIndex(p => p.id === parkId);

            if (parkIndex !== -1) {
                parks[parkIndex].reviews.unshift(review); // 新しいレビューを先頭に追加
                await this.saveParks(parks);
            }
        } catch (error) {
            console.error('レビューの追加に失敗しました:', error);
        }
    }

    // 公園の更新
    static async updatePark(updatedPark: Park): Promise<void> {
        try {
            const parks = await this.getParks();
            const parkIndex = parks.findIndex(p => p.id === updatedPark.id);

            if (parkIndex !== -1) {
                parks[parkIndex] = updatedPark;
                await this.saveParks(parks);
            }
        } catch (error) {
            console.error('公園の更新に失敗しました:', error);
        }
    }

    // データの同期（将来的にバックエンドと同期する際に使用）
    static async syncWithBackend(): Promise<void> {
        // 実際の実装では、Firebase FirestoreやSupabaseなどのバックエンドサービスと同期
        // 例: Firebase Firestore
        /*
        import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
        import { db } from './firebase';
        
        const parks = await this.getParks();
        const parksCollection = collection(db, 'parks');
        
        for (const park of parks) {
          await addDoc(parksCollection, park);
        }
        */

        console.log('バックエンドとの同期機能は実装予定です');
    }

    // データのエクスポート（バックアップ用）
    static async exportData(): Promise<string> {
        try {
            const parks = await this.getParks();
            return JSON.stringify(parks, null, 2);
        } catch (error) {
            console.error('データのエクスポートに失敗しました:', error);
            return '';
        }
    }

    // データのインポート（復元用）
    static async importData(jsonData: string): Promise<void> {
        try {
            const parks: Park[] = JSON.parse(jsonData);
            await this.saveParks(parks);
        } catch (error) {
            console.error('データのインポートに失敗しました:', error);
        }
    }
}

// 将来的なバックエンド連携のためのインターフェース
export interface BackendService {
    getParks(): Promise<Park[]>;
    addPark(park: Park): Promise<void>;
    updatePark(park: Park): Promise<void>;
    deletePark(parkId: string): Promise<void>;
    addReview(parkId: string, review: Review): Promise<void>;
    updateReview(reviewId: string, review: Review): Promise<void>;
    deleteReview(reviewId: string): Promise<void>;
}

// Firebase実装の例（コメントアウト）
/*
export class FirebaseService implements BackendService {
  async getParks(): Promise<Park[]> {
    const parksCollection = collection(db, 'parks');
    const parksSnapshot = await getDocs(parksCollection);
    return parksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Park));
  }

  async addPark(park: Park): Promise<void> {
    const parksCollection = collection(db, 'parks');
    await addDoc(parksCollection, park);
  }

  // 他のメソッドも同様に実装...
}
*/
