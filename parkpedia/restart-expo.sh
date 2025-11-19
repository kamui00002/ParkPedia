#!/bin/bash
# Expo Goでアプリを再起動するスクリプト

echo "🔄 Expo Goのキャッシュをクリアして再起動します..."

# キャッシュをクリア
echo "📦 キャッシュをクリア中..."
rm -rf node_modules/.cache
rm -rf .expo

# Expoを再起動（キャッシュクリア付き）
echo "🚀 Expoを起動中..."
npx expo start --clear

