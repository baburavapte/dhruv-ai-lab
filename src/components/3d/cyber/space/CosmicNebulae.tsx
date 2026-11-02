"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural Organic Nebula Texture Generator
 * Generates soft fractal cloud structures with natural alpha falloff,
 * filamentary tendrils, and organic edge variation.
 */
function createNebulaTexture({
  primaryColor = "#3d007a",
  secondaryColor = "#0044ff",
  accentColor = "#ff007f",
  seed = 42,
}: {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  seed?: number;
}): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 512;

  // Multi-octave organic cloud puffs
  const puffs = 48;
  for (let p = 0; p < puffs; p++) {
    const angle = (p / puffs) * Math.PI * 2 + Math.sin(p * 2.3 + seed) * 0.5;
    const dist = (Math.sin(p * 3.7 + seed * 2) * 0.4 + 0.5) * 360;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * 0.75;
    const radius = 90 + Math.abs(Math.sin(p * 5.1)) * 180;

    const radGrad = ctx.createRadialGradient(px, py, 2, px, py, radius);

    // Color mixing across octaves
    const colorType = p % 3;
    const colStr =
      colorType === 0 ? primaryColor : colorType === 1 ? secondaryColor : accentColor;

    radGrad.addColorStop(0.0, colStr);
    radGrad.addColorStop(0.35, colStr);
    radGrad.addColorStop(0.7, "rgba(10, 5, 30, 0.2)");
    radGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + (p % 4) * 0.08;
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Interstellar dark dust lanes (filaments carving through the nebula)
  for (let d = 0; d < 6; d++) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    const startX = 200 + d * 110;
    const startY = 150 + d * 130;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + 120,
      startY + 180,
      startX - 90,
      startY + 340,
      startX + 160,
      startY + 480
    );
    ctx.lineWidth = 32 + (d % 3) * 24;
    ctx.lineCap = "round";
    ctx.filter = "blur(18px)";
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Rich Layered Deep Space Nebulae
 * Composed of deep blue, violet, magenta, and golden cosmic cloud volumes
 * framing the celestial vista with authentic astronomical depth.
 */
export default function CosmicNebulae() {
  const blueVioletTex = useMemo(
    () =>
      createNebulaTexture({
        primaryColor: "rgba(35, 15, 120, 0.75)",
        secondaryColor: "rgba(10, 60, 180, 0.65)",
        accentColor: "rgba(80, 20, 160, 0.5)",
        seed: 11,
      }),
    []
  );

  const magentaVioletTex = useMemo(
    () =>
      createNebulaTexture({
        primaryColor: "rgba(160, 15, 110, 0.7)",
        secondaryColor: "rgba(110, 10, 160, 0.65)",
        accentColor: "rgba(230, 40, 140, 0.45)",
        seed: 27,
      }),
    []
  );

  const goldenAmberTex = useMemo(
    () =>
      createNebulaTexture({
        primaryColor: "rgba(180, 110, 20, 0.55)",
        secondaryColor: "rgba(140, 50, 110, 0.5)",
        accentColor: "rgba(240, 180, 70, 0.4)",
        seed: 84,
      }),
    []
  );

  const clouds = useMemo(
    () => [
      // 1. Broad Indigo/Blue Cosmic Backdrop (Behind Galactic Centers)
      {
        pos: [200, 550, -4600] as [number, number, number],
        size: [2400, 1800] as [number, number],
        rot: [0.1, -0.2, 0.35] as [number, number, number],
        tex: blueVioletTex,
        opacity: 0.88,
      },
      // 2. Violet & Electric-Purple Gas Formation (Upper Center-Left)
      {
        pos: [-520, 680, -4500] as [number, number, number],
        size: [1900, 1500] as [number, number],
        rot: [-0.15, 0.1, -0.2] as [number, number, number],
        tex: blueVioletTex,
        opacity: 0.82,
      },
      // 3. Magenta & Rose Star-Forming Emission Cloud (Upper Right near Milky Way)
      {
        pos: [720, 620, -4400] as [number, number, number],
        size: [1800, 1600] as [number, number],
        rot: [0.2, 0.3, -0.4] as [number, number, number],
        tex: magentaVioletTex,
        opacity: 0.85,
      },
      // 4. Warm Golden/Amber Core Nebular Gas (Deep Galactic Bulge)
      {
        pos: [580, 480, -4500] as [number, number, number],
        size: [1400, 1200] as [number, number],
        rot: [-0.05, -0.15, 0.45] as [number, number, number],
        tex: goldenAmberTex,
        opacity: 0.78,
      },
      // 5. Deep Space Lower-Right Horizon Nebula
      {
        pos: [840, 280, -4300] as [number, number, number],
        size: [1600, 1200] as [number, number],
        rot: [0.1, -0.3, 0.15] as [number, number, number],
        tex: magentaVioletTex,
        opacity: 0.72,
      },
      // 6. Distant Left Horizon Cosmic Veil
      {
        pos: [-850, 420, -4450] as [number, number, number],
        size: [1700, 1300] as [number, number],
        rot: [-0.1, 0.25, 0.1] as [number, number, number],
        tex: blueVioletTex,
        opacity: 0.75,
      },
    ],
    [blueVioletTex, magentaVioletTex, goldenAmberTex]
  );

  return (
    <group name="cosmic-nebulae">
      {clouds.map((c, idx) => (
        <mesh key={`nebula-${idx}`} position={c.pos} rotation={c.rot}>
          <planeGeometry args={c.size} />
          <meshBasicMaterial
            map={c.tex}
            transparent
            opacity={c.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

