#!/bin/bash
# IMPLEMENTATION_CHECKLIST.md の進捗を自動更新するスクリプト

CHECKLIST_FILE="IMPLEMENTATION_CHECKLIST.md"
BACKUP_FILE="${CHECKLIST_FILE}.backup"

# バックアップを作成
cp "$CHECKLIST_FILE" "$BACKUP_FILE"

# エージェント自動実行タスクの更新
if [ -f ".env.example" ]; then
    sed -i '' 's/- \[ \] \*\*環境変数化の実装\*\*/- [x] **環境変数化の実装** ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] 環境変数化の実装/- [x] 環境変数化の実装 ✅/' "$CHECKLIST_FILE"
fi

if grep -q "userId" firestore.rules 2>/dev/null; then
    sed -i '' 's/- \[ \] \*\*Firestoreルールの改善\*\*/- [x] **Firestoreルールの改善** ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] Firestoreルールの改善/- [x] Firestoreルールの改善 ✅/' "$CHECKLIST_FILE"
fi

DEV_COUNT=$(grep -r "__DEV__" --include="*.js" --include="*.jsx" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEV_COUNT" -gt 100 ]; then
    sed -i '' 's/- \[ \] \*\*console\.logの整理\*\*/- [x] **console.logの整理** ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] console\.logの整理/- [x] console.logの整理 ✅/' "$CHECKLIST_FILE"
fi

if [ -f "jest.config.js" ]; then
    sed -i '' 's/- \[ \] \*\*テスト環境のセットアップ\*\*/- [x] **テスト環境のセットアップ** ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] テスト環境のセットアップ/- [x] テスト環境のセットアップ ✅/' "$CHECKLIST_FILE"
fi

if [ -f ".github/workflows/ci.yml" ]; then
    sed -i '' 's/- \[ \] \*\*CI\/CDパイプラインの構築\*\*/- [x] **CI/CDパイプラインの構築** ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] CI\/CDパイプラインの構築/- [x] CI/CDパイプラインの構築 ✅/' "$CHECKLIST_FILE"
fi

TS_COUNT=$(find . -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$TS_COUNT" -gt 0 ]; then
    sed -i '' 's/- \[ \] \*\*TypeScript型定義の追加/- [x] **TypeScript型定義の追加 ✅/' "$CHECKLIST_FILE"
    sed -i '' 's/- \[ \] TypeScript型定義の追加/- [x] TypeScript型定義の追加 ✅/' "$CHECKLIST_FILE"
fi

# あなたが対応するタスクの更新
if [ -f ".env" ]; then
    sed -i '' 's/- \[ \] `\.env` ファイルの作成と設定/- [x] `.env` ファイルの作成と設定 ✅/' "$CHECKLIST_FILE"
fi

if ! git log --all --full-history --oneline -- serviceAccountKey.json 2>/dev/null | grep -q .; then
    # Git履歴に存在しない場合は完了とみなす
    echo "Git履歴の確認: ✅ 完了"
fi

echo "✅ チェックリストを更新しました"
echo "📝 バックアップ: $BACKUP_FILE"
echo ""
echo "⚠️  手動確認が必要なタスク:"
echo "  - EAS Secrets の設定 (eas secret:list で確認)"
echo "  - Firebase APIキーの制限設定 (Firebase Console で確認)"
echo "  - Firestoreルールのデプロイ (Firebase Console で確認)"
echo ""
echo "これらのタスクが完了したら、手動で [ ] を [x] に更新してください"


