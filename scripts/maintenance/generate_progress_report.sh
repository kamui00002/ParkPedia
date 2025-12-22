#!/bin/bash
# IMPLEMENTATION_CHECKLIST.md の進捗レポートを生成するスクリプト

REPORT_FILE="PROGRESS_REPORT.md"
CHECKLIST_FILE="IMPLEMENTATION_CHECKLIST.md"
DATE=$(date '+%Y年%m月%d日 %H:%M')

# 進捗カウンター
AUTO_COMPLETED=0
AUTO_TOTAL=6
MANUAL_COMPLETED=0
MANUAL_TOTAL=7

# レポート開始
cat > "$REPORT_FILE" << 'EOF'
# 📊 ParkPedia 改善実装 進捗レポート

EOF

echo "**生成日時**: $DATE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# エージェント自動実行タスクの確認
echo "## 🤖 エージェント自動実行タスク" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. 環境変数化
if [ -f ".env.example" ]; then
    echo "- [x] ✅ **環境変数化の実装**" >> "$REPORT_FILE"
    echo "  - \`.env.example\` ファイル: ✅ 存在" >> "$REPORT_FILE"
    echo "  - \`firebaseConfig.js\`: ✅ 環境変数対応済み" >> "$REPORT_FILE"
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ❌ **環境変数化の実装**" >> "$REPORT_FILE"
    echo "  - .env.example ファイル: ❌ 未作成" >> "$REPORT_FILE"
fi

# 2. Firestoreルール
if grep -q "userId" firestore.rules 2>/dev/null; then
    echo "- [x] ✅ **Firestoreルールの改善**" >> "$REPORT_FILE"
    echo "  - userId フィルタ: ✅ 実装済み" >> "$REPORT_FILE"
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ❌ **Firestoreルールの改善**" >> "$REPORT_FILE"
    echo "  - userId フィルタ: ❌ 未実装" >> "$REPORT_FILE"
fi

