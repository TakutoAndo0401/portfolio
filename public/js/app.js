/* =========================================================
 *  Terminal Portfolio — app.js
 * ========================================================= */

"use strict";

/* ---------- ASCII logo (patorjk.com の "Standard" フォントで再生成可) ---------- */
const ASCII_LOGO = String.raw`
 _____     _     _  __ _   _  _____   ___
|_   _|   / \   | |/ /| | | ||_   _| / _ \
  | |    / _ \  | ' / | | | |  | |  | | | |
  | |   / ___ \ | . \ | |_| |  | |  | |_| |
  |_|  /_/   \_\|_|\_\ \___/   |_|   \___/
`.replace(/^\n/, "");

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const outputEl = $("output");
const screenEl = $("screen");
const promptEl = $("prompt");
const clPre = $("cl-pre");
const clPost = $("cl-post");
const cursorEl = $("cursor");
const hiddenInput = $("hidden-input");
const titleEl = $("titlebar-title");
const bootEl = $("boot");
const bootLog = $("boot-log");
const windowEl = $("window");

/* ---------- state ---------- */
let cwd = [];            // 現在のパス（セグメント配列）
let prevCwd = [];        // cd - 用
let cmdHistory = [];
let histIdx = -1;
let histDraft = "";
let animating = false;   // 自動タイピング中
let matrixTimer = null;
let pendingConfirm = null; // [y/N] 確認待ちの処理

/* =========================================================
 *  utils
 * ========================================================= */
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isMac = /mac|iP(hone|ad|od)/i.test(navigator.userAgentData?.platform ?? navigator.platform);
const CLEAR_KEY = isMac ? "⌘+K" : "Ctrl+K";

function scrollToBottom() {
  screenEl.scrollTop = screenEl.scrollHeight;
}

function print(html = "", cls = "") {
  const div = document.createElement("div");
  div.className = "line" + (cls ? " " + cls : "");
  div.innerHTML = html === "" ? "&nbsp;" : html;
  outputEl.appendChild(div);
  scrollToBottom();
}

const cmdBtn = (cmd, label) =>
  `<button class="cmd-btn" data-cmd="${escapeHtml(cmd)}">${escapeHtml(label || cmd)}</button>`;

const link = (url, label) =>
  `<a class="c-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label || url)}</a>`;

/* =========================================================
 *  virtual filesystem
 * ========================================================= */
function fmtPath(segs) {
  return "~" + (segs.length ? "/" + segs.join("/") : "");
}

function getNode(segs) {
  let node = FILESYSTEM;
  for (const s of segs) {
    if (node.type !== "dir" || !node.children[s]) return null;
    node = node.children[s];
  }
  return node;
}

/** 入力パス文字列 → セグメント配列（不正なら null ではなく解決だけする） */
function resolvePath(input) {
  if (!input || input === "~") return [];
  let base = input.startsWith("/") || input.startsWith("~/") ? [] : [...cwd];
  const parts = input.replace(/^~\//, "").replace(/^\//, "").split("/");
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") base.pop();
    else base.push(p);
  }
  return base;
}

/* =========================================================
 *  renderers（ファイルの中身の表示）
 * ========================================================= */
