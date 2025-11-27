// 広告設定ファイル

// このファイルで広告のON/OFFを一括管理

import { Platform } from 'react-native';



// 🎯 ここを変更するだけで広告の表示/非表示を切り替え

export const AD_ENABLED = false;  // 本番リリース時は true に変更



// 広告の表示設定

export const AD_SETTINGS = {

  // バナー広告

  banner: {

    enabled: AD_ENABLED,

    height: 50,  // 広告の高さ（ピクセル）

  },

  

  // インタースティシャル広告（全画面）

  interstitial: {

    enabled: AD_ENABLED,

    showAfterReviewCount: 5,  // レビュー投稿5回ごとに表示

  },

  

  // リワード広告（報酬型）

  rewarded: {

    enabled: AD_ENABLED,

    rewardAmount: 10,  // 獲得ポイント

  },

};



// 開発用：広告スペースの背景色

export const AD_PLACEHOLDER_COLOR = '#FFE5E5';  // ピンク色で視認性UP



// 広告ユニットID（本番リリース時にAdMobで取得したIDに置き換える）

// ステップ2で取得した広告ユニットIDを以下に設定してください

export const AD_UNIT_IDS = {

  banner: Platform.select({

    ios: 'ca-app-pub-xxxxx/yyyyy',      // ← ステップ2で取得したiOSバナー広告ID

    android: 'ca-app-pub-xxxxx/zzzzz',  // ← ステップ2で取得したAndroidバナー広告ID

  }),

  interstitial: Platform.select({

    ios: 'ca-app-pub-xxxxx/aaaaa',      // ← ステップ2で取得したiOSインタースティシャル広告ID

    android: 'ca-app-pub-xxxxx/bbbbb',  // ← ステップ2で取得したAndroidインタースティシャル広告ID

  }),

};

