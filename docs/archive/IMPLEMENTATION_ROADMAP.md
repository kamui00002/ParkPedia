# ParkPedia 実装ロードマップ

**作成日**: 2025年12月18日
**対象期間**: 3ヶ月（Week 1-12）

---

## 概要

このドキュメントは、ParkPediaの品質向上とセキュリティ強化のための実装計画です。優先度順に整理されています。

---

## 🔴 CRITICAL（即時対応 - Week 1-2）

### C-1. セキュリティ脆弱性の完全修正 ⚠️
**期間**: 1-2週間 | **工数**: 10人日 | **担当**: Backend Engineer

- [ ] **Git履歴から機密情報を完全削除**
  ```bash
  # BFG Repo-Cleaner または git filter-repo 使用
  git filter-repo --path serviceAccountKey.json --invert-paths
  git filter-repo --path credentials.json --invert-paths
  git push --force
  ```

- [ ] **Firebase serviceAccountKey.json のローテーション**
  - Firebase Console → プロジェクト設定 → サービスアカウント
  - 新しい秘密鍵を生成
  - 古い鍵を削除

- [ ] **iOS credentials.json（Distribution Certificate）のローテーション**
  - Apple Developer Account → Certificates
  - 新しいDistribution Certificateを作成
  - 古い証明書を失効

- [ ] **環境変数への移行**
  ```bash
  # .env ファイル作成
  npm install --save-dev dotenv
  echo "FIREBASE_API_KEY=your-api-key" > .env
  echo "FIREBASE_AUTH_DOMAIN=your-auth-domain" >> .env
  echo ".env" >> .gitignore
  ```

- [ ] **EAS Secrets 設定**
  ```bash
  eas secret:create --scope project --name FIREBASE_API_KEY --value your-api-key
  eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value your-auth-domain
  # ... 他の設定値も同様に
  ```

- [ ] **Firebase APIキー制限設定**
  - Firebase Console → プロジェクト設定 → API制限
  - iOS Bundle ID、Android パッケージ名を登録
  - リファラー制限を設定

- [ ] **Firestoreセキュリティルールの修正**
  ```javascript
  // reports コレクション
  match /reports/{reportId} {
    allow list: if request.auth != null
                && request.query.limit <= 100
                && 'userId' in request.query.orderBy;
  }

  // favorites コレクション
  match /favorites/{favoriteId} {
    allow list: if request.auth != null
                && request.query.limit <= 100
                && 'userId' in request.query.orderBy;
  }

  // blockedUsers コレクション
  match /blockedUsers/{blockId} {
    allow list: if request.auth != null
                && request.query.limit <= 100
                && 'userId' in request.query.orderBy;
  }
  ```

**検証方法**:
- [ ] Git 履歴に機密情報が含まれていないことを確認（`git log --all --full-history -- serviceAccountKey.json`）
- [ ] Firebase Console で新しい秘密鍵が生成されていることを確認
- [ ] アプリが環境変数から設定値を読み込めることを確認
- [ ] Firestore ルールテストで列挙クエリが制限されていることを確認

---

## 🔴 HIGH（1-2週間以内 - Week 3-6）

### H-1. 自動テストの導入
**期間**: 2週間 | **工数**: 20人日 | **担当**: Frontend Engineer

- [ ] **Jest + React Native Testing Library セットアップ**
  ```bash
  npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
  ```

- [ ] **jest.config.js 作成**
  ```javascript
  module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
    ],
    collectCoverageFrom: [
      '**/*.{js,jsx,ts,tsx}',
      '!**/node_modules/**',
      '!**/coverage/**',
    ],
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  };
  ```

- [ ] **utils/ のユニットテスト作成**
  - [ ] `utils/__tests__/imageUploader.test.js`
  - [ ] `utils/__tests__/adminUtils.test.js`
  - カバレッジ目標: 80%以上

- [ ] **components/ のコンポーネントテスト作成**
  - [ ] `components/__tests__/AdBanner.test.js`
  - [ ] `components/__tests__/ErrorBoundary.test.js`
  - [ ] `components/__tests__/FilterDrawer.test.js`

- [ ] **screens/ の統合テスト作成（主要フロー）**
  - [ ] ログインフロー（`LoginScreen.test.js`）
  - [ ] 公園一覧表示（`HomeScreen.test.js`）
  - [ ] レビュー投稿（`AddReviewScreen.test.js`）

- [ ] **package.json にスクリプト追加**
  ```json
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
  ```

**検証方法**:
- [ ] `npm test` でテストが通ることを確認
- [ ] カバレッジレポート（`npm run test:coverage`）で80%以上を達成

---

### H-2. CI/CDパイプラインの構築
**期間**: 1週間 | **工数**: 5人日 | **担当**: DevOps Engineer

