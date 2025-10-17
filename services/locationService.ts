import { Geolocation } from '@capacitor/geolocation';

export interface Location {
    latitude: number;
    longitude: number;
}

export class LocationService {
    static async getCurrentPosition(): Promise<Location> {
        try {
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });

            return {
                latitude: coordinates.coords.latitude,
                longitude: coordinates.coords.longitude
            };
        } catch (error) {
            console.error('位置情報の取得に失敗しました:', error);
            throw new Error('位置情報の取得に失敗しました');
        }
    }

    static async requestPermissions(): Promise<boolean> {
        try {
            const permissions = await Geolocation.requestPermissions();
            return permissions.location === 'granted';
        } catch (error) {
            console.error('位置情報の許可取得に失敗しました:', error);
            return false;
        }
    }

    static calculateDistance(
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
        const distance = R * c;
        return Math.round(distance * 100) / 100; // 小数点第2位まで
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    static formatDistance(distance: number): string {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance}km`;
    }
}
