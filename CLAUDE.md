# CLAUDE.md - ParkPedia 開発ガイド（短縮版）

このファイルは、Claude Code が ParkPedia を触るときの **最短導線**だけを残しています。
過去の詳細な修正メモ・チェックリスト類は `docs/` に集約しました。

## まず見る場所（ドキュメント導線）

- **基本（起動/構成/リンク集）**: `README.md`
- **運用/審査/トラブルシュート集約**: `docs/DEVELOPMENT_KNOWLEDGE_BASE.md`
- **過去メモの統合アーカイブ（旧mdの全内容）**: `docs/ARCHIVE.md`

## プロジェクト概要

- **ParkPedia**: 公園情報を共有する React Native アプリ（Expo）
- **主要**: Firebase (Auth / Firestore / Storage), AdMob

## Firebase ルール運用（最低限）

- **Firestore**: `firestore.rules` を Firebase Console > Firestore Database > ルール に貼り付けて公開
- **Storage**: `storage.rules` を Firebase Console > Storage > ルール に貼り付けて公開

## よくある落とし穴（超要点）

- **Firestoreの `list` では `resource.data` を使えない**（`allow read` を安易に書くと詰む）
- **FirestoreとStorageのルールは貼り付け先を絶対に混同しない**
- **期限付きのテストモードルール（`request.time < ...`）を残さない**

詳細手順・過去事例は `docs/DEVELOPMENT_KNOWLEDGE_BASE.md` と `docs/ARCHIVE.md` を参照してください。
