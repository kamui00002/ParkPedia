#!/bin/bash

# ローカルビルドスクリプト（App Store / TestFlight 提出用 .ipa 作成）
set -e

echo "📱 ローカルビルドを開始します..."

# スクリプトのあるディレクトリ（=プロジェクト直下想定）に移動
cd "$(dirname "$0")"

# Xcodeで設定している Team をここでも明示（署名エラー対策）
TEAM_ID="B7F79FDM78"

# 1. クリーンビルド
echo "🧹 クリーンビルドを実行中..."
xcodebuild clean \
  -workspace ios/ParkPedia.xcworkspace \
  -scheme ParkPedia \
  -configuration Release \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates

# 2. アーカイブを作成
echo "📦 アーカイブを作成中..."
# 自動署名設定を尊重するため、手動の署名設定は指定しない
xcodebuild archive \
  -workspace ios/ParkPedia.xcworkspace \
  -scheme ParkPedia \
  -configuration Release \
  -archivePath ios/build/ParkPedia.xcarchive \
  -destination "generic/platform=iOS" \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates

# 3. .ipaファイルをエクスポート
echo "📤 .ipaファイルをエクスポート中..."

# ExportOptions.plist を作成（必要に応じて調整）
cat > ios/ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>teamID</key>
  <string>B7F79FDM78</string>
  <key>uploadBitcode</key>
  <false/>
  <key>uploadSymbols</key>
  <true/>
  <key>compileBitcode</key>
  <false/>
</dict>
</plist>
EOF

# エクスポート実行
xcodebuild -exportArchive \
  -archivePath ios/build/ParkPedia.xcarchive \
  -exportPath ios/build/export \
  -exportOptionsPlist ios/ExportOptions.plist \
  -allowProvisioningUpdates

echo "✅ ビルド完了！"
echo "📦 .ipaファイルの場所: ios/build/export/ParkPedia.ipa"
echo ""
echo "次のステップ:"
echo "  eas submit --platform ios --profile production --path ./ios/build/export/ParkPedia.ipa"



