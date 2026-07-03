// Generates SVG placeholder imagery for the Norfu storefront.
// Run: node scripts/generate-images.mjs
// Replace the generated files in /public with real photography when available.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "src/data/catalog.json"), "utf8"));

const productsDir = join(root, "public/products");
const bannersDir = join(root, "public/banners");
mkdirSync(productsDir, { recursive: true });
mkdirSync(bannersDir, { recursive: true });

// Garment silhouettes drawn in a 200x200 box, centered.
const SILHOUETTES = {
  tshirt: `M63 38 L88 28 Q100 44 112 28 L137 38 L168 72 L142 94 L136 74 L138 172 L62 172 L64 74 L58 94 L32 72 Z`,
  polo: `M63 38 L88 28 L100 62 L112 28 L137 38 L168 72 L142 94 L136 74 L138 172 L62 172 L64 74 L58 94 L32 72 Z
         M88 28 L94 40 L100 62 L106 40 L112 28`,
  shirt: `M60 40 L86 26 L100 40 L114 26 L140 40 L170 78 L144 98 L138 76 L140 178 L60 178 L62 76 L56 98 L30 78 Z`,
  hoodie: `M64 46 Q64 20 100 20 Q136 20 136 46 L140 48 L170 80 L144 100 L138 80 L140 176 L60 176 L62 80 L56 100 L30 80 L60 48 Z
           M82 46 Q82 32 100 32 Q118 32 118 46 Q110 56 100 56 Q90 56 82 46 Z`,
  jeans: `M68 24 L132 24 L142 176 L110 176 L100 84 L90 176 L58 176 Z`,
  shorts: `M64 40 L136 40 L146 118 L108 118 L100 74 L92 118 L54 118 Z`,
  dress: `M76 26 L100 40 L124 26 L134 58 L120 72 L142 176 L58 176 L80 72 L66 58 Z`,
  jacket: `M60 40 L92 26 L100 44 L108 26 L140 40 L170 78 L144 98 L138 76 L140 178 L104 178 L100 60 L96 178 L60 178 L62 76 L56 98 L30 78 Z`,
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const BG_TONES = ["#F1EEE9", "#EDE9E1", "#EAE7E2", "#F0ECE4", "#ECE9E4", "#EFEAE2"];

function productSvg(product, variant, index) {
  const tone = product.colors[0].hex;
  const bg = BG_TONES[index % BG_TONES.length];
  const path = SILHOUETTES[product.silhouette] ?? SILHOUETTES.tshirt;
  const dark = shade(tone, -28);
  const isB = variant === "b";
  // Variant B: closer crop + diagonal weave texture, reads as an alternate shot.
  const scale = isB ? 5.2 : 4.2;
  const tx = isB ? 450 - 100 * scale : 450 - 100 * scale;
  const ty = isB ? 520 - 100 * scale : 600 - 100 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${isB ? shade(bg, -8) : bg}"/>
      <stop offset="1" stop-color="${shade(bg, isB ? -20 : -10)}"/>
    </linearGradient>
    <linearGradient id="garment" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(tone, 14)}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <pattern id="weave" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="14" fill="none"/>
      <line x1="0" y1="0" x2="0" y2="14" stroke="${shade(tone, 30)}" stroke-width="1" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="900" height="1200" fill="url(#bg)"/>
  <ellipse cx="450" cy="${isB ? 1030 : 1010}" rx="300" ry="46" fill="${shade(bg, -26)}" opacity="0.5"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    <path d="${path}" fill="url(#garment)" stroke="${dark}" stroke-width="1.4" stroke-linejoin="round" fill-rule="evenodd"/>
    ${isB ? `<path d="${path}" fill="url(#weave)" fill-rule="evenodd"/>` : ""}
  </g>
  <text x="450" y="1148" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="12" fill="#9a948a">NORFU STUDIO</text>
</svg>`;
}

function bannerSvg({ w, h, from, to, arc, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.32}" r="${h * 0.42}" fill="none" stroke="${arc}" stroke-width="2" opacity="0.5"/>
  <circle cx="${w * 0.78}" cy="${h * 0.32}" r="${h * 0.58}" fill="none" stroke="${arc}" stroke-width="1.4" opacity="0.35"/>
  <circle cx="${w * 0.16}" cy="${h * 0.85}" r="${h * 0.5}" fill="${arc}" opacity="0.10"/>
  <text x="${w * 0.5}" y="${h * 0.94}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.032)}" letter-spacing="10" fill="#ffffff" opacity="0.55">${label}</text>
</svg>`;
}

catalog.products.forEach((p, i) => {
  writeFileSync(join(productsDir, `${p.id}-a.svg`), productSvg(p, "a", i));
  writeFileSync(join(productsDir, `${p.id}-b.svg`), productSvg(p, "b", i));
});

const banners = [
  { file: "hero-1.svg", w: 1920, h: 1080, from: "#2E2A26", to: "#6B5D4E", arc: "#E8DFD2", label: "SUMMER 26 CAMPAIGN" },
  { file: "hero-2.svg", w: 1920, h: 1080, from: "#3B4A56", to: "#8FA8BC", arc: "#EDF2F6", label: "COASTLINE EDIT" },
  { file: "cat-men.svg", w: 900, h: 1200, from: "#33383F", to: "#6B7280", arc: "#E5E7EB", label: "MEN" },
  { file: "cat-women.svg", w: 900, h: 1200, from: "#8C6A55", to: "#D9B8B4", arc: "#F6EDEA", label: "WOMEN" },
  { file: "cat-juniors.svg", w: 900, h: 1200, from: "#8A7B3F", to: "#E5C55B", arc: "#F7F0D8", label: "JUNIORS" },
  { file: "cat-sale.svg", w: 900, h: 1200, from: "#7A1F1F", to: "#C0392B", arc: "#F7DCD8", label: "SALE" },
  { file: "promo-1.svg", w: 1400, h: 900, from: "#4C5B4A", to: "#A8B5A0", arc: "#EEF2EC", label: "LINEN SHOP" },
  { file: "promo-2.svg", w: 1400, h: 900, from: "#23262E", to: "#5A6E8C", arc: "#E3E9F1", label: "DENIM LAB" },
];
banners.forEach((b) => writeFileSync(join(bannersDir, b.file), bannerSvg(b)));

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <text x="8" y="86" font-family="Arial Black, Arial, sans-serif" font-size="76" font-weight="900" letter-spacing="14" fill="#111111">NORFU</text>
  <rect x="10" y="100" width="120" height="6" fill="#111111"/>
</svg>`;
writeFileSync(join(root, "public/norfu-logo.svg"), logo);

console.log(`Generated ${catalog.products.length * 2} product images, ${banners.length} banners, 1 logo.`);