const RENDERERS = {
  readme() {
    return [
      `<span class="bold c-accent"># Welcome to ${escapeHtml(PROFILE.name)}'s Portfolio</span>`,
      ``,
      `ここは私のポートフォリオ・ターミナルです。`,
      `${cmdBtn("help")} で使い方、${cmdBtn("tree")} で全体マップが見れます。`,
      ``,
      `<span class="c-muted">hint: 隠しファイルがあるかも…？ (${cmdBtn("ls -a")})</span>`,
    ].join("\n");
  },

  profile() {
    const rows = [
      ["NAME", PROFILE.name],
      ["ROLE", PROFILE.role],
      ["FROM", PROFILE.location],
      ["WORK", PROFILE.work],
    ];
    return rows
      .map(([k, v]) => `<span class="c-accent bold">${k.padEnd(7)}</span> ${escapeHtml(v)}`)
      .join("\n");
  },

  bio() {
    return PROFILE.bio.map((l) => escapeHtml(l)).join("\n");
  },

  timeline() {
    return HISTORY_TIMELINE
      .map((t) => `<span class="c-accent">${escapeHtml(t.year.padEnd(7))}</span> ─ ${escapeHtml(t.text)}`)
      .join("\n");
  },

  skill(node) {
    const list = SKILLS[node.key] || [];
    return list
      .map((s) => {
        const filled = "█".repeat(s.level);
        const rest = "░".repeat(10 - s.level);
        return `${escapeHtml(s.name.padEnd(26))} <span class="bar">${filled}<span class="rest">${rest}</span></span> ${s.level}/10`;
      })
      .join("\n");
  },

  project(node) {
    const p = PROJECTS.find((x) => x.id === node.key);
    if (!p) return "project not found";
    const tags = p.stack.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
    const year = p.year ? ` <span class="c-muted">(${p.year})</span>` : "";
    const desc = p.desc ? `\n${escapeHtml(p.desc)}` : "";
    return `<div class="card"><span class="bold c-accent">${escapeHtml(p.title)}</span>${year}${desc}\n${tags}\n<span class="c-muted">link:</span> ${link(p.link)}</div>`;
  },

  "contact-sns"() {
    return [
      `<span class="c-accent bold">GitHub</span>  ${link(PROFILE.github)}`,
      `<span class="c-accent bold">X      </span> ${link(PROFILE.x)}`,
    ].join("\n");
  },

  interests() {
    return HOBBIES.map((h) => {
      const filled = "█".repeat(h.level);
      const rest = "░".repeat(10 - h.level);
      const btn = h.cmd ? `  ${cmdBtn(h.cmd)}` : "";
      return (
        `<span class="bold c-accent">${escapeHtml(h.name.padEnd(8))}</span><span class="bar">${filled}<span class="rest">${rest}</span></span> ${h.level}/10${btn}\n` +
        `<span class="c-muted">  └ ${escapeHtml(h.comment)}</span>`
      );
    }).join("\n");
  },

  photo(node) {
    const p = PHOTOS.find((x) => x.file === node.key);
    if (!p) return "photo not found";
    const meta = [p.place, p.date, p.camera].filter(Boolean).map(escapeHtml).join(" · ");
    const path = `/hobbies/photos/${p.file}`;
    return (
      `<figure class="photo-card">` +
      `<img class="photo" src="img/photos/${escapeHtml(p.file)}" alt="${escapeHtml(p.title)}" loading="lazy" data-lightbox="${escapeHtml(p.file)}" />` +
      `<figcaption><span class="bold c-accent">${escapeHtml(p.title)}</span>` +
      (meta ? `  <span class="c-muted">${meta}</span>` : "") +
      `\n<span class="c-muted">クリックで拡大 / ${cmdBtn("ascii " + path, "ascii")} でアスキーアート化</span></figcaption>` +
      `</figure>`
    );
  },

  "now-playing"() {
    const t = MUSIC.find((m) => m.featured) || MUSIC[0];
    if (!t) return `<span class="c-muted">(no tracks)</span>`;
    return [
      `<span class="c-accent">♪ now playing</span>  <span class="bold">${escapeHtml(t.artist)} — ${escapeHtml(t.title)}</span>`,
      `<span class="c-muted">${escapeHtml(t.comment || "")}</span>`,
      `${cmdBtn("play " + t.id, "▶ play")}`,
    ].join("\n");
  },

  playlist() {
    const lines = [`<span class="c-muted">#EXTM3U</span>`];
    MUSIC.forEach((t, i) => {
      lines.push(
        `<span class="c-muted">${String(i + 1).padStart(2)}.</span> ${escapeHtml(t.artist)} — <span class="bold">${escapeHtml(t.title)}</span>  ${cmdBtn("play " + t.id, "▶")}`
      );
    });
    lines.push(`<span class="c-muted">${cmdBtn("play")} で一覧 / play &lt;id&gt; で再生</span>`);
    return lines.join("\n");
  },

  treasure() {
    return [
      `<span class="c-warn">      ___________</span>`,
      `<span class="c-warn">     '._==_==_=_.'</span>`,
      `<span class="c-warn">     .-\\:      /-.</span>`,
      `<span class="c-warn">    | (|:.     |) |</span>`,
      `<span class="c-warn">     '-|:.     |-'</span>`,
      `<span class="c-warn">       \\::.    /</span>`,
      `<span class="c-warn">        '::. .'</span>`,
      `<span class="c-warn">          ) (</span>`,
      `<span class="c-warn">        _.' '._</span>`,
      ``,
      `🎉 <span class="bold c-accent">おめでとう！隠しディレクトリを発見しました。</span>`,
      `ここまで探検してくれてありがとう。あなたのような好奇心のある人と働きたい。`,
      ``,
      `ご褒美に隠しコマンドを教えます → ${cmdBtn("matrix")}`,
    ].join("\n");
  },
};

function renderFile(node, name) {
  const fn = RENDERERS[node.render];
  return fn ? fn(node) : `<span class="c-muted">(empty file: ${escapeHtml(name)})</span>`;
}

/* =========================================================
 *  commands
 * ========================================================= */
