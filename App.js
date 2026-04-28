import React, { useState, useEffect } from 'react';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Constants from 'expo-constants';

// iOS 17+ / 26: AppState が active でないと ATT ダイアログが silent no-op になる
async function waitForActiveState() {
  if (AppState.currentState === 'active') return;
  return new Promise(resolve => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

// ATT を安全にリクエストする（AppState 待ち + 遅延 + 事前チェック）
async function requestATTOnceReady() {
  if (Platform.OS === 'web') return null;

  await waitForActiveState();
  // scene attach の余裕を与える（iOS 17+ で稀に必要）
  await new Promise(r => setTimeout(r, 500));

  // 既に決定済みなら prompt はスキップされる → 現状を必ず確認
  const current = await getTrackingPermissionsAsync();
  console.log('[ATT] current before request:', current.status);

  if (current.status !== 'undetermined') {
    return current.status; // authorized / denied / restricted
  }

  const { status } = await requestTrackingPermissionsAsync();
  console.log('[ATT] status after request:', status);
  return status;
}

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
import EditProfileScreen from './screens/EditProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // 認証状態を管理
  const [_user, setUser] = useState(null);
  // 初期化状態を管理
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    // 初期化処理を実行
    const initializeApp = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // ATT（App Tracking Transparency）ダイアログ表示
        // Apple ガイドライン 2.1: ATT 完了後に広告 SDK を初期化する
        // AppState が active になるまで待ち、500ms 遅延後にリクエスト
        if (Platform.OS !== 'web') {
          let attStatus = 'unknown';
          try {
            attStatus = await requestATTOnceReady();
            console.log('[ATT] Final status:', attStatus);
          } catch (attError) {
            console.warn('[ATT] Request failed:', attError.message);
          }

          // ATT 完了後に AdMob を初期化
          try {
            const mobileAds = require('react-native-google-mobile-ads').default;
            await mobileAds.initialize();
            console.log('[AdMob] 初期化成功');
          } catch (adError) {
            console.warn('[AdMob] 初期化失敗:', adError.message);
          }
        }

        // Firebase設定の確認
        try {
          // firebaseConfig.jsが正常に読み込まれているか確認
          const { auth: authCheck } = await import('./firebaseConfig');
          if (!authCheck) {
            throw new Error('Firebase Auth初期化に失敗しました');
          }
        } catch (error) {
          console.error('Firebase初期化エラー:', error);
          setInitError(error);
          setIsInitializing(false);
          return;
        }

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
            console.warn('Crashlyticsモジュール読み込み失敗:', error.message);
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
            console.warn('App Checkモジュール読み込み/初期化失敗:', error.message);
          }
        } else if (__DEV__ && isExpoGo) {
          console.log('📱 Expo Goで実行中 - App Checkはスキップします');
        }

        // 認証状態の変更を監視
        unsubscribe = onAuthStateChanged(auth, currentUser => {
          setUser(currentUser);
          setIsInitializing(false); // 認証状態が確定したら初期化完了

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
              console.warn('Crashlyticsユーザー設定失敗:', error.message);
            }
          }
        });
      } catch (error) {
        console.error('アプリ初期化エラー:', error);
        setInitError(error);
        setIsInitializing(false);
      }
    };

    initializeApp();

    // クリーンアップ
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 初期化エラーが発生した場合
  if (initError) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>初期化エラー</Text>
            <Text style={styles.errorMessage}>
              アプリの初期化に失敗しました。アプリを再起動してください。
            </Text>
            {/* 本番では内部エラー詳細を表示しない（情報漏洩防止） */}
            {__DEV__ && (
              <Text style={styles.errorDetails}>{initError.message || initError.toString()}</Text>
            )}
          </View>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  // 初期化中のローディング画面
  if (isInitializing) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

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
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: 'プロフィール編集',
              }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{
                title: 'プロフィール',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#166534',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
});
