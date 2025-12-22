#!/bin/bash
# コードベースクリーンアップスクリプト

echo "🧹 ParkPedia コードベースクリーンアップ開始..."
echo ""

# バックアップディレクトリを作成
BACKUP_DIR=".cleanup_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 バックアップディレクトリ: $BACKUP_DIR"
echo ""

# 削除対象ファイルのリスト
FILES_TO_REMOVE=(
  "app.json.backup"
  "assets/icon_backup.png"
  "crash.log"
  "release-build.log"
  "session_monitor.log"
  "firestore-rules-clean.txt"
  "firestore-rules-simple.txt"
  "FIRESTORE_RULES_COPY_PASTE.txt"
  "STORAGE_RULES_COPY_PASTE.txt"
  "STORAGE_RULES_DEPLOY.md"
)

# ファイルをバックアップして削除
REMOVED_COUNT=0
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "🗑️  削除: $file"
    # バックアップ
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file" 2>/dev/null || true
    # 削除
    rm "$file"
    ((REMOVED_COUNT++))
  fi
done

echo ""
echo "✅ $REMOVED_COUNT 個のファイルを削除しました"
echo ""

# 重複ファイルの確認
echo "🔍 重複ファイルの確認..."
DUPLICATES=0

# imageUploader.js と imageUploader.ts の重複確認
if [ -f "utils/imageUploader.js" ] && [ -f "utils/imageUploader.ts" ]; then
  echo "⚠️  重複: utils/imageUploader.js と utils/imageUploader.ts が両方存在"
  echo "   → TypeScript版を優先し、JavaScript版を削除することを推奨"
  ((DUPLICATES++))
fi

if [ $DUPLICATES -eq 0 ]; then
  echo "✅ 重複ファイルは見つかりませんでした"
fi

echo ""

# 未使用の依存関係チェック（npm-check-unused が利用可能な場合）
if command -v depcheck &> /dev/null; then
  echo "📦 未使用の依存関係をチェック..."
  depcheck --ignores="@types/*,eslint-*,prettier,babel-*,jest,*test*" 2>/dev/null || echo "  depcheck の結果を確認してください"
  echo ""
fi

# .gitignore の確認
echo "📝 .gitignore の確認..."
if ! grep -q "\.backup" .gitignore 2>/dev/null; then
  echo "  → .gitignore に .backup パターンを追加することを推奨"
fi
if ! grep -q "\.log" .gitignore 2>/dev/null; then
  echo "  → .gitignore に *.log パターンが既に存在します"
fi

echo ""

# クリーンアップサマリー
echo "📊 クリーンアップサマリー"
echo "=========================="
echo "削除したファイル: $REMOVED_COUNT 個"
echo "バックアップ場所: $BACKUP_DIR"
echo ""
echo "✅ クリーンアップ完了！"
echo ""
echo "💡 次のステップ:"
echo "   1. バックアップを確認: ls -la $BACKUP_DIR"
echo "   2. 問題がなければバックアップを削除: rm -rf $BACKUP_DIR"
echo "   3. 改善計画の実装を開始: IMPROVEMENT_PLAN.md を確認"


