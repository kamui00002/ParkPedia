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

const Stack = createNativeStackNavigator();

export default function App() {
    // 認証状態を管理
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 認証状態の変更を監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // クリーンアップ
        return () => unsubscribe();
    }, []);

    // ローディング中は何も表示しない
    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
                initialRouteName={user ? "Home" : "Login"}
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
                {!user ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            title: 'ログイン',
                            headerShown: false,
                        }}
                    />
                ) : (
                    <>
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
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}