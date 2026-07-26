import fs from "fs";
import path from "path";

const targetDir = path.resolve("assets/themes/comic");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function createComicSvg(id, name, stage, color, shapeSymbol, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="burst-${id}-${stage}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF8E8"/>
      <stop offset="100%" stop-color="${color}"/>
    </radialGradient>
  </defs>

  <!-- Comic Action Frame -->
  <rect x="5" y="5" width="190" height="190" rx="20" ry="20" fill="url(#burst-${id}-${stage})" stroke="#202020" stroke-width="6"/>

  <!-- Comic Starburst / Action Lines -->
  <polygon points="100,20 120,70 170,40 140,90 190,120 135,135 150,185 100,150 50,185 65,135 10,120 60,90 30,40 80,70" fill="rgba(255,255,255,0.4)" stroke="#202020" stroke-width="3"/>

  <!-- Main Hero Icon Shape -->
  <g transform="translate(50, 45)">
    <circle cx="50" cy="50" r="42" fill="${color}" stroke="#202020" stroke-width="6"/>
    <text x="50" y="65" font-family="'Fredoka', sans-serif" font-size="44" font-weight="900" text-anchor="middle" fill="#202020">${shapeSymbol}</text>
  </g>

  <!-- Comic Caption Box -->
  <rect x="20" y="145" width="160" height="38" rx="8" fill="#FFF8E8" stroke="#202020" stroke-width="4"/>
  <text x="100" y="168" font-family="'Fredoka', sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#202020">${name.toUpperCase()} ${stage > 0 ? 'St.' + stage : ''}</text>
</svg>`;
}

const charactersSpec = [
  { id: "res_x6", name: "Officer Paws", color: "#FFD166", symbol: "🐶", stages: 1 },
  { id: "res_x7", name: "Chippy", color: "#F4A261", symbol: "🐿️", stages: 1 },
  { id: "res_x8", name: "Sprout Hero", color: "#06D6A0", symbol: "🌱", stages: 1 },
  { id: "res_x9", name: "Blaze Kid", color: "#EF476F", symbol: "🔥", stages: 1 },
  { id: "res_x10", name: "Splash Cap", color: "#118AB2", symbol: "🐢", stages: 1 },

  { id: "embercub", name: "Ember Pup", color: "#FF8C42", symbol: "🐕", stages: 3 },
  { id: "leafling", name: "Leafy Bud", color: "#4E9F3D", symbol: "🌿", stages: 4 },
  { id: "bubblit", name: "Bubble Tad", color: "#4D96FF", symbol: "🐸", stages: 4 },
  { id: "sparkitty", name: "Zap Cat", color: "#FFD93D", symbol: "⚡", stages: 2 },
  { id: "coraly", name: "Coral Champ", color: "#FF6B6B", symbol: "🪸", stages: 2 },
  { id: "frosty", name: "Frost Fox", color: "#6BCB77", symbol: "🦊", stages: 2 },
  { id: "glimmowl", name: "Glimmer Owl", color: "#4D96FF", symbol: "🦉", stages: 4 },
  { id: "duskit", name: "Dusk Knight", color: "#9B51E0", symbol: "🌙", stages: 2 },
  { id: "pebblin", name: "Rocky Puncher", color: "#BDBDBD", symbol: "🪨", stages: 4 },
  { id: "wispurr", name: "Psi Cat", color: "#F2994A", symbol: "🔮", stages: 2 },
  { id: "glowmoth", name: "Glow Flutter", color: "#27AE60", symbol: "🦋", stages: 4 },
  { id: "tidalpup", name: "Wave Hound", color: "#2F80ED", symbol: "🌊", stages: 2 },
  { id: "starhorn", name: "Cosmic Titan", color: "#EB5757", symbol: "🌟", stages: 4 },
  { id: "aurelio", name: "Star Sprite", color: "#F2C94C", symbol: "✨", stages: 2 },
  { id: "moonkit", name: "Ribbon Tail", color: "#FF75C3", symbol: "🎀", stages: 2 }
];

let generatedCount = 0;

for (const c of charactersSpec) {
  if (c.stages === 1) {
    const filename = `${c.id}.svg`;
    const svgContent = createComicSvg(c.id, c.name, 0, c.color, c.symbol);
    fs.writeFileSync(path.join(targetDir, filename), svgContent, "utf8");
    generatedCount++;
  } else {
    for (let st = 1; st <= c.stages; st++) {
      const filename = `${c.id}_st${st}.svg`;
      const svgContent = createComicSvg(c.id, c.name, st, c.color, c.symbol);
      fs.writeFileSync(path.join(targetDir, filename), svgContent, "utf8");
      generatedCount++;
    }
  }
}

console.log(`Generated ${generatedCount} Comic Quest SVG assets!`);
