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
  typing: ['Hello World!', 'Digital Store Owner', 'Telegram & Whatsapp Bot Developer', 'Front-end & Automation'],

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
    const n = [...ph].length;
    const ts = p * slot;
    const times = [0], widths = [0];
    for (let k = 1; k <= n; k++) { const t = ts + lead + k * step; times.push(t); widths.push(k * adv); curT.push(t); curX.push(x + k * adv); }
    times.push(ts + slot - hideAt); widths.push(0);
    curT.push(ts + slot - hideAt); curX.push(x);
    times.push(D); widths.push(0);
    const id = `tc${p}`;
    const w0 = p === 0 ? n * adv : 0;
    clips += `<clipPath id="${id}"><rect x="${f1(x)}" y="${f1(base - size)}" width="${f1(w0)}" height="${f1(size * 1.5)}"><animate attributeName="width" dur="${D}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${times.map(kt).join(';')}" values="${widths.map(f1).join(';')}"/></rect></clipPath>`;
    texts += `<g clip-path="url(#${id})">${T(font, ph, { size, x, y: base, fill })}</g>`;
  });
  curT.push(D); curX.push(x);
  const n0 = [...phrases[0]].length;
  const cursor = `<rect x="${f1(x + n0 * adv + 2)}" y="${f1(base - curH + 3)}" width="${curW}" height="${curH}" fill="${fill}"><animate attributeName="x" dur="${D}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${curT.map(kt).join(';')}" values="${curX.map((v) => f1(v + 2)).join(';')}"/><animate attributeName="opacity" dur="0.9s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.5" values="1;0"/></rect>`;
  return clips + texts + cursor;
}

function bannerSVG(cfg) {
  const W = 800, cx = 24, cy = 24, cw = 744, ch = 264, H = cy + ch + 30;
  let b = card(cx, cy, cw, ch, { r: 20, sh: 8, sw: 4 });
  // dekorasi
  const plus = (x, y, s = 7) => `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`;
  b += plus(cx + 452, cy + 34) + plus(cx + 712, cy + 38, 6) + plus(cx + 600, cy + 118, 5);

  // avatar + nama
  const ax = cx + 32, ay = cy + 28;
  b += `<rect x="${ax + 4}" y="${ay + 4}" width="76" height="76" rx="14" fill="${C.yellow}"/>`;
  b += `<rect x="${ax}" y="${ay}" width="76" height="76" rx="14" fill="${C.ink}"/>`;
  b += T(fonts.grot, cfg.name[0].toUpperCase(), { size: 50, x: ax + 38, y: ay + 38 + CAP * 25, anchor: 'middle', fill: C.cream });
  const nameSize = 68, nameStr = cfg.name.toUpperCase();
  const nx = ax + 76 + 26, nBase = ay + 38 + (CAP * nameSize) / 2 - 2;
  const nW = W_(fonts.grot, nameStr, nameSize);
  b += `<rect x="${f1(nx - 8)}" y="${f1(nBase - CAP * nameSize * 0.5)}" width="${f1(nW + 16)}" height="${f1(CAP * nameSize * 0.5 + 9)}" fill="${C.yellow}" transform="rotate(-1.4 ${f1(nx)} ${f1(nBase)})"/>`;
  b += T(fonts.grot, nameStr, { size: nameSize, x: nx, y: nBase });

  // tile melayang di kanan
  const fl = [
    { x: cx + 468, y: cy + 52, col: 'yellow', ik: 'store', rot: -8, d: 0 },
    { x: cx + 548, y: cy + 36, col: 'blue', ik: 'bot', rot: 6, d: 0.45 },
    { x: cx + 628, y: cy + 56, col: 'green', ik: 'code', rot: -4, d: 0.9 },
  ];
  for (const f of fl) {
    b += `<g transform="rotate(${f.rot} ${f.x + 33} ${f.y + 33})"><g class="float" style="animation-delay:${f.d}s">${tile(f.x, f.y, 66, f.col, { ik: f.ik, k: 0.56, sh: 5, r: 14 })}</g></g>`;
  }

  // chip peran + handle
  const ry = cy + 124;
  let rx = cx + 32;
  for (const [label, col] of cfg.roles) {
    const c = chip(label, rx, ry, { h: 34, size: 13.5, fill: C[col], color: ICOLOR[col] });
    b += c.svg; rx += c.w + 14;
  }
  b += chip(cfg.handle.toUpperCase(), cx + cw - 32, ry, { h: 34, size: 13.5, anchor: 'end' }).svg;

  // terminal
  const bx = cx + 32, by = cy + 178, bw = cw - 64, bh = 58;
  b += `<rect x="${bx + 4}" y="${by + 4}" width="${bw}" height="${bh}" rx="12" fill="${C.yellow}"/>`;
  b += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${C.ink}"/>`;
  [C.pink, C.yellow, C.green].forEach((col, i) => { b += `<circle cx="${bx + 24 + i * 19}" cy="${by + bh / 2}" r="5.5" fill="${col}"/>`; });
  const px = bx + 100;
  b += T(fonts.monoB, '>', { size: 22, x: px, y: by + bh / 2 + 7.5, fill: C.green });
  b += typedBlock({ phrases: cfg.typing, x: px + 26, base: by + bh / 2 + 7.5, size: 22, fill: C.yellow, curH: 24, curW: 11 });
  const st = cfg.status.toUpperCase();
  const sw_ = W_(fonts.monoB, st, 12, 1.5);
  b += `<circle class="pulse" cx="${bx + bw - 26 - sw_ - 12}" cy="${by + bh / 2}" r="4.5" fill="${C.green}"/>`;
  b += T(fonts.monoB, st, { size: 12, x: bx + bw - 22, y: by + bh / 2 + 4.2, anchor: 'end', fill: C.cream, ls: 1.5 });

  return svgDoc(W, H, {
    title: `${cfg.name} — ${cfg.roles.map((r) => r[0]).join(', ')}`,
    desc: `Banner profil ${cfg.name} (${cfg.handle}). ${cfg.typing.join('. ')}.`,
    body: b,
  });
}

