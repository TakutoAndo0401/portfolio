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
  { name: "写真", level: 8, comment: "旅先のスナップと風景が多め。撮った写真は photos/ に置いています。", cmd: "gallery" },
  { name: "音楽", level: 9, comment: "作業中も移動中もずっと何か流してます。好きな曲は music/ から聴けます。", cmd: "cat hobbies/music/playlist.m3u" },
  { name: "ガジェット", level: 7, comment: "キーボード・ターミナル環境いじり。このサイトもその延長です。" },
  { name: "コーヒー", level: 6, comment: "浅煎りのハンドドリップ派。" },
];

/* 写真: public/img/photos/ に置いたファイル名を file に指定 */
const PHOTOS = [
  { file: "sample-sunset.svg", title: "夕暮れの海", place: "神奈川", date: "2024.05", camera: "iPhone 15 Pro" },
  { file: "sample-city-night.svg", title: "夜の街", place: "東京・新宿", date: "2024.02", camera: "iPhone 15 Pro" },
  { file: "sample-forest.svg", title: "森の小径", place: "栃木・日光", date: "2023.10", camera: "iPhone 15 Pro" },
  { file: "sample-coffee.svg", title: "朝のコーヒー", place: "自宅", date: "2023.08", camera: "iPhone 15 Pro" },
];

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
