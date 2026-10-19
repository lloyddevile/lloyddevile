#!/usr/bin/env node
/**
 * build.mjs — pembuat aset profil GitHub bertema neo-brutalism.
 *
 * Menghasilkan SVG (banner, about, stack, stats, activity, languages, snake,
 * kontak, footer) ke folder --out (default: dist). Semua teks diubah jadi path
 * supaya font Space Mono / Space Grotesk tampil sama di semua perangkat.
 *
 * Pakai:
 *   node .github/profile/build.mjs --out dist          # data asli (butuh GH_TOKEN)
 *   node .github/profile/build.mjs --out dist --demo   # data contoh, untuk tes tampilan
 *
 * Ubah isi profil di bagian CONFIG di bawah, lalu commit. Workflow jalan otomatis.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';
import * as si from 'simple-icons';

/* ════════════════════════════════════════════════════════════════════════
   CONFIG — edit di sini
   ════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  username: process.env.GH_USER || 'lloyddevile',
  name: 'Fatiha',
  handle: '@lloyddevile',
  status: 'ONLINE',

  // Teks yang diketik di terminal banner
  typing: ['Hello World!', 'Digital Store Owner', 'Telegram Bot Developer', 'Front-end & Automation'],

  // Chip di bawah nama: [label, warna]
  roles: [
    ['LLOYD MARKET', 'yellow'],
    ['BOT DEVELOPER', 'blue'],
    ['FRONT-END', 'green'],
  ],

  // Kartu "Tentang Saya" (icon: store, bot, code, sprout)
  about: [
    { icon: 'store', color: 'yellow', chip: 'TOKO DIGITAL', title: 'Lloyd Market', text: 'Toko langganan aplikasi premium' },
    { icon: 'bot', color: 'blue', chip: 'AUTOMASI', title: 'Bot Telegram', text: 'Auto-order dengan Node.js' },
    { icon: 'code', color: 'green', chip: 'FRONT-END', title: 'React + Vite', text: 'Web tools & situs front-end' },
    { icon: 'sprout', color: 'purple', chip: 'SEDANG BELAJAR', title: 'Front-end & Otomasi', text: 'Mendalami lebih jauh' },
  ],
  cta: 'Tanya saya soal bot, web tools, dan produk digital',

  // Tech stack. Kunci ikon: html css js react vite node git github vercel
  stack: [
    { label: 'FRONT-END', color: 'yellow', items: [['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript'], ['react', 'React'], ['vite', 'Vite']] },
    { label: 'BACKEND', color: 'green', items: [['node', 'Node.js']] },
    { label: 'TOOLS & DEPLOY', color: 'blue', items: [['git', 'Git'], ['github', 'GitHub'], ['vercel', 'Vercel']] },
  ],

  // Kartu kontak (URL ada di README.md)
  contacts: [
    { file: 'contact-telegram.svg', brand: 'siTelegram', color: 'blue', name: 'Telegram', handle: '@lloyddvondegurechaff' },
    { file: 'contact-instagram.svg', brand: 'siInstagram', color: 'pink', name: 'Instagram', handle: '@paatihhaaa' },
    { file: 'contact-github.svg', brand: 'siGithub', color: 'ink', name: 'GitHub', handle: '@lloyddevile' },
  ],

  // Teks berjalan di footer
  ticker: ['LLOYD MARKET', 'BOT DEVELOPER', 'FRONT-END', 'NODE.JS', 'REACT + VITE', 'AUTOMASI'],
};

/* ════════════════════════════════════════════════════════════════════════
   CLI
   ════════════════════════════════════════════════════════════════════════ */
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const OUT = arg('--out', 'dist');
const DEMO = argv.includes('--demo');
const NOW = DEMO ? new Date('2026-10-19T00:05:00Z') : new Date();

/* ════════════════════════════════════════════════════════════════════════
   TEMA (diambil dari screenshot dashboard Alipai)
   ════════════════════════════════════════════════════════════════════════ */