/* ════════════════════════════════════════════════════════════════════════
   2) ABOUT
   ════════════════════════════════════════════════════════════════════════ */
function aboutSVG(cfg) {
  const W = 800, x0 = 24, cw = 746, gap = 22, cardW = (cw - gap) / 2, cardH = 156;
  let b = sectionTab(x0, 22, 'TENTANG SAYA', cw);
  cfg.about.forEach((a, i) => {
    const x = x0 + (i % 2) * (cardW + gap);
    const y = 76 + Math.floor(i / 2) * (cardH + gap);
    let g = card(x, y, cardW, cardH, { bar: C[a.color], barH: 10 });
    g += tile(x + 20, y + 20, 54, a.color, { ik: a.icon, k: 0.54 });
    g += chip(a.chip, x + cardW - 20, y + 24, { h: 30, size: 12, anchor: 'end', ls: 1, padX: 11 }).svg;
    g += T(fonts.grot, a.title.toUpperCase(), { size: 27, x: x + 22, y: y + 108, maxW: cardW - 44 });
    g += T(fonts.mono, a.text.toUpperCase(), { size: 13.5, x: x + 22, y: y + 132, fill: C.gray, ls: 0.8, maxW: cardW - 44 });
    b += `<g class="rise" style="animation-delay:${(i * 0.09).toFixed(2)}s">${g}</g>`;
  });
  // CTA
  const cy = 76 + 2 * (cardH + gap) + 2, cH = 76;
  b += `<g class="rise" style="animation-delay:.4s">${card(x0, cy, cw, cH, { fill: C.yellow, r: 18 })}`;
  b += `<circle cx="${x0 + 52}" cy="${cy + cH / 2}" r="25" fill="${C.ink}"/>`;
  b += icon('chat', x0 + 52 - 14, cy + cH / 2 - 14, 28, C.yellow, 2.2);
  b += T(fonts.grot, cfg.cta, { size: 22, x: x0 + 96, y: cy + cH / 2 + 8, maxW: cw - 96 - 150 });
  b += chip('CHAT SAYA', x0 + cw - 24, cy + cH / 2 - 17, { h: 34, size: 12.5, fill: C.paper, anchor: 'end', padX: 14 }).svg;
  b += '</g>';
  const H = cy + cH + 6 + 24;
  return svgDoc(W, H, { title: 'Tentang saya', desc: cfg.about.map((a) => `${a.title}: ${a.text}`).join('. ') + `. ${cfg.cta}.`, body: b });
}

/* ════════════════════════════════════════════════════════════════════════
   3) STACK
   ════════════════════════════════════════════════════════════════════════ */
