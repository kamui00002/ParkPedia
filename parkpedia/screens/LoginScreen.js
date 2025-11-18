// ログイン画面
// メール/パスワードでのログインと新規アカウント作成

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

  // ログイン処理
  const handleLogin = async () => {
    console.log('🔵 ログインボタンがタップされました');
    // 入力検証
    if (!email.trim() || !password.trim()) {
      console.log('⚠️ 入力が空です');
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // ログイン成功時はApp.jsのonAuthStateChangedで自動的に画面遷移
    } catch (error) {
      // 本番環境でもエラーログを出力（コンソールに出力）
      console.error('ログインエラー:', error.code, error.message);
      
      let errorMessage = 'ログインに失敗しました';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'ユーザーが見つかりません';
          break;
        case 'auth/wrong-password':
          errorMessage = 'パスワードが正しくありません';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          break;
        default:
          errorMessage = `ログインに失敗しました: ${error.message || '不明なエラー'}`;
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 新規登録処理
  const handleSignUp = async () => {
    console.log('🟢 新規登録ボタンがタップされました');
    // 入力検証
    if (!email.trim() || !password.trim()) {
      console.log('⚠️ 入力が空です');
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('成功', 'アカウントを作成しました');
      // 登録成功後は自動的にログイン状態になる
    } catch (error) {
      // 本番環境でもエラーログを出力
      console.error('新規登録エラー:', error.code, error.message);

      let errorMessage = 'アカウントの作成に失敗しました';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます。より強いパスワードを設定してください';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください';
          break;
        default:
          errorMessage = `アカウントの作成に失敗しました: ${error.message || '不明なエラー'}`;
      }

      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ゲストログイン処理
  const handleGuestLogin = async () => {
    console.log('👤 ゲストログインボタンがタップされました');
    try {
      setLoading(true);
      await signInAnonymously(auth);
      console.log('✅ ゲストログイン成功');
      // ログイン成功時はApp.jsのonAuthStateChangedで自動的に画面遷移
    } catch (error) {
      console.error('ゲストログインエラー:', error.code, error.message);

      let errorMessage = 'ゲストログインに失敗しました';

      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください';
          break;
        default:
          errorMessage = `ゲストログインに失敗しました: ${error.message || '不明なエラー'}`;
      }

      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
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
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
          />
        </View>

        {/* ログイン/新規登録ボタン */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            loading && styles.buttonDisabled,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            console.log('🔴 Pressable onPress triggered');
            if (isLogin) {
              handleLogin();
            } else {
              handleSignUp();
            }
          }}
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {loading ? (
            <ActivityIndicator color="#4CAF50" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'ログイン' : '新規登録'}
            </Text>
          )}
        </Pressable>

        {/* ログイン/新規登録切り替え */}
        <Pressable
          style={styles.switchButton}
          onPress={() => {
            console.log('🟡 切り替えボタンがタップされました');
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
          }}
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.switchButtonText}>
            {isLogin
              ? 'アカウントをお持ちでない方はこちら'
              : '既にアカウントをお持ちの方はこちら'}
          </Text>
        </Pressable>

        {/* 区切り線 */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ゲストログインボタン */}
        <Pressable
          style={({ pressed }) => [
            styles.guestButton,
            loading && styles.buttonDisabled,
            pressed && styles.buttonPressed
          ]}
          onPress={handleGuestLogin}
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.guestButtonText}>
            ゲストとして続ける
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 56,
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
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
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
});




