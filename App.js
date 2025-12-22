import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Constants from 'expo-constants';

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
let _isAdMobInitialized = false;
if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads').default;
    // 同期的に初期化を開始（非同期完了を待たない）
    mobileAds
      .initialize()
      .then(() => {
        _isAdMobInitialized = true;
        if (__DEV__) {
          console.log('AdMob初期化成功');
        }
      })
      .catch(error => {
        if (__DEV__) {
          console.warn('AdMob初期化失敗:', error.message);
        }
        // エラーでもアプリは続行（AdMobなしで動作）
        _isAdMobInitialized = true;
      });
  } catch (error) {
    if (__DEV__) {
      console.warn('AdMobモジュール読み込み失敗:', error.message);
    }
    // モジュールが存在しない場合もアプリは続行
    _isAdMobInitialized = true;
  }
} else {
  // Web環境では初期化不要
  _isAdMobInitialized = true;
}

export default function App() {
  // 認証状態を管理
  const [_user, setUser] = useState(null);

  useEffect(() => {
    // Expo Goで実行中かチェック
    const isExpoGo = Constants.appOwnership === 'expo';

    // Crashlytics初期化
    // Note: Expo Go では動作しません。Development Build または Production Build が必要です。
    if (Platform.OS !== 'web' && !isExpoGo) {
      try {
        const crashlyticsModule = require('@react-native-firebase/crashlytics');
        if (crashlyticsModule && crashlyticsModule.default) {
          const crashlytics = crashlyticsModule.default;
          crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
          crashlytics().log('アプリケーション起動');
          if (__DEV__) {
            console.log('Crashlytics初期化成功');
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Crashlyticsモジュール読み込み失敗:', error.message);
        }
      }
    } else if (__DEV__ && isExpoGo) {
      console.log('📱 Expo Goで実行中 - Crashlyticsはスキップします');
    }

    // App Check初期化
    // Note: Expo Go では動作しません。Development Build または Production Build が必要です。
    if (Platform.OS !== 'web' && !isExpoGo) {
      try {
        const appCheckModule = require('@react-native-firebase/app-check');
        if (appCheckModule && appCheckModule.default) {
          const appCheck = appCheckModule.default;

          if (__DEV__) {
            appCheck().initializeAppCheck({
              provider: 'debug',
              isTokenAutoRefreshEnabled: true,
            });
            console.log('App Check初期化成功 (Debug mode)');
          } else {
            appCheck().initializeAppCheck({
              provider: Platform.OS === 'ios' ? 'deviceCheck' : 'playIntegrity',
              isTokenAutoRefreshEnabled: true,
            });
            if (__DEV__) console.log('App Check初期化成功 (Production mode)');
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('App Checkモジュール読み込み/初期化失敗:', error.message);
        }
      }
    } else if (__DEV__ && isExpoGo) {
      console.log('📱 Expo Goで実行中 - App Checkはスキップします');
    }

    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);

      // Firebase AuthのユーザーIDをCrashlyticsに設定
      const isExpoGo = Constants.appOwnership === 'expo';
      if (Platform.OS !== 'web' && !isExpoGo) {
        try {
          const crashlyticsModule = require('@react-native-firebase/crashlytics');
          if (crashlyticsModule && crashlyticsModule.default) {
            const crashlytics = crashlyticsModule.default;
            if (currentUser) {
              crashlytics().setUserId(currentUser.uid);
              crashlytics().setAttribute(
                'auth_provider',
                currentUser.isAnonymous ? 'anonymous' : 'password'
              );
            } else {
              crashlytics().setUserId('anonymous');
            }
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
