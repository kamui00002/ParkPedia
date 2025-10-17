import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface PhotoResult {
    dataUrl: string;
    format: string;
}

export class CameraService {
    static async takePicture(): Promise<PhotoResult> {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            return {
                dataUrl: image.dataUrl || '',
                format: image.format || 'jpeg'
            };
        } catch (error) {
            console.error('写真の撮影に失敗しました:', error);
            throw new Error('写真の撮影に失敗しました');
        }
    }

    static async selectFromGallery(): Promise<PhotoResult> {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos
            });

            return {
                dataUrl: image.dataUrl || '',
                format: image.format || 'jpeg'
            };
        } catch (error) {
            console.error('写真の選択に失敗しました:', error);
            throw new Error('写真の選択に失敗しました');
        }
    }

    static async requestPermissions(): Promise<boolean> {
        try {
            const permissions = await Camera.requestPermissions();
            return permissions.camera === 'granted' && permissions.photos === 'granted';
        } catch (error) {
            console.error('カメラの許可取得に失敗しました:', error);
            return false;
        }
    }
}
