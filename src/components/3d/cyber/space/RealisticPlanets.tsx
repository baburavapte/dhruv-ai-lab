"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Procedural Pseudo-Noise generator for realistic fractal continents and terrain
 */
function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < octaves; o++) {
    val +=
      Math.sin(x * freq * 3.7 + Math.cos(y * freq * 2.9)) *
      Math.cos(y * freq * 3.3 + Math.sin(x * freq * 2.1)) *
      amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return (val + 1.0) * 0.5; // Normalized [0, 1]
}

// Pre-allocate helper colors for smooth gradient interpolation
function lerpColor(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  t: number
): [number, number, number] {
  const clampT = Math.max(0, Math.min(1, t));
  return [
    Math.round(r1 + (r2 - r1) * clampT),
    Math.round(g1 + (g2 - g1) * clampT),
    Math.round(b1 + (b2 - b1) * clampT),
  ];
}

/**
 * Photorealistic Procedural Texture for Planet A (Colossal Blue Terrestrial World)
 * Features:
 * - Natural continental coasts with smooth anti-aliased gradient blending
 * - Biome-graded terrain: lush tropical greens, arid tan deserts, snow-capped alpine ridges
 * - Deep navy/cobalt ocean with turquoise coastal shallows
 * - Night hemisphere with thousands of glowing golden city lights clustered along coastlines
 * - Multilayer swirling white cyclonic clouds and storm fronts
 */
function createEarthlikePlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(2048, 1024);
  const data = imgData.data;

  // 1. Generate base planetary terrain and oceans using multi-octave FBM with anti-aliasing
  for (let y = 0; y < 1024; y++) {
    const ny = y / 1024;
    const lat = (ny - 0.5) * Math.PI; // Latitude [-PI/2, PI/2]
    const cosLat = Math.cos(lat);

    for (let x = 0; x < 2048; x++) {
      const nx = x / 2048;
      const lon = nx * Math.PI * 2; // Longitude [0, 2PI]

      // Sphere coordinates for seamless noise
      const sx = cosLat * Math.cos(lon) * 2.8;
      const sy = Math.sin(lat) * 2.8;
      const sz = cosLat * Math.sin(lon) * 2.8;

      const elevation = fbm(sx + 1.2, sy + 0.8, 6);
      const idx = (y * 2048 + x) * 4;

      // Polar ice caps
      const isPolar = ny < 0.09 || ny > 0.91;
      const polarDist = ny < 0.09 ? (0.09 - ny) / 0.09 : (ny - 0.91) / 0.09;

      let r = 0;
      let g = 0;
      let b = 0;

      if (elevation < 0.48) {
        // Ocean: smooth gradient from coastal turquoise to azure to deep cobalt abyss
        const oceanNorm = elevation / 0.48; // 0 (abyss) -> 1 (coast)
        if (oceanNorm > 0.82) {
          // Coastal shelf blend (turquoise to azure)
          const t = (oceanNorm - 0.82) / 0.18;
          [r, g, b] = lerpColor(12, 85, 160, 0, 185, 225, t);
        } else if (oceanNorm > 0.35) {
          // Mid ocean blend (navy to azure)
          const t = (oceanNorm - 0.35) / 0.47;
          [r, g, b] = lerpColor(4, 28, 80, 12, 85, 160, t);
        } else {
          // Deep abyssal trench
          const t = oceanNorm / 0.35;
          [r, g, b] = lerpColor(1, 14, 45, 4, 28, 80, t);
        }
      } else {
        // Continent: smooth anti-aliased transitions between biomes
        const landNorm = (elevation - 0.48) / 0.52; // 0 (coast) -> 1 (peak)
        if (landNorm < 0.22) {
          // Coastal lowland & lush rainforest
          const t = landNorm / 0.22;
          [r, g, b] = lerpColor(36, 105, 58, 48, 130, 68, t);
        } else if (landNorm < 0.52) {
          // Savanna, steppe, and arid ochre plateaus
          const t = (landNorm - 0.22) / 0.30;
          [r, g, b] = lerpColor(48, 130, 68, 168, 138, 82, t);
        } else if (landNorm < 0.82) {
          // Rugged brown mountain ranges
          const t = (landNorm - 0.52) / 0.30;
          [r, g, b] = lerpColor(168, 138, 82, 110, 84, 62, t);
        } else {
          // Glacial mountain summits
          const t = (landNorm - 0.82) / 0.18;
          [r, g, b] = lerpColor(110, 84, 62, 235, 242, 255, t);
        }
      }

      // Blend polar ice caps smoothly
      if (isPolar && polarDist > 0.1) {
        const iceFactor = Math.min(1.0, (polarDist - 0.1) / 0.5);
        [r, g, b] = lerpColor(r, g, b, 240, 248, 255, iceFactor);
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 2. Add Glowing Golden City Lights on the Night Hemisphere (X: 1024 to 2048)
  ctx.save();
  for (let c = 0; c < 220; c++) {
    const cx = 1100 + Math.random() * 880;
    const cy = 180 + Math.random() * 660;
    const radius = 4 + Math.random() * 16;

    const cityGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
    cityGrad.addColorStop(0.0, "rgba(255, 245, 200, 0.98)");
    cityGrad.addColorStop(0.3, "rgba(255, 190, 80, 0.85)");
    cityGrad.addColorStop(0.65, "rgba(255, 120, 25, 0.4)");
    cityGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

    ctx.fillStyle = cityGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Branching transit highways connecting cities
    if (c % 2 === 0) {
      ctx.strokeStyle = "rgba(255, 205, 100, 0.45)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 70);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. Multi-layer Swirling Cloud Cover (Storm fronts, cyclones, trade wind spirals)
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  for (let s = 0; s < 55; s++) {
    const cx = (s * 42) % 2048;
    const cy = 140 + ((s * 33) % 760);
    const cr = 35 + (s % 5) * 16;

    ctx.beginPath();
    for (let p = 0; p < 16; p++) {
      const pang = (p / 16) * Math.PI * 2;
      const prad = cr * (0.45 + Math.sin(p * 2.4 + s) * 0.55);
      const px = cx + Math.cos(pang) * prad * 2.8;
      const py = cy + Math.sin(pang) * prad * 0.9;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Planet B (Massive Banded Jupiter-like Gas Giant)
 * Alternating cream, mocha, terracotta, pale sand bands with turbulent eddies
 * and a prominent Great Red Spot storm vortex.
 */
function createBandedGasGiantTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Zonal atmospheric bands with realistic Jupiter color palette
  const bands = [
    { y: 0, h: 80, col: "#5a4135" },
    { y: 80, h: 65, col: "#cbb49e" },
    { y: 145, h: 105, col: "#8c5b3e" },
    { y: 250, h: 80, col: "#ebdcc9" },
    { y: 330, h: 125, col: "#a76e48" },
    { y: 455, h: 90, col: "#d8c0a8" },
    { y: 545, h: 140, col: "#7e4c34" },
    { y: 685, h: 95, col: "#cbb49e" },
    { y: 780, h: 130, col: "#6b4535" },
    { y: 910, h: 114, col: "#4a3328" },
  ];

  bands.forEach((b) => {
    ctx.fillStyle = b.col;
    ctx.fillRect(0, b.y, 2048, b.h);
  });

  // 2. High-frequency sinusoidal turbulence along band borders
  for (let row = 0; row < 16; row++) {
    const y = 60 + row * 60;
    ctx.fillStyle = row % 2 === 0 ? "rgba(245, 235, 218, 0.42)" : "rgba(115, 65, 40, 0.42)";
    ctx.beginPath();
    for (let x = 0; x <= 2048; x += 12) {
      const wave =
        Math.sin(x * 0.012 + row * 1.6) * 16 +
        Math.sin(x * 0.035 + row) * 8 +
        Math.cos(x * 0.08) * 3;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.lineTo(2048, y + 36);
    ctx.lineTo(0, y + 36);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Great Red Spot & Concentric Swirling Storm Vortices
  const stormGrad = ctx.createRadialGradient(760, 520, 8, 760, 520, 160);
  stormGrad.addColorStop(0.0, "#c24424");
  stormGrad.addColorStop(0.38, "#d9653d");
  stormGrad.addColorStop(0.75, "#8e3c22");
  stormGrad.addColorStop(1.0, "rgba(142, 60, 34, 0.0)");
  ctx.save();
  ctx.scale(1.0, 0.58);
  ctx.fillStyle = stormGrad;
  ctx.beginPath();
  ctx.arc(760, 520 / 0.58, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // White oval storms (Little Red Spot & anticyclonic pearls)
  for (let os = 0; os < 8; os++) {
    const ox = 260 + os * 240;
    const oy = 660 + (os % 3) * 28;
    ctx.fillStyle = "rgba(255, 252, 244, 0.72)";
    ctx.beginPath();
    ctx.ellipse(ox, oy, 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Planet C Ring System (Saturn-like)
 * 80+ fine concentric ringlets, Cassini Division gap, and Encke division.
 */
function createPlanetaryRingsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background transparency
  ctx.clearRect(0, 0, 2048, 64);

  // Inner C Ring (semitransparent dark crepe ring)
  const grad = ctx.createLinearGradient(0, 0, 2048, 0);
  grad.addColorStop(0.0, "rgba(0, 0, 0, 0.0)");
  grad.addColorStop(0.06, "rgba(150, 130, 100, 0.18)");
  grad.addColorStop(0.2, "rgba(200, 180, 145, 0.45)");

  // B Ring (brightest, densest ring)
  grad.addColorStop(0.24, "rgba(240, 225, 190, 0.95)");
  grad.addColorStop(0.52, "rgba(225, 210, 175, 0.92)");

  // Cassini Division (prominent dark gap at 54% - 59%)
  grad.addColorStop(0.54, "rgba(10, 8, 6, 0.05)");
  grad.addColorStop(0.58, "rgba(10, 8, 6, 0.05)");

  // A Ring (outer dense ring with Encke gap)
  grad.addColorStop(0.6, "rgba(220, 205, 170, 0.85)");
  grad.addColorStop(0.78, "rgba(205, 190, 155, 0.8)");
  grad.addColorStop(0.81, "rgba(20, 15, 10, 0.1)"); // Encke gap
  grad.addColorStop(0.83, "rgba(195, 180, 145, 0.75)");
  grad.addColorStop(0.94, "rgba(165, 145, 115, 0.35)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 64);

  // Add micro-ringlet striations
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let r = 0; r < 90; r++) {
    const rx = 400 + Math.random() * 1500;
    ctx.fillRect(rx, 0, 1 + Math.random() * 2, 64);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Planet D (Mars-like Reddish-Bronze Rocky World)
 * Craters with sunlit highlights, Valles Marineris canyon rifts, and basaltic dust.
 */
function createRockyPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base terracotta/rust gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
  baseGrad.addColorStop(0.0, "#3e1c10");
  baseGrad.addColorStop(0.28, "#7a371c");
  baseGrad.addColorStop(0.6, "#aa5229");
  baseGrad.addColorStop(0.85, "#6d3018");
  baseGrad.addColorStop(1.0, "#441c0e");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle basalt plain dust variations
  ctx.fillStyle = "rgba(40, 20, 12, 0.25)";
  for (let p = 0; p < 30; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 512;
    const pr = 40 + Math.random() * 90;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Canyon Chasms & Rift Valleys (Valles Marineris-style)
  ctx.strokeStyle = "#220e06";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(160, 260);
  ctx.bezierCurveTo(320, 235, 540, 275, 820, 250);
  ctx.stroke();

  // Branching tributary rifts
  ctx.lineWidth = 2.5;
  for (let t = 0; t < 8; t++) {
    ctx.beginPath();
    const bx = 280 + t * 65;
    ctx.moveTo(bx, 255);
    ctx.lineTo(bx + (Math.random() - 0.5) * 40, 255 + (Math.random() - 0.5) * 35);
    ctx.stroke();
  }

  // Refined impact craters (smaller, softer, authentic)
  for (let c = 0; c < 75; c++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 512;
    const cr = 2.5 + Math.random() * 12;

    // Dark floor
    ctx.fillStyle = "#1e0b04";
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit rim highlight
    ctx.strokeStyle = "rgba(235, 155, 105, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();

    // Shadowed rim
    ctx.strokeStyle = "rgba(18, 8, 3, 0.8)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, Math.PI * 1.9, Math.PI * 0.9);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Planet E (Icy Glacial World)
 */
function createIcyPlanetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Pale azure glacial foundation
  ctx.fillStyle = "#cceeff";
  ctx.fillRect(0, 0, 1024, 512);

  // Tectonic ice cracks & crevasses
  ctx.strokeStyle = "#2b6794";
  ctx.lineWidth = 2.2;
  for (let f = 0; f < 42; f++) {
    ctx.beginPath();
    let fx = Math.random() * 1024;
    let fy = Math.random() * 512;
    ctx.moveTo(fx, fy);
    for (let seg = 0; seg < 4; seg++) {
      fx += (Math.random() - 0.5) * 95;
      fy += (Math.random() - 0.5) * 65;
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Radiant Starlight Sunrise Starburst
 * (Nestled directly on Planet A's curved horizon limb, matching reference image)
 */
function createSunriseStarburstTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 256;
  const cy = 256;

  // Intense brilliant solar core
  const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 210);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.12, "rgba(255, 245, 205, 0.98)");
  grad.addColorStop(0.3, "rgba(255, 190, 90, 0.65)");
  grad.addColorStop(0.65, "rgba(0, 190, 255, 0.22)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Anamorphic horizontal flare glare ray
  const hRay = ctx.createLinearGradient(0, cy, 512, cy);
  hRay.addColorStop(0.0, "rgba(255, 220, 160, 0.0)");
  hRay.addColorStop(0.42, "rgba(255, 240, 200, 0.5)");
  hRay.addColorStop(0.5, "rgba(255, 255, 255, 1.0)");
  hRay.addColorStop(0.58, "rgba(255, 240, 200, 0.5)");
  hRay.addColorStop(1.0, "rgba(255, 220, 160, 0.0)");
  ctx.fillStyle = hRay;
  ctx.beginPath();
  ctx.moveTo(10, cy);
  ctx.lineTo(cx, cy - 8);
  ctx.lineTo(502, cy);
  ctx.lineTo(cx, cy + 8);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Master Realistic Planets Component
 * Implements:
 * 1. Planet A — Colossal Blue Terrestrial World with electric cyan limb & sunrise starburst
 * 2. Planet B — Massive Banded Jupiter-like Gas Giant with Great Red Spot & orbiting cratered moon
 * 3. Planet C — Ringed Saturn-like Gas Giant with Cassini division multi-ring disc
 * 4. Planet D — Warm Reddish-Bronze Rocky World with canyons & craters
 * 5. Planet E — Pale Icy World with glacial fractures
 * 6. Distant Moons & Celestial Worlds
 */
export default function RealisticPlanets() {
  const earthTex = useMemo(() => createEarthlikePlanetTexture(), []);
  const jupiterTex = useMemo(() => createBandedGasGiantTexture(), []);
  const ringsTex = useMemo(() => createPlanetaryRingsTexture(), []);
  const rockyTex = useMemo(() => createRockyPlanetTexture(), []);
  const icyTex = useMemo(() => createIcyPlanetTexture(), []);
  const sunriseTex = useMemo(() => createSunriseStarburstTexture(), []);

  const earthRef = useRef<THREE.Mesh>(null);
  const jupiterRef = useRef<THREE.Mesh>(null);
  const saturnRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.005;
    if (jupiterRef.current) jupiterRef.current.rotation.y = t * 0.008;
    if (saturnRef.current) saturnRef.current.rotation.y = t * 0.006;
  });

  return (
    <group name="realistic-planets">
      {/* =========================================================================
          1. PLANET A — COLOSSAL BLUE TERRESTRIAL WORLD (Foreground Left)
          ========================================================================= */}
      <group position={[-680, -320, -3900]}>
        {/* Main Planetary Sphere */}
        <mesh ref={earthRef} rotation={[0.22, 0.25, -0.1]}>
          <sphereGeometry args={[820, 64, 48]} />
          <meshStandardMaterial
            map={earthTex}
            emissiveMap={earthTex}
            emissive="#ffffff"
            emissiveIntensity={0.85}
            roughness={0.45}
            metalness={0.1}
            fog={false}
          />
        </mesh>

        {/* Luminous Electric Cyan Atmospheric Scattering Rim */}
        <mesh scale={[1.022, 1.022, 1.022]}>
          <sphereGeometry args={[820, 48, 36]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.48}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>

        {/* Radiant Sunrise Starburst cresting the planet's curved limb */}
        <mesh position={[560, 595, 260]} rotation={[0, 0, -0.72]}>
          <planeGeometry args={[620, 620]} />
          <meshBasicMaterial
            map={sunriseTex}
            transparent
            opacity={0.98}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>

        {/* Ambient Planetary Cyan Starlight Fill */}
        <pointLight color="#00b4d8" intensity={3.5} distance={2400} position={[300, 200, 500]} />
      </group>

      {/* =========================================================================
          2. PLANET B — MASSIVE BANDED GAS GIANT (Upper-Left Sky, Jupiter-like)
          ========================================================================= */}
      <group position={[-620, 520, -4100]}>
        <mesh ref={jupiterRef} rotation={[0.15, 0, 0.08]}>
          <sphereGeometry args={[360, 48, 36]} />
          <meshStandardMaterial
            map={jupiterTex}
            emissiveMap={jupiterTex}
            emissive="#ffffff"
            emissiveIntensity={0.78}
            roughness={0.5}
            metalness={0.05}
            fog={false}
          />
        </mesh>

        {/* Atmospheric Haze Rim */}
        <mesh scale={[1.018, 1.018, 1.018]}>
          <sphereGeometry args={[360, 36, 28]} />
          <meshBasicMaterial
            color="#e0bb95"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>

        {/* Orbiting Cratered Moon in front of Gas Giant */}
        <mesh position={[240, -110, 160]}>
          <sphereGeometry args={[38, 24, 20]} />
          <meshStandardMaterial
            color="#a0aab8"
            roughness={0.85}
            emissive="#556070"
            emissiveIntensity={0.4}
            fog={false}
          />
        </mesh>
      </group>

      {/* =========================================================================
          3. PLANET C — RINGED GAS GIANT (Mid-Right Sky, Saturn-like)
          ========================================================================= */}
      <group ref={saturnRef} position={[780, 290, -4000]} rotation={[-0.32, 0.22, 0.38]}>
        {/* Planetary Sphere */}
        <mesh>
          <sphereGeometry args={[190, 40, 32]} />
          <meshStandardMaterial
            color="#eedbb5"
            emissive="#ccb58c"
            emissiveIntensity={0.7}
            roughness={0.4}
            metalness={0.08}
            fog={false}
          />
        </mesh>

        {/* Concentric Multi-Ring Disk */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[230, 420, 64]} />
          <meshBasicMaterial
            map={ringsTex}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* =========================================================================
          4. PLANET D — WARM REDDISH-BRONZE ROCKY WORLD (Lower-Right Midground)
          ========================================================================= */}
      <group position={[540, -40, -3600]} rotation={[0.2, 0.8, -0.15]}>
        <mesh>
          <sphereGeometry args={[170, 36, 28]} />
          <meshStandardMaterial
            map={rockyTex}
            emissiveMap={rockyTex}
            emissive="#8a4422"
            emissiveIntensity={0.65}
            roughness={0.8}
            fog={false}
          />
        </mesh>
        {/* Subtle Warm Atmospheric Rim */}
        <mesh scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[170, 32, 24]} />
          <meshBasicMaterial
            color="#ff7744"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* =========================================================================
          5. PLANET E — PALE ICY WORLD (Mid-Upper Center Sky)
          ========================================================================= */}
      <group position={[140, 480, -4300]}>
        <mesh>
          <sphereGeometry args={[110, 32, 24]} />
          <meshStandardMaterial
            map={icyTex}
            emissiveMap={icyTex}
            emissive="#77aacc"
            emissiveIntensity={0.65}
            roughness={0.7}
            fog={false}
          />
        </mesh>
        <mesh scale={[1.025, 1.025, 1.025]}>
          <sphereGeometry args={[110, 24, 20]} />
          <meshBasicMaterial
            color="#88ddff"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* =========================================================================
          6. DISTANT CELESTIAL MOONS
          ========================================================================= */}
      {/* Crescent Moon in deep space */}
      <mesh position={[410, 210, -3900]} rotation={[0.3, 1.1, 0]}>
        <sphereGeometry args={[28, 20, 16]} />
        <meshStandardMaterial
          color="#90a4ae"
          emissive="#546e7a"
          emissiveIntensity={0.5}
          roughness={0.85}
          fog={false}
        />
      </mesh>

      {/* Small blue ocean moon near core */}
      <mesh position={[-160, 320, -4100]} rotation={[0.1, 0.4, 0]}>
        <sphereGeometry args={[42, 24, 18]} />
        <meshStandardMaterial
          color="#64b5f6"
          emissive="#1e88e5"
          emissiveIntensity={0.55}
          roughness={0.6}
          fog={false}
        />
      </mesh>
    </group>
  );
}