const COMMANDS = {
  help: {
    desc: "使い方を表示",
    fn() {
      print(`<span class="bold c-accent">━━━ USAGE GUIDE ━━━━━━━━━━━━━━━━━━━━━━</span>`);
      print(`このサイトは<span class="bold">ターミナル</span>です。コマンドで中を探検できます。`);
      print(`<span class="c-muted">（青いボタンはクリックでも実行できます）</span>`);
      print();
      print(`<span class="c-warn bold">▼ はじめての人はこの順番で:</span>`);
      print(`  1. ${cmdBtn("ls")}                … いまの場所のファイル一覧`);
      print(`  2. ${cmdBtn("cd about")}          … about ディレクトリへ移動`);
      print(`  3. ${cmdBtn("cat profile.txt")}   … ファイルの中身を表示`);
      print(`  4. ${cmdBtn("cd ..")}             … ひとつ上の階層へ戻る`);
      print();
      print(`<span class="c-warn bold">▼ ショートカット（迷子になったらこれ）:</span>`);
      print(`  ${cmdBtn("about")} ${cmdBtn("skills")} ${cmdBtn("projects")} ${cmdBtn("hobbies")} ${cmdBtn("contact")} … 各セクションを一発表示`);
      print(`  ${cmdBtn("tree")} … サイト全体の地図`);
      print();
      print(`<span class="c-warn bold">▼ 全コマンド:</span>`);
      const list = Object.entries(COMMANDS).filter(([, c]) => !c.hidden);
      for (const [name, c] of list) {
        print(`  <span class="c-accent">${name.padEnd(10)}</span> ${c.desc}`);
      }
      print();
      print(`<span class="c-muted">TIPS: <span class="bold">Tab</span>=補完 / <span class="bold">↑↓</span>=履歴 / <span class="bold">${CLEAR_KEY}</span>=画面クリア</span>`);
      print(`<span class="c-muted">どこかに隠しコマンドや隠しファイルも…🤫</span>`);
    },
  },

  ls: {
    desc: "ファイル・ディレクトリ一覧",
    fn(args) {
      const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const pathArg = args.find((a) => !a.startsWith("-"));
      const segs = pathArg ? resolvePath(pathArg) : cwd;
      const node = getNode(segs);
      if (!node) return print(`ls: ${escapeHtml(pathArg)}: No such file or directory`, "c-error");
      if (node.type === "file") return print(escapeHtml(pathArg));
      const entries = Object.entries(node.children).filter(([n, c]) => showAll || !(c.hidden || n.startsWith(".")));
      if (!entries.length) return print(`<span class="c-muted">(empty)</span>`);
      const html = entries
        .map(([n, c]) => {
          const isHidden = c.hidden || n.startsWith(".");
          if (c.type === "dir")
            return `<span class="c-dir ${isHidden ? "c-hidden-f" : ""}" style="cursor:pointer" data-cd="${escapeHtml(n)}">${escapeHtml(n)}/</span>`;
          return `<span class="${isHidden ? "c-hidden-f" : "c-file"}" style="cursor:pointer" data-cat="${escapeHtml(n)}">${escapeHtml(n)}</span>`;
        })
        .join("   ");
      print(html);
      print(`<span class="c-muted" style="font-size:.85em">└ 名前をクリックすると cd / cat できます</span>`);
    },
  },

  cd: {
    desc: "ディレクトリ移動 (cd .. で戻る)",
    fn(args) {
      const target = args[0];
      if (!target || target === "~") { prevCwd = cwd; cwd = []; return updatePrompt(); }
      if (target === "-") { const t = cwd; cwd = prevCwd; prevCwd = t; updatePrompt(); return print(fmtPath(cwd), "c-muted"); }
      const segs = resolvePath(target);
      const node = getNode(segs);
      if (!node) return print(`cd: ${escapeHtml(target)}: No such file or directory`, "c-error");
      if (node.type !== "dir") return print(`cd: ${escapeHtml(target)}: Not a directory`, "c-error");
      prevCwd = cwd;
      cwd = segs;
      updatePrompt();
      const names = Object.keys(node.children).filter((n) => !n.startsWith("."));
      print(`<span class="c-muted">📂 ${fmtPath(cwd)} — ${names.length} item(s). ${cmdBtn("ls")} で一覧表示</span>`);
    },
  },

  cat: {
    desc: "ファイルの中身を表示",
    fn(args) {
      if (!args[0]) return print(`cat: ファイル名を指定してください（例: cat README.md）`, "c-error");
      for (const target of args) {
        const segs = resolvePath(target);
        const node = getNode(segs);
        if (!node) { print(`cat: ${escapeHtml(target)}: No such file or directory`, "c-error"); continue; }
        if (node.type === "dir") { print(`cat: ${escapeHtml(target)}: Is a directory（${cmdBtn("cd " + target)} してみて）`, "c-error"); continue; }
        print(renderFile(node, target));
      }
    },
  },

  tree: {
    desc: "サイト全体の構造を表示",
    fn() {
      print(`<span class="c-dir">~</span>`);
      const walk = (node, prefix) => {
        const entries = Object.entries(node.children).filter(([n, c]) => !(c.hidden || n.startsWith(".")));
        entries.forEach(([name, child], i) => {
          const last = i === entries.length - 1;
          const branch = last ? "└── " : "├── ";
          const label =
            child.type === "dir"
              ? `<span class="c-dir" style="cursor:pointer" data-cd="/${escapeHtml(pathOf(node, name))}">${escapeHtml(name)}/</span>`
              : `<span style="cursor:pointer" data-cat="/${escapeHtml(pathOf(node, name))}">${escapeHtml(name)}</span>`;
          print(`<span class="c-muted">${prefix}${branch}</span>${label}`);
          if (child.type === "dir") walk(child, prefix + (last ? "    " : "│   "));
        });
      };
      // pathOf: FS を辿って name のフルパスを求める簡易版
      const pathsCache = new Map();
      (function index(node, path) {
        for (const [n, c] of Object.entries(node.children || {})) {
          pathsCache.set(c, path.concat(n));
          if (c.type === "dir") index(c, path.concat(n));
        }
      })(FILESYSTEM, []);
      const pathOf = (parent, name) => {
        const child = parent.children[name];
        return (pathsCache.get(child) || [name]).join("/");
      };
      walk(FILESYSTEM, "");
      print();
      print(`<span class="c-muted">クリックで移動 / 表示できます</span>`);
    },
  },

  pwd: {
    desc: "現在地を表示",
    fn() { print(fmtPath(cwd)); },
  },

  about: {
    desc: "自己紹介を表示",
    fn() { catDir(["about"]); },
  },
  skills: {
    desc: "スキル一覧を表示",
    fn() {
      catDir(["skills"]);
      print(`<span class="c-muted">* GitHub コミット履歴の分析に基づく（${STATS.since}年〜 累計 ${STATS.totalCommits} commits・業務/個人開発含む）</span>`);
    },
  },
  projects: {
    desc: "プロジェクト一覧を表示",
    fn() { catDir(["projects"]); },
  },
  contact: {
    desc: "連絡先を表示",
    fn() { catDir(["contact"]); },
  },

  hobbies: {
    desc: "趣味・写真・音楽を表示",
    fn() {
      catDir(["hobbies"]);
      print(`<span class="c-accent bold">▸ photos/</span>  ${PHOTOS.length} 枚 … ${cmdBtn("gallery")} でサムネ一覧`);
      print(`<span class="c-accent bold">▸ music/</span>   ${MUSIC.length} 曲 … ${cmdBtn("play")} で再生`);
    },
  },

  gallery: {
    desc: "写真をサムネイル一覧で表示 (gallery <page> / --all)",
    fn(args) {
      if (!PHOTOS.length) return print(`<span class="c-muted">(no photos)</span>`);
      const PER_PAGE = 12;
      const all = args.includes("--all") || args.includes("-a");
      const total = Math.ceil(PHOTOS.length / PER_PAGE);
      const page = Math.min(total, Math.max(1, parseInt(args.find((a) => /^\d+$/.test(a)), 10) || 1));
      const shown = all ? PHOTOS : PHOTOS.slice((page - 1) * PER_PAGE, page * PER_PAGE);
      const items = shown.map(
        (p) =>
          `<figure class="gallery-item">` +
          `<img src="img/photos/${escapeHtml(p.file)}" alt="${escapeHtml(p.title)}" loading="lazy" data-lightbox="${escapeHtml(p.file)}" />` +
          `<figcaption><span data-cat="/hobbies/photos/${escapeHtml(p.file)}" style="cursor:pointer">${escapeHtml(p.title)}</span>` +
          `<span class="c-muted"> ${escapeHtml(p.date || "")}</span></figcaption></figure>`
      );
      const range = all ? "all" : `${(page - 1) * PER_PAGE + 1}-${(page - 1) * PER_PAGE + shown.length}`;
      print(`<span class="c-muted">📷 ~/hobbies/photos — ${PHOTOS.length} photo(s)  [${range}]</span>`);
      print(`<div class="gallery">${items.join("")}</div>`);
      if (!all && total > 1) {
        const prev = page > 1 ? cmdBtn(`gallery ${page - 1}`, "← prev") : "";
        const next = page < total ? cmdBtn(`gallery ${page + 1}`, "next →") : "";
        print(`<span class="c-muted">page ${page}/${total}</span>  ${prev} ${next}  ${cmdBtn("gallery --all", "all")}`);
      }
      print(`<span class="c-muted">画像クリックで拡大 / タイトルクリックで詳細</span>`);
    },
  },

  play: {
    desc: "好きな曲を再生 (play <id>)",
    fn(args) {
      const key = args[0];
      const track = MUSIC.find((m) => m.id === key);
      if (!track) {
        if (key) print(`play: ${escapeHtml(key)}: track not found`, "c-error");
        print(`usage: play &lt;id&gt;`);
        MUSIC.forEach((t) =>
          print(`  ${cmdBtn("play " + t.id, t.id.padEnd(14))} ${escapeHtml(t.artist)} — ${escapeHtml(t.title)}`)
        );
        return;
      }
      const run = () => {
        print(`<span class="c-accent">♪ now playing</span>  <span class="bold">${escapeHtml(track.artist)} — ${escapeHtml(track.title)}</span>`);
        if (track.comment) print(`<span class="c-muted">${escapeHtml(track.comment)}</span>`);
        print(
          `<div class="embed"><iframe src="https://open.spotify.com/embed/track/${encodeURIComponent(track.spotify)}?utm_source=generator&theme=0" ` +
            `width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify: ${escapeHtml(track.title)}"></iframe></div>`
        );
      };
      if (localStorage.getItem("pf-embed-ok") === "1") return run();
      print(`<span class="c-warn">Spotify の埋め込みプレイヤー（外部コンテンツ）を読み込みます。続けますか？ [y/N]</span> ${cmdBtn("y", "yes")}`);
      pendingConfirm = () => {
        localStorage.setItem("pf-embed-ok", "1");
        run();
      };
    },
  },

  ascii: {
    desc: "写真をアスキーアートに変換",
    async fn(args) {
      const target = args.find((a) => !a.startsWith("-"));
      if (!target) return print(`usage: ascii &lt;photo&gt;（例: ${cmdBtn("ascii /hobbies/photos/" + (PHOTOS[0]?.file || ""))}）`, "c-error");
      const node = getNode(resolvePath(target));
      if (!node || node.render !== "photo") return print(`ascii: ${escapeHtml(target)}: not an image file`, "c-error");
      const p = PHOTOS.find((x) => x.file === node.key);
      print(`<span class="c-muted">converting ${escapeHtml(p.file)} ...</span>`);
      try {
        const art = await imageToAscii(`img/photos/${p.file}`, 72);
        print(`<pre class="ascii-art">${escapeHtml(art)}</pre>`);
        print(`<span class="c-muted">${escapeHtml(p.title)} — ${cmdBtn("cat /hobbies/photos/" + p.file, "元画像を見る")}</span>`);
      } catch {
        print(`ascii: 画像の読み込みに失敗しました`, "c-error");
      }
    },
  },

  neofetch: {
    desc: "システム情報風プロフィール",
    fn() {
      const logo = ASCII_LOGO.split("\n");
      const info = [
        `<span class="c-accent bold">guest@${escapeHtml(PROFILE.handle)}</span>`,
        `<span class="c-muted">──────────────────</span>`,
        `<span class="c-accent">Name</span>     ${escapeHtml(PROFILE.name)}`,
        `<span class="c-accent">Role</span>     ${escapeHtml(PROFILE.role)}`,
        `<span class="c-accent">Loc</span>      ${escapeHtml(PROFILE.location)}`,
        `<span class="c-accent">Shell</span>    portfolio-sh 1.0`,
        `<span class="c-accent">Uptime</span>   ${uptime()}`,
        `<span class="c-accent">Theme</span>    ${document.body.dataset.theme}`,
        `<span class="c-accent">Music</span>    ♪ ${escapeHtml(((m) => (m ? `${m.artist} — ${m.title}` : "—"))(MUSIC.find((x) => x.featured) || MUSIC[0]))}`,
        `<span class="c-accent">Motto</span>    keep it fun & shippable`,
      ];
      print(`<span class="ascii">${escapeHtml(ASCII_LOGO)}</span>`);
      info.forEach((l) => print(l));
    },
  },

  theme: {
    desc: "配色変更 (green/amber/cyber/light)",
    fn(args) {
      const themes = ["green", "amber", "cyber", "light"];
      const t = args[0];
      if (!t || !themes.includes(t)) {
        print(`usage: theme &lt;name&gt;`);
        print(`available: ${themes.map((x) => cmdBtn("theme " + x, x)).join(" ")}`);
        return;
      }
      document.body.dataset.theme = t;
      localStorage.setItem("pf-theme", t);
      print(`テーマを <span class="c-accent bold">${t}</span> に変更しました ✨`);
    },
  },

  history: {
    desc: "コマンド履歴",
    fn() {
      if (!cmdHistory.length) return print(`<span class="c-muted">(まだ履歴がありません)</span>`);
      cmdHistory.forEach((c, i) => print(`<span class="c-muted">${String(i + 1).padStart(3)}</span>  ${escapeHtml(c)}`));
    },
  },

  clear: {
    desc: "画面をクリア",
    fn() { outputEl.innerHTML = ""; },
  },

  banner: {
    desc: "バナーを再表示",
    fn() { showBanner(); },
  },

  open: {
    desc: "リンクを開く (open github など)",
    fn(args) {
      const map = { github: PROFILE.github, x: PROFILE.x, twitter: PROFILE.x };
      PROJECTS.forEach((p) => (map[p.id] = p.link));
      const key = args[0];
      if (!key || !map[key]) {
        print(`usage: open &lt;target&gt;`);
        print(`targets: ${Object.keys(map).map((k) => cmdBtn("open " + k, k)).join(" ")}`);
        return;
      }
      print(`🔗 opening <span class="c-link">${escapeHtml(map[key])}</span> ...`);
      window.open(map[key], "_blank", "noopener");
    },
  },

  echo: {
    desc: "文字を表示",
    fn(args) { print(escapeHtml(args.join(" ")) || "&nbsp;"); },
  },

  date: {
    desc: "現在時刻",
    fn() { print(new Date().toLocaleString("ja-JP", { dateStyle: "full", timeStyle: "medium" })); },
  },

  whoami: {
    desc: "あなたは誰？",
    fn() {
      print(`guest`);
      print(`<span class="c-muted">…そしてこのターミナルの主は ${escapeHtml(PROFILE.name)}。${cmdBtn("about")} でどうぞ。</span>`);
    },
  },

  exit: {
    desc: "ログアウト(?)",
    fn: async () => {
      print(`logout`);
      await sleep(400);
      print(`Connection to takuto.dev closed.`, "c-muted");
      await sleep(1200);
      print(`…と見せかけて再接続しました。そう簡単には帰しませんよ 😏`, "c-warn");
      print(`本当に閉じたいときはブラウザのタブをどうぞ。良い一日を！`);
    },
  },

  /* ---------- hidden commands ---------- */
  sudo: {
    hidden: true,
    fn(args) {
      if (args.join(" ").includes("rm")) return COMMANDS.rm.fn(["-rf", "/"]);
      print(`[sudo] password for guest: `, "c-muted");
      print(`guest は sudoers ファイル内にありません。この事象は報告されます。`, "c-error");
      print(`<span class="c-muted">…冗談です。ここでは全員ゲストです 🙂</span>`);
    },
  },

  rm: {
    hidden: true,
    fn: async (args) => {
      if (!(args.includes("-rf") || args.includes("-fr")) ) {
        return print(`rm: このターミナルのファイルは消せません（読み取り専用の思い出です）`, "c-warn");
      }
      print(`rm: removing all files...`, "c-error");
      document.body.classList.add("glitch");
      await sleep(1500);
      document.body.classList.remove("glitch");
      print(`rm: cannot remove '/': <span class="bold">Permission denied</span>`, "c-error");
      print(`このポートフォリオは不滅です 🛡️ （バックアップは 3 世代あります）`);
    },
  },

  matrix: {
    hidden: true,
    fn() {
      const on = document.body.classList.toggle("matrix-on");
      if (on) {
        startMatrix();
        print(`Wake up, Neo... <span class="c-muted">(止めるには <span class="bold">Esc</span>、またはもう一度 ${cmdBtn("matrix")})</span>`, "c-accent");
      } else {
        stopMatrix();
        print(`現実世界へようこそ。`, "c-muted");
      }
    },
  },

  coffee: {
    hidden: true,
    fn() {
      print(`<span class="c-warn">      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     '----'</span>`);
      print(`☕ コーヒーをどうぞ。開発のお供に。`);
    },
  },

  crt: {
    hidden: true,
    fn() {
      const off = document.body.classList.toggle("no-crt");
      print(off ? "CRT effect: OFF" : "CRT effect: ON", "c-muted");
    },
  },

  hack: {
    hidden: true,
    fn: async () => {
      const lines = [
        "Initializing hack sequence...",
        "Bypassing firewall... [██████████] 100%",
        "Accessing mainframe...",
        "Decrypting passwords...",
        "ERROR: 対象はただのポートフォリオサイトです",
        "ハッキングするものが何もありません。平和が一番。",
      ];
      for (const l of lines) {
        print(escapeHtml(l), l.startsWith("ERROR") ? "c-error" : "c-accent");
        await sleep(420);
      }
    },
  },
};