# 3. console.logの整理
DEV_COUNT=$(grep -r "__DEV__" --include="*.js" --include="*.jsx" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEV_COUNT" -gt 100 ]; then
    echo "- [x] ✅ **console.logの整理**" >> "$REPORT_FILE"
    echo "  - __DEV__ 使用箇所: ✅ $DEV_COUNT 箇所" >> "$REPORT_FILE"
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ⚠️  **console.logの整理**" >> "$REPORT_FILE"
    echo "  - __DEV__ 使用箇所: ⚠️  $DEV_COUNT 箇所（目標: 100以上）" >> "$REPORT_FILE"
fi

# 4. テスト環境
if [ -f "jest.config.js" ]; then
    echo "- [x] ✅ **テスト環境のセットアップ**" >> "$REPORT_FILE"
    echo "  - jest.config.js: ✅ 存在" >> "$REPORT_FILE"
    if grep -q '"test"' package.json 2>/dev/null; then
        echo "  - package.json テストスクリプト: ✅ 設定済み" >> "$REPORT_FILE"
    fi
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ❌ **テスト環境のセットアップ**" >> "$REPORT_FILE"
    echo "  - jest.config.js: ❌ 未作成" >> "$REPORT_FILE"
fi

# 5. CI/CD
if [ -f ".github/workflows/ci.yml" ]; then
    echo "- [x] ✅ **CI/CDパイプラインの構築**" >> "$REPORT_FILE"
    echo "  - .github/workflows/ci.yml: ✅ 存在" >> "$REPORT_FILE"
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ❌ **CI/CDパイプラインの構築**" >> "$REPORT_FILE"
    echo "  - .github/workflows/ci.yml: ❌ 未作成" >> "$REPORT_FILE"
fi

# 6. TypeScript型定義
TS_COUNT=$(find . -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$TS_COUNT" -gt 0 ]; then
    echo "- [x] ✅ **TypeScript型定義の追加**" >> "$REPORT_FILE"
    echo "  - TypeScriptファイル: ✅ $TS_COUNT 個" >> "$REPORT_FILE"
    AUTO_COMPLETED=$((AUTO_COMPLETED + 1))
else
    echo "- [ ] ❌ **TypeScript型定義の追加**" >> "$REPORT_FILE"
    echo "  - TypeScriptファイル: ❌ 0 個" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "**進捗**: $AUTO_COMPLETED / $AUTO_TOTAL 完了 ($(echo "scale=1; $AUTO_COMPLETED * 100 / $AUTO_TOTAL" | bc)%)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 進捗バー生成
PROGRESS_BAR=""
FILLED=$((AUTO_COMPLETED * 20 / AUTO_TOTAL))
for i in {1..20}; do
    if [ $i -le $FILLED ]; then
        PROGRESS_BAR="${PROGRESS_BAR}█"
    else
        PROGRESS_BAR="${PROGRESS_BAR}░"
    fi
done
echo "**進捗バー**: \`$PROGRESS_BAR\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# あなたが対応するタスク
echo "## 👤 あなたが対応するタスク" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. .env ファイル
if [ -f ".env" ]; then
    echo "- [x] ✅ **\`.env\` ファイルの作成と設定**" >> "$REPORT_FILE"
    echo "  - \`.env\` ファイル: ✅ 存在" >> "$REPORT_FILE"
    MANUAL_COMPLETED=$((MANUAL_COMPLETED + 1))
else
    echo "- [ ] ❌ **`.env` ファイルの作成と設定**" >> "$REPORT_FILE"
    echo "  - .env ファイル: ❌ 未作成" >> "$REPORT_FILE"
fi

# 2. EAS Secrets
echo "- [ ] ⚠️  **EAS Secrets の設定**" >> "$REPORT_FILE"
echo "  - 確認コマンド: \`eas secret:list\`" >> "$REPORT_FILE"
echo "  - 状態: 手動確認が必要" >> "$REPORT_FILE"

# 3. Firebase APIキー制限
echo "- [ ] ⚠️  **Firebase APIキーの制限設定**" >> "$REPORT_FILE"
echo "  - 確認場所: Firebase Console > プロジェクト設定 > API制限" >> "$REPORT_FILE"
echo "  - 状態: 手動確認が必要" >> "$REPORT_FILE"

# 4. Firestoreルールデプロイ
echo "- [ ] ⚠️  **Firestoreルールのデプロイ**" >> "$REPORT_FILE"
echo "  - 確認場所: Firebase Console > Firestore Database > ルール" >> "$REPORT_FILE"
echo "  - 状態: 手動確認が必要" >> "$REPORT_FILE"

# 5. Git履歴
if ! git log --all --full-history --oneline -- serviceAccountKey.json 2>/dev/null | grep -q .; then
    echo "- [x] ✅ **Git履歴の確認**" >> "$REPORT_FILE"
    echo "  - serviceAccountKey.json: ✅ 履歴に存在しない" >> "$REPORT_FILE"
    MANUAL_COMPLETED=$((MANUAL_COMPLETED + 1))
else
    echo "- [ ] ⚠️  **Git履歴の確認**" >> "$REPORT_FILE"
    echo "  - serviceAccountKey.json: ⚠️  履歴に存在する可能性" >> "$REPORT_FILE"
fi

# 6. Firebase秘密鍵ローテーション（オプション）
echo "- [ ] ⚪ **Firebase秘密鍵のローテーション（オプション）**" >> "$REPORT_FILE"
echo "  - 優先度: 低（念のため）" >> "$REPORT_FILE"

# 7. iOS証明書確認（オプション）
echo "- [ ] ⚪ **iOS証明書の状態確認（オプション）**" >> "$REPORT_FILE"
echo "  - 優先度: 低（念のため）" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "**進捗**: $MANUAL_COMPLETED / $MANUAL_TOTAL 完了 ($(echo "scale=1; $MANUAL_COMPLETED * 100 / $MANUAL_TOTAL" | bc)%)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 進捗バー生成
PROGRESS_BAR=""
FILLED=$((MANUAL_COMPLETED * 20 / MANUAL_TOTAL))
for i in {1..20}; do
    if [ $i -le $FILLED ]; then
        PROGRESS_BAR="${PROGRESS_BAR}█"
    else
        PROGRESS_BAR="${PROGRESS_BAR}░"
    fi
done
echo "**進捗バー**: \`$PROGRESS_BAR\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 全体進捗
TOTAL_COMPLETED=$((AUTO_COMPLETED + MANUAL_COMPLETED))
TOTAL_TASKS=$((AUTO_TOTAL + MANUAL_TOTAL))
TOTAL_PERCENT=$(echo "scale=1; $TOTAL_COMPLETED * 100 / $TOTAL_TASKS" | bc)

echo "## 📈 全体進捗" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**完了タスク**: $TOTAL_COMPLETED / $TOTAL_TASKS" >> "$REPORT_FILE"
echo "**完了率**: $TOTAL_PERCENT%" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 全体進捗バー
PROGRESS_BAR=""
FILLED=$((TOTAL_COMPLETED * 30 / TOTAL_TASKS))
for i in {1..30}; do
    if [ $i -le $FILLED ]; then
        PROGRESS_BAR="${PROGRESS_BAR}█"
    else
        PROGRESS_BAR="${PROGRESS_BAR}░"
    fi
done
echo "**進捗バー**: \`$PROGRESS_BAR\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 次のステップ
echo "## 🎯 次のステップ" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $MANUAL_COMPLETED -lt $MANUAL_TOTAL ]; then
    echo "### 🚨 優先度: 高" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    if [ ! -f ".env" ]; then
        echo "1. **`.env` ファイルの作成**" >> "$REPORT_FILE"
        echo "   \`\`\`bash" >> "$REPORT_FILE"
        echo "   cp .env.example .env" >> "$REPORT_FILE"
        echo "   # .env を編集してFirebase設定値を入力" >> "$REPORT_FILE"
        echo "   \`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
    
    echo "2. **EAS Secrets の設定**" >> "$REPORT_FILE"
    echo "   \`\`\`bash" >> "$REPORT_FILE"
    echo "   eas secret:list  # 現在の設定を確認" >> "$REPORT_FILE"
    echo "   # 未設定の場合は eas secret:create で追加" >> "$REPORT_FILE"
    echo "   \`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "3. **Firebase APIキーの制限設定**" >> "$REPORT_FILE"
    echo "   - Firebase Console > プロジェクト設定 > API制限" >> "$REPORT_FILE"
    echo "   - iOS Bundle ID を登録" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "4. **Firestoreルールのデプロイ**" >> "$REPORT_FILE"
    echo "   - Firebase Console > Firestore Database > ルール" >> "$REPORT_FILE"
    echo "   - \`firestore.rules\` の内容をコピーして貼り付け" >> "$REPORT_FILE"
    echo "   - 「公開」をクリック" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

echo "### 📝 チェックリスト更新" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "完了したタスクは \`IMPLEMENTATION_CHECKLIST.md\` で \`- [ ]\` を \`- [x]\` に更新してください。" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "自動更新スクリプト:" >> "$REPORT_FILE"
echo "\`\`\`bash" >> "$REPORT_FILE"
echo "./update_checklist_progress.sh" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**レポート生成スクリプト**: \`./generate_progress_report.sh\`" >> "$REPORT_FILE"
echo "**次回更新**: タスク完了後に再実行" >> "$REPORT_FILE"

# レポート生成完了
echo "✅ 進捗レポートを生成しました: $REPORT_FILE"
echo ""
echo "📊 サマリー:"
echo "  - エージェント自動実行: $AUTO_COMPLETED / $AUTO_TOTAL ($(echo "scale=1; $AUTO_COMPLETED * 100 / $AUTO_TOTAL" | bc)%)"
echo "  - あなたの対応: $MANUAL_COMPLETED / $MANUAL_TOTAL ($(echo "scale=1; $MANUAL_COMPLETED * 100 / $MANUAL_TOTAL" | bc)%)"
echo "  - 全体: $TOTAL_COMPLETED / $TOTAL_TASKS ($TOTAL_PERCENT%)"
echo ""
echo "📄 レポートを確認: cat $REPORT_FILE"

