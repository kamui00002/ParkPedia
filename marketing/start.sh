#!/bin/bash
# ☁️ start.sh — ParkPedia 動画・スクショ作成セッション開始スクリプト

set -uo pipefail

MARKETING_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$MARKETING_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

echo "═══════════════════════════════════════"
echo "🌳  ParkPedia 動画+スクショ作成セッション"
echo "═══════════════════════════════════════"
echo ""

# Git 状態
echo "📋 Git 状態"
BRANCH=$(git branch --show-current)
echo "  Branch: $BRANCH"
if [ "$BRANCH" = "main" ]; then
    echo "  ⚠️  main にいます。作業ブランチに切り替えてください:"
    echo "      git checkout marketing/2026-05-19-promo"
fi
echo ""

# Expo / シミュレータ状態
echo "📱 Expo シミュレータ"
BOOTED=$(xcrun simctl list devices booted 2>&1 | grep -c Booted || true)
if [ "$BOOTED" -gt 0 ]; then
    echo "  ✅ Booted simulator あり"
    xcrun simctl list devices booted 2>&1 | grep Booted | head -1
else
    echo "  ⚠️  シミュレータ未起動。別ターミナルで起動:"
    echo "      cd $PROJECT_ROOT && npx expo start --ios"
fi
echo ""

# ツール
echo "🛠  必要ツール"
for tool in ffmpeg xcrun npx; do
    if command -v $tool >/dev/null 2>&1; then
        echo "  ✅ $tool"
    else
        echo "  ❌ $tool が見つかりません"
    fi
done
echo ""

# npm 脆弱性 (今日の宿題)
echo "🛡  npm audit 状態 (帰宅後対応 TODO)"
cd "$PROJECT_ROOT"
AUDIT_OUTPUT=$(npm audit 2>&1 | head -20 || true)
if echo "$AUDIT_OUTPUT" | grep -qE "critical|high"; then
    echo "  ⚠️  脆弱性あり (Critical 1 を Issue #4 で検出済)"
    echo "  対応: 動画作業の前後どこかで npm audit fix"
else
    echo "  ✅ 脆弱性なし"
fi
cd "$MARKETING_DIR"
echo ""

# ファイル状態
echo "📁 marketing/ 配下"
ls "$MARKETING_DIR"/{copy.md,make-video.sh,make-screenshots.sh,promo-video/README.md} 2>/dev/null | sed 's|^|  ✅ |'
echo ""

cat <<EOF
═══════════════════════════════════════
🚀 次のステップ (順番に実行)

  # === 0. (任意) npm 脆弱性修正を先に片付ける ===
  cd $PROJECT_ROOT
  npm audit fix
  # → diff 確認 → npm start で動作確認 → commit

  cd $MARKETING_DIR
  cat copy.md                      # コピー全部確認

  # === 1. Expo シミュレータ起動 (別ターミナル) ===
  # cd $PROJECT_ROOT && npx expo start --ios

  # === 2. 動画作成 ===
  ./make-video.sh record           # 15 秒録画
  ./make-video.sh edit             # Claude 編集依頼
  ./make-video.sh bgm              # Suno BGM 依頼
  ./make-video.sh convert          # 4 アスペクト比生成

  # === 3. スクショ作成 ===
  ./make-screenshots.sh capture-all  # 6 シーン順次撮影
                                       (map, search, park_detail,
                                        reviews, photos, favorites)
  ./make-screenshots.sh gen          # Claude に generator 作成依頼

⏱  目安: 20 分
🆘  詰まったら Discord に「parkpedia 詰まった」と送信

═══════════════════════════════════════
EOF