/** ディレクトリ内の全ファイルを cat する（ショートカット用） */
function catDir(segs) {
  const node = getNode(segs);
  if (!node || node.type !== "dir") return;
  print(`<span class="c-muted">— ${fmtPath(segs)} の内容 —（${cmdBtn("cd " + segs.join("/"))} で直接探索もできます）</span>`);
  for (const [name, child] of Object.entries(node.children)) {
    if (child.type !== "file") continue;
    print(`<span class="c-accent bold">▸ ${escapeHtml(name)}</span>`);
    print(renderFile(child, name));
    print();
  }
}

const startTime = Date.now();
function uptime() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  return s < 60 ? `${s} sec` : `${Math.floor(s / 60)} min ${s % 60} sec`;
}

/* =========================================================
 *  image → ascii art
 * ========================================================= */
function imageToAscii(src, cols = 72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 等幅フォントは縦長なので行数を半分にしてアスペクト比を合わせる
      const rows = Math.max(1, Math.round((img.height / img.width) * cols * 0.5));
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, cols, rows);
      const { data } = ctx.getImageData(0, 0, cols, rows);
      let ramp = " .:-=+*#%@";
      if (document.body.dataset.theme === "light") ramp = ramp.split("").reverse().join("");
      const lums = [];
      for (let i = 0; i < data.length; i += 4) {
        lums.push((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
      }
      // 明暗をフルレンジに引き伸ばして暗い写真でも輪郭が出るようにする
      const min = Math.min(...lums), max = Math.max(...lums), range = max - min || 1;
      const lines = [];
      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) {
          const lum = (lums[y * cols + x] - min) / range;
          line += ramp[Math.min(ramp.length - 1, Math.floor(lum * ramp.length))];
        }
        lines.push(line);
      }
      resolve(lines.join("\n"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

/* =========================================================
 *  lightbox
 * =========================================================*/
const lightboxEl = $("lightbox");
const lightboxImg = $("lightbox-img");
const lightboxCap = $("lightbox-cap");

function openLightbox(file) {
  const p = PHOTOS.find((x) => x.file === file);
  if (!p) return;
  lightboxImg.src = `img/photos/${p.file}`;
  lightboxImg.alt = p.title;
  lightboxCap.textContent = [p.title, p.place, p.date, p.camera].filter(Boolean).join(" · ");
  lightboxEl.hidden = false;
}
function closeLightbox() {
  lightboxEl.hidden = true;
  lightboxImg.src = "";
}

/* =========================================================
 *  prompt & input
 * ========================================================= */
function updatePrompt() {
  promptEl.innerHTML = `<span class="u">guest@${escapeHtml(PROFILE.handle)}</span>:<span class="p">${escapeHtml(fmtPath(cwd))}</span>$ `;
  titleEl.textContent = `guest@${PROFILE.handle}: ${fmtPath(cwd)}`;
}

function syncDisplay() {
  const v = hiddenInput.value;
  const pos = hiddenInput.selectionStart ?? v.length;
  clPre.textContent = v.slice(0, pos);
  const at = v.slice(pos, pos + 1);
  cursorEl.innerHTML = at ? escapeHtml(at) : "&nbsp;";
  clPost.textContent = v.slice(pos + 1);
}

function echoCommand(raw) {
  print(
    `<span class="c-muted">${promptEl.innerHTML}</span><span class="bold">${escapeHtml(raw)}</span>`
  );
}

async function execute(raw) {
  const trimmed = raw.trim();
  echoCommand(raw);
  if (!trimmed) return;

  if (cmdHistory[cmdHistory.length - 1] !== trimmed) cmdHistory.push(trimmed);
  histIdx = -1;

  if (pendingConfirm) {
    const fn = pendingConfirm;
    pendingConfirm = null;
    if (/^y(es)?$/i.test(trimmed)) await fn();
    else print(`キャンセルしました`, "c-muted");
    print();
    scrollToBottom();
    return;
  }

  const [name, ...args] = trimmed.split(/\s+/);
  const cmd = COMMANDS[name.toLowerCase()];
  if (cmd) {
    await cmd.fn(args);
  } else {
    windowEl.classList.remove("shake");
    void windowEl.offsetWidth;
    windowEl.classList.add("shake");
    print(`command not found: ${escapeHtml(name)}`, "c-error");
    const suggestion = suggest(name.toLowerCase());
    if (suggestion) print(`もしかして: ${cmdBtn(suggestion)} ?`, "c-muted");
    else print(`${cmdBtn("help")} で使えるコマンドが見れます`, "c-muted");
  }
  print();
  scrollToBottom();
}

/** typo サジェスト（レーベンシュタイン距離 <= 2） */
function suggest(input) {
  const names = Object.keys(COMMANDS);
  let best = null, bestD = 3;
  for (const n of names) {
    const d = levenshtein(input, n);
    if (d < bestD) { bestD = d; best = n; }
  }
  return best;
}
function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

/* ---------- tab completion ---------- */
function complete() {
  const v = hiddenInput.value;
  const pos = hiddenInput.selectionStart ?? v.length;
  const before = v.slice(0, pos);
  const tokens = before.split(/\s+/);
  const current = tokens[tokens.length - 1];
  const isFirst = tokens.length === 1;

  let candidates = [];
  let base = "";
  if (isFirst) {
    candidates = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(current));
  } else {
    const slash = current.lastIndexOf("/");
    base = slash >= 0 ? current.slice(0, slash + 1) : "";
    const partial = slash >= 0 ? current.slice(slash + 1) : current;
    const dirNode = getNode(resolvePath(base || "."));
    if (dirNode && dirNode.type === "dir") {
      candidates = Object.entries(dirNode.children)
        .filter(([n, c]) => n.startsWith(partial) && (partial.startsWith(".") || !(c.hidden || n.startsWith("."))))
        .map(([n, c]) => base + n + (c.type === "dir" ? "/" : ""));
    }
  }

  if (!candidates.length) return;
  if (candidates.length === 1) {
    const completed = candidates[0] + (isFirst ? " " : "");
    const newBefore = before.slice(0, before.length - current.length) + completed;
    hiddenInput.value = newBefore + v.slice(pos);
    hiddenInput.setSelectionRange(newBefore.length, newBefore.length);
  } else {
    // 共通プレフィックスまで補完して候補表示
    let common = candidates[0];
    for (const c of candidates) {
      while (!c.startsWith(common)) common = common.slice(0, -1);
    }
    if (common.length > current.length) {
      const newBefore = before.slice(0, before.length - current.length) + common;
      hiddenInput.value = newBefore + v.slice(pos);
      hiddenInput.setSelectionRange(newBefore.length, newBefore.length);
    }
    echoCommand(v);
    print(candidates.map((c) => `<span class="c-accent">${escapeHtml(c)}</span>`).join("   "));
  }
  syncDisplay();
}

/* ---------- key handling ---------- */
hiddenInput.addEventListener("input", syncDisplay);

hiddenInput.addEventListener("keydown", async (e) => {
  if (e.isComposing) return;

  if (e.key === "Enter") {
    e.preventDefault();
    const raw = hiddenInput.value;
    hiddenInput.value = "";
    syncDisplay();
    await execute(raw);
    return;
  }
  if (e.key === "Tab") {
    e.preventDefault();
    complete();
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!cmdHistory.length) return;
    if (histIdx === -1) { histDraft = hiddenInput.value; histIdx = cmdHistory.length - 1; }
    else if (histIdx > 0) histIdx--;
    hiddenInput.value = cmdHistory[histIdx];
    hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
    syncDisplay();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histIdx === -1) return;
    histIdx++;
    if (histIdx >= cmdHistory.length) { histIdx = -1; hiddenInput.value = histDraft; }
    else hiddenInput.value = cmdHistory[histIdx];
    hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
    syncDisplay();
    return;
  }
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    if (window.getSelection()?.toString()) return; // コピーは邪魔しない
    e.preventDefault();
    echoCommand(hiddenInput.value + "^C");
    hiddenInput.value = "";
    syncDisplay();
    return;
  }
  setTimeout(syncDisplay, 0);
});