const STACK_STYLE = {
  html: { brand: 'siHtml5', color: 'orange' }, css: { brand: 'siCss', color: 'blue' }, js: { brand: 'siJavascript', color: 'yellow' },
  react: { brand: 'siReact', color: 'cyan' }, vite: { brand: 'siVite', color: 'purple' }, node: { brand: 'siNodedotjs', color: 'green' },
  git: { brand: 'siGit', color: 'pink' }, github: { brand: 'siGithub', color: 'ink' }, vercel: { brand: 'siVercel', color: 'paper' },
};

function stackSVG(cfg) {
  const W = 800, cx = 24, cy = 24, cw = 744;
  const groups = cfg.stack;
  const hdr = cardHeader(cx, cy, cw, { colorKey: 'blue', ik: 'code', title: 'TECH STACK', sub: 'Teknologi yang saya gunakan sehari-hari' });
  const gx = cx + 28, gw = cw - 56, gh = 176, gap = 20;
  const tS = 76;
  let idx = 0;
  const groupSvg = (g, x, y, w, tileGap) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${gh}" rx="14" fill="${C.chart}" stroke="${C.ink}" stroke-width="3"/>`;
    const c = chip(g.label, x + 16, y + 16, { h: 30, size: 12.5, fill: C[g.color], color: ICOLOR[g.color], padX: 12 });
    s += c.svg;
    s += T(fonts.monoB, String(g.items.length).padStart(2, '0'), { size: 12, x: x + w - 18, y: y + 35, anchor: 'end', fill: C.gray, ls: 1 });
    const total = g.items.length * tS + (g.items.length - 1) * tileGap;
    let tx = x + (w - total) / 2;
    for (const [key, label] of g.items) {
      const st = STACK_STYLE[key];
      if (!st) throw new Error(`Ikon stack tidak dikenal: ${key}`);
      s += `<g class="float" style="animation-delay:${(idx++ * 0.28).toFixed(2)}s">${tile(tx, y + 62, tS, st.color, { bk: st.brand, k: 0.56, r: 14, sh: 4.5 })}</g>`;
      s += T(fonts.monoB, label.toUpperCase(), { size: 12.5, x: tx + tS / 2, y: y + 62 + tS + 24, anchor: 'middle', ls: 0.6, maxW: tS + tileGap - 6 });
      tx += tS + tileGap;
    }
    return s;
  };
  let y = hdr.next;
  let b = groupSvg(groups[0], gx, y, gw, 46);
  y += gh + gap;
  const hw = (gw - gap) / 2;
  b += groupSvg(groups[1], gx, y, hw, 24);
  b += groupSvg(groups[2], gx + hw + gap, y, hw, 24);
  const ch = y + gh + 28 - cy;
  const body = card(cx, cy, cw, ch, { r: 20, sh: 8, sw: 4 }) + hdr.svg + b;
  return svgDoc(W, cy + ch + 30, { title: 'Tech stack', desc: groups.map((g) => `${g.label}: ${g.items.map((i) => i[1]).join(', ')}`).join('. '), body });
}

/* ════════════════════════════════════════════════════════════════════════
   4) STATS
   ════════════════════════════════════════════════════════════════════════ */
