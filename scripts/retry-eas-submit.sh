#!/bin/bash
# EAS Submit の障害復旧を待って自動再試行するスクリプト
# - 20 分間隔で最大 24 回（合計 8 時間）リトライ
# - 成功したら macOS 通知 + 終了
# - すべて失敗したら通知して終了

BUILD_ID="c22b28d4-7188-4533-a285-5c2cfae81db9"
RETRY_INTERVAL=1200      # 20 分
MAX_RETRIES=24           # 最大 8 時間
PROJECT_ROOT="/Users/yoshidometoru/Documents/GitHub/ParkPedia"
LOG_FILE="$PROJECT_ROOT/eas-submit-retry.log"

cd "$PROJECT_ROOT" || exit 1

# 通知ヘルパー（macOS）
notify() {
  local title="$1"
  local message="$2"
  osascript -e "display notification \"$message\" with title \"$title\"" 2>/dev/null || true
}

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "============================================"
log "🔁 EAS Submit retry script started"
log "Build ID: $BUILD_ID"
log "Retry interval: $((RETRY_INTERVAL/60)) min"
log "Max attempts: $MAX_RETRIES (total $((RETRY_INTERVAL*MAX_RETRIES/3600)) hours)"
log "============================================"

notify "ParkPedia: EAS Submit 自動再試行開始" "20分間隔で復旧を待ちます"

for attempt in $(seq 1 $MAX_RETRIES); do
  log ""
  log "=== Attempt $attempt/$MAX_RETRIES ==="

  # eas submit を実行（出力をログにも残す）
  if eas submit --platform ios --id "$BUILD_ID" --non-interactive --wait >> "$LOG_FILE" 2>&1; then
    log "✅ SUCCESS: build $BUILD_ID submitted to App Store Connect"
    notify "ParkPedia: TestFlight 提出成功 🎉" "build 42 が ASC へ提出されました。Apple 処理 5-15分で TestFlight に出現します"
    exit 0
  fi

  exit_code=$?
  log "⚠️  Attempt $attempt failed (exit $exit_code)"

  if [ $attempt -lt $MAX_RETRIES ]; then
    log "  Sleeping $((RETRY_INTERVAL/60)) min before next attempt..."
    sleep $RETRY_INTERVAL
  fi
done

log "❌ All $MAX_RETRIES attempts failed"
notify "ParkPedia: 自動再試行失敗" "8時間試したが提出できませんでした。手動対応が必要です"
exit 1
