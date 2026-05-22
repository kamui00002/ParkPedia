# ParkPedia 紹介・広告動画 制作ガイド ⭐️

## 📁 ディレクトリ構成

```
marketing/promo-video/
├── 01_recordings/  # Expo シミュレータ / Web ブラウザ録画
├── 02_edited/      # 編集済み中間ファイル
├── 03_final/       # 各アスペクト比の最終物
│   ├── 9_16/       # Meta Reels / TikTok / YouTube Shorts
│   ├── 1_1/        # Meta フィード正方形
│   ├── 16_9/       # YouTube / Web LP
│   └── 4_5/        # Meta フィード推奨
└── bgm/            # Suno 生成 BGM
```

> 既存 `ads/` には brand-profile / campaign-brief があるので、**動画コンセプトの参考**に。
> 既存 `screenshots/` には Web ブラウザのスクショ多数 (Playwright 等で取得？)

## 🎯 アプリ訴求ポイント (top 3)

1. **子連れで行ける公園探し** — 遊具・トイレ・駐車場情報を一目で
2. **みんなの口コミと写真** — 実際に行った人の生の声と現地写真
3. **位置情報で近場の公園発見** — 旅先や引っ越し先でも便利

## 🎬 撮影スクリプト (15秒版)

```
0-3秒  : 子連れで困っている親 (検索シーン or LP の課題訴求)
3-7秒  : ParkPedia アプリ起動 → 位置情報で近場の公園リスト
7-11秒 : 公園詳細画面 → 写真ギャラリー + 口コミ
11-13秒: 笑顔の子供 / 楽しんでいるシーン
13-15秒: ロゴ + "公園選びに迷わない"
```

## 🎵 BGM 方向性

- **ジャンル**: acoustic / family-friendly / uplifting
- **ムード**: 暖かい / 家族 / 休日の楽しさ
- **テンポ**: 100-120 BPM (歩く速さ)
- **Suno prompt 例**:
  ```
  uplifting acoustic guitar, family vibes, sunny weekend morning,
  100 bpm, no vocals, light percussion, 15 second loop
  ```

## 📝 字幕案

日本語:
```
0-3秒  : "今日どこ行こう?"
3-7秒  : "近くの公園、すぐ見つかる"
7-11秒 : "みんなの口コミと写真で安心"
11-15秒: "ParkPedia"
```

英語:
```
0-3秒  : "Where to go today?"
3-7秒  : "Find Parks Nearby"
7-11秒 : "Trusted by Real Visitors"
11-15秒: "ParkPedia"
```

## 🛠️ ワークフロー (帰宅後実行)

### Step 1: Expo / iOS Simulator で撮影 (5-10 分)
```bash
cd ~/Documents/GitHub/ParkPedia

# Expo 起動
npx expo start --ios

# シミュレータ起動後、録画:
xcrun simctl io booted recordVideo marketing/promo-video/01_recordings/raw_search.mp4
# 検索画面の操作を 5 秒撮影 → Ctrl+C

xcrun simctl io booted recordVideo marketing/promo-video/01_recordings/raw_detail.mp4
# 公園詳細画面を 5 秒撮影 → Ctrl+C

xcrun simctl io booted recordVideo marketing/promo-video/01_recordings/raw_review.mp4
# 口コミ・写真ギャラリーを 5 秒撮影 → Ctrl+C
```

### Step 2: video-use で編集 (10 分)
Claude にこう頼む:
> `marketing/promo-video/01_recordings/` の 3 つの動画を 15 秒の広告動画に編集して。
> - 構成: search (0-3s) → detail (3-7s) → review (7-11s) → ロゴ (11-15s)
> - 字幕: 上記スクリプト通り (warm な日本語)
> - カラーグレード: 暖かい朝の光感
> - 出力先: `02_edited/edited.mp4`

### Step 3: BGM 生成 (Suno 経由、5 分)
```
Claude に: "Suno で『uplifting acoustic guitar, family vibes, sunny weekend morning, 100 bpm, no vocals, 15 second loop』のプロンプトで BGM 生成して bgm/parkpedia_bgm.mp3 に保存して"
```

### Step 4: BGM ミックス & 4 規格変換

```bash
SRC="02_edited/edited.mp4"
BGM="bgm/parkpedia_bgm.mp3"
OUT_BASE="03_final"

ffmpeg -y -i "$SRC" -i "$BGM" -c:v copy -c:a aac -shortest "02_edited/edited_with_bgm.mp4"
WITH_BGM="02_edited/edited_with_bgm.mp4"

ffmpeg -y -i "$WITH_BGM" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:a copy "$OUT_BASE/9_16/parkpedia_9x16.mp4"

ffmpeg -y -i "$WITH_BGM" -vf "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:black" -c:a copy "$OUT_BASE/1_1/parkpedia_1x1.mp4"

ffmpeg -y -i "$WITH_BGM" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" -c:a copy "$OUT_BASE/16_9/parkpedia_16x9.mp4"

ffmpeg -y -i "$WITH_BGM" -vf "scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2:black" -c:a copy "$OUT_BASE/4_5/parkpedia_4x5.mp4"
```

## ✅ 完了チェック

- [ ] 01_recordings/ に 3 種類の操作録画
- [ ] 02_edited/ に 15 秒の編集動画
- [ ] bgm/ に Suno BGM
- [ ] 03_final/9_16/ /1_1/ /16_9/ /4_5/ の 4 形式
- [ ] Meta Ads / Google Ads にアップロードして配信開始

## 💡 注意点

- **React Native / Expo** なので Android シミュレータ録画も可能 (`adb shell screenrecord`)
- **Web 版**もあるなら Playwright で操作画面録画も選択肢
- 子供の写真使う場合は権利・プライバシーに注意

---

> ⭐️ ParkPedia プロジェクト固有
