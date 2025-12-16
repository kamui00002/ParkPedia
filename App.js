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

// コンポーネント
import ErrorBoundary from './components/ErrorBoundary';

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
let isAdMobInitialized = false;
if (Platform.OS !== 'web') {
    try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        // 同期的に初期化を開始（非同期完了を待たない）
        mobileAds.initialize().then(() => {
            isAdMobInitialized = true;
            if (__DEV__) {
                console.log('AdMob初期化成功');
            }
        }).catch((error) => {
            if (__DEV__) {
                console.warn('AdMob初期化失敗:', error.message);
            }
            // エラーでもアプリは続行（AdMobなしで動作）
            isAdMobInitialized = true;
        });
    } catch (error) {
        if (__DEV__) {
            console.warn('AdMobモジュール読み込み失敗:', error.message);
        }
        // モジュールが存在しない場合もアプリは続行
        isAdMobInitialized = true;
    }
} else {
    // Web環境では初期化不要
    isAdMobInitialized = true;
}

export default function App() {
    // 認証状態を管理
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Crashlytics初期化（React Component内で実行する：ブリッジ初期化前の呼び出しを避ける）
        if (Platform.OS !== 'web') {
            try {
                const crashlytics = require('@react-native-firebase/crashlytics').default;
                // 開発中は収集を止めたい場合は true/false を切り替え
                crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
                crashlytics().log('アプリケーション起動');
                if (__DEV__) {
                    console.log('Crashlytics初期化成功');
                }
            } catch (error) {
                if (__DEV__) {
                    console.warn('Crashlyticsモジュール読み込み失敗:', error.message);
                }
            }
        }

        // 認証状態の変更を監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            // Firebase AuthのユーザーIDをCrashlyticsに設定
            if (Platform.OS !== 'web') {
                try {
                    const crashlytics = require('@react-native-firebase/crashlytics').default;
                    if (currentUser) {
                        crashlytics().setUserId(currentUser.uid);
                        // 個人情報は送らないのが安全。必要ならメールは削除/匿名化してください。
                        crashlytics().setAttribute('auth_provider', currentUser.isAnonymous ? 'anonymous' : 'password');
                    } else {
                        crashlytics().setUserId('anonymous');
                    }
                } catch (error) {
                    if (__DEV__) {
                        console.warn('Crashlyticsユーザー設定失敗:', error.message);
                    }
                }
            }
        });

        // クリーンアップ
        return () => unsubscribe();
    }, []);

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
}