/**
 * photos/ に置いた元画像を WebP に変換して public/img/photos/ に書き出し、
 * 写真一覧 public/js/photos.generated.js を生成、data.js の PHOTO_META に新しい写真の行を追記する。
 *   node scripts/optimize-images.mjs         # 未生成のものだけ変換（一覧は毎回更新）
 *   node scripts/optimize-images.mjs --force # すべて再生成
 *
 * 出力: <basename>-480.webp / -720.webp / -1080.webp / -1920.webp
 * EXIF は向き情報を反映したうえで除去（位置情報などを配信しないため）。
 * 撮影日・カメラ名は EXIF から読み取って PHOTO_META の初期値として書き込む（既に書いてある値は上書きしない）。
 */
import { readdir, mkdir, stat, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import exifReader from "exif-reader";

const SRC = "photos";
const OUT = "public/img/photos";
const MANIFEST = "public/js/photos.generated.js";
const DATA_JS = "public/js/data.js";
/* 幅ごとの WebP 品質。大きいサイズほど圧縮を強める */
const VARIANTS = [
  { width: 480, quality: 80 },
  { width: 720, quality: 78 },
  { width: 1080, quality: 78 },
  { width: 1920, quality: 72 },
];
const force = process.argv.includes("--force");

const isImage = (f) => /\.(jpe?g|png|webp|heic|avif|tiff?)$/i.test(f);
const exists = (p) => stat(p).then(() => true, () => false);
const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

/** EXIF から撮影日 (YYYY.MM.DD) とカメラ名を取り出す。無ければ空文字 */
function readExif(buf) {
  if (!buf) return { date: "", camera: "" };
  let exif;
  try {
    exif = exifReader(buf);
  } catch {
    return { date: "", camera: "" };
  }
  const d = exif.Photo?.DateTimeOriginal ?? exif.Image?.DateTime;
  // exif-reader は現地時刻を UTC として Date 化するので UTC 系で読み戻す
  const date =
    d instanceof Date && !isNaN(d)
      ? `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`
      : "";
  const make = (exif.Image?.Make ?? "").trim();
  const model = (exif.Image?.Model ?? "").trim();
  const camera = model.toLowerCase().startsWith(make.toLowerCase()) ? model : [make, model].filter(Boolean).join(" ");
  return { date, camera };
}

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC).catch(() => [])).filter(isImage).sort();
if (!files.length) {
  console.log(`no images in ${SRC}/`);
}

let generated = 0;
const manifest = [];
for (const file of files) {
  const base = file.replace(/\.[^.]+$/, "");
  const src = path.join(SRC, file);
  const srcSize = (await stat(src)).size;
  const image = sharp(src).rotate();
  const meta = await image.metadata();
  // 向き情報で 90° 回転する場合は幅と高さを入れ替える
  const swap = (meta.orientation ?? 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;
  const sizes = [];

  for (const { width: w, quality } of VARIANTS) {
    const out = path.join(OUT, `${base}-${w}.webp`);
    if (!force && (await exists(out))) {
      sizes.push(`${w}: cached`);
      continue;
    }
    const info = await image
      .clone()
      .resize({ width: Math.min(w, width), withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(out);
    sizes.push(`${w}: ${kb(info.size)}`);
    generated++;
  }
  console.log(`${file} (${kb(srcSize)}) → ${sizes.join(", ")}`);
  manifest.push({ file, width, height, ...readExif(meta.exif) });
}

/* photos/ から消えた画像の WebP を掃除 */
const keep = new Set(files.map((f) => f.replace(/\.[^.]+$/, "")));
for (const f of await readdir(OUT)) {
  const m = f.match(/^(.+)-\d+\.webp$/);
  if (m && !keep.has(m[1])) {
    await unlink(path.join(OUT, f));
    console.log(`removed stale ${f}`);
  }
}

/* 一覧 (ファイル名と寸法のみ)。表示順や撮影情報は data.js の PHOTO_META 側 */
const body = manifest
  .map(({ file, width, height }) => `  { file: ${JSON.stringify(file)}, width: ${width}, height: ${height} },`)
  .join("\n");
await writeFile(
  MANIFEST,
  `/* scripts/optimize-images.mjs が生成。直接編集しない（npm run images で更新） */\nconst PHOTO_FILES = [\n${body}\n];\n`
);

/* data.js の PHOTO_META を更新: 新しい写真は EXIF 値で行を追加、既存の行は手で書いた値を尊重して空欄だけ埋める */
const added = await updatePhotoMeta(manifest);
console.log(
  `done: ${generated} file(s) generated, ${manifest.length} photo(s) → ${MANIFEST}` +
    (added.length ? `, ${added.length} new entr${added.length > 1 ? "ies" : "y"} → ${DATA_JS} (${added.join(", ")})` : "")
);

async function updatePhotoMeta(items) {
  const src = await readFile(DATA_JS, "utf8");
  const re = /const PHOTO_META = (\{[\s\S]*?\n\});/;
  const m = src.match(re);
  if (!m) {
    console.warn(`warn: PHOTO_META not found in ${DATA_JS}, skipped`);
    return [];
  }
  const current = new Function(`return ${m[1]}`)();
  const known = new Set(items.map((p) => p.file));
  const added = [];
  const next = {};

  // 既存の行は順番を保って残す（photos/ から消えた写真の行は落とす）
  for (const [file, meta] of Object.entries(current)) {
    if (!known.has(file)) {
      console.log(`removed PHOTO_META entry for missing ${file}`);
      continue;
    }
    const exif = items.find((p) => p.file === file);
    next[file] = { ...meta, date: meta.date ?? exif.date, camera: meta.camera ?? exif.camera };
  }
  // 新しい写真は撮影日の新しい順で末尾に追加
  const fresh = items.filter((p) => !(p.file in current));
  fresh.sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.file.localeCompare(b.file));
  for (const p of fresh) {
    next[p.file] = { place: "", date: p.date, camera: p.camera };
    added.push(p.file);
  }

  const KEY_ORDER = ["place", "date", "camera", "order"];
  const fmt = (meta) => {
    const keys = [...KEY_ORDER.filter((k) => k in meta), ...Object.keys(meta).filter((k) => !KEY_ORDER.includes(k))];
    return `{ ${keys.map((k) => `${k}: ${JSON.stringify(meta[k])}`).join(", ")} }`;
  };
  const lines = Object.entries(next).map(([file, meta]) => `  ${JSON.stringify(file)}: ${fmt(meta)},`);
  const block = `{\n${lines.join("\n")}\n}`;
  if (block !== m[1]) await writeFile(DATA_JS, src.replace(re, `const PHOTO_META = ${block};`));
  return added;
}
