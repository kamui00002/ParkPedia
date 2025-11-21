#!/bin/bash
# Expo開発サーバーを自動起動するスクリプト
# 20:00に実行されることを想定

cd /Users/yoshidometoru/Documents/GitHub/ParkPedia/parkpedia

# 既存のExpoサーバーを停止
pkill -f "expo start" 2>/dev/null
sleep 2

# Expoサーバーを起動
npx expo start > /tmp/expo_auto_start.log 2>&1 &

echo "$(date): Expoサーバーを自動起動しました" >> /tmp/expo_auto_start.log