document.addEventListener("selectionchange", () => {
  if (document.activeElement === hiddenInput) syncDisplay();
});

/* フォーカス管理: 画面クリック（テキスト選択時を除く）で入力へ */
screenEl.addEventListener("mouseup", () => {
  if (!window.getSelection()?.toString()) hiddenInput.focus({ preventScroll: true });
});
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.activeElement !== hiddenInput && e.key.length === 1) {
    hiddenInput.focus({ preventScroll: true });
  }
});

/* 画面クリア: mac=⌘K / win=Ctrl+K */
document.addEventListener("keydown", (e) => {
  const clearCombo = e.key.toLowerCase() === "k" && (isMac ? e.metaKey && !e.ctrlKey : e.ctrlKey);
  if (clearCombo) {
    e.preventDefault();
    COMMANDS.clear.fn();
  }
});

/* matrix 中の脱出: Esc で停止（画面が見えなくても抜けられる） */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.body.classList.contains("matrix-on")) return;
  e.preventDefault();
  e.stopPropagation();
  document.body.classList.remove("matrix-on");
  stopMatrix();
  print(`現実世界へようこそ。`, "c-muted");
}, true);

/* lightbox 閉じる: Esc */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || lightboxEl.hidden) return;
  e.preventDefault();
  closeLightbox();
}, true);

