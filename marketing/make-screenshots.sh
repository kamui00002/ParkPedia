#!/bin/bash
# ☁️ make-screenshots.sh — ParkPedia App Store スクショ 1 コマンドビルダー
#
# 既存 generator なし → /app-store-screenshots skill を Claude で起動して新規作成

set -uo pipefail

MARKETING_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$MARKETING_DIR/.." && pwd)"
STAGING_DIR="$MARKETING_DIR/raw-screenshots"

SCENES=("map" "search" "park_detail" "reviews" "photos" "favorites")

case "${1:-help}" in
    capture)
        SCENE="${2:-}"
        if [ -z "$SCENE" ]; then
            echo "❌ シーン名を指定してください"
            exit 1
        fi
        mkdir -p "$STAGING_DIR"
        OUTFILE="$STAGING_DIR/${SCENE}.png"
        xcrun simctl io booted screenshot "$OUTFILE"
        echo "✅ 撮影完了: $OUTFILE"
        ;;

    capture-all)
        echo "📸 6 シーンを順番に撮影します (ParkPedia)"
        echo ""
        mkdir -p "$STAGING_DIR"
        for SCENE in "${SCENES[@]}"; do
            echo "🎬 シミュレータで [$SCENE] 画面に遷移してください"
            case "$SCENE" in
                map)            echo "  → ホーム/地図画面" ;;
                search)         echo "  → 検索 / フィルター画面" ;;
                park_detail)    echo "  → 公園詳細画面" ;;
                reviews)        echo "  → 口コミ一覧" ;;
                photos)         echo "  → フォトギャラリー" ;;
                favorites)      echo "  → お気に入りリスト" ;;
            esac
            read -p "  準備できたら Enter (skip するなら 's' + Enter): " input
            if [ "$input" = "s" ]; then
                echo "  ⏭ skip: $SCENE"
                continue
            fi
            OUTFILE="$STAGING_DIR/${SCENE}.png"
            xcrun simctl io booted screenshot "$OUTFILE"
            echo "  ✅ 撮影: $OUTFILE"
            echo ""
        done
        echo "🎉 全シーン撮影完了"
        echo ""
        echo "次のステップ:"
        echo "  ./make-screenshots.sh gen   # /app-store-screenshots skill で generator 作成"
        ;;

    gen)
        cat <<EOF
🎨 generator を作成するには Claude にこう頼んでください:

「$(pwd)/raw-screenshots/ に撮影済の ParkPedia スクショがあります。
\`/app-store-screenshots\` skill を起動して、Keeplet スタイル
(参考: ~/.claude/skills/app-store-screenshots/references/keeplet-style.png)
の App Store スクショ generator を新規作成してください。

設定:
- Brand color: #4CAF50 (緑、自然)
- 背景グラデ: 緑系の薄い → 中緑
- Headline / Subhead / Feature bullets: $(pwd)/copy.md 参照
- 既存 brand-profile: $(pwd)/../ads/brand-profile.json
- 出力先: $(pwd)/screenshot-gen/
- 5 スライド (copy.md の Slide 1-5)」

Claude が必要な質問をして、Next.js プロジェクトを自動生成します。
EOF
        ;;

    list-screenshots)
        ls -la "$STAGING_DIR" 2>/dev/null
        ;;

    help|*)
        cat <<EOF
☁️ make-screenshots.sh — ParkPedia App Store スクショビルダー

Usage:
  ./make-screenshots.sh capture <scene>    # 1 シーン撮影
  ./make-screenshots.sh capture-all        # 6 シーンを順番に撮影
  ./make-screenshots.sh gen                # /app-store-screenshots skill 起動指示
  ./make-screenshots.sh list-screenshots   # 撮影済一覧

シーン:
  map / search / park_detail / reviews / photos / favorites

Note:
  ParkPedia は Expo (React Native) なので、シミュレータ起動は
  事前に \`npx expo start --ios\` で行ってください
EOF
        ;;
esac
