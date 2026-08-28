# Terminal Portfolio

ターミナル風のインタラクティブなポートフォリオサイト

## プレビュー

```bash
npm run dev
# → http://localhost:4173
```

## 内容の編集

**`public/js/data.js` を編集するだけ**で中身が変わります。

| 定数 | 内容 |
| --- | --- |
| `PROFILE` | 名前・肩書き・連絡先・自己紹介 |
| `SKILLS` | スキルとレベル (0-10) |
| `PROJECTS` | プロジェクト一覧（増減自由） |
| `HISTORY_TIMELINE` | 経歴年表 |
| `FILESYSTEM` | ディレクトリ構造そのもの |

ASCII ロゴは `public/js/app.js` 先頭の `ASCII_LOGO`。
[patorjk.com/software/taag](https://patorjk.com/software/taag/)（Standard フォント）で再生成可能。

## コマンド一覧

- 基本: `help` `ls` `cd` `cat` `tree` `pwd` `clear`
- ショートカット: `about` `skills` `projects` `contact`
- おまけ: `neofetch` `theme` `open` `whoami` `history` `banner` `exit`
- 隠しコマンド: `ls -a` で見つかる場所 / `sudo` / `rm -rf /` / `matrix` / `hack` / `coffee` / `crt`
