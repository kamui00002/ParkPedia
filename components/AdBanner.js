import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_ENABLED, AD_UNIT_IDS, AD_TEST_MODE } from '../adConfig';

/**
 * AdMobバナー広告コンポーネント
 *
 * 使い方:
 *   <AdBanner />
 *
 * 広告の有効/無効は adConfig.js の AD_ENABLED で制御
 */
const AdBanner = () => {
  // 広告が無効の場合は何も表示しない
  if (!AD_ENABLED) {
    return null;
  }

  // 開発環境ではテスト広告IDを使用、本番環境では実際の広告IDを使用
  const adUnitId = AD_TEST_MODE
    ? TestIds.BANNER
    : AD_UNIT_IDS.banner;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('AdMob: 広告が読み込まれました');
        }}
        onAdFailedToLoad={(error) => {
          console.log('AdMob: 広告の読み込みに失敗しました:', error);
        }}
      />
    </View>
  );
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