function statsSVG(cfg, data) {
  const W = 800, x0 = 24, cw = 746, gap = 24;
  const v = (n) => (data ? fmtNum(n) : '—');
  let b = sectionTab(x0, 22, 'STATISTIK GITHUB', cw);
  const big = (x, y, w, h, o, delay) => {
    let s = card(x, y, w, h, { bar: C[o.color], barH: 10 });
    s += tile(x + 20, y + 20, 58, o.color, { ik: o.ik, k: 0.54 });
    s += chip(o.chip, x + w - 20, y + 24, { h: 32, size: 12.5, anchor: 'end', dot: o.dot }).svg;
    s += T(fonts.monoB, o.value, { size: 58, x: x + 22, y: y + 134, maxW: w - 44 });
    s += T(fonts.mono, o.caption, { size: 13.5, x: x + 23, y: y + 159, fill: C.gray, ls: 1.1, maxW: w - 44 });
    return `<g class="rise" style="animation-delay:${delay}s">${s}</g>`;
  };
  const cwHalf = (cw - gap) / 2, hA = 184, yA = 76;
  b += big(x0, yA, cwHalf, hA, { color: 'blue', ik: 'commit', chip: '12 BULAN', value: v(data?.contributions), caption: 'TOTAL KONTRIBUSI' }, 0);
  b += big(x0 + cwHalf + gap, yA, cwHalf, hA, { color: 'green', ik: 'repo', chip: 'PUBLIK', dot: C.green, value: v(data?.repos), caption: 'REPOSITORI AKTIF' }, 0.1);

  // bar streak
  const yB = yA + hA + gap + 2, hB = 104;
  const st = data ? streaks(data.days) : { current: NaN, longest: NaN };
  let s = card(x0, yB, cw, hB, { r: 18 });
  s += tile(x0 + 20, yB + 20, 62, 'yellow', { ik: 'flame', k: 0.56 });
  s += T(fonts.mono, 'STREAK KONTRIBUSI SAAT INI', { size: 13, x: x0 + 104, y: yB + 30, fill: C.gray, ls: 1.2 });
  const val = data ? `${st.current} HARI` : '—';
  const vw = Math.max(150, W_(fonts.monoB, val, 24) + 36);
  s += `<rect x="${x0 + 104 + 3.5}" y="${yB + 42 + 3.5}" width="${f1(vw)}" height="42" rx="8" fill="${C.ink}"/>`;
  s += `<rect x="${x0 + 104}" y="${yB + 42}" width="${f1(vw)}" height="42" rx="8" fill="${C.soft}" stroke="${C.ink}" stroke-width="3"/>`;
  s += T(fonts.monoB, val, { size: 24, x: x0 + 104 + 18, y: yB + 42 + 21 + 8.4 });
  const active = data && st.current > 0;
  const c2 = chip(!data ? 'MENUNGGU DATA' : active ? 'AKTIF' : 'ISTIRAHAT', x0 + cw - 24, yB + 32, { h: 40, size: 13, fill: C.yellow, anchor: 'end', dot: active ? C.green : C.ink, padX: 16 });
  s += c2.svg;
  s += chip(`TERPANJANG ${data ? st.longest : '—'}`, c2.x - 18, yB + 32, { h: 40, size: 13, fill: C.paper, anchor: 'end', padX: 16 }).svg;
  b += `<g class="rise" style="animation-delay:.2s">${s}</g>`;

  // 4 kartu kecil
  const yC = yB + hB + gap + 2, hC = 124, wC = (cw - 3 * 18) / 4;
  const minis = [
    { color: 'yellow', ik: 'star', value: v(data?.stars), cap: 'STARS DITERIMA' },
    { color: 'cyan', ik: 'users', value: v(data?.followers), cap: 'FOLLOWERS' },
    { color: 'purple', ik: 'pr', value: v(data?.prs), cap: 'PULL REQUEST' },
    { color: 'pink', ik: 'issue', value: v(data?.issues), cap: 'ISSUES' },
  ];
  minis.forEach((m, i) => {
    const x = x0 + i * (wC + 18);
    let g = card(x, yC, wC, hC, { r: 16, bar: C[m.color], barH: 9 });
    g += tile(x + 16, yC + 14, 40, m.color, { ik: m.ik, k: 0.56, r: 10, sh: 3, sw: 2.5 });
    g += T(fonts.monoB, m.value, { size: 30, x: x + 18, y: yC + 91, maxW: wC - 36 });
    g += T(fonts.mono, m.cap, { size: 11.5, x: x + 18, y: yC + 108, fill: C.gray, ls: 0.7, maxW: wC - 36 });
    b += `<g class="rise" style="animation-delay:${(0.3 + i * 0.08).toFixed(2)}s">${g}</g>`;
  });
  const H = yC + hC + 6 + 26;
  return svgDoc(W, H, {
    title: `Statistik GitHub ${cfg.handle}`,
    desc: data ? `Kontribusi 12 bulan: ${data.contributions}. Repositori: ${data.repos}. Streak: ${st.current} hari (terpanjang ${st.longest}). Stars: ${data.stars}. Followers: ${data.followers}. Pull request: ${data.prs}. Issues: ${data.issues}.` : 'Data statistik belum tersedia.',
    body: b,
  });
}

/* ════════════════════════════════════════════════════════════════════════
   5) ACTIVITY (grafik batang 7 hari — gaya "Statistik Penambahan")
   ════════════════════════════════════════════════════════════════════════ */
