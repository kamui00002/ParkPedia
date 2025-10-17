#!/bin/bash

echo "🚀 ParkPedia iOS配信のセットアップを開始します..."

# 依存関係をインストール
echo "📦 依存関係をインストール中..."
npm install

# プロダクションビルド
echo "🔨 プロダクションビルドを実行中..."
npm run build

# Capacitorの初期化
echo "📱 Capacitorを初期化中..."
npx cap init ParkPedia com.parkpedia.app

# iOSプラットフォームを追加
echo "🍎 iOSプラットフォームを追加中..."
npx cap add ios

# 依存関係を同期
echo "🔄 依存関係を同期中..."
npx cap sync ios

echo "✅ セットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. npm run open:ios でXcodeを開く"
echo "2. Bundle Identifierを com.parkpedia.app に設定"
echo "3. Apple Developer Teamを選択"
echo "4. 署名設定を完了"
echo "5. ビルドしてテスト"
echo ""
echo "詳細は README.md を参照してください。"
