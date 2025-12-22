import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { AD_SETTINGS, AD_PLACEHOLDER_COLOR } from '../adConfig';

/**

 * バナー広告プレースホルダー

 * 

 * AD_ENABLED = false の場合:

 *   → ピンク色の枠だけ表示（開発時）

 * 

 * AD_ENABLED = true の場合:

 *   → 実際の広告を表示（本番時）

 * 

 * 使い方:

 * <AdBannerPlaceholder />

 */

export default function AdBannerPlaceholder() {
  if (!AD_SETTINGS.banner.enabled) {
    // 🎨 広告無効時：スペースだけ確保

    return (
      <View style={[styles.placeholder, { height: AD_SETTINGS.banner.height }]}>
        <Text style={styles.placeholderText}>[広告スペース {AD_SETTINGS.banner.height}px]</Text>
      </View>
    );
  }

  // 🎯 広告有効時：ここに実際の広告コードを追加

  return (
    <View style={styles.adContainer}>
      {/* 

        TODO: 本番時にコメントアウトを外す

        

        import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

        

        <BannerAd

          unitId="ca-app-pub-xxxxx/yyyyy"

          size={BannerAdSize.BANNER}

          requestOptions={{

            requestNonPersonalizedAdsOnly: false,

          }}

        />

      */}

      <View style={[styles.placeholder, { height: AD_SETTINGS.banner.height }]}>
        <Text style={styles.placeholderText}>[広告読み込み中...]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: AD_PLACEHOLDER_COLOR,

    justifyContent: 'center',

    alignItems: 'center',

    borderTopWidth: 1,

    borderBottomWidth: 1,

    borderColor: '#FFB3B3',
  },

  placeholderText: {
    fontSize: 12,

    color: '#999',

    fontStyle: 'italic',
  },

  adContainer: {
    alignItems: 'center',

    backgroundColor: '#f5f5f5',
  },
});
