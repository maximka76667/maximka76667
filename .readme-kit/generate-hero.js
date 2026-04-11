#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const W = 854;
const H = 220;
const CX = W / 2;
const CY = H / 2;

const PHI = 1.6180339887;

function lissajousFrames({ a, b, numFrames, N, rx, ry, noiseX, noiseY, driftX = 0, driftY = 0 }) {
  const frames = [];
  for (let f = 0; f <= numFrames; f++) {
    const delta = (f / numFrames) * Math.PI * 2;
    const cx = CX + driftX * Math.sin(delta * 0.4 + 1.2);
    const cy = CY + driftY * Math.sin(delta * 0.3 + 0.7);
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      let x = cx + rx * Math.sin(a * t + delta);
      let y = cy + ry * Math.sin(b * t);
      x += noiseX * Math.sin(i * PHI * 2.618 + delta * 1.414) * Math.sin(i * 0.083 + delta * 0.5);
      y += noiseY * Math.sin(i * PHI * 1.618 + delta * 2.236) * Math.cos(i * 0.097 + delta * 0.3);
      x += (noiseX * 0.4) * Math.sin(i * PHI * 4.236 + delta * 0.7);
      y += (noiseY * 0.4) * Math.cos(i * PHI * 3.141 + delta * 0.9);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    frames.push(pts.join(" "));
  }
  return frames.join(";");
}

const N = 90;
const FRAMES = 12;

const framesA = lissajousFrames({ a: 3.02, b: 2.0, numFrames: FRAMES, N, rx: W * 0.48, ry: H * 0.44, noiseX: 18, noiseY: 12, driftX: 12, driftY: 10 });
const framesB = lissajousFrames({ a: 5.03, b: 4.0, numFrames: FRAMES, N, rx: W * 0.46, ry: H * 0.42, noiseX: 14, noiseY: 10, driftX: -10, driftY: 8 });
const framesC = lissajousFrames({ a: 7.05, b: 6.0, numFrames: FRAMES, N, rx: W * 0.44, ry: H * 0.40, noiseX: 10, noiseY: 8, driftX: 8, driftY: -6 });

const initA = framesA.split(";")[0];
const initB = framesB.split(";")[0];
const initC = framesC.split(";")[0];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Glow filters for dark mode -->
    <filter id="ga" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
      <feBlend in="SourceGraphic" in2="blur" mode="screen"/>
    </filter>
    <filter id="gb" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
      <feBlend in="SourceGraphic" in2="blur" mode="screen"/>
    </filter>
    <filter id="gc" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feBlend in="SourceGraphic" in2="blur" mode="screen"/>
    </filter>

    <clipPath id="clip">
      <rect width="${W}" height="${H}" rx="6"/>
    </clipPath>
  </defs>

  <style>
    /* Light mode — deep saturated colors, no glow */
    .ca { stroke: #007a8c; }
    .cb { stroke: #aa0077; }
    .cc { stroke: #007740; }

    /* Dark mode — neon with glow */
    @media (prefers-color-scheme: dark) {
      .ca { stroke: #00eedd; filter: url(#ga); }
      .cb { stroke: #ee00bb; filter: url(#gb); }
      .cc { stroke: #00ff77; filter: url(#gc); }
    }
  </style>

  <!-- No background rect — fully transparent -->

  <g clip-path="url(#clip)">
    <polyline class="ca" fill="none" stroke-width="1.3" stroke-opacity="0.85" points="${initA}">
      <animate attributeName="points" values="${framesA}" dur="26s" repeatCount="indefinite"/>
    </polyline>

    <polyline class="cb" fill="none" stroke-width="1.2" stroke-opacity="0.85" points="${initB}">
      <animate attributeName="points" values="${framesB}" dur="18s" repeatCount="indefinite"/>
    </polyline>

    <polyline class="cc" fill="none" stroke-width="0.9" stroke-opacity="0.70" points="${initC}">
      <animate attributeName="points" values="${framesC}" dur="22s" repeatCount="indefinite"/>
    </polyline>
  </g>

</svg>`;

const outPath = path.join(__dirname, "assets", "hero.svg");
fs.writeFileSync(outPath, svg, "utf8");
const kb = (Buffer.byteLength(svg, "utf8") / 1024).toFixed(1);
console.log(`Written: ${outPath} (${kb} KB)`);
