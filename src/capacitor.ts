import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export const initializeCapacitor = async () => {
    try {
        if (Capacitor.isNativePlatform()) {
            // ステータスバーの設定
            try {
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                await StatusBar.setOverlaysWebView({ overlay: false });
            } catch (error) {
                console.error('ステータスバーの設定に失敗しました:', error);
                // ステータスバーの設定失敗は致命的ではないので続行
            }

            // スプラッシュスクリーンの設定
            try {
                await SplashScreen.hide();
            } catch (error) {
                console.error('スプラッシュスクリーンの非表示に失敗しました:', error);
                // スプラッシュスクリーンの非表示失敗は致命的ではないので続行
            }

            // iOS Safari のスクロールバウンス対策
            if (Capacitor.getPlatform() === 'ios') {
                try {
                    // スクロールバウンスを無効化
                    document.body.style.overscrollBehavior = 'none';
                    document.body.style.webkitOverscrollBehavior = 'none';
                } catch (error) {
                    console.error('スクロールバウンス対策の設定に失敗しました:', error);
                }
            }

            // アプリのライフサイクルイベント
            try {
                App.addListener('appStateChange', ({ isActive }) => {
                    console.log('App state changed. Is active?', isActive);
                });

                App.addListener('appUrlOpen', (event) => {
                    console.log('App opened with URL:', event.url);
                });

                App.addListener('appRestoredResult', (event) => {
                    console.log('App restored with result:', event);
                });
            } catch (error) {
                console.error('アプリのライフサイクルイベントの登録に失敗しました:', error);
            }
        }
    } catch (error) {
        console.error('Capacitorの初期化に失敗しました:', error);
        // 初期化に失敗してもアプリは動作するようにする
    }
};
