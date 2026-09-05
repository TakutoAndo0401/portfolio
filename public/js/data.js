/* =========================================================
 *  data.js — ここを編集すればポートフォリオの中身が変わります
 * ========================================================= */

const PROFILE = {
  name: "安藤 拓斗 (Takuto Ando)",
  handle: "takuto",
  role: "Frontend Engineer",
  location: "Tokyo, Japan",
  work: "チームラボでWebサイトのフロントエンド領域を担当",
  github: "https://github.com/TakutoAndo0401",
  x: "https://x.com/_NoireAmour",
  bio: [
    "1999年4月1日生まれ、栃木県宇都宮市出身",
    "チームラボでWebサイトのフロントエンド領域を担当しています。",
  ],
};

/* =========================================================
 * skills: level は 0-10
 * ※ GitHub コミット履歴の分析（2021年〜 累計 9,500+ commits・業務/個人開発含む）を元に算出
 * ========================================================= */
const STATS = { totalCommits: "9,500+", since: 2021 };

const SKILLS = {
  "frontend.json": [
    { name: "TypeScript", level: 7 },
    { name: "React / Next.js", level: 7 },
    { name: "HTML / CSS / SCSS", level: 7 },
    { name: "JavaScript", level: 7 },
    { name: "Vue.js", level: 5 },
  ],
  "testing.json": [
    { name: "Vitest / Jest", level: 7 },
    { name: "Testing Library", level: 7 },
    { name: "Storybook", level: 7 },
    { name: "Playwright (E2E)", level: 7 },
  ],
  "backend.json": [
    { name: "Node.js", level: 7 },
    { name: "Rust / Tauri", level: 1 },
    { name: "PHP / Laravel", level: 2 },
    { name: "Python", level: 1 },
  ],
  "tools.json": [
    { name: "Git / GitHub", level: 9 },
    { name: "AI Driven Development", level: 8 },
    { name: "Biome / ESLint / Prettier", level: 8 },
    { name: "GitHub Actions (CI/CD)", level: 8 },
    { name: "Docker", level: 1 },
  ],
};

/* GitHub の Pinned リポジトリ (https://github.com/TakutoAndo0401) */
const PROJECTS = [
  {
    id: "notebook",
    title: "notebook",
    desc: "PC設定・備忘録など",
    stack: ["Shell"],
    link: "https://github.com/TakutoAndo0401/notebook",
  },
  {
    id: "arc-bookmarklet-bridge",
    title: "Arc-Bookmarklet-Bridge",
    desc: "Arcブラウザ（Chromium拡張互換）向けの、ブックマークレット管理拡張",
    stack: ["JavaScript"],
    link: "https://github.com/TakutoAndo0401/Arc-Bookmarklet-Bridge",
  },
  {
    id: "routeiq",
    title: "RouteIQ",
    desc: "経路、所要時間、料金、燃料費から、入力した条件で高速道路と一般道のどちらを選ぶべきかを説明する",
    stack: ["CSS"],
    link: "https://github.com/TakutoAndo0401/RouteIQ",
  },
  {
    id: "flickterm",
    title: "FlickTerm",
    desc: "A small Rust/Tauri terminal app built with TypeScript, xterm.js, and portable-pty.",
    stack: ["TypeScript", "Rust", "Tauri"],
    link: "https://github.com/TakutoAndo0401/FlickTerm",
  },
  {
    id: "universal-page-copilot",
    title: "Universal-Page-Copilot",
    desc: "",
    stack: ["TypeScript"],
    link: "https://github.com/TakutoAndo0401/Universal-Page-Copilot",
  },
];

/* =========================================================
 *  hobbies
 * ========================================================= */

/* 趣味: level は 0-10 の熱量。cmd を付けると関連ディレクトリへのボタンが出ます */
const HOBBIES = [
  { name: "写真", level: 7, comment: "旅先のスナップと風景が多め。撮った写真は photos/ に置いています。", cmd: "gallery" },
  { name: "音楽", level: 7, comment: "作業中も移動中もずっと何か流してます。好きな曲は music/ から聴けます。", cmd: "cat hobbies/music/playlist.m3u" },
  { name: "コーヒー", level: 7, comment: "深煎り・どんな時も絶対にホットでなきゃ嫌だ。" },
  { name: "ドライブ", level: 7, comment: "TOYOTA DBA-ZN6 86 乗ってます" },
  { name: "スキューバダイビング", level: 5, comment: "まだオープン・ウォーター・ダイバーのライセンスのみ。" },
];