const C = {
  ink: '#111111', cream: '#F4F3EE', paper: '#FFFFFF', soft: '#FFF9E6', chart: '#FFFDF5',
  dot: '#D8D5C8', gray: '#5F5E58', grid: '#ECE7D6', badge: '#1B1D22',
  yellow: '#FFD600', blue: '#3B66E6', green: '#10B981', purple: '#8B5CF6',
  cyan: '#22C3E0', pink: '#F43F5E', orange: '#FF8A3D',
};
// warna ikon di atas tile berwarna tertentu
const ICOLOR = { yellow: C.ink, cyan: C.ink, orange: C.ink, paper: C.ink, blue: '#fff', green: '#fff', purple: '#fff', pink: '#fff', ink: '#fff' };

/* ════════════════════════════════════════════════════════════════════════
   FONT → PATH
   ════════════════════════════════════════════════════════════════════════ */
const require = createRequire(import.meta.url);
function loadFont(pkg, file) {
  const dir = path.dirname(require.resolve(`${pkg}/package.json`));
  const buf = fs.readFileSync(path.join(dir, 'files', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const fonts = {
  mono: loadFont('@fontsource/space-mono', 'space-mono-latin-400-normal.woff'),
  monoB: loadFont('@fontsource/space-mono', 'space-mono-latin-700-normal.woff'),
  grot: loadFont('@fontsource/space-grotesk', 'space-grotesk-latin-700-normal.woff'),
};
const CAP = 0.7; // tinggi huruf kapital relatif ke ukuran font

const f1 = (n) => (Math.round(n * 10) / 10).toString();
const f2 = (n) => (Math.round(n * 100) / 100).toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function layout(font, str, size, ls = 0) {
  const sc = size / font.unitsPerEm;
  const cs = [...str];
  const out = [];
  let x = 0;
  cs.forEach((ch, i) => {
    const idx = font.charToGlyphIndex(ch);
    if (idx === 0) throw new Error(`Font tidak punya glyph "${ch}" (U+${ch.codePointAt(0).toString(16)}) pada teks: ${str}`);
    const g = font.glyphs.get(idx);
    out.push({ g, x });
    x += g.advanceWidth * sc + ls;
    const nx = cs[i + 1];
    if (nx) {
      const ni = font.charToGlyphIndex(nx);
      if (ni) { try { x += (font.getKerningValue(g, font.glyphs.get(ni)) || 0) * sc; } catch { /* abaikan */ } }
    }
  });
  return { out, width: Math.max(0, x - (cs.length ? ls : 0)) };
}
const W_ = (font, str, size, ls = 0) => layout(font, str, size, ls).width;

// Serialisasi path sendiri (toPathData bawaan opentype.js kadang menghasilkan NaN)
const r1 = (n) => { const v = Math.round(n * 10) / 10; if (!Number.isFinite(v)) throw new Error('Koordinat path tidak valid'); return Object.is(v, -0) ? 0 : v; };
function pathData(cmds) {
  return cmds.map((c) => {
    switch (c.type) {
      case 'M': return `M${r1(c.x)} ${r1(c.y)}`;
      case 'L': return `L${r1(c.x)} ${r1(c.y)}`;
      case 'Q': return `Q${r1(c.x1)} ${r1(c.y1)} ${r1(c.x)} ${r1(c.y)}`;
      case 'C': return `C${r1(c.x1)} ${r1(c.y1)} ${r1(c.x2)} ${r1(c.y2)} ${r1(c.x)} ${r1(c.y)}`;
      case 'Z': return 'Z';
      default: throw new Error(`Perintah path tidak dikenal: ${c.type}`);
    }
  }).join('');
}

/** Teks → <path>. y = baseline. maxW = otomatis diperkecil bila kelebihan lebar. */
function T(font, str, { size = 14, x = 0, y = 0, anchor = 'start', fill = C.ink, ls = 0, maxW = 0 } = {}) {
  let s = size;
  let L = layout(font, str, s, ls);
  if (maxW && L.width > maxW) {
    const k = maxW / L.width;
    s = size * k;
    L = layout(font, str, s, ls * k);
  }
  const x0 = anchor === 'end' ? x - L.width : anchor === 'middle' ? x - L.width / 2 : x;
  const d = L.out.map((o) => pathData(o.g.getPath(x0 + o.x, y, s).commands)).join('');
  return `<path d="${d}" fill="${fill}"/>`;
}

/* ════════════════════════════════════════════════════════════════════════
   IKON
   ════════════════════════════════════════════════════════════════════════ */
const ICONS = {
  store: '<path d="M5 9h14l-1 11H6L5 9Z"/><path d="M9 9V7.5a3 3 0 0 1 6 0V9"/>',
  bot: '<rect x="5" y="9" width="14" height="10" rx="3"/><path d="M12 9V6M3 13v3M21 13v3"/><circle cx="12" cy="4.6" r="1.3"/><circle cx="9.4" cy="13.8" r=".6" fill="$C"/><circle cx="14.6" cy="13.8" r=".6" fill="$C"/><path d="M10 16.6h4"/>',
  code: '<path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.2 6l-2.4 12"/>',
  sprout: '<path d="M12 20v-8"/><path d="M12 12c0-3.5-2.6-5.8-7-5.8 0 3.6 2.8 5.8 7 5.8Z"/><path d="M12 14c0-3.2 2.4-5.6 7-5.6 0 3.4-2.6 5.6-7 5.6Z"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5v-8Z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
  chart: '<rect x="3.5" y="12" width="5" height="8.5" rx="1.2" fill="$C" stroke="none"/><rect x="9.5" y="3.5" width="5" height="17" rx="1.2" fill="$C" stroke="none"/><rect x="15.5" y="8.5" width="5" height="12" rx="1.2" fill="$C" stroke="none"/>',
  flame: '<path d="M12 3c.6 3.2 5 5.2 5 10.2A5 5 0 0 1 7 13.2c0-2 .9-3.4 2.2-4.4.2 1.8 1 2.8 2 3.2C11 9 10.6 6 12 3Z"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5Z"/>',
  commit: '<circle cx="12" cy="12" r="3.6"/><path d="M3 12h5.4M15.6 12H21"/>',
  repo: '<path d="M6 4h11a1 1 0 0 1 1 1v14H8a2 2 0 0 1-2-2V4Z"/><path d="M6 17a2 2 0 0 1 2-2h10"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.2A4.6 4.6 0 0 1 20.5 19"/>',
  pr: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M6 8.2v7.6M18 15.8V10a3 3 0 0 0-3-3h-3m0 0 2-2m-2 2 2 2"/>',
  issue: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5"/><circle cx="12" cy="16.2" r=".7" fill="$C"/>',
  arrow: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2" fill="$C"/><rect x="4" y="14" width="6" height="6" rx="1.2" fill="$C"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
};

function icon(key, x, y, size, color, sw = 2.2) {
  if (!ICONS[key]) throw new Error(`Ikon tidak dikenal: ${key}`);
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f2(size / 24)})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[key].replaceAll('$C', color)}</g>`;
}
function brand(key, x, y, size, color) {
  const i = si[key];
  if (!i) throw new Error(`Brand icon tidak ada: ${key}`);
  return `<path transform="translate(${f1(x)} ${f1(y)}) scale(${f2(size / 24)})" d="${i.path}" fill="${color}"/>`;
}
/** Panah tren: dir = 1 naik, -1 turun, 0 datar. */
function trend(dir, x, y, s, color) {
  const d = dir > 0 ? `M${x} ${y + s * 0.55}L${x + s / 2} ${y}L${x + s} ${y + s * 0.55}M${x + s / 2} ${y}V${y + s}`
    : dir < 0 ? `M${x} ${y + s * 0.45}L${x + s / 2} ${y + s}L${x + s} ${y + s * 0.45}M${x + s / 2} ${y + s}V${y}`
      : `M${x} ${y + s / 2}H${x + s}M${x + s * 0.45} ${y + s * 0.1}L${x + s} ${y + s / 2}L${x + s * 0.45} ${y + s * 0.9}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* ════════════════════════════════════════════════════════════════════════
   KOMPONEN DASAR
   ════════════════════════════════════════════════════════════════════════ */
const DEFS = `<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="${C.dot}"/></pattern>`;
const CSS = `
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-in-out infinite}
.float{animation:float 3.6s ease-in-out infinite}
.bob{animation:bob 2.8s ease-in-out infinite}
.nudge{animation:nudge 1.8s ease-in-out infinite}
.rise{animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
.grow{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s cubic-bezier(.2,.9,.3,1.15) both}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.62)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes nudge{0%,100%{transform:translate(0,0)}50%{transform:translate(2.5px,-2.5px)}}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

function svgDoc(w, h, { title, desc, body, css = '', defs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>${esc(desc)}</desc><defs>${DEFS}${defs}</defs><style>${CSS}${css}</style><rect width="${w}" height="${h}" rx="14" fill="${C.cream}"/><rect width="${w}" height="${h}" rx="14" fill="url(#dots)"/>${body}</svg>\n`;
}