/* クリック実行（cmd-btn / ls・tree の項目 / 写真の拡大） */
document.addEventListener("click", async (e) => {
  if (e.target.closest("#lightbox")) return closeLightbox();
  const lb = e.target.closest("[data-lightbox]");
  if (lb) return openLightbox(lb.dataset.lightbox);
  const btn = e.target.closest(".cmd-btn, .chip");
  if (btn?.dataset.cmd) {
    if (!animating) await typeAndRun(btn.dataset.cmd);
    return;
  }
  const cdEl = e.target.closest("[data-cd]");
  if (cdEl) { if (!animating) await typeAndRun("cd " + cdEl.dataset.cd); return; }
  const catEl = e.target.closest("[data-cat]");
  if (catEl) { if (!animating) await typeAndRun("cat " + catEl.dataset.cat); return; }
});

/** コマンドをタイプ演出つきで実行 */
async function typeAndRun(cmd) {
  animating = true;
  document.body.classList.add("typing");
  hiddenInput.value = "";
  for (const ch of cmd) {
    hiddenInput.value += ch;
    syncDisplay();
    scrollToBottom();
    await sleep(18 + Math.random() * 30);
  }
  await sleep(120);
  hiddenInput.value = "";
  syncDisplay();
  document.body.classList.remove("typing");
  animating = false;
  await execute(cmd);
  hiddenInput.focus({ preventScroll: true });
}

