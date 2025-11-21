#!/bin/bash

# Claude Code エージェント監視スクリプト

echo "=== Claude Code エージェント監視 ==="
echo "実行時刻: $(date)"
echo ""

# 実行中のClaudeプロセスを検出
echo "📋 実行中のClaudeセッション:"
ps aux | grep -E "^\S+\s+\d+.*claude\s*$" | grep -v grep | awk '{
    printf "  PID: %-6s | CPU: %5s%% | MEM: %5s%% | 実行時間: %s\n", $2, $3, $4, $10
}'

echo ""
echo "💾 メモリ使用状況:"
ps aux | grep -E "^\S+\s+\d+.*claude\s*$" | grep -v grep | awk '{sum+=$4; count++} END {
    if(count>0) printf "  合計: %.1f%% (%d セッション)\n", sum, count
    else print "  Claudeセッションが見つかりません"
}'

echo ""
echo "📝 Git状態:"
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$CHANGES" -gt 0 ]; then
    echo "  ⚠️  未コミットの変更: $CHANGES ファイル"
    git status --short | head -10
else
    echo "  ✅ クリーン（変更なし）"
fi

echo ""
echo "🔧 推奨アクション:"

# セッション数をチェック
SESSION_COUNT=$(ps aux | grep -E "^\S+\s+\d+.*claude\s*$" | grep -v grep | wc -l | tr -d ' ')
if [ "$SESSION_COUNT" -gt 2 ]; then
    echo "  ⚠️  $SESSION_COUNT 個のセッションが実行中 - リソース競合の可能性"
    echo "     不要なセッションを終了することを検討してください"
fi

# 未コミット変更をチェック
if [ "$CHANGES" -gt 5 ]; then
    echo "  ⚠️  多数の未コミット変更 - コンフリクトのリスク"
    echo "     変更を早めにコミットすることを推奨"
fi

echo ""
echo "=== 監視完了 ==="
