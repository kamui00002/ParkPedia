// ログイン画面
// メール/パスワードでのログインと新規アカウント作成

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  // 状態管理
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true: ログイン, false: 新規登録
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // 利用規約への同意

  // Firebase認証の初期化確認
  useEffect(() => {
    if (!auth) {
      Alert.alert(
        'エラー',
        '認証サービスの初期化に失敗しました。アプリを再起動してください。'
      );
    }
  }, []);

  // ログイン処理
  const handleLogin = async () => {
    // 入力値の検証
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
      return;
    }

    // Firebase認証の確認
    if (!auth) {
      Alert.alert(
        'エラー',
        '認証サービスが利用できません。アプリを再起動してください。'
      );
      return;
    }

    try {
      setLoading(true);
      
      // タイムアウト処理（30秒）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      await Promise.race([
        signInWithEmailAndPassword(auth, email.trim(), password),
        timeoutPromise,
      ]);

      // ログイン成功後、前の画面に戻る
      navigation.goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('ログインエラー:', error);
      }
      
      let errorMessage = 'ログインに失敗しました';
      let errorTitle = 'エラー';
      
      // エラーコードに応じたメッセージ
      if (error.message === 'TIMEOUT') {
        errorTitle = 'タイムアウト';
        errorMessage = '接続がタイムアウトしました。ネットワーク接続を確認してから再試行してください。';
      } else if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'このメールアドレスは登録されていません。新規登録を行ってください。';
            break;
          case 'auth/wrong-password':
            errorMessage = 'パスワードが正しくありません。もう一度お試しください。';
            break;
          case 'auth/invalid-email':
            errorMessage = 'メールアドレスの形式が正しくありません。';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
            break;
          case 'auth/too-many-requests':
            errorTitle = 'ログイン試行回数制限';
            errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください。';
            break;
          case 'auth/network-request-failed':
            errorTitle = 'ネットワークエラー';
            errorMessage = 'ネットワーク接続を確認してから、もう一度お試しください。';
            break;
          case 'auth/user-disabled':
            errorMessage = 'このアカウントは無効化されています。サポートにお問い合わせください。';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'この認証方法は有効になっていません。';
            break;
          default:
            errorMessage = `ログインに失敗しました。エラーコード: ${error.code}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage, [
        {
          text: 'OK',
          style: 'default',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 新規登録処理
  const handleSignUp = async () => {
    // 入力値の検証
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    // 利用規約への同意チェック
    if (!agreedToTerms) {
      Alert.alert('エラー', '利用規約に同意する必要があります');
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
      return;
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    // Firebase認証の確認
    if (!auth) {
      Alert.alert(
        'エラー',
        '認証サービスが利用できません。アプリを再起動してください。'
      );
      return;
    }

    try {
      setLoading(true);
      
      // タイムアウト処理（30秒）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      await Promise.race([
        createUserWithEmailAndPassword(auth, email.trim(), password),
        timeoutPromise,
      ]);

      Alert.alert('成功', 'アカウントを作成しました', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('新規登録エラー:', error);
      }
      
      let errorMessage = 'アカウントの作成に失敗しました';
      let errorTitle = 'エラー';
      
      // エラーコードに応じたメッセージ
      if (error.message === 'TIMEOUT') {
        errorTitle = 'タイムアウト';
        errorMessage = '接続がタイムアウトしました。ネットワーク接続を確認してから再試行してください。';
      } else if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'このメールアドレスは既に使用されています。ログインしてください。';
            break;
          case 'auth/invalid-email':
            errorMessage = 'メールアドレスの形式が正しくありません。';
            break;
          case 'auth/weak-password':
            errorMessage = 'パスワードが弱すぎます。6文字以上のより強いパスワードを設定してください。';
            break;
          case 'auth/network-request-failed':
            errorTitle = 'ネットワークエラー';
            errorMessage = 'ネットワーク接続を確認してから、もう一度お試しください。';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'この認証方法は有効になっていません。';
            break;
          default:
            errorMessage = `アカウントの作成に失敗しました。エラーコード: ${error.code}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage, [
        {
          text: 'OK',
          style: 'default',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ゲストログイン処理
  const handleGuestLogin = async () => {
    // Firebase認証の確認
    if (!auth) {
      Alert.alert(
        'エラー',
        '認証サービスが利用できません。アプリを再起動してください。'
      );
      return;
    }

    try {
      setLoading(true);

      // タイムアウト処理（30秒）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      await Promise.race([
        signInAnonymously(auth),
        timeoutPromise,
      ]);

      // ログイン成功後、前の画面に戻る
      navigation.goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('ゲストログインエラー:', error);
      }

      let errorMessage = 'ゲストログインに失敗しました';
      let errorTitle = 'エラー';

      if (error.message === 'TIMEOUT') {
        errorTitle = 'タイムアウト';
        errorMessage = '接続がタイムアウトしました。ネットワーク接続を確認してから再試行してください。';
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = 'ネットワークエラー';
        errorMessage = 'ネットワーク接続を確認してから、もう一度お試しください。';
      } else if (error.code) {
        errorMessage = `ゲストログインに失敗しました。エラーコード: ${error.code}`;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* ホームに戻るボタン */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← ホームに戻る</Text>
            </TouchableOpacity>

            {/* アプリタイトル */}
            <View style={styles.header}>
              <Text style={styles.title}>ParkPedia</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'ログイン' : '新規登録'}
              </Text>
            </View>

            {/* メールアドレス入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            {/* パスワード入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>パスワード</Text>
              <TextInput
                style={styles.input}
                placeholder="パスワードを入力"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={isLogin ? 'password' : 'password-new'}
                autoCorrect={false}
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            {/* 利用規約への同意（新規登録時のみ表示） */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('TermsOfService')}
                        disabled={loading}
                      >
                        <Text style={styles.termsLink}>利用規約</Text>
                      </TouchableOpacity>
                      <Text style={styles.termsText}>に同意します</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* ログイン/新規登録ボタン */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={isLogin ? handleLogin : handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#4CAF50" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'ログイン' : '新規登録'}
                </Text>
              )}
            </TouchableOpacity>

            {/* ログイン/新規登録切り替え */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                if (!loading) {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setAgreedToTerms(false);
                }
              }}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isLogin
                  ? 'アカウントをお持ちでない方はこちら'
                  : '既にアカウントをお持ちの方はこちら'}
              </Text>
            </TouchableOpacity>

            {/* 区切り線 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>または</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ゲストログインボタン */}
            <TouchableOpacity
              style={[styles.guestButton, loading && styles.buttonDisabled]}
              onPress={handleGuestLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.guestButtonText}>ゲストとして続ける</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    minHeight: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? -50 : -30,
    left: -20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  dividerText: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 10,
    opacity: 0.9,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#fff',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