- [ ] **.github/workflows/ci.yml 作成**
  ```yaml
  name: CI

  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
        - run: npm ci
        - run: npm run lint
        - run: npm test
        - uses: codecov/codecov-action@v3
          with:
            files: ./coverage/lcov.info

    eas-build:
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      steps:
        - uses: actions/checkout@v3
        - uses: expo/expo-github-action@v8
          with:
            expo-version: latest
            token: ${{ secrets.EXPO_TOKEN }}
        - run: npm ci
        - run: eas build --platform ios --non-interactive --no-wait
  ```

- [ ] **ESLint + Prettier 設定**
  ```bash
  npm install --save-dev eslint @react-native/eslint-config prettier eslint-config-prettier
  ```

- [ ] **.eslintrc.js 作成**
  ```javascript
  module.exports = {
    root: true,
    extends: ['@react-native', 'prettier'],
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  };
  ```

- [ ] **Husky + lint-staged 設定（Pre-commit hooks）**
  ```bash
  npm install --save-dev husky lint-staged
  npx husky install
  npx husky add .husky/pre-commit "npx lint-staged"
  ```

- [ ] **package.json に lint-staged 設定追加**
  ```json
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
  ```

**検証方法**:
- [ ] Pull Request作成時にCIが自動実行されることを確認
- [ ] Lint エラーがある場合、CIが失敗することを確認
- [ ] main ブランチへのマージ時にEAS Buildが自動実行されることを確認

---

### H-3. TypeScriptの段階的導入
**期間**: 3週間 | **工数**: 30人日 | **担当**: Frontend Engineer

- [ ] **Phase 1: utils/ の型定義（Week 1）**
  - [ ] `utils/imageUploader.ts`
  - [ ] `utils/adminUtils.ts`
  ```typescript
  // utils/imageUploader.ts
  export const uploadImage = async (
    uri: string,
    userId: string,
    folder: 'parks' | 'reviews'
  ): Promise<string> => {
    // 実装
  };
  ```

- [ ] **Phase 2: components/ の型定義（Week 2）**
  - [ ] `components/AdBanner.tsx`
  - [ ] `components/ErrorBoundary.tsx`
  - [ ] `components/FilterDrawer.tsx`
  ```typescript
  // components/AdBanner.tsx
  interface AdBannerProps {
    adType: 'banner' | 'interstitial';
    onAdLoaded?: () => void;
    onAdFailedToLoad?: (error: Error) => void;
  }

  export const AdBanner: React.FC<AdBannerProps> = ({ adType, onAdLoaded }) => {
    // 実装
  };
  ```

- [ ] **Phase 3: screens/ の型定義（Week 3）**
  - [ ] `screens/HomeScreen.tsx`
  - [ ] `screens/ParkDetailScreen.tsx`
  - [ ] `screens/LoginScreen.tsx`

