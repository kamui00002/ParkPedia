import { Park } from '../types';

export class SearchService {
    static searchParks(parks: Park[], query: string): Park[] {
        if (!query.trim()) {
            return parks;
        }

        const searchTerm = query.toLowerCase().trim();

        return parks.filter(park => {
            // 公園名で検索
            if (park.name.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // 住所で検索
            if (park.address.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // タグで検索
            const allTags = [
                ...park.tags.age,
                ...park.tags.equipment,
                ...park.tags.facilities
            ];

            if (allTags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                return true;
            }

            // レビューのコメントで検索
            if (park.reviews.some(review =>
                review.comment.toLowerCase().includes(searchTerm)
            )) {
                return true;
            }

            return false;
        });
    }

    static sortParksByDistance(parks: Park[], userLat?: number, userLon?: number): Park[] {
        if (!userLat || !userLon) {
            return parks;
        }

        return [...parks].sort((a, b) => {
            const distanceA = this.calculateDistance(userLat, userLon, a.latitude, a.longitude);
            const distanceB = this.calculateDistance(userLat, userLon, b.latitude, b.longitude);
            return distanceA - distanceB;
        });
    }

    static sortParksByRating(parks: Park[]): Park[] {
        return [...parks].sort((a, b) => {
            const ratingA = this.calculateAverageRating(a);
            const ratingB = this.calculateAverageRating(b);
            return ratingB - ratingA;
        });
    }

    static sortParksByReviewCount(parks: Park[]): Park[] {
        return [...parks].sort((a, b) => b.reviews.length - a.reviews.length);
    }

    private static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // 地球の半径（km）
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private static calculateAverageRating(park: Park): number {
        if (park.reviews.length === 0) return 0;
        const totalRating = park.reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / park.reviews.length;
    }
}
