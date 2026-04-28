#!/bin/bash

# TestFlight提出エラー完全解決スクリプト
# このスクリプトは、バージョンエラーを完全に解決します

set -e

echo "🔧 TestFlight提出エラー完全解決スクリプト"
echo ""

# プロジェクトルートに移動
cd "$(dirname "$0")"

# 1. 現在の設定を確認
echo "📋 現在の設定を確認中..."
VERSION=$(grep -A 1 "version:" app.config.js | grep "version:" | sed "s/.*version: '\(.*\)',/\1/")
BUILD_NUMBER=$(grep -A 1 "buildNumber:" app.config.js | grep "buildNumber:" | sed "s/.*buildNumber: '\(.*\)',/\1/")

echo "  version: $VERSION"
echo "  buildNumber: $BUILD_NUMBER"
echo ""

# 2. 既存のビルドファイルを完全に削除
echo "🧹 既存のビルドファイルを削除中..."
rm -rf ios/build
rm -rf ios/ParkPedia.xcarchive
echo "  ✅ 削除完了"
echo ""

# 3. CocoaPodsを再インストール（念のため）
echo "🍫 CocoaPodsを確認中..."
if [ -d "ios" ]; then
  cd ios
  if [ -f "Podfile" ]; then
    pod install
    echo "  ✅ CocoaPods再インストール完了"
  fi
  cd ..
fi
echo ""

# 4. 新しいバージョンでビルド
echo "🏗️  新しいバージョン（$VERSION, $BUILD_NUMBER）でビルド開始..."
echo ""

# ローカルビルドスクリプトを実行
if [ -f "local_build_ios_ipa.sh" ]; then
  chmod +x local_build_ios_ipa.sh
  ./local_build_ios_ipa.sh
else
  echo "❌ local_build_ios_ipa.sh が見つかりません"
  exit 1
fi

echo ""
echo "✅ ビルド完了"
echo ""

# 5. ビルドファイルの確認
IPA_PATH="./ios/build/export/ParkPedia.ipa"
if [ ! -f "$IPA_PATH" ]; then
  echo "❌ IPAファイルが見つかりません: $IPA_PATH"
  exit 1
fi

echo "📦 ビルドファイルを確認:"
echo "  場所: $IPA_PATH"
echo "  サイズ: $(du -h "$IPA_PATH" | cut -f1)"
echo ""

# 6. ビルドファイル内のバージョン情報を確認（オプション）
echo "🔍 ビルドファイル内のバージョン情報を確認中..."
if command -v unzip >/dev/null 2>&1; then
  TEMP_DIR=$(mktemp -d)
  unzip -q "$IPA_PATH" -d "$TEMP_DIR" 2>/dev/null || true
  if [ -f "$TEMP_DIR/Payload/ParkPedia.app/Info.plist" ]; then
    PLIST_VERSION=$(plutil -extract CFBundleShortVersionString raw "$TEMP_DIR/Payload/ParkPedia.app/Info.plist" 2>/dev/null || echo "確認不可")
    PLIST_BUILD=$(plutil -extract CFBundleVersion raw "$TEMP_DIR/Payload/ParkPedia.app/Info.plist" 2>/dev/null || echo "確認不可")
    echo "  CFBundleShortVersionString: $PLIST_VERSION"
    echo "  CFBundleVersion: $PLIST_BUILD"
    echo ""
    if [ "$PLIST_VERSION" != "$VERSION" ] || [ "$PLIST_BUILD" != "$BUILD_NUMBER" ]; then
      echo "⚠️  警告: ビルドファイル内のバージョンが設定と一致しません"
      echo "  設定: version=$VERSION, buildNumber=$BUILD_NUMBER"
      echo "  ビルド: version=$PLIST_VERSION, buildNumber=$PLIST_BUILD"
    else
      echo "  ✅ バージョン情報が一致しています"
    fi
  fi
  rm -rf "$TEMP_DIR"
else
  echo "  ⚠️  unzipコマンドが見つかりません。バージョン確認をスキップします"
fi
echo ""

# 7. TestFlightに提出
echo "📤 TestFlightに提出中..."
echo ""

if command -v eas >/dev/null 2>&1; then
  eas submit --platform ios --profile production --path "$IPA_PATH"
  echo ""
  echo "✅ 提出完了"
else
  echo "❌ easコマンドが見つかりません"
  echo "  インストール: npm install -g eas-cli"
  echo ""
  echo "手動で提出する場合:"
  echo "  eas submit --platform ios --profile production --path $IPA_PATH"
  exit 1
fi

echo ""
echo "🎉 完了！"
echo ""
echo "次のステップ:"
echo "  1. App Store Connectでビルドの処理を確認"
echo "  2. TestFlightタブでビルドが表示されることを確認"
echo ""