function activitySVG(cfg, data) {
  const W = 800, cx = 24, cy = 24, cw = 744;
  let days;
  if (data && data.days.length >= 14) days = data.days.slice(-14);
  else days = Array.from({ length: 14 }, (_, i) => ({ date: new Date(NOW.getTime() - (13 - i) * 864e5).toISOString().slice(0, 10), count: 0 }));
  const prev = days.slice(0, 7).reduce((a, d) => a + d.count, 0);
  const cur7 = days.slice(7);
  const curSum = cur7.reduce((a, d) => a + d.count, 0);
  const maxV = Math.max(1, ...cur7.map((d) => d.count));

  const hdr = cardHeader(cx, cy, cw, { colorKey: 'yellow', ik: 'chart', title: 'KONTRIBUSI 7 HARI', sub: 'Aktivitas kontribusi GitHub 7 hari terakhir' });
  let b = hdr.svg;
  const bx = cx + 28, by = cy + 128, bw = cw - 56, bh = 236;
  b += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="${C.chart}"/>`;
  const colW = bw / 7;
  for (let i = 1; i <= 3; i++) b += `<rect x="${bx + 2}" y="${f1(by + (bh / 4) * i)}" width="${bw - 4}" height="1.6" fill="${C.grid}"/>`;
  for (let i = 1; i < 7; i++) b += `<rect x="${f1(bx + colW * i - 0.8)}" y="${by + 2}" width="1.6" height="${bh - 4}" fill="${C.grid}"/>`;
  const base = by + bh - 20, maxH = bh - 20 - 54, barW = 62;
  cur7.forEach((d, i) => {
    const col = i % 2 === 0 ? C.blue : C.yellow;
    const h = d.count === 0 ? 8 : Math.max(14, (d.count / maxV) * maxH);
    const x = bx + colW * i + (colW - barW) / 2, y = base - h;
    b += `<g class="grow" style="animation-delay:${(i * 0.08).toFixed(2)}s"><rect x="${f1(x + 3.5)}" y="${f1(y + 3.5)}" width="${barW}" height="${f1(h)}" rx="7" fill="${C.ink}"/><rect x="${f1(x)}" y="${f1(y)}" width="${barW}" height="${f1(h)}" rx="7" fill="${col}" stroke="${C.ink}" stroke-width="3"/></g>`;
    const label = String(d.count);
    const bwid = Math.max(36, W_(fonts.monoB, label, 15) + 18);
    b += `<g class="bob" style="animation-delay:${(i * 0.22).toFixed(2)}s"><rect x="${f1(x + barW / 2 - bwid / 2)}" y="${f1(y - 42)}" width="${f1(bwid)}" height="30" rx="7" fill="${C.badge}"/>`;
    b += T(fonts.monoB, label, { size: 15, x: x + barW / 2, y: y - 42 + 15 + 5.3, anchor: 'middle', fill: C.yellow }) + '</g>';
    const isToday = i === 6;
    b += T(fonts.monoB, dmy(d.date), { size: 14, x: bx + colW * i + colW / 2, y: by + bh + 32, anchor: 'middle', fill: isToday ? C.ink : C.gray, ls: 1.2 });
  });
  b += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="none" stroke="${C.ink}" stroke-width="3.5"/>`;

  // footer
  const fy = by + bh + 54;
  let dir = 0, pct = '0%';
  if (prev === 0 && curSum > 0) { dir = 1; pct = 'BARU'; }
  else if (prev > 0) { const p = Math.round(((curSum - prev) / prev) * 100); dir = p > 0 ? 1 : p < 0 ? -1 : 0; pct = `${Math.abs(p)}%`; }
  const tw = W_(fonts.monoB, pct, 14, 0.5);
  b += `<rect x="${bx}" y="${fy}" width="${f1(tw + 52)}" height="34" rx="8" fill="${C.badge}"/>`;
  b += trend(dir, bx + 15, fy + 10, 13, C.yellow);
  b += T(fonts.monoB, pct, { size: 14, x: bx + 36, y: fy + 17 + 5, fill: C.yellow, ls: 0.5 });
  b += T(fonts.monoB, `TOTAL ${curSum}  ·  PERIODE 7 HARI TERAKHIR`, { size: 12.5, x: bx + bw - 2, y: fy + 21, anchor: 'end', fill: C.gray, ls: 1.2 });
  const ch = fy + 34 + 26 - cy;
  const body = card(cx, cy, cw, ch, { r: 20, sh: 8, sw: 4 }) + b;
  return svgDoc(W, cy + ch + 30, {
    title: 'Grafik kontribusi 7 hari',
    desc: `Kontribusi harian: ${cur7.map((d) => `${dmy(d.date)} ${d.count}`).join(', ')}. Total ${curSum} dibanding ${prev} pada 7 hari sebelumnya.`,
    body,
  });
}

