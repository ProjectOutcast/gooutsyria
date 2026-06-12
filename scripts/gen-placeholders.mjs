// Generates lightweight SVG placeholder photos for seed/demo data.
import { mkdirSync, writeFileSync } from "fs";

const palettes = [
  ["#7a1f1f", "#d22b2b"],
  ["#92400e", "#f59e0b"],
  ["#9a3412", "#fb923c"],
  ["#3f2d23", "#a16207"],
  ["#14532d", "#4ade80"],
  ["#1e3a5f", "#60a5fa"],
];
const emojis = ["🍽️", "🥙", "🍢", "🍕", "☕", "🍰", "🦐", "🍜", "🍳", "🥖", "🥤", "🫖", "🍔", "🌯", "🧆", "🍧"];

mkdirSync("public/placeholders", { recursive: true });

for (let i = 0; i < 16; i++) {
  const [c1, c2] = palettes[i % palettes.length];
  const emoji = emojis[i % emojis.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
</linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<circle cx="400" cy="280" r="150" fill="rgba(255,255,255,0.12)"/>
<text x="400" y="340" font-size="160" text-anchor="middle">${emoji}</text>
</svg>`;
  writeFileSync(`public/placeholders/p${i + 1}.svg`, svg);
}
console.log("generated 16 placeholder SVGs");

// portrait "photographed menu page" placeholders
const menuTitles = ["المقبلات", "المشاوي", "الأطباق الرئيسية", "المشروبات", "الحلويات", "العروض"];
for (let i = 0; i < 6; i++) {
  const rows = Array.from({ length: 9 }, (_, r) => {
    const y = 150 + r * 58;
    return `<rect x="60" y="${y}" width="${360 - (r % 3) * 40}" height="10" rx="5" fill="#D8C8BC"/>
<rect x="490" y="${y}" width="60" height="10" rx="5" fill="#C9503A"/>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<rect width="600" height="800" fill="#FDFBF6"/>
<rect x="20" y="20" width="560" height="760" fill="none" stroke="#EADBD2" stroke-width="2" rx="14"/>
<text x="300" y="90" font-size="34" text-anchor="middle" fill="#B5392C" font-family="sans-serif" font-weight="bold">${menuTitles[i]}</text>
<line x1="200" y1="112" x2="400" y2="112" stroke="#E14434" stroke-width="3"/>
${rows}
<text x="300" y="760" font-size="14" text-anchor="middle" fill="#B7A79E" font-family="monospace">صفحة ${i + 1}</text>
</svg>`;
  writeFileSync(`public/placeholders/menu${i + 1}.svg`, svg);
}
console.log("generated 6 menu-page SVGs");

// dark hero background: warm blurred "table spread" mood, design-scrim friendly
const blobs = [
  [120, 180, 130, "#E14434", 0.35], [430, 90, 90, "#F59E0B", 0.28],
  [760, 200, 150, "#C9503A", 0.3], [1080, 110, 100, "#16A34A", 0.18],
  [1350, 230, 140, "#E14434", 0.3], [260, 420, 110, "#F97316", 0.22],
  [620, 480, 160, "#B5392C", 0.32], [980, 430, 100, "#F5A623", 0.2],
  [1290, 500, 130, "#7A2418", 0.45], [80, 560, 90, "#D97706", 0.18],
].map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`).join("\n");
const rings = [
  [240, 300, 70], [700, 170, 55], [1150, 330, 80], [480, 540, 60], [1390, 120, 45],
].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FFF" stroke-opacity="0.07" stroke-width="10"/>
<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="#FFF" stroke-opacity="0.05" stroke-width="4"/>`).join("\n");
const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="640" viewBox="0 0 1500 640">
<rect width="1500" height="640" fill="#140D0B"/>
<g filter="url(#b)">${blobs}</g>
${rings}
<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="46"/></filter></defs>
</svg>`;
writeFileSync("public/hero-bg.svg", hero);
console.log("generated hero background");
