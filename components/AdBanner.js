import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
  const [adModuleAvailable, setAdModuleAvailable] = useState(false);
  const [BannerAdComponent, setBannerAdComponent] = useState(null);
  const [BannerAdSize, setBannerAdSize] = useState(null);
  const [TestIds, setTestIds] = useState(null);

  useEffect(() => {
    // Expo Go環境を検出
    // executionEnvironment === 'storeClient' は Expo Go アプリ
    let isExpoGo = false;
    try {
      if (Constants && Constants.executionEnvironment) {
        isExpoGo = Constants.executionEnvironment === 'storeClient';
      }
    } catch (e) {
      // Constantsが利用できない場合は、Expo Goの可能性が高い
      isExpoGo = true;
    }

    // Expo Go環境の場合は、広告モジュールをロードしない
    if (isExpoGo) {
      setAdModuleAvailable(false);
      return;
    }

    // 開発ビルドまたは本番ビルドの場合のみ、広告モジュールをロード
    const loadAdModule = () => {
      try {
        // モジュールを安全にロード
        const adModule = require('react-native-google-mobile-ads');
        
        // モジュールが正しくロードされているか確認
        if (adModule && typeof adModule === 'object' && adModule.BannerAd && adModule.BannerAdSize) {
          setBannerAdComponent(adModule.BannerAd);
          setBannerAdSize(adModule.BannerAdSize);
          setTestIds(adModule.TestIds || { BANNER: 'ca-app-pub-3940256099942544/6300978111' });
          setAdModuleAvailable(true);
          if (__DEV__) {
            console.log('AdMob: 広告モジュールが利用可能です');
          }
        } else {
          setAdModuleAvailable(false);
        }
      } catch (error) {
        // エラーを無視（開発ビルドが必要）
        setAdModuleAvailable(false);
      }
    };

    // 非同期でロード
    setTimeout(() => {
      loadAdModule();
    }, 0);
  }, []);

  // 広告が無効の場合は何も表示しない
  if (!AD_ENABLED) {
    return null;
  }

  // 広告モジュールが利用できない場合は何も表示しない
  if (!adModuleAvailable || !BannerAdComponent || !BannerAdSize) {
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
        {React.createElement(BannerAdComponent, {
          unitId: adUnitId,
          size: BannerAdSize.BANNER,
          requestOptions: {
            requestNonPersonalizedAdsOnly: false,
          },
          onAdLoaded: () => {
            if (__DEV__) {
              console.log('AdMob: 広告が読み込まれました');
            }
          },
          onAdFailedToLoad: (error) => {
            if (__DEV__) {
              console.log('AdMob: 広告の読み込みに失敗しました:', error);
            }
          },
        })}
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