/* ════════════════════════════════════════════════════════════════════════
   6) LANGUAGES
   ════════════════════════════════════════════════════════════════════════ */
function languagesSVG(cfg, data) {
  const W = 800, cx = 24, cy = 24, cw = 744;
  const hdr = cardHeader(cx, cy, cw, { colorKey: 'purple', ik: 'code', title: 'BAHASA TERATAS', sub: 'Berdasarkan ukuran kode di repositori publik' });
  let b = hdr.svg;
  const palette = ['yellow', 'blue', 'green', 'pink', 'purple', 'cyan'];
  let list = [];
  if (data && data.langs.length) {
    const total = data.langs.reduce((a, l) => a + l[1], 0);
    const top = data.langs.slice(0, 5).map(([n, s]) => ({ name: n, pct: (s / total) * 100 }));
    const rest = data.langs.slice(5).reduce((a, l) => a + l[1], 0);
    list = top;
    if (rest > 0) list.push({ name: 'Lainnya', pct: (rest / total) * 100 });
  }
  const bx = cx + 28, by = hdr.next + 4, bw = cw - 56, bh = 38;
  let ch;
  if (!list.length) {
    b += `<rect x="${bx}" y="${by}" width="${bw}" height="90" rx="14" fill="${C.chart}" stroke="${C.ink}" stroke-width="3"/>`;
    b += T(fonts.monoB, 'DATA BAHASA BELUM TERSEDIA', { size: 15, x: bx + bw / 2, y: by + 51, anchor: 'middle', fill: C.gray, ls: 1.5 });
    ch = by + 90 + 28 - cy;
  } else {
    const id = nid('lc');
    b += `<clipPath id="${id}"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="11"/></clipPath><g clip-path="url(#${id})">`;
    let x = bx;
    const totalPct = list.reduce((a, l) => a + l.pct, 0);
    list.forEach((l, i) => {
      const w = (l.pct / totalPct) * bw;
      b += `<rect x="${f1(x)}" y="${by}" width="${f1(w)}" height="${bh}" fill="${C[palette[i]]}"/>`;
      if (i > 0) b += `<rect x="${f1(x - 1.5)}" y="${by}" width="3" height="${bh}" fill="${C.ink}"/>`;
      x += w;
    });
    b += `</g><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="11" fill="none" stroke="${C.ink}" stroke-width="3.5"/>`;
    const colW = bw / 2, rowH = 44, ly = by + bh + 34;
    list.forEach((l, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x2 = bx + col * colW + (col ? 14 : 0), y2 = ly + row * rowH;
      b += `<rect x="${x2 + 2.5}" y="${y2 + 2.5}" width="20" height="20" rx="5" fill="${C.ink}"/><rect x="${x2}" y="${y2}" width="20" height="20" rx="5" fill="${C[palette[i]]}" stroke="${C.ink}" stroke-width="2.5"/>`;
      b += T(fonts.monoB, l.name.toUpperCase(), { size: 15, x: x2 + 34, y: y2 + 15.5, maxW: colW - 34 - 110, ls: 0.6 });
      b += T(fonts.monoB, `${l.pct.toFixed(1)}%`, { size: 15, x: x2 + colW - 28 - (col ? 14 : 0), y: y2 + 15.5, anchor: 'end', fill: C.gray });
    });
    ch = ly + Math.ceil(list.length / 2) * rowH + 8 - cy;
  }
  const body = card(cx, cy, cw, ch, { r: 20, sh: 8, sw: 4 }) + b;
  return svgDoc(W, cy + ch + 30, { title: 'Bahasa pemrograman teratas', desc: list.length ? list.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', ') : 'Data bahasa belum tersedia.', body });
}

/* ════════════════════════════════════════════════════════════════════════
   7) SNAKE (membungkus output Platane/snk dalam kartu bertema)
   ════════════════════════════════════════════════════════════════════════ */
