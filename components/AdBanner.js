import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { AD_ENABLED, AD_UNIT_IDS, AD_TEST_MODE } from '../adConfig';

/**
 * AdMobバナー広告コンポーネント
 *
 * 使い方:
 *   <AdBanner />
 *
 * 広告の有効/無効は adConfig.js の AD_ENABLED で制御
 * Expo Go環境では自動的に広告を無効化（エラーをキャッチ）
 */
const AdBanner = () => {
  // 広告が無効の場合は何も表示しない
  if (!AD_ENABLED) {
    return null;
  }

  // Webは非対応
  if (Platform.OS === 'web') {
    return null;
  }

  // Expo Go環境を検出（executionEnvironment === 'storeClient' は Expo Go）
  let isExpoGo = false;
  try {
    if (Constants && Constants.executionEnvironment) {
      isExpoGo = Constants.executionEnvironment === 'storeClient';
    }
  } catch (e) {
    // Constantsが利用できない場合は、Expo Goの可能性が高い
    isExpoGo = true;
  }

  // Expo Go ではネイティブ広告モジュールが使えないため表示しない
  if (isExpoGo) {
    return null;
  }

  // ネイティブ広告モジュールを安全にロード（hooksでコンポーネント参照を保持しない）
  let adModule;
  try {
    adModule = require('react-native-google-mobile-ads');
  } catch (e) {
    return null;
  }

  const BannerAd = adModule?.BannerAd;
  const BannerAdSize = adModule?.BannerAdSize;
  const TestIds = adModule?.TestIds || { BANNER: 'ca-app-pub-3940256099942544/6300978111' };

  if (!BannerAd || !BannerAdSize) {
    return null;
  }

  // 開発環境ではテスト広告IDを使用、本番環境では実際の広告IDを使用
  const adUnitId = AD_TEST_MODE && TestIds
    ? TestIds.BANNER
    : AD_UNIT_IDS.banner;

  // 広告コンポーネントを安全にレンダリング
  try {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => {
            if (__DEV__) {
              console.log('AdMob: 広告が読み込まれました');
            }
          }}
          onAdFailedToLoad={(error) => {
            if (__DEV__) {
              console.log('AdMob: 広告の読み込みに失敗しました:', error);
            }
          }}
        />
      </View>
    );
  } catch (error) {
    // レンダリング時のエラーも無視
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
  },
});

export default AdBanner;
