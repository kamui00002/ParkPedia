#!/bin/bash
#
# 一括: ローカルで .ipa を作成 → TestFlight に提出
#
# 前提:
# - EAS CLI が使えること（`eas whoami` が通る）
# - iOS の署名設定が Xcode 側で整っていること
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 ParkPedia: build → submit (TestFlight) を開始します"

echo "🔎 EAS ログイン確認..."
if ! command -v eas >/dev/null 2>&1; then
  echo "❌ eas コマンドが見つかりません。先にインストールしてください: npm i -g eas-cli"
  exit 1
fi
eas whoami >/dev/null

echo "📦 Node 依存関係を確認..."
npm install

echo "🍫 CocoaPods を確認..."
cd ios
pod install
cd "$ROOT_DIR"

echo "🏗  ローカルで .ipa をビルド..."
./local_build_ios_ipa.sh

IPA_PATH="./ios/build/export/ParkPedia.ipa"
if [ ! -f "$IPA_PATH" ]; then
  echo "❌ .ipa が見つかりません: $IPA_PATH"
  exit 1
fi

echo "📤 TestFlight に提出..."
eas submit --platform ios --profile production --path "$IPA_PATH"

echo "✅ 完了: build & submit"











