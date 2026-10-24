import fs from "node:fs";
import path from "node:path";

const publicMediaDir = path.join(process.cwd(), "public", "media");
const coversDir = path.join(publicMediaDir, "covers");
const avatarsDir = path.join(publicMediaDir, "avatars");
const bannersDir = path.join(publicMediaDir, "banners");
const audioDir = path.join(publicMediaDir, "audio");
const excerptsDir = path.join(publicMediaDir, "excerpts");

for (const dir of [
  publicMediaDir,
  coversDir,
  avatarsDir,
  bannersDir,
  audioDir,
  excerptsDir,
]) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Bespoke Editorial Book & Issue Covers (SVG 600x900)
const bookCovers = [
  {
    file: "the-glass-meridian.svg",
    bg1: "#0B132B",
    bg2: "#162447",
    accent: "#C89D54",
    imprint: "MERIDIAN HOUSE PRESS",
    title1: "THE GLASS",
    title2: "MERIDIAN",
    subtitle: "A Novel of Cartography & the North Sea",
    author: "ELEANOR VANCE",
    motif: "compass",
  },
  {
    file: "the-saltwater-ledger.svg",
    bg1: "#102532",
    bg2: "#0B132B",
    accent: "#D4A359",
    imprint: "HARBOUR & LOOM",
    title1: "THE SALTWATER",
    title2: "LEDGER",
    subtitle: "Three Generations Along the Gold Coast",
    author: "AMARA OSEI",
    motif: "waves",
  },
  {
    file: "atlas-of-quiet-cities.svg",
    bg1: "#141B2D",
    bg2: "#1E293B",
    accent: "#B87333",
    imprint: "NORTHLIGHT EDITIONS",
    title1: "ATLAS OF",
    title2: "QUIET CITIES",
    subtitle: "Dispatches from Unmapped Municipalities",
    author: "JULIAN THORNE",
    motif: "arch",
  },
  {
    file: "winter-harmonics.svg",
    bg1: "#1A2238",
    bg2: "#0F172A",
    accent: "#E2C07D",
    imprint: "ATELIER BORÉAL",
    title1: "WINTER",
    title2: "HARMONICS",
    subtitle: "Poems & Lyric Sequences in Two Languages",
    author: "CLAIRE MOREAU",
    motif: "peaks",
  },
  {
    file: "republic-of-typesetters.svg",
    bg1: "#1F1916",
    bg2: "#0B132B",
    accent: "#C89D54",
    imprint: "FJORD & FOLIO PRESS",
    title1: "THE REPUBLIC OF",
    title2: "TYPESETTERS",
    subtitle: "Independent Pamphleteers & Nordic Letters",
    author: "SØREN LINDQVIST",
    motif: "type",
  },
  {
    file: "issue-13.svg",
    bg1: "#0B132B",
    bg2: "#1C2541",
    accent: "#C89D54",
    imprint: "LVN DIGITAL MAGAZINE · ISSUE NO. 13",
    title1: "CARTOGRAPHIES",
    title2: "OF VOICE",
    subtitle: "Place, Polyphony & the Contemporary Novel",
    author: "AUTUMN 2026 EDITION",
    motif: "compass",
  },
  {
    file: "issue-14.svg",
    bg1: "#141B2D",
    bg2: "#0B132B",
    accent: "#B87333",
    imprint: "LVN DIGITAL MAGAZINE · ISSUE NO. 14",
    title1: "ARCHITECTURE",
    title2: "OF MEMORY",
    subtitle: "Archives, Inheritance & Unreliable Histories",
    author: "WINTER 2026 · OPEN FOR SUBMISSIONS",
    motif: "arch",
  },
  {
    file: "issue-15.svg",
    bg1: "#0F1E2E",
    bg2: "#0B132B",
    accent: "#C89D54",
    imprint: "LVN DIGITAL MAGAZINE · ISSUE NO. 15",
    title1: "LANGUAGES",
    title2: "IN TRANSIT",
    subtitle: "World Literature & Borderless Poetics",
    author: "WINTER 2027 EDITION",
    motif: "waves",
  },
];

