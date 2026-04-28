#!/bin/bash
# Preview ビルド完了を監視 → 成功時に Production + TestFlight 提出を自動実行
#
# Usage:
#   ./scripts/auto-promote-to-production.sh [PREVIEW_BUILD_ID]
#   ./scripts/auto-promote-to-production.sh --no-confirm  # 確認スキップ
#
# Exit codes:
#   0: success (production submitted)
#   1: preview failed
#   2: timeout
#   3: production submit failed

set -euo pipefail

PREVIEW_BUILD_ID="${1:-a191162e-ca84-440a-9eb3-cfa47d9c4f03}"
POLL_INTERVAL=60       # 1分ごとにポーリング
MAX_WAIT_SECONDS=2700  # 最大45分待機
CONFIRM_WAIT=300       # 成功後 5分の cancel 猶予 (Ctrl+C で中止可)
NO_CONFIRM=0

for arg in "$@"; do
  if [ "$arg" = "--no-confirm" ]; then
    NO_CONFIRM=1
  fi
done

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

LOG_FILE="$PROJECT_ROOT/auto-promote.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }

log "============================================"
log "🤖 Auto-promote script started"
log "Preview build ID: $PREVIEW_BUILD_ID"
log "Project: $PROJECT_ROOT"
log "Log file: $LOG_FILE"
log "============================================"

# === Phase 1: Preview ビルドの完了を待機 ===
log ""
log "📡 Phase 1: Polling preview build status..."

elapsed=0
last_status=""
while [ $elapsed -lt $MAX_WAIT_SECONDS ]; do
  # eas build:view で JSON 取得 → jq で status 抽出
  status_json=$(eas build:view --json "$PREVIEW_BUILD_ID" 2>/dev/null || echo '{"status":"UNKNOWN"}')
  status=$(echo "$status_json" | jq -r '.status // "UNKNOWN"')

  if [ "$status" != "$last_status" ]; then
    log "  Build status: $status (elapsed: ${elapsed}s / max: ${MAX_WAIT_SECONDS}s)"
    last_status="$status"
  fi

  case "$status" in
    FINISHED)
      log "✅ Preview build FINISHED successfully"
      ipa_url=$(echo "$status_json" | jq -r '.artifacts.buildUrl // "N/A"')
      log "   IPA URL: $ipa_url"
      break
      ;;
    ERRORED|CANCELED|FAILED)
      log "❌ Preview build failed: $status"
      log "   詳細: https://expo.dev/accounts/soumatou/projects/parkpedia/builds/$PREVIEW_BUILD_ID"
      exit 1
      ;;
    NEW|IN_QUEUE|IN_PROGRESS|PENDING_CANCEL)
      sleep $POLL_INTERVAL
      elapsed=$((elapsed + POLL_INTERVAL))
      ;;
    *)
      log "⚠️  Unknown status: $status — keep polling"
      sleep $POLL_INTERVAL
      elapsed=$((elapsed + POLL_INTERVAL))
      ;;
  esac
done

if [ $elapsed -ge $MAX_WAIT_SECONDS ]; then
  log "⏱  Timeout waiting for preview build (>${MAX_WAIT_SECONDS}s)"
  exit 2
fi

# === Phase 2: 確認猶予 ===
if [ $NO_CONFIRM -eq 0 ]; then
  log ""
  log "🛑 Phase 2: Confirmation window"
  log "   Production ビルド + TestFlight 提出を ${CONFIRM_WAIT} 秒後に開始します"
  log "   中止する場合は今すぐ Ctrl+C を押してください"
  log "   (--no-confirm フラグで猶予をスキップできます)"

  for i in $(seq $CONFIRM_WAIT -10 10); do
    log "   ... ${i}秒後に開始"
    sleep 10
  done
fi

# === Phase 3: Production ビルド + auto-submit ===
log ""
log "🚀 Phase 3: Triggering production build + TestFlight submission"
log "   コマンド: eas build --platform ios --profile production --non-interactive --auto-submit"

if eas build --platform ios --profile production --non-interactive --auto-submit; then
  log ""
  log "============================================"
  log "✅ Production build submitted successfully"
  log "   Apple TestFlight 処理は通常 5-15 分で完了します"
  log "   進捗確認: https://appstoreconnect.apple.com/apps"
  log "============================================"
  exit 0
else
  log "❌ Production build/submit failed"
  exit 3
fi