let uid = 0;
const nid = (p) => `${p}${++uid}`;

function card(x, y, w, h, { fill = C.paper, r = 16, sw = 3.5, sh = 6, bar = null, barH = 9 } = {}) {
  let s = `<rect x="${x + sh}" y="${y + sh}" width="${w}" height="${h}" rx="${r}" fill="${C.ink}"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  if (bar) {
    const id = nid('cb');
    s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`;
    s += `<rect x="${x}" y="${y + h - barH}" width="${w}" height="${barH}" fill="${bar}" clip-path="url(#${id})"/>`;
    s += `<rect x="${x}" y="${y + h - barH}" width="${w}" height="3" fill="${C.ink}" clip-path="url(#${id})"/>`;
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${C.ink}" stroke-width="${sw}"/>`;
  return s;
}

function tile(x, y, s, colorKey, { ik, bk, r = 12, sh = 3.5, sw = 3, k = 0.56, iconColor } = {}) {
  const col = C[colorKey];
  const ic = iconColor || ICOLOR[colorKey] || C.ink;
  const pad = (s * (1 - k)) / 2;
  let out = `<rect x="${x + sh}" y="${y + sh}" width="${s}" height="${s}" rx="${r}" fill="${C.ink}"/>`;
  out += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="${col}" stroke="${C.ink}" stroke-width="${sw}"/>`;
  if (ik) out += icon(ik, x + pad, y + pad, s * k, ic);
  if (bk) out += brand(bk, x + pad, y + pad, s * k, ic);
  return out;
}

function chip(label, x, y, { h = 30, size = 12, fill = C.soft, color = C.ink, ls = 1.2, dot = null, anchor = 'start', sh = 3, sw = 2.5, r = 8, padX = 13, font = fonts.monoB } = {}) {
  const dotW = dot ? 18 : 0;
  const w = W_(font, label, size, ls) + padX * 2 + dotW;
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  let s = `<rect x="${f1(x0 + sh)}" y="${y + sh}" width="${f1(w)}" height="${h}" rx="${r}" fill="${C.ink}"/>`;
  s += `<rect x="${f1(x0)}" y="${y}" width="${f1(w)}" height="${h}" rx="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="${sw}"/>`;
  if (dot) s += `<circle class="pulse" cx="${f1(x0 + padX + 5)}" cy="${y + h / 2}" r="4.2" fill="${dot}"/>`;
  s += T(font, label, { size, x: x0 + padX + dotW, y: y + h / 2 + (CAP * size) / 2, fill: color, ls });
  return { svg: s, w, x: x0 };
}

