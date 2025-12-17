#!/bin/bash

# セッション監視＆自動Git Pushスクリプト
# 他のClaudeセッションが終了するまで待機し、その後自動的にpush

PROJECT_DIR="/Users/yoshidometoru/Documents/GitHub/ParkPedia"
LOG_FILE="$PROJECT_DIR/session_monitor.log"

# 現在のセッションPIDを取得（このスクリプトを実行しているセッション）
CURRENT_SESSION_PID=$$
CURRENT_CLAUDE_PPID=$(ps -o ppid= -p $CURRENT_SESSION_PID | tr -d ' ')

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "============================================"
log "セッション監視開始"
log "現在のセッションPID: $CURRENT_SESSION_PID"
log "============================================"

# 他のClaudeセッションを監視
while true; do
    # 実行中のClaudeプロセスを取得（このスクリプト実行中のセッション以外）
    OTHER_SESSIONS=$(ps aux | grep -E "claude\s*$" | grep -v grep | grep -v "$CURRENT_CLAUDE_PPID" | awk '{print $2}')
    SESSION_COUNT=$(echo "$OTHER_SESSIONS" | grep -v "^$" | wc -l | tr -d ' ')

    if [ "$SESSION_COUNT" -eq 0 ]; then
        log "✅ 他のセッションがすべて終了しました"
        break
    fi

    log "📊 他のアクティブなセッション数: $SESSION_COUNT"
    echo "$OTHER_SESSIONS" | grep -v "^$" | while read pid; do
        CPU=$(ps -p $pid -o %cpu= 2>/dev/null | tr -d ' ')
        MEM=$(ps -p $pid -o %mem= 2>/dev/null | tr -d ' ')
        TIME=$(ps -p $pid -o etime= 2>/dev/null | tr -d ' ')
        if [ -n "$CPU" ]; then
            log "  → PID $pid: CPU ${CPU}%, MEM ${MEM}%, 実行時間 ${TIME}"
        fi
    done

    sleep 10  # 10秒ごとにチェック
done

log ""
log "============================================"
log "Git Push処理開始"
log "============================================"

cd "$PROJECT_DIR"

# Git状態を確認
log "📝 変更ファイル一覧:"
git status --short | tee -a "$LOG_FILE"

# 変更があるか確認
CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$CHANGES" -eq 0 ]; then
    log "✅ 変更がありません。Pushは不要です。"
    log "============================================"
    exit 0
fi

# Git add
log ""
log "📦 ファイルをステージング中..."
git add -A 2>&1 | tee -a "$LOG_FILE"

# Git commit
log ""
log "💾 コミット中..."
COMMIT_MSG="App Store Review対応: アカウント削除とレビュー報告機能のドキュメント改善

- APP_STORE_REVIEW_NOTES.mdを英語版に更新（詳細なテスト手順）
- APP_STORE_CONNECT_NOTES.txtを作成（簡潔版）
- レビュアー向けに機能の場所を明確に記載
- サンプルデータの確認方法を追加
- 監視スクリプト（monitor_agents.sh）を追加

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"
COMMIT_RESULT=$?

if [ $COMMIT_RESULT -ne 0 ]; then
    log "❌ コミットに失敗しました"
    exit 1
fi

# Git push
log ""
log "🚀 リモートにPush中..."
git push 2>&1 | tee -a "$LOG_FILE"
PUSH_RESULT=$?

if [ $PUSH_RESULT -eq 0 ]; then
    log ""
    log "============================================"
    log "✅ Push完了！"
    log "============================================"
    log ""
    log "🎯 次にあなたがすべきこと:"
    log ""
    log "1️⃣ Firestoreのデータ確認"
    log "   - Firebase Console → Firestore Database"
    log "   - 'parks'コレクションに公園データがあることを確認"
    log "   - 'reviews'コレクションにレビューデータがあることを確認"
    log "   - データがない場合: SAMPLE_DATA.jsを参照して手動追加"
    log ""
    log "2️⃣ デモアカウントの作成とテスト"
    log "   Email: reviewer@parkpedia.test"
log "   Password: (removed from repo)  ※App Store Connectの「Demo Account」に設定したものを参照"
    log "   - Firebase Console → Authentication → Add User"
    log "   - 実機でログインして全機能をテスト"
    log ""
    log "3️⃣ App Store Connectでの対応"
    log "   Step 1: Demo Account情報を追加"
    log "     App Review Information → Demo Account"
    log "     Email: reviewer@parkpedia.test"
log "     Password: (removed from repo)  ※App Store Connectの「Demo Account」に設定したものを参照"
    log ""
    log "   Step 2: Review Notesにテスト手順を追加"
    log "     APP_STORE_CONNECT_NOTES.txt の内容をコピー＆ペースト"
    log ""
    log "   Step 3: App Reviewに返信"
    log "     メッセージ例:"
    log "     'Thank you for your feedback. Both features are"
    log "     fully implemented. Please see detailed testing"
    log "     instructions in Notes for Reviewers section.'"
    log ""
    log "4️⃣ 最終確認"
    log "   ✅ デモアカウントでログイン成功"
    log "   ✅ おすすめセクションの公園にレビューが表示される"
    log "   ✅ レビューに「🚩 報告」ボタンが表示される"
    log "   ✅ マイページに「アカウントを削除」ボタンが表示される"
    log ""
    log "詳細はAPP_STORE_REVIEW_NOTES.mdを参照してください"
    log "============================================"
else
    log "❌ Pushに失敗しました"
    exit 1
fi
