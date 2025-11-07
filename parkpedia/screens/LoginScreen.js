// ログイン画面
// メール/パスワードでのログインと新規アカウント作成

import React, { useState } from 'react';
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
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // ログイン成功時はApp.jsのonAuthStateChangedで自動的に画面遷移
    } catch (error) {
      console.error('ログインエラー:', error);
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
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 新規登録処理
  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
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
      console.error('新規登録エラー:', error);
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
        <TouchableOpacity
          style={styles.button}
          onPress={isLogin ? handleLogin : handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
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
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
          }}
          disabled={loading}
        >
          <Text style={styles.switchButtonText}>
            {isLogin
              ? 'アカウントをお持ちでない方はこちら'
              : '既にアカウントをお持ちの方はこちら'}
          </Text>
        </TouchableOpacity>
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
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});