function demoSnake() {
  const rnd = mulberry32(3);
  const lv = ['#E4E0D2', '#FFE98A', '#FFD600', '#F2A900', '#111111'];
  let r = '';
  for (let w = 0; w < 53; w++) for (let d = 0; d < 7; d++) {
    const l = rnd() < 0.45 ? 0 : Math.ceil(rnd() * 4);
    r += `<rect x="${w * 16}" y="${d * 16}" width="12" height="12" rx="2" fill="${lv[l]}"/>`;
  }
  r += `<rect x="0" y="0" width="12" height="12" rx="4" fill="#3B66E6"><animate attributeName="x" values="0;832" dur="10s" repeatCount="indefinite"/></rect>`;
  return `<svg viewBox="-16 -32 880 192" width="880" height="192" xmlns="http://www.w3.org/2000/svg">${r}</svg>`;
}

function snakeSVG(cfg, snakeRaw) {
  const W = 800, cx = 24, cy = 24, cw = 744;
  const hdr = cardHeader(cx, cy, cw, { colorKey: 'green', ik: 'grid', title: 'CONTRIBUTION SNAKE', sub: 'Ular melahap grafik kontribusi GitHub' });
  let b = hdr.svg;
  const bx = cx + 28, by = hdr.next + 2, bw = cw - 56;
  let inner = null, vb = null;
  if (snakeRaw) {
    const m = snakeRaw.match(/<svg[^>]*\sviewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/);
    if (m) {
      vb = m[1].trim().split(/[\s,]+/).map(Number);
      // kartu selalu krem: buang override dark-mode bawaan snk supaya palet tetap sesuai tema
      inner = m[2].replace(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
    }
  }
  let bh;
  b += `<rect x="${bx}" y="${by}" width="${bw}" height="1" fill="none"/>`;
  if (inner && vb.length === 4 && vb.every(Number.isFinite)) {
    const pad = 14;
    const iw = bw - pad * 2;
    const ih = (iw * vb[3]) / vb[2];
    bh = ih + pad * 2;
    b += `<rect x="${bx}" y="${by}" width="${bw}" height="${f1(bh)}" rx="14" fill="${C.chart}"/>`;
    b += `<svg x="${bx + pad}" y="${f1(by + pad)}" width="${f1(iw)}" height="${f1(ih)}" viewBox="${vb.join(' ')}" overflow="hidden">${inner}</svg>`;
  } else {
    bh = 120;
    b += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="${C.chart}"/>`;
    b += T(fonts.monoB, 'SNAKE BELUM TERSEDIA — JALANKAN WORKFLOW', { size: 14, x: bx + bw / 2, y: by + 66, anchor: 'middle', fill: C.gray, ls: 1.2 });
  }
  b += `<rect x="${bx}" y="${by}" width="${bw}" height="${f1(bh)}" rx="14" fill="none" stroke="${C.ink}" stroke-width="3.5"/>`;
  const ch = by + bh + 28 - cy;
  const body = card(cx, cy, cw, ch, { r: 20, sh: 8, sw: 4 }) + b;
  return svgDoc(W, cy + ch + 30, { title: 'Contribution snake', desc: 'Animasi ular memakan grafik kontribusi GitHub.', body });
}

/* ════════════════════════════════════════════════════════════════════════
   8) KONTAK
   ════════════════════════════════════════════════════════════════════════ */
function contactSVG(c) {
  const W = 270, H = 182, x = 14, y = 14, w = 234, h = 146;
  let b = card(x, y, w, h, { bar: C[c.color], barH: 10, r: 16 });
  b += tile(x + 18, y + 18, 54, c.color, { bk: c.brand, k: 0.56 });
  b += `<g class="nudge"><rect x="${x + w - 18 - 40 + 3}" y="${y + 18 + 3}" width="40" height="40" rx="10" fill="${C.yellow}"/><rect x="${x + w - 18 - 40}" y="${y + 18}" width="40" height="40" rx="10" fill="${C.ink}"/>${icon('arrow', x + w - 18 - 40 + 9, y + 27, 22, C.yellow, 2.6)}</g>`;
  b += T(fonts.grot, c.name.toUpperCase(), { size: 24, x: x + 20, y: y + 102, maxW: w - 40 });
  b += T(fonts.mono, c.handle, { size: 13.5, x: x + 20, y: y + 121, fill: C.gray, maxW: w - 40 });
  return svgDoc(W, H, { title: `${c.name} ${c.handle}`, desc: `Kontak ${c.name}: ${c.handle}`, body: b });
}

/* ════════════════════════════════════════════════════════════════════════
   9) FOOTER (ticker berjalan)
   ════════════════════════════════════════════════════════════════════════ */
function footerSVG(cfg) {
  const W = 800, x0 = 24, cw = 744, y0 = 18, h = 48;
  const size = 15, ls = 2.4;
  let seqW = 0, seq = '';
  cfg.ticker.forEach((t, i) => {
    seq += T(fonts.monoB, t, { size, x: seqW, y: y0 + h / 2 + 5.2, fill: C.yellow, ls });
    seqW += W_(fonts.monoB, t, size, ls) + 26;
    seq += `<rect x="${f1(seqW - 3)}" y="${y0 + h / 2 - 5}" width="10" height="10" fill="${i % 2 ? C.cream : C.blue}" transform="rotate(45 ${f1(seqW + 2)} ${y0 + h / 2})"/>`;
    seqW += 26;
  });
  const copies = Math.ceil(cw / seqW) + 1;
  let track = '';
  for (let i = 0; i < copies; i++) track += `<g transform="translate(${f1(i * seqW)} 0)">${seq}</g>`;
  const dur = (seqW / 55).toFixed(1);
  const id = nid('tk');
  let b = `<rect x="${x0 + 5}" y="${y0 + 5}" width="${cw}" height="${h}" rx="12" fill="${C.yellow}"/>`;
  b += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${cw}" height="${h}" rx="12"/></clipPath>`;
  b += `<rect x="${x0}" y="${y0}" width="${cw}" height="${h}" rx="12" fill="${C.ink}"/>`;
  b += `<g clip-path="url(#${id})"><g transform="translate(${x0 + 10} 0)"><g class="tick">${track}</g></g></g>`;
  const d = NOW;
  const stamp = `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}  ·  ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
  b += `<circle class="pulse" cx="${W / 2 - W_(fonts.monoB, 'DIPERBARUI OTOMATIS  ' + stamp, 11, 1.2) / 2 - 12}" cy="${y0 + h + 28}" r="3.6" fill="${C.green}"/>`;
  b += T(fonts.monoB, 'DIPERBARUI OTOMATIS  ' + stamp, { size: 11, x: W / 2, y: y0 + h + 32, anchor: 'middle', fill: C.gray, ls: 1.2 });
  const H = y0 + h + 52;
  return svgDoc(W, H, {
    title: 'Footer profil', desc: `${cfg.ticker.join(', ')}. Diperbarui otomatis ${stamp}.`, body: b,
    css: `.tick{animation:tick ${dur}s linear infinite}@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-${f1(seqW)}px)}}`,
  });
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════════════ */
async function main() {
  let data = null;
  if (DEMO) data = demoData();
  else {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) console.log('::warning::GH_TOKEN tidak ada — kartu statistik dibuat tanpa data.');
    else {
      try { data = await fetchData(CONFIG.username, token); }
      catch (e) { console.log(`::warning::Gagal mengambil data GitHub: ${e.message}`); }
    }
  }

  fs.mkdirSync(OUT, { recursive: true });
  const snakePath = arg('--snake', path.join(OUT, 'github-snake.svg'));
  let snakeRaw = null;
  if (fs.existsSync(snakePath)) snakeRaw = fs.readFileSync(snakePath, 'utf8');
  else if (DEMO) snakeRaw = demoSnake();

  const files = {
    'banner.svg': bannerSVG(CONFIG),
    'about.svg': aboutSVG(CONFIG),
    'stack.svg': stackSVG(CONFIG),
    'stats.svg': statsSVG(CONFIG, data),
    'activity.svg': activitySVG(CONFIG, data),
    'languages.svg': languagesSVG(CONFIG, data),
    'snake-card.svg': snakeSVG(CONFIG, snakeRaw),
    'footer.svg': footerSVG(CONFIG),
  };
  for (const c of CONFIG.contacts) files[c.file] = contactSVG(c);

  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT, name), svg);
    console.log(`  ${name.padEnd(24)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
  console.log(`Selesai → ${OUT}/ ${DEMO ? '(data demo)' : data ? '(data asli)' : '(tanpa data)'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
