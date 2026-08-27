# Terminal Portfolio

ターミナル風のインタラクティブなポートフォリオサイト。
ビルド不要・依存ゼロの静的サイトです（サイト本体は `public/`）。

## プレビュー

```bash
npm run dev
# → http://localhost:4173
```

## 内容の編集

**`public/js/data.js` を編集するだけ**で中身が変わります。

| 定数 | 内容 |
|---|---|
| `PROFILE` | 名前・肩書き・連絡先・自己紹介 |
| `SKILLS` | スキルとレベル (0-10) |
| `PROJECTS` | プロジェクト一覧（増減自由） |
| `HISTORY_TIMELINE` | 経歴年表 |
| `FILESYSTEM` | ディレクトリ構造そのもの |

ASCII ロゴは `public/js/app.js` 先頭の `ASCII_LOGO`。
[patorjk.com/software/taag](https://patorjk.com/software/taag/)（Standard フォント）で再生成できます。

## コマンド一覧

- 基本: `help` `ls` `cd` `cat` `tree` `pwd` `clear`
- ショートカット: `about` `skills` `projects` `contact`
- おまけ: `neofetch` `theme` `open` `whoami` `history` `banner` `exit`
- 隠しコマンド: `ls -a` で見つかる場所 / `sudo` / `rm -rf /` / `matrix` / `hack` / `coffee` / `crt`

## デプロイ（Cloudflare Pages）

### A. CLI で直接デプロイ（最速）

```bash
npx wrangler login          # 初回のみ（ブラウザで Cloudflare 認証）
npm run deploy              # public/ を takuto-portfolio プロジェクトへアップロード
```

→ `https://takuto-portfolio.pages.dev` で公開されます。

### B. GitHub 連携（push で自動デプロイ）

1. このフォルダを GitHub リポジトリとして push
2. Cloudflare ダッシュボード → Workers & Pages → Create → Pages → リポジトリを接続
3. Build 設定: **Framework preset: None / Build command: なし / Output directory: `public`**

`public/_headers` によりセキュリティヘッダーとキャッシュが自動適用されます。