/* =========================================================
 *  matrix rain
 * ========================================================= */
const mCanvas = $("matrix-canvas");
const mCtx = mCanvas.getContext("2d");
let mDrops = [];

function startMatrix() {
  mCanvas.width = innerWidth;
  mCanvas.height = innerHeight;
  const cols = Math.floor(innerWidth / 16);
  mDrops = Array(cols).fill(1);
  clearInterval(matrixTimer);
  matrixTimer = setInterval(drawMatrix, 50);
}
function stopMatrix() {
  clearInterval(matrixTimer);
  matrixTimer = null;
  setTimeout(() => mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height), 800);
}
function drawMatrix() {
  mCtx.fillStyle = "rgba(2, 6, 4, 0.08)";
  mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);
  mCtx.fillStyle = "#4af26c";
  mCtx.font = "14px monospace";
  const chars = "アイウエオカキクケコサシスセソ0123456789ABCDEF";
  mDrops.forEach((y, i) => {
    const ch = chars[Math.floor(Math.random() * chars.length)];
    mCtx.fillText(ch, i * 16, y * 16);
    if (y * 16 > mCanvas.height && Math.random() > 0.975) mDrops[i] = 0;
    mDrops[i]++;
  });
}
addEventListener("resize", () => {
  if (document.body.classList.contains("matrix-on")) startMatrix();
});

