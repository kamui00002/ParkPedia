#!/bin/bash
# IMPLEMENTATION_CHECKLIST.md の進捗を確認するスクリプト

echo "📊 IMPLEMENTATION_CHECKLIST.md 進捗確認"
echo "=========================================="
echo ""

# エージェント自動実行タスク
echo "🤖 エージェント自動実行タスク:"
echo ""

# 1. 環境変数化
if [ -f ".env.example" ]; then
    echo "  ✅ 環境変数化の実装 (.env.example 存在)"
else
    echo "  ❌ 環境変数化の実装 (.env.example 未作成)"
fi

# 2. Firestoreルール（改善されているか確認）
if grep -q "userId" firestore.rules 2>/dev/null; then
    echo "  ✅ Firestoreルールの改善 (userId フィルタ確認済み)"
else
    echo "  ⚠️  Firestoreルールの改善 (要確認)"
fi

# 3. console.logの整理
DEV_COUNT=$(grep -r "__DEV__" --include="*.js" --include="*.jsx" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEV_COUNT" -gt 100 ]; then
    echo "  ✅ console.logの整理 (__DEV__ 使用: $DEV_COUNT 箇所)"
else
    echo "  ⚠️  console.logの整理 (__DEV__ 使用が少ない: $DEV_COUNT 箇所)"
fi

# 4. テスト環境
if [ -f "jest.config.js" ]; then
    echo "  ✅ テスト環境のセットアップ (jest.config.js 存在)"
else
    echo "  ❌ テスト環境のセットアップ (jest.config.js 未作成)"
fi

# 5. CI/CD
if [ -f ".github/workflows/ci.yml" ]; then
    echo "  ✅ CI/CDパイプラインの構築 (ci.yml 存在)"
else
    echo "  ❌ CI/CDパイプラインの構築 (ci.yml 未作成)"
fi

# 6. TypeScript型定義
TS_COUNT=$(find . -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$TS_COUNT" -gt 0 ]; then
    echo "  ✅ TypeScript型定義の追加 (TypeScriptファイル: $TS_COUNT 個)"
else
    echo "  ❌ TypeScript型定義の追加 (TypeScriptファイルなし)"
fi

echo ""
echo "👤 あなたが対応するタスク:"
echo ""

# .env ファイル
if [ -f ".env" ]; then
    echo "  ✅ .env ファイルの作成と設定 (.env 存在)"
else
    echo "  ❌ .env ファイルの作成と設定 (.env 未作成)"
fi

# EAS Secrets（確認できないので手動確認が必要）
echo "  ⚠️  EAS Secrets の設定 (手動確認が必要: eas secret:list)"

# Firebase APIキー制限（確認できないので手動確認が必要）
echo "  ⚠️  Firebase APIキーの制限設定 (手動確認が必要)"

# Firestoreルールデプロイ（確認できないので手動確認が必要）
echo "  ⚠️  Firestoreルールのデプロイ (手動確認が必要)"

# Git履歴
if git log --all --full-history --oneline -- serviceAccountKey.json 2>/dev/null | grep -q .; then
    echo "  ⚠️  Git履歴の確認 (serviceAccountKey.json が履歴に存在する可能性)"
else
    echo "  ✅ Git履歴の確認 (serviceAccountKey.json は履歴に存在しない)"
fi

echo ""
echo "=========================================="
echo "完了したタスクは IMPLEMENTATION_CHECKLIST.md で [ ] を [x] に更新してください"
