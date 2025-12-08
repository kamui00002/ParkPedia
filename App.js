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

    useEffect(() => {
        // 認証状態の変更を監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // クリーンアップ
        return () => unsubscribe();
    }, []);

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