/* =========================================================
 *  boot sequence
 * ========================================================= */
const BOOT_LINES = [
  ["PORTFOLIO BIOS v3.7 — initializing...", 60],
  ["Memory check ............ <span class='ok'>640K OK</span> (ought to be enough)", 220],
  ["Loading kernel modules:", 240],
  ["  [ <span class='ok'>OK</span> ] personality.service", 130],
  ["  [ <span class='ok'>OK</span> ] skills.service", 110],
  ["  [ <span class='ok'>OK</span> ] humor.service <span style='color:#3d6b49'>(beta)</span>", 130],
  ["  [ <span class='ok'>OK</span> ] coffee.daemon ☕", 150],
  ["Mounting /dev/creativity ......... <span class='ok'>done</span>", 260],
  ["Establishing connection to guest ... <span class='ok'>done</span>", 240],
  ["", 100],
  ["Boot complete. Have fun!", 200],
];

let bootSkipped = false;
async function runBoot() {
  const skip = () => { bootSkipped = true; };
  addEventListener("keydown", skip, { once: true });
  bootEl.addEventListener("click", skip, { once: true });

  for (const [text, delay] of BOOT_LINES) {
    if (bootSkipped) break;
    bootLog.innerHTML += text + "\n";
    await sleep(delay);
  }
  bootEl.classList.add("hide");
  setTimeout(() => bootEl.remove(), 600);
}

/* =========================================================
 *  banner & init
 * ========================================================= */
function showBanner() {
  print(`<span class="ascii">${escapeHtml(ASCII_LOGO)}</span>`);
  print(`<span class="c-muted">${escapeHtml(PROFILE.role)} — ${escapeHtml(PROFILE.location)}</span>`);
  print();
  print(`ようこそ！ここは <span class="bold c-accent">${escapeHtml(PROFILE.name)}</span> のポートフォリオ・ターミナルです。`);
  print(`💡 まずは ${cmdBtn("help")} と入力（クリックでもOK）してみてください。`);
  print();
}

async function init() {
  const savedTheme = localStorage.getItem("pf-theme");
  if (savedTheme) document.body.dataset.theme = savedTheme;

  updatePrompt();
  syncDisplay();
  await runBoot();
  showBanner();

  const isTouch = matchMedia("(pointer: coarse)").matches;
  if (!isTouch) hiddenInput.focus({ preventScroll: true });
}

init();
