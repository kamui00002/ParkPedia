# TypeScript Migration Files

このディレクトリには、将来のTypeScript移行計画用に準備された.tsファイルが含まれています。

## 現状

ParkPediaは現在JavaScriptベースで動作しており、utils/ディレクトリの実際のファイルは.js形式です。
このディレクトリの.tsファイルは、段階的なTypeScript移行の準備として作成されたものです。

## 含まれるファイル

- adminUtils.ts
- errorHandler.ts
- imageCompressor.ts
- imageUploader.ts
- pagination.ts

## TypeScript移行について

TypeScript移行を実行する際は、`docs/guides/TYPESCRIPT_MIGRATION_PLAN.md`を参照してください。

## 注意事項

- これらのファイルは現在使用されていません
- 移行時には、.jsファイルの最新の変更を.tsファイルに反映してから移行を実行してください
- 移行完了後、.jsファイルを削除し、.tsファイルをutils/ディレクトリに移動します
