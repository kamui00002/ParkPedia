// Error Boundary - アプリ全体のエラーをキャッチしてCrashlyticsに送信
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Crashlyticsが利用可能な場合のみ送信（Web以外）
    if (Platform.OS !== 'web') {
      try {
        const crashlytics = require('@react-native-firebase/crashlytics').default;
        crashlytics().recordError(error);
        crashlytics().log(`Error Info: ${JSON.stringify(errorInfo)}`);
      } catch (e) {
        console.error('Failed to log error to Crashlytics:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>予期しないエラーが発生しました</Text>
            <Text style={styles.errorMessage}>
              申し訳ございません。アプリでエラーが発生しました。
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>エラー詳細（開発者向け）:</Text>
                <Text style={styles.errorDetailsText}>{this.state.error.toString()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
              <Text style={styles.resetButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resetButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