/** Header kartu: tile + judul + subjudul + garis. Mengembalikan svg dan y konten berikutnya. */
function cardHeader(cx, cy, cw, { colorKey, ik, title, sub }) {
  let s = tile(cx + 28, cy + 26, 56, colorKey, { ik, k: 0.52 });
  s += T(fonts.grot, title, { size: 26, x: cx + 28 + 56 + 20, y: cy + 53, maxW: cw - 180 });
  s += T(fonts.mono, sub, { size: 15, x: cx + 28 + 56 + 20, y: cy + 76, fill: C.gray, maxW: cw - 180 });
  s += `<rect x="${cx + 28}" y="${cy + 100}" width="${cw - 56}" height="3" fill="${C.ink}"/>`;
  return { svg: s, next: cy + 126 };
}

function sectionTab(x, y, label, w) {
  const size = 13;
  const tw = W_(fonts.monoB, label, size, 2);
  const tabW = tw + 50;
  let s = `<rect x="${x}" y="${y}" width="${f1(tabW)}" height="32" rx="8" fill="${C.ink}"/>`;
  s += `<rect x="${x + 14}" y="${y + 11}" width="10" height="10" fill="${C.yellow}"/>`;
  s += T(fonts.monoB, label, { size, x: x + 34, y: y + 16 + (CAP * size) / 2, fill: C.yellow, ls: 2 });
  s += `<rect x="${f1(x + tabW + 10)}" y="${y + 14.5}" width="${f1(w - tabW - 10)}" height="3" fill="${C.ink}"/>`;
  return s;
}

