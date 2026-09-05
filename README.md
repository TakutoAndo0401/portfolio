# Terminal Portfolio

ターミナル風のインタラクティブなポートフォリオサイト

## プレビュー

```bash
npm run dev
```

## 内容の編集

- **`public/js/data.js` を編集する

| 定数 | 内容 |
| --- | --- |
| `PROFILE` | 名前・肩書き・連絡先・自己紹介 |
| `SKILLS` | スキルとレベル (0-10) |
| `PROJECTS` | プロジェクト一覧（増減自由） |
| `HISTORY_TIMELINE` | 経歴年表 |
| `HOBBIES` | 趣味と熱量 (0-10) |
| `PHOTO_META` | 写真の場所・撮影日・カメラ・並び順（`npm run images` が EXIF から初期値を追記） |
| `MUSIC` | 好きな曲（Spotify の track ID を指定） |
| `FILESYSTEM` | ディレクトリ構造そのもの |

### 写真の追加

```bash
cp ~/Pictures/IMG_0001.jpg photos/   # 元画像（git 管理外・配信されない）
npm run images                       # → public/img/photos/IMG_0001-{480,720,1080,1920}.webp
                                     # + public/js/photos.generated.js（一覧・撮影日・カメラを EXIF から自動取得）
```

ASCII ロゴは `public/js/app.js` 先頭の `ASCII_LOGO`。
[patorjk.com/software/taag](https://patorjk.com/software/taag/)（Standard フォント）で再生成可能。

## コマンド一覧

- 基本: `help` `ls` `cd` `cat` `tree` `pwd` `clear`
- ショートカット: `about` `skills` `projects` `hobbies` `contact`
- 趣味: `gallery [page|--all]`（写真サムネ一覧・12枚ずつ） `play <id>`（Spotify 再生） `ascii <photo>`（アスキーアート化）
- おまけ: `neofetch` `theme` `open` `whoami` `history` `banner` `exit`
- 隠しコマンド: `ls -a` で見つかる場所 / `sudo` / `rm -rf /` / `matrix` / `hack` / `coffee` / `crt`