for (const c of bookCovers) {
  let centerGraphic = "";
  if (c.motif === "compass") {
    centerGraphic = `
      <circle cx="300" cy="430" r="115" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.55"/>
      <circle cx="300" cy="430" r="85" fill="none" stroke="${c.accent}" stroke-width="1" stroke-dasharray="4 6" stroke-opacity="0.45"/>
      <line x1="300" y1="290" x2="300" y2="570" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
      <line x1="160" y1="430" x2="440" y2="430" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
      <polygon points="300,335 314,430 300,525 286,430" fill="${c.accent}" fill-opacity="0.22" stroke="${c.accent}" stroke-width="1.5"/>
    `;
  } else if (c.motif === "waves") {
    centerGraphic = `
      <circle cx="300" cy="430" r="105" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
      <path d="M 195 410 Q 247 380 300 410 T 405 410" fill="none" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.7"/>
      <path d="M 195 440 Q 247 410 300 440 T 405 440" fill="none" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.5"/>
      <path d="M 195 470 Q 247 440 300 470 T 405 470" fill="none" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.35"/>
    `;
  } else if (c.motif === "arch") {
    centerGraphic = `
      <path d="M 215 535 L 215 400 A 85 85 0 0 1 385 400 L 385 535 Z" fill="none" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.65"/>
      <path d="M 240 535 L 240 410 A 60 60 0 0 1 360 410 L 360 535 Z" fill="${c.accent}" fill-opacity="0.12" stroke="${c.accent}" stroke-width="1.2" stroke-opacity="0.45"/>
    `;
  } else {
    centerGraphic = `
      <rect x="200" y="340" width="200" height="180" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.55"/>
      <line x1="225" y1="380" x2="375" y2="380" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.6"/>
      <line x1="225" y1="415" x2="355" y2="415" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.45"/>
      <line x1="225" y1="450" x2="375" y2="450" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.45"/>
      <line x1="225" y1="485" x2="330" y2="485" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.45"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg1}"/>
      <stop offset="100%" stop-color="${c.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <rect x="34" y="34" width="532" height="832" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-opacity="0.45"/>
  <rect x="46" y="46" width="508" height="808" fill="none" stroke="#F9F6F0" stroke-width="0.6" stroke-opacity="0.2"/>
  <text x="300" y="105" text-anchor="middle" fill="${c.accent}" font-family="Georgia, serif" font-size="13" letter-spacing="4">${c.imprint}</text>
  <line x1="240" y1="128" x2="360" y2="128" stroke="${c.accent}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="300" y="195" text-anchor="middle" fill="#F9F6F0" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="bold" letter-spacing="2">${c.title1}</text>
  <text x="300" y="248" text-anchor="middle" fill="${c.accent}" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="bold" letter-spacing="2">${c.title2}</text>
  <text x="300" y="286" text-anchor="middle" fill="#F9F6F0" fill-opacity="0.72" font-family="Georgia, serif" font-style="italic" font-size="16">${c.subtitle}</text>
  ${centerGraphic}
  <line x1="220" y1="735" x2="380" y2="735" stroke="${c.accent}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="300" y="780" text-anchor="middle" fill="#F9F6F0" font-family="Georgia, serif" font-size="21" letter-spacing="3.5">${c.author}</text>
  <text x="300" y="820" text-anchor="middle" fill="${c.accent}" fill-opacity="0.7" font-family="sans-serif" font-size="10" letter-spacing="3">LITERARY VOICES NETWORK</text>
</svg>`;

  fs.writeFileSync(path.join(coversDir, c.file), svg, "utf8");
}

// 2. Author Portraits (SVG 400x400)
const avatars = [
  { file: "eleanor-vance.svg", initials: "EV", name: "Eleanor Vance", bg: "#0B132B", accent: "#C89D54" },
  { file: "marcus-sterling.svg", initials: "MS", name: "Marcus Sterling", bg: "#141B2D", accent: "#B87333" },
  { file: "amara-osei.svg", initials: "AO", name: "Amara Osei", bg: "#102532", accent: "#D4A359" },
  { file: "julian-thorne.svg", initials: "JT", name: "Julian Thorne", bg: "#1E293B", accent: "#C89D54" },
  { file: "claire-moreau.svg", initials: "CM", name: "Claire Moreau", bg: "#1A2238", accent: "#E2C07D" },
  { file: "soren-lindqvist.svg", initials: "SL", name: "Søren Lindqvist", bg: "#1F1916", accent: "#C89D54" },
  { file: "nadia-khoury.svg", initials: "NK", name: "Nadia Khoury", bg: "#0B132B", accent: "#B87333" },
  { file: "default-portrait.svg", initials: "LVN", name: "LVN Member", bg: "#0B132B", accent: "#C89D54" },
];

for (const a of avatars) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${a.bg}"/>
  <circle cx="200" cy="200" r="176" fill="none" stroke="${a.accent}" stroke-width="2" stroke-opacity="0.5"/>
  <circle cx="200" cy="200" r="160" fill="${a.accent}" fill-opacity="0.08"/>
  <text x="200" y="222" text-anchor="middle" fill="#F9F6F0" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="bold" letter-spacing="4">${a.initials}</text>
  <text x="200" y="330" text-anchor="middle" fill="${a.accent}" font-family="Georgia, serif" font-size="13" letter-spacing="3">${a.name.toUpperCase()}</text>
</svg>`;
  fs.writeFileSync(path.join(avatarsDir, a.file), svg, "utf8");
}

// 3. Editorial Banner & Hero Poster SVG (1920x1080)
const heroPosterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070C1C"/>
      <stop offset="50%" stop-color="#0B132B"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="72%" cy="38%" r="45%">
      <stop offset="0%" stop-color="#C89D54" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#C89D54" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#heroGrad)"/>
  <rect width="1920" height="1080" fill="url(#goldGlow)"/>
  <g stroke="#C89D54" stroke-opacity="0.16" fill="none">
    <circle cx="1380" cy="440" r="240" stroke-width="1.5"/>
    <circle cx="1380" cy="440" r="340" stroke-width="1" stroke-dasharray="6 10"/>
    <circle cx="1380" cy="440" r="460" stroke-width="0.8"/>
    <line x1="1380" y1="0" x2="1380" y2="1080" stroke-width="0.8"/>
    <line x1="0" y1="440" x2="1920" y2="440" stroke-width="0.8"/>
  </g>
  <g fill="#F9F6F0" fill-opacity="0.04" font-family="Georgia, serif" font-style="italic" font-size="220">
    <text x="1120" y="510">LVN</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicMediaDir, "lvn-hero-poster.svg"), heroPosterSvg, "utf8");
fs.writeFileSync(path.join(bannersDir, "editorial-desk.svg"), heroPosterSvg, "utf8");

// 4. Generate a real playable 4-second ambient chord WAV file (/media/audio/lvn-studio-preview.wav)
function createStudioAudioWav(filePath: string): void {
  const sampleRate = 22050;
  const durationSeconds = 4;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Warm A-major seventh studio chime chord (A3=220Hz, C#4=277.18Hz, E4=329.63Hz, G#4=415.30Hz)
  const freqs = [220.0, 277.18, 329.63, 415.3];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t / 0.15) * Math.exp(-t * 0.65);
    let sample = 0;
    for (const f of freqs) {
      sample += Math.sin(2 * Math.PI * f * t);
    }
    sample = (sample / freqs.length) * envelope * 0.35;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

createStudioAudioWav(path.join(audioDir, "lvn-studio-preview.wav"));

// 5. Generate a valid minimal PDF sample excerpt (/media/excerpts/the-glass-meridian-sample.pdf)
const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>
endobj
5 0 obj
<< /Length 168 >>
stream
BT
/F1 18 Tf
72 700 Td
(THE GLASS MERIDIAN - Authorized Excerpt) Tj
/F1 12 Tf
0 -32 Td
(By Eleanor Vance - Literary Voices Network Meridian House Press) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
515
%%EOF`;

fs.writeFileSync(path.join(excerptsDir, "the-glass-meridian-sample.pdf"), minimalPdf, "utf8");

console.log("Generated LVN SVG covers, portraits, poster, studio audio WAV, and PDF excerpt.");

