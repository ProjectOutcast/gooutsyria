// Generates SVG menu-page + hero placeholders for seed/demo data.
// (Restaurant photo placeholders p1..p16 are real generated images committed
// under public/placeholders/.)
import { mkdirSync, writeFileSync } from "fs";

mkdirSync("public/placeholders", { recursive: true });

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