const fmtNum = (n) => (Number.isFinite(n) ? n.toLocaleString('id-ID') : '—');
const BULAN = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
const dmy = (iso) => { const [, m, d] = iso.split('-'); return `${parseInt(d, 10)} ${BULAN[parseInt(m, 10) - 1]}`; };

/* ════════════════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════════════════ */
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function demoData() {
  const rnd = mulberry32(7);
  const days = [];
  const end = new Date('2026-10-19T00:00:00Z');
  const last7 = [3, 5, 0, 2, 9, 4, 1];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 864e5);
    const count = i < 7 ? last7[6 - i] : rnd() < 0.3 ? 0 : Math.floor(rnd() * 8);
    days.push({ date: d.toISOString().slice(0, 10), count });
  }
  return {
    login: 'lloyddevile', contributions: days.reduce((a, d) => a + d.count, 0), commits: 842, prs: 37, issues: 12,
    repos: 24, stars: 58, followers: 41, days,
    langs: [['JavaScript', 612000], ['HTML', 181000], ['CSS', 122000], ['TypeScript', 64000], ['Shell', 31000], ['Python', 14000], ['Dockerfile', 4000]],
  };
}

async function fetchData(user, token) {
  const q = `query($login:String!){user(login:$login){login followers{totalCount} pullRequests{totalCount} issues{totalCount}
    repositories(ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false,first:100,orderBy:{field:UPDATED_AT,direction:DESC}){totalCount nodes{stargazerCount languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
    contributionsCollection{totalCommitContributions contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-build' },
    body: JSON.stringify({ query: q, variables: { login: user } }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join('; ')}`);
  const u = json.data.user;
  const cal = u.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
  const langMap = new Map();
  let stars = 0;
  for (const r of u.repositories.nodes) {
    stars += r.stargazerCount;
    for (const e of r.languages.edges) langMap.set(e.node.name, (langMap.get(e.node.name) || 0) + e.size);
  }
  return {
    login: u.login, contributions: cal.totalContributions, commits: u.contributionsCollection.totalCommitContributions,
    prs: u.pullRequests.totalCount, issues: u.issues.totalCount, repos: u.repositories.totalCount, stars,
    followers: u.followers.totalCount, days, langs: [...langMap.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // hari ini belum ada kontribusi tidak memutus streak
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { current, longest };
}

/* ════════════════════════════════════════════════════════════════════════
   1) BANNER
   ════════════════════════════════════════════════════════════════════════ */
function typedBlock({ phrases, x, base, size, fill, curH, curW }) {
  const font = fonts.monoB;
  const adv = (font.charToGlyph('A').advanceWidth * size) / font.unitsPerEm;
  const slot = 3.8, lead = 0.45, step = 0.085, hideAt = 0.4;
  const D = phrases.length * slot;
  const kt = (t) => (t / D).toFixed(5);
  let clips = '', texts = '';
  const curT = [0], curX = [x];
  phrases.forEach((ph, p) => {
