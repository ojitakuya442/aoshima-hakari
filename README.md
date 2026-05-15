# 青島はかり 検定員募集：情報サイト モック

検定機関と検定官のマッチングサービスを想定した、フロントエンドのみの静的モックです。

Supabase、認証、DB、Storage には接続していません。画面確認とGitHub Pages公開を目的に、すべての表示データを `src/App.tsx` 内のモックデータで管理しています。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## GitHub Pages

`.github/workflows/deploy.yml` を含めています。

GitHubリポジトリ側で `Settings > Pages > Build and deployment > Source` を `GitHub Actions` に設定すると、`main` ブランチへのpushで `dist` が公開されます。
