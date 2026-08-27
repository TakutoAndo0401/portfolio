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
    { name: "TypeScript", level: 9 },
    { name: "React / Next.js", level: 9 },
    { name: "HTML / CSS / SCSS", level: 8 },
    { name: "JavaScript", level: 8 },
    { name: "Vue.js", level: 6 },
  ],
  "testing.json": [
    { name: "Vitest / Jest", level: 8 },
    { name: "Testing Library", level: 8 },
    { name: "Storybook", level: 8 },
    { name: "Playwright (E2E)", level: 7 },
    { name: "MSW (API mocking)", level: 7 },
    { name: "A11y (markuplint)", level: 7 },
  ],
  "backend.json": [
    { name: "Node.js", level: 7 },
    { name: "Rust / Tauri", level: 5 },
    { name: "PHP / Laravel", level: 5 },
    { name: "Python", level: 4 },
  ],
  "tools.json": [
    { name: "Git / GitHub", level: 9 },
    { name: "AI Driven Development", level: 8 },
    { name: "Biome / ESLint / Prettier", level: 8 },
    { name: "GitHub Actions (CI/CD)", level: 7 },
    { name: "Docker", level: 6 },
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
