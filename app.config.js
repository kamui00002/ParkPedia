// app.config.js - Dynamic Expo configuration with environment variables
// This file replaces app.json and allows loading values from .env file

// Load environment variables from .env file
require('dotenv').config();

// Facebook SDK プラグイン（環境変数が設定されている場合のみ有効）
const plugins = [
  [
    'expo-location',
    {
      locationAlwaysAndWhenInUsePermission:
        'このアプリは近くの公園を検索するために位置情報を使用します。',
    },
  ],
  [
    'expo-image-picker',
    {
      photosPermission: 'このアプリは公園の写真を選択するためにフォトライブラリにアクセスします。',
      cameraPermission: 'このアプリは公園の写真を撮影するためにカメラを使用します。',
    },
  ],
  [
    'react-native-google-mobile-ads',
    {
      iosAppId: 'ca-app-pub-5237930968754753~4809377071',
      androidAppId: 'ca-app-pub-5237930968754753~4809377071',
    },
  ],
  [
    'expo-tracking-transparency',
    {
      userTrackingPermission:
        'お客様の興味に合った広告を表示し、サービスを無料で提供し続けるため、トラッキングの許可をお願いします。',
    },
  ],
];

// Google AdMob 推奨 SKAdNetwork ID (https://developers.google.com/admob/ios/ios14)
const SK_AD_NETWORK_ITEMS = [
  'cstr6suwn9.skadnetwork',
  '4fzdc2evr5.skadnetwork',
  '2fnua5tdw4.skadnetwork',
  'ydx93a7ass.skadnetwork',
  'p78axxw29g.skadnetwork',
  'v72qych5uu.skadnetwork',
  'ludvb6z3bs.skadnetwork',
  'cp8zw746q7.skadnetwork',
  '3sh42y64q3.skadnetwork',
  'c6k4g5qg8m.skadnetwork',
  's39g8k73mm.skadnetwork',
  'wg4vff78zm.skadnetwork',
  '3qy4746246.skadnetwork',
  'f38h382jlk.skadnetwork',
  'hs6bdukanm.skadnetwork',
  'mlmmfzh3r3.skadnetwork',
  'v4nxqhlyqp.skadnetwork',
  'wzmmz9fp6w.skadnetwork',
  'su67r6k2v3.skadnetwork',
  'yclnxrl5pm.skadnetwork',
  't38b2kh725.skadnetwork',
  '7ug5zh24hu.skadnetwork',
  'gta9lk7p23.skadnetwork',
  'vutu7akeur.skadnetwork',
  'y5ghdn5j9k.skadnetwork',
  'v9wttpbfk9.skadnetwork',
  'n38lu8286q.skadnetwork',
  '47vhws6wlr.skadnetwork',
  'kbd757ywx3.skadnetwork',
  '9t245vhmpl.skadnetwork',
  'a2p9lx4jpn.skadnetwork',
  '22mmun2rn5.skadnetwork',
  '44jx6755aq.skadnetwork',
  'k674qkevps.skadnetwork',
  '4468km3ulz.skadnetwork',
  '2u9pt9hc89.skadnetwork',
  '8s468mfl3y.skadnetwork',
  'klf5c3l5u5.skadnetwork',
  'ppxm28t8ap.skadnetwork',
  'kbmxgpxpgc.skadnetwork',
  'uw77j35x4d.skadnetwork',
  '578prtvx9j.skadnetwork',
  '4dzt52r2t5.skadnetwork',
  'tl55sbb4fm.skadnetwork',
  'c3frkrj4fj.skadnetwork',
  'e5fvkxwrpn.skadnetwork',
  '8c4e2ghe7u.skadnetwork',
  '3rd42ekr43.skadnetwork',
  '97r2b46745.skadnetwork',
  '3qcr597p9d.skadnetwork',
].map(id => ({ SKAdNetworkIdentifier: id }));

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_CLIENT_TOKEN) {
  plugins.push([
    'react-native-fbsdk-next',
    {
      appID: process.env.FACEBOOK_APP_ID,
      clientToken: process.env.FACEBOOK_CLIENT_TOKEN,
      displayName: 'ParkPedia',
      advertiserIDCollectionEnabled: false,
      autoLogAppEventsEnabled: false,
      isAutoInitEnabled: true,
    },
  ]);
}

plugins.push(
  '@react-native-firebase/app',
  '@react-native-firebase/crashlytics',
  '@react-native-firebase/app-check',
  './plugins/withModularHeaders'
);

module.exports = {
  expo: {
    name: 'ParkPedia',
    slug: 'parkpedia',
    version: '1.1.2',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    backgroundColor: '#4CAF50',
    primaryColor: '#4CAF50',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#4CAF50',
    },
    assetBundlePatterns: ['**/*'],
    // OTA 更新は無効化（v1.0.15 で expo-updates が起動時クラッシュの原因となった経緯あり）
    updates: {
      enabled: false,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.parkpedia.app',
      buildNumber: '42',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'このアプリは近くの公園を検索するために位置情報を使用します。',
        NSCameraUsageDescription: 'このアプリは公園の写真を撮影するためにカメラを使用します。',
        NSPhotoLibraryUsageDescription:
          'このアプリは公園の写真を選択するためにフォトライブラリにアクセスします。',
        ITSAppUsesNonExemptEncryption: false,
        GADIsAdManagerApp: true,
        NSUserTrackingUsageDescription:
          'お客様の興味に合った広告を表示し、サービスを無料で提供し続けるため、トラッキングの許可をお願いします。',
        FirebaseAnalyticsCollectionEnabled: false,
        SKAdNetworkItems: SK_AD_NETWORK_ITEMS,
      },
      newArchEnabled: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS || '',
      },
    },
    android: {
      package: 'com.parkpedia.app',
      versionCode: 25,
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID || '',
        },
      },
    },
    web: {
      favicon: './assets/icon.png',
      bundler: 'metro',
    },
    plugins,
    extra: {
      eas: {
        projectId: 'd557bbc6-e7ef-4acc-915b-26ab09766021',
      },
      // Firebase configuration from environment variables
      // These values will be available via Constants.expoConfig.extra in the app
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
    install: {
      exclude: ['jest'],
    },
  },
};