/* 写真
 *  1. photos/ に元画像を置く
 *  2. npm run images  → WebP 変換 + photos.generated.js 生成 + ここ (PHOTO_META) に新しい写真の行を追記
 *     date / camera は EXIF から自動で入る。自由に書き換えてよい（再実行しても手で書いた値は上書きされない）
 *  3. place（場所）や order（小さいほど前。省略時は撮影日の新しい順）を必要に応じて書く
 */
const PHOTO_META = {
  "IMG_20260831_211322187.jpg": { place: "大黒パーキング", date: "2026.08.31", camera: "Nothing Phone (2a)", order: 1 },
  "1784088999151.jpg": { place: "千里川土手", date: "", camera: "Pentax Espio 70（フジカラー SUPERIA PREMIUM 400）", order: 2 },
  "1784088999330.jpg": { place: "阪急六甲駅", date: "", camera: "Pentax Espio 70（フジカラー SUPERIA PREMIUM 400）", order: 3 },
  "1784088999702.jpg": { place: "成田空港 第三ターミナル", date: "", camera: "Pentax Espio 70（フジカラー SUPERIA PREMIUM 400）", order: 4 },
  "IMG_20260621_100558559.jpg": { place: "桂浜", date: "2026.06.21", camera: "Nothing Phone (2a)", order: 5 },
  "1774247606839.jpg": { place: "江ノ島", date: "", camera: "Pentax Espio 70（Kodak ULTRAMAX 400）", order: 6 },
  "1774247606502.jpg": { place: "江ノ島", date: "", camera: "Pentax Espio 70（Kodak ULTRAMAX 400）", order: 7 },
};

const PHOTOS = (typeof PHOTO_FILES === "undefined" ? [] : PHOTO_FILES)
  .map((p) => ({ ...p, ...(PHOTO_META[p.file] || {}) }))
  .sort(
    (a, b) =>
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      (b.date || "").localeCompare(a.date || "") ||
      a.file.localeCompare(b.file)
  );

/* 音楽: spotify は track ID (https://open.spotify.com/track/<ID>) */
const MUSIC = [
  {
    id: "never-gonna",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    spotify: "4uLU6hMCjMI75M1A2tKUQC",
    comment: "サンプル曲です。data.js の MUSIC を書き換えてください。",
    featured: true,
  },
  {
    id: "brightside",
    title: "Mr. Brightside",
    artist: "The Killers",
    spotify: "3n3Ppam7vgaVa1iaRUc9Lp",
    comment: "サンプル曲その2。",
  },
];

const HISTORY_TIMELINE = [
  { year: "1999.04.01", text: "栃木県宇都宮市に生まれる" },
  { year: "2021.03", text: "東京電機大学 システムデザイン工学部 情報システム工学科 卒業" },
  { year: "2021.04", text: "チームラボ 入社" },
  { year: "now", text: "チームラボ パッケージチーム フロントエンド班 所属" },
];

/* =========================================================
 *  仮想ファイルシステム
 *  type: dir | file
 *  render: 特殊表示するファイルは app.js 側の renderer 名を指定
 * ========================================================= */
const FILESYSTEM = {
  type: "dir",
  children: {
    "README.md": {
      type: "file",
      render: "readme",
    },
    "about": {
      type: "dir",
      children: {
        "profile.txt": { type: "file", render: "profile" },
        "bio.md": { type: "file", render: "bio" },
        "timeline.log": { type: "file", render: "timeline" },
      },
    },
    "skills": {
      type: "dir",
      children: Object.fromEntries(
        Object.keys(SKILLS).map((k) => [k, { type: "file", render: "skill", key: k }])
      ),
    },
    "projects": {
      type: "dir",
      children: Object.fromEntries(
        PROJECTS.map((p) => [p.id + ".md", { type: "file", render: "project", key: p.id }])
      ),
    },
    "hobbies": {
      type: "dir",
      children: {
        "interests.md": { type: "file", render: "interests" },
        "photos": {
          type: "dir",
          children: Object.fromEntries(
            PHOTOS.map((p) => [p.file, { type: "file", render: "photo", key: p.file }])
          ),
        },
        "music": {
          type: "dir",
          children: {
            "now_playing.txt": { type: "file", render: "now-playing" },
            "playlist.m3u": { type: "file", render: "playlist" },
          },
        },
      },
    },
    "contact": {
      type: "dir",
      children: {
        "sns.txt": { type: "file", render: "contact-sns" },
      },
    },
    ".secret": {
      type: "dir",
      hidden: true,
      children: {
        "treasure.txt": { type: "file", render: "treasure" },
      },
    },
  },
};