- [ ] **tsconfig.json の strict モード有効化**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true
    }
  }
  ```

**検証方法**:
- [ ] `npx tsc --noEmit` で型エラーが0件になることを確認
- [ ] IDEで型補完が正常に機能することを確認

---

## 🟡 MEDIUM（1ヶ月以内 - Week 7-10）

### M-1. パフォーマンス最適化
**期間**: 2週間 | **工数**: 20人日

- [ ] **画像圧縮（アップロード前）**
  ```javascript
  import * as ImageManipulator from 'expo-image-manipulator';

  const compressImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  };
  ```

- [ ] **ページネーション実装**
  ```javascript
  const [lastVisible, setLastVisible] = useState(null);
  const ITEMS_PER_PAGE = 20;

  const fetchParks = async () => {
    let q = query(
      collection(db, 'parks'),
      orderBy('createdAt', 'desc'),
      limit(ITEMS_PER_PAGE)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
  };
  ```

- [ ] **FlatList 最適化**
  ```javascript
  <FlatList
    data={parks}
    renderItem={renderPark}
    keyExtractor={(item) => item.id}
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={5}
  />
  ```

- [ ] **useMemo/useCallback の適切な使用**
  ```javascript
  const filteredParks = useMemo(() => {
    return parks.filter(park => park.name.includes(searchQuery));
  }, [parks, searchQuery]);

  const handlePress = useCallback((parkId) => {
    navigation.navigate('ParkDetail', { parkId });
  }, [navigation]);
  ```

**検証方法**:
- [ ] Firebase Storage のネットワークトラフィック削減を確認
- [ ] FlatList のスクロールパフォーマンス改善を体感確認
- [ ] React DevTools Profiler でレンダリング回数削減を確認

---

### M-2. アクセシビリティ対応
**期間**: 1週間 | **工数**: 5人日

- [ ] **全てのインタラクティブ要素に accessibilityLabel 追加**
  ```javascript
  <TouchableOpacity
    accessible={true}
    accessibilityLabel="公園を検索"
    accessibilityHint="タップして検索画面を開きます"
    accessibilityRole="button"
    onPress={handleSearch}
  >
    <Text>検索</Text>
  </TouchableOpacity>
  ```

- [ ] **VoiceOver/TalkBack テスト**
  - iOS VoiceOver で全画面をテスト
  - Android TalkBack で全画面をテスト

- [ ] **テキストスケール対応**
  ```javascript
  <Text allowFontScaling={true} style={styles.text}>
    公園の説明
  </Text>
  ```

- [ ] **色コントラスト検証（WCAG AA準拠）**
  - コントラスト比4.5:1以上を確保

**検証方法**:
- [ ] VoiceOver/TalkBackで全ての操作が可能なことを確認
- [ ] 設定でテキストサイズを最大にしても読める事を確認

---

### M-3. 多言語対応（i18n）
**期間**: 2週間 | **工数**: 20人日

- [ ] **react-i18next 導入**
  ```bash
  npm install i18next react-i18next
  ```

- [ ] **i18n.js 作成**
  ```javascript
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import * as Localization from 'expo-localization';

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: require('./locales/en.json') },
        ja: { translation: require('./locales/ja.json') },
      },
      lng: Localization.locale.split('-')[0],
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  export default i18n;
  ```

- [ ] **翻訳キー抽出と翻訳ファイル作成**
  - [ ] `locales/ja.json`
  - [ ] `locales/en.json`

- [ ] **全てのハードコード文字列を翻訳キーに置換**
  ```javascript
  import { useTranslation } from 'react-i18next';

  const HomeScreen = () => {
    const { t } = useTranslation();

    return (
      <View>
        <Text>{t('home.welcome')}</Text>
        <Button title={t('home.search')} onPress={handleSearch} />
      </View>
    );
  };
  ```

**検証方法**:
- [ ] デバイス言語を英語に変更してアプリ表示を確認
- [ ] 全ての画面で翻訳が適用されていることを確認

---

### M-4. オフライン対応強化
**期間**: 2週間 | **工数**: 20人日

- [ ] **React Query 導入**
  ```bash
  npm install @tanstack/react-query
  ```

- [ ] **QueryClient 設定**
  ```javascript
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分
        cacheTime: 1000 * 60 * 30, // 30分
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });
  ```

- [ ] **Firestore クエリを React Query に移行**
  ```javascript
  const { data: parks, isLoading, error } = useQuery({
    queryKey: ['parks'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'parks'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
  ```

- [ ] **オフラインインジケーター追加**
  ```javascript
  import NetInfo from '@react-native-community/netinfo';

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  {isOffline && (
    <View style={styles.offlineBanner}>
      <Text>オフラインです</Text>
    </View>
  )}
  ```

**検証方法**:
- [ ] 機内モードでアプリを起動し、キャッシュデータが表示されることを確認
- [ ] オフライン状態でオフラインインジケーターが表示されることを確認

---

## 🟢 LOW（2ヶ月以内 - Week 11-12）

### L-1. Firebase Analytics 導入
**期間**: 3日 | **工数**: 3人日

- [ ] **@react-native-firebase/analytics インストール**
- [ ] **イベントログ実装**
- [ ] **スクリーン追跡実装**

### L-2. Firebase Performance Monitoring 導入
**期間**: 2日 | **工数**: 2人日

- [ ] **@react-native-firebase/perf インストール**
- [ ] **カスタムトレース追加**

### L-3. プッシュ通知機能
**期間**: 1週間 | **工数**: 5人日

- [ ] **expo-notifications 導入**
- [ ] **FCM 設定**
- [ ] **通知送信機能実装**

### L-4. 高度な検索機能
**期間**: 1週間 | **工数**: 7人日

- [ ] **Algolia 導入**
- [ ] **全文検索実装**

---

## チェックリスト統計

### 総タスク数
- **CRITICAL**: 7タスク
- **HIGH**: 17タスク
- **MEDIUM**: 16タスク
- **LOW**: 4タスク
- **合計**: 44タスク

### 総工数
- **120人日**（約6ヶ月・2名体制）

### 完了目標
- **Week 1-2**: セキュリティ対応完了
- **Week 6**: テスト・CI/CD基盤完成
- **Week 9**: TypeScript移行完了
- **Week 12**: 主要機能改善完了

---

## 進捗管理

### 週次レビュー
- 毎週金曜日に進捗確認
- 完了タスクをチェック
- ブロッカーの洗い出し

### マイルストーン
- [ ] **Week 2**: セキュリティ緊急対応完了
- [ ] **Week 6**: テスト・CI/CD基盤完成
- [ ] **Week 9**: TypeScript移行完了
- [ ] **Week 12**: アプリ品質向上完了

---

**次のステップ**: このロードマップを基に、チームでキックオフミーティングを実施し、担当者と期日を確定してください。
