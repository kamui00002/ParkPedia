# Maintenance Scripts

このディレクトリには、プロジェクトのメンテナンス用シェルスクリプトが含まれています。

## スクリプト一覧

### 進捗管理
- **check_progress.sh** - プロジェクトの進捗状況をチェック
- **generate_progress_report.sh** - 進捗レポートを生成
- **update_checklist_progress.sh** - チェックリストの進捗を更新

### コードベース管理
- **cleanup_codebase.sh** - コードベースのクリーンアップを実行

## 使い方

各スクリプトは実行権限が付与されています。
ルートディレクトリから以下のように実行してください：

```bash
./scripts/maintenance/check_progress.sh
./scripts/maintenance/generate_progress_report.sh
./scripts/maintenance/update_checklist_progress.sh
./scripts/maintenance/cleanup_codebase.sh
```

## 注意事項

- これらのスクリプトはプロジェクトルートから実行することを前提としています
- 実行前にスクリプトの内容を確認し、影響を理解してから実行してください
