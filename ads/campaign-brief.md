# Campaign Brief: ParkPedia
**Generated:** 2026-04-30
**Platforms:** Meta (Facebook, Instagram)
**Objective:** App Installs
**Concepts:** 3

## Brand DNA Summary
ParkPediaは「公園を、もっと楽しく。」をタグラインに、ユーザーが公園情報を共有・レビューできるモバイルアプリ。ターゲットは25-40歳の子育て世代で、「近くの良い公園が見つからない」「設備・混雑状況が事前にわからない」という課題を解決する。ブランドボイスは親しみやすく明るく、地域コミュニティへの帰属感を大切にする。

## Audit Context
No audit data; concepts are generalized. 広告出稿後に `/ads audit` でデータを取得し、次回サイクルに反映してください。

## Campaign Concepts

### Concept 1: 「週末どこ行く？」— 発見訴求
**Hypothesis:** 週末の公園選びに迷う親御さんに「すぐ使える地図」として想起させる
**Primary Message:** 口コミで選べる公園情報が手のひらに
**Tone:** 親しみやすい・明るい・共感
**Visual Direction:** 子どもが笑顔で遊んでいる公園の明るい写真。青空と緑が映える構図。親が見守りながらスマホを見ているシーン。
**Target Platforms:** Instagram Feed, Facebook Feed
**CTA:** 無料でダウンロード
**Copy Framework:** PAS（近くの公園選びに困っている → もっと遊ばせたい → ParkPediaで解決）

### Concept 2: 「みんなの口コミで選ぶ」— 信頼訴求
**Hypothesis:** 初めての公園は不安という心理に、口コミという安心感でアプローチ
**Primary Message:** リアルな口コミが、いちばん正直な公園ガイド
**Tone:** 安心・信頼・コミュニティ
**Visual Direction:** スマホ画面に公園レビューが表示されているモックアップ。星評価と写真が並ぶUI。温かみのある色調。
**Target Platforms:** Instagram Stories, Instagram Feed
**CTA:** 今すぐ使ってみる
**Copy Framework:** AIDA（口コミ情報で注目 → 詳細レビューに興味 → 安心感で欲求 → DL行動）

### Concept 3: 「近くの穴場、教えます」— 地域訴求
**Hypothesis:** 有名公園より「地元民しか知らない穴場」への興味関心を刺激
**Primary Message:** 地元の人だけが知っている、隠れた名公園が見つかる
**Tone:** 発見・ワクワク・地域密着
**Visual Direction:** 地図ピンが複数立っているマップビュー。「穴場発見！」的なポップ感。
**Target Platforms:** Facebook Feed, Instagram Reels
**CTA:** 公園を探す
**Copy Framework:** Star-Story-Solution（穴場公園を知らなかった → 友人に教えてもらった体験談 → ParkPediaで誰でも発見）

## Copy Deck

### Concept 1 — Meta Feed
- **Headline (40文字以内):** 「週末の公園、口コミで選ぼう」
- **Primary Text (125文字以内):** 近くに良い公園がわからない…そんなお悩みを解決。ParkPediaで口コミ検索、すぐ見つかる！無料DL。
- **CTA:** アプリをインストール

### Concept 1 — Instagram Stories (縦型)
- **Headline:** 「週末どこ行く？」
- **Primary Text:** 口コミで選ぶ公園アプリ。子どもと一緒に新しい公園を発見しよう。
- **CTA:** スワイプしてDL

### Concept 2 — Meta Feed
- **Headline:** 「リアル口コミで安心の公園選び」
- **Primary Text:** 設備・混雑・安全性…気になることが全部わかる。ParkPediaのレビューで、ベストな公園へ。
- **CTA:** 無料でダウンロード

### Concept 3 — Meta Feed
- **Headline:** 「地元民しか知らない公園、発見」
- **Primary Text:** 有名スポットより、近所の穴場が一番。ParkPediaで地域の口コミ公園情報を今すぐチェック！
- **CTA:** 公園を探す

## Image Generation Briefs

### Brief 1: Concept 1 — Instagram/Facebook Feed (1080×1080)
**Prompt:** Bright sunny day at a Japanese park, happy young child playing on colorful playground equipment, cheerful parent watching with a smile, lush green trees and blue sky in background, warm natural photography style, family-friendly atmosphere, soft pastel tones, photorealistic
**Dimensions:** 1080×1080
**Safe zone notes:** テキストオーバーレイ用に上部20%・下部20%を余白確保

### Brief 2: Concept 2 — Instagram Stories (1080×1920)
**Prompt:** Close-up of smartphone showing park review app UI with star ratings and park photos, soft bokeh background of a real park, natural lighting, clean minimal style, warm tones, Japanese mobile app mockup
**Dimensions:** 1080×1920
**Safe zone notes:** 上部250px・下部250px はUIと重なるため空ける

### Brief 3: Concept 3 — Facebook Feed (1080×1080)
**Prompt:** Aerial view of a beautiful hidden park in Japan, map pins overlay graphic, discovery theme, warm afternoon golden hour light, lush greenery, peaceful and inviting atmosphere, travel photography style
**Dimensions:** 1080×1080
**Safe zone notes:** 中央に地図ピンを配置、左下1/4にテキスト余白

## Next Steps
1. `ads/.env` に Meta 認証情報を設定（ユーザー作業）
2. `/ads generate` で Brief の画像を本番生成（banana-claude セットアップ後）
3. `meta-ads create --config ads/campaign-template.yaml --dry-run` で最終確認
4. `meta-ads create --config ads/campaign-template.yaml` で出稿
