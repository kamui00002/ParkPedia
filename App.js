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

export default function App() {
    // 認証状態を管理（初期起動時もホーム画面を表示するため、ローディング状態を削除）
    const [user, setUser] = useState(null);
    const [isAdMobInitialized, setIsAdMobInitialized] = useState(false);

    // AdMobの初期化
    useEffect(() => {
        const initializeAdMob = async () => {
            try {
                // Native環境でのみAdMobを初期化
                if (Platform.OS !== 'web') {
                    const mobileAds = require('react-native-google-mobile-ads').default;

                    // AdMobを初期化
                    await mobileAds.initialize();

                    if (__DEV__) {
                        console.log('AdMob初期化成功');
                    }
                }
                setIsAdMobInitialized(true);
            } catch (error) {
                // AdMob初期化エラーをキャッチ（Expo Go環境や開発環境での安全性）
                if (__DEV__) {
                    console.log('AdMob初期化スキップ（開発環境または利用不可）:', error.message);
                }
                setIsAdMobInitialized(true); // エラーでも続行
            }
        };

        initializeAdMob();
    }, []);

    useEffect(() => {
        // 認証状態の変更を監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // クリーンアップ
        return () => unsubscribe();
    }, []);

    // AdMob初期化待ち
    if (!isAdMobInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    return (
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
    );
}