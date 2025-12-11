import React, {
    useState,
    useEffect
} from 'react';
import {
    NavigationContainer
} from '@react-navigation/native';
import {
    createNativeStackNavigator
} from '@react-navigation/native-stack';
import {
    StatusBar
} from 'expo-status-bar';
import {
    Platform,
    View,
    ActivityIndicator
} from 'react-native';
import {
    SafeAreaProvider
} from 'react-native-safe-area-context';
import {
    onAuthStateChanged
} from 'firebase/auth';
import {
    auth
} from './firebaseConfig';

// 画面コンポーネント
import HomeScreen from './screens/HomeScreen';
import ParkDetailScreen from './screens/ParkDetailScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import LoginScreen from './screens/LoginScreen';
import AddParkScreen from './screens/AddParkScreen';
import MyPageScreen from './screens/MyPageScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import AdminScreen from './screens/AdminScreen';

const Stack = createNativeStackNavigator();

// AdMobをアプリ起動時に初期化（React Componentの外で実行）
// これはAdMob公式ドキュメントの推奨事項です
// クラッシュを防ぐため、遅延初期化を採用
let isAdMobInitialized = false;
let adMobInitPromise = null;

function initializeAdMobSafely() {
    if (Platform.OS === 'web' || isAdMobInitialized || adMobInitPromise) {
        return adMobInitPromise || Promise.resolve();
    }

    adMobInitPromise = new Promise((resolve) => {
        // アプリの起動を優先し、AdMob初期化は少し遅らせる
        setTimeout(() => {
            try {
                const mobileAds = require('react-native-google-mobile-ads').default;
                if (mobileAds && typeof mobileAds.initialize === 'function') {
                    mobileAds.initialize()
                        .then(() => {
                            isAdMobInitialized = true;
                            if (__DEV__) {
                                console.log('AdMob初期化成功');
                            }
                            resolve(true);
                        })
                        .catch((error) => {
                            if (__DEV__) {
                                console.warn('AdMob初期化失敗:', error.message);
                            }
                            // エラーでもアプリは続行（AdMobなしで動作）
                            isAdMobInitialized = true;
                            resolve(false);
                        });
                } else {
                    if (__DEV__) {
                        console.warn('AdMobモジュールが正しく読み込めませんでした');
                    }
                    isAdMobInitialized = true;
                    resolve(false);
                }
            } catch (error) {
                if (__DEV__) {
                    console.warn('AdMobモジュール読み込み失敗:', error.message);
                }
                // モジュールが存在しない場合もアプリは続行
                isAdMobInitialized = true;
                resolve(false);
            }
        }, 1000); // 1秒遅延して初期化（アプリ起動を優先）
    });

    return adMobInitPromise;
}

// ネイティブ環境でのみ初期化を開始
if (Platform.OS !== 'web') {
    initializeAdMobSafely();
} else {
    // Web環境では初期化不要
    isAdMobInitialized = true;
}

export default function App() {
    // 認証状態を管理
    const [user, setUser] = useState(null);

    useEffect(() => {
        // グローバルエラーハンドラーを設定（本番環境のみ）
        // 開発環境ではデフォルトのRed Screenを表示してデバッグを容易にする
        if (!__DEV__) {
            const errorHandler = (error, isFatal) => {
                console.error('グローバルエラー:', error);
                // エラーをログに記録するが、アプリは続行
            };

            // 未処理のPromise拒否をキャッチ
            const rejectionHandler = (reason, promise) => {
                console.error('未処理のPromise拒否:', reason);
                // エラーをログに記録するが、アプリは続行
            };

            // エラーハンドラーを登録
            const ErrorUtils = global.ErrorUtils || (typeof ErrorUtils !== 'undefined' ? ErrorUtils : null);
            if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
                try {
                    ErrorUtils.setGlobalHandler(errorHandler);
                } catch (setupError) {
                    console.error('エラーハンドラー設定エラー:', setupError);
                }
            }

            // Promise拒否ハンドラーを登録
            if (typeof Promise !== 'undefined') {
                global.onunhandledrejection = (event) => {
                    rejectionHandler(event.reason, event.promise);
                    event.preventDefault();
                };
            }
        }

        // 認証状態の変更を監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // クリーンアップ
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="auto" />
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerTintColor: '#166534',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ParkDetail"
                    component={ParkDetailScreen}
                    options={{
                        title: '公園詳細',
                    }}
                />
                <Stack.Screen
                    name="AddReview"
                    component={AddReviewScreen}
                    options={{
                        title: 'レビューを書く',
                    }}
                />
                <Stack.Screen
                    name="AddPark"
                    component={AddParkScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="MyPage"
                    component={MyPageScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        title: 'ログイン',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="TermsOfService"
                    component={TermsOfServiceScreen}
                    options={{
                        title: '利用規約',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        title: '管理者ページ',
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}