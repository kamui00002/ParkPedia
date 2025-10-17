import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export const initializeCapacitor = async () => {
    if (Capacitor.isNativePlatform()) {
        // ステータスバーの設定
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await StatusBar.setOverlaysWebView({ overlay: false });

        // スプラッシュスクリーンの設定
        await SplashScreen.hide();

        // iOS Safari のスクロールバウンス対策
        if (Capacitor.getPlatform() === 'ios') {
            // スクロールバウンスを無効化
            document.body.style.overscrollBehavior = 'none';
            document.body.style.webkitOverscrollBehavior = 'none';
        }

        // アプリのライフサイクルイベント
        App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
        });

        App.addListener('appUrlOpen', (event) => {
            console.log('App opened with URL:', event.url);
        });

        App.addListener('appRestoredResult', (event) => {
            console.log('App restored with result:', event);
        });
    }
};
