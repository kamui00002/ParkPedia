// React Native Testing Library の拡張マッチャー
import '@testing-library/jest-native/extend-expect';

// グローバルなモックを設定
global.__DEV__ = true;

// Firebase のモック
jest.mock('./firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  storage: {},
}));

// Firebase Storage のモック
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Firebase Auth のモック
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInAnonymously: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Firebase Firestore のモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// React Native Firebase Crashlytics のモック
jest.mock('@react-native-firebase/crashlytics', () => ({
  default: jest.fn(() => ({
    setCrashlyticsCollectionEnabled: jest.fn(),
    log: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    recordError: jest.fn(),
  })),
}));

// React Native Google Mobile Ads のモック
jest.mock('react-native-google-mobile-ads', () => ({
  default: {
    initialize: jest.fn(() => Promise.resolve()),
  },
  BannerAd: 'BannerAd',
  BannerAdSize: {
    BANNER: 'BANNER',
  },
  TestIds: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
  },
}));

// AsyncStorage のモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Expo Constants のモック
jest.mock('expo-constants', () => ({
  default: {
    executionEnvironment: 'standalone',
    expoConfig: {
      extra: {},
    },
  },
}));

// Expo Image Picker のモック
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Expo Location のモック
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// React Navigation のモック
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
}));

// React Native Safe Area Context のモック
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// fetch のモック（画像アップロード用）
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
  })
);

// console のモック（テスト出力を綺麗に保つため）
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
