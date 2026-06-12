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
