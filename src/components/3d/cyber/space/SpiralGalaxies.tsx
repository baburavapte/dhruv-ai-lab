"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural Texture for the Hero Milky Way Spiral Galaxy
 * 2048x2048 high-resolution astronomical rendering:
 * - Radiant warm-golden core bulge
 * - Multi-arm logarithmic spirals with variable star density
 * - Pink/violet H II starburst emission nebulae
 * - Blue-white young star clusters
 * - Dark interstellar dust lanes slicing through spiral arms
 */
function createMilkyWayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 2048, 2048);
  const cx = 1024;
  const cy = 1024;

  // 1. Radiant Galactic Nucleus Bulge
  const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 380);
  coreGrad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  coreGrad.addColorStop(0.12, "rgba(255, 240, 210, 0.98)");
  coreGrad.addColorStop(0.28, "rgba(255, 200, 140, 0.85)");
  coreGrad.addColorStop(0.48, "rgba(220, 120, 190, 0.55)");
  coreGrad.addColorStop(0.75, "rgba(120, 50, 180, 0.25)");
  coreGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 380, 0, Math.PI * 2);
  ctx.fill();

  // 2. Spiral Arms (Logarithmic spiral with 2 major arms + 2 minor branches)
  const arms = [
    { offset: 0, length: 3200, scale: 1.0 },
    { offset: Math.PI, length: 3200, scale: 1.0 },
    { offset: Math.PI * 0.45, length: 1800, scale: 0.8 },
    { offset: Math.PI * 1.45, length: 1800, scale: 0.8 },
  ];

  arms.forEach((arm) => {
    for (let i = 0; i < arm.length; i++) {
      const u = i / arm.length;
      const angle = arm.offset + u * Math.PI * 3.8;
      const dist = 70 + u * 840 * arm.scale;
      const scatter = (Math.random() - 0.5) * (45 + u * 240);

      const px = cx + Math.cos(angle) * dist + Math.sin(angle) * scatter;
      const py = cy + Math.sin(angle) * dist * 0.9 - Math.cos(angle) * scatter;

      const alpha = (1.0 - u * 0.82) * (0.35 + Math.random() * 0.65);

      // Star-forming H II knots (pink/magenta) vs young stellar clusters (blue/cyan)
      const isH2 = Math.random() < 0.22 && u > 0.18;
      const isBlueCluster = Math.random() < 0.35 && u > 0.15;
      const color = isH2
        ? `rgba(255, 70, 170, ${alpha * 0.9})`
        : isBlueCluster
        ? `rgba(130, 210, 255, ${alpha})`
        : u < 0.25
        ? `rgba(255, 225, 180, ${alpha * 0.95})`
        : `rgba(180, 160, 245, ${alpha * 0.8})`;

      ctx.fillStyle = color;
      const rad = isH2 ? 3.0 + Math.random() * 4.5 : 1.2 + Math.random() * 2.8;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 3. Dark Interstellar Dust Lanes (carving authentic silhouettes along the inner arms)
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.filter = "blur(8px)";
  for (let d = 0; d < 2; d++) {
    const baseAng = d * Math.PI + 0.25;
    ctx.beginPath();
    for (let step = 0; step < 60; step++) {
      const u = step / 60;
      const ang = baseAng + u * Math.PI * 2.6;
      const dist = 95 + u * 720;
      const dx = cx + Math.cos(ang) * dist;
      const dy = cy + Math.sin(ang) * dist * 0.88;
      if (step === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.globalAlpha = 0.65;
    ctx.stroke();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Face-on Spiral Galaxy
 */
function createFaceOnSpiralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 1024, 1024);
  const cx = 512;
  const cy = 512;

  // Luminous white/blue nucleus
  const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 180);
  coreGrad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  coreGrad.addColorStop(0.2, "rgba(210, 235, 255, 0.9)");
  coreGrad.addColorStop(0.5, "rgba(140, 100, 220, 0.6)");
  coreGrad.addColorStop(0.8, "rgba(60, 40, 160, 0.25)");
  coreGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();

  // Distinct 2-arm face-on blue spiral
  const arms = 2;
  const stars = 2200;
  for (let a = 0; a < arms; a++) {
    const armOff = a * Math.PI;
    for (let i = 0; i < stars; i++) {
      const u = i / stars;
      const angle = armOff + u * Math.PI * 3.4;
      const dist = 30 + u * 420;
      const scatter = (Math.random() - 0.5) * (20 + u * 90);

      const px = cx + Math.cos(angle) * dist + Math.sin(angle) * scatter;
      const py = cy + Math.sin(angle) * dist - Math.cos(angle) * scatter;

      const alpha = (1.0 - u * 0.75) * (0.35 + Math.random() * 0.65);
      const isPink = Math.random() < 0.25;
      ctx.fillStyle = isPink
        ? `rgba(255, 100, 200, ${alpha})`
        : `rgba(140, 200, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Edge-on Galaxy with Prominent Central Dust Lane
 */
function createEdgeOnGalaxyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 1024, 512);
  const cx = 512;
  const cy = 256;

  // Elongated stellar disk
  const diskGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 480);
  diskGrad.addColorStop(0.0, "rgba(255, 245, 220, 1.0)");
  diskGrad.addColorStop(0.18, "rgba(255, 210, 150, 0.85)");
  diskGrad.addColorStop(0.5, "rgba(160, 140, 220, 0.45)");
  diskGrad.addColorStop(0.85, "rgba(80, 80, 160, 0.15)");
  diskGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.save();
  ctx.scale(1.0, 0.28);
  ctx.fillStyle = diskGrad;
  ctx.beginPath();
  ctx.arc(cx, cy / 0.28, 480, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Central nuclear bulge
  const bulgeGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 95);
  bulgeGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
  bulgeGrad.addColorStop(0.4, "rgba(255, 215, 160, 0.7)");
  bulgeGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.save();
  ctx.scale(1.0, 0.75);
  ctx.fillStyle = bulgeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy / 0.75, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dark horizontal dust lane bisecting the galaxy
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.filter = "blur(6px)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 440, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedural Texture for Distant Elliptical Galaxy
 */
function createEllipticalGalaxyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 512, 512);
  const cx = 256;
  const cy = 256;

  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 200);
  grad.addColorStop(0.0, "rgba(255, 240, 200, 0.95)");
  grad.addColorStop(0.2, "rgba(255, 210, 140, 0.7)");
  grad.addColorStop(0.55, "rgba(200, 140, 100, 0.3)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.save();
  ctx.scale(1.0, 0.65);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy / 0.65, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Master Spiral Galaxies Component
 * Implements:
 * 1. Primary Hero Milky Way Spiral Galaxy (Upper Center-Right, Majestic & Tilted)
 * 2. Secondary Face-On Spiral Galaxy (Upper Left)
 * 3. Third Tilted Spiral Galaxy (Mid-Lower Center)
 * 4. Edge-On Spiral Galaxy with prominent dark dust lane (Distant Left)
 * 5. Distant Elliptical Galaxies scattered in the cosmic depth
 */
export default function SpiralGalaxies() {
  const milkyWayTex = useMemo(() => createMilkyWayTexture(), []);
  const faceOnTex = useMemo(() => createFaceOnSpiralTexture(), []);
  const edgeOnTex = useMemo(() => createEdgeOnGalaxyTexture(), []);
  const ellipticalTex = useMemo(() => createEllipticalGalaxyTexture(), []);

  return (
    <group name="spiral-galaxies">
      {/* 1. HERO MILKY WAY SPIRAL GALAXY (Upper Center-Right, Majestic Scale) */}
      <group position={[620, 680, -4500]} rotation={[-0.42, 0.28, 0.68]}>
        <mesh>
          <planeGeometry args={[1650, 1650]} />
          <meshBasicMaterial
            map={milkyWayTex}
            transparent
            opacity={0.96}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
        {/* Core Bulge Accent Point Light */}
        <pointLight color="#ffe0b2" intensity={2.8} distance={1200} position={[0, 0, 60]} />
      </group>

      {/* 2. SECONDARY FACE-ON SPIRAL GALAXY (Upper Left Sky, Tilted Violet/Blue) */}
      <group position={[-680, 720, -4600]} rotation={[0.35, -0.25, -0.45]}>
        <mesh>
          <planeGeometry args={[1150, 1150]} />
          <meshBasicMaterial
            map={faceOnTex}
            transparent
            opacity={0.92}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
        <pointLight color="#b388ff" intensity={2.0} distance={900} position={[0, 0, 40]} />
      </group>

      {/* 3. THIRD TILTED SPIRAL GALAXY (Mid-Lower Center, Distant) */}
      <group position={[80, 240, -4700]} rotation={[-0.55, 0.45, 0.2]}>
        <mesh>
          <planeGeometry args={[750, 750]} />
          <meshBasicMaterial
            map={faceOnTex}
            transparent
            opacity={0.82}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      </group>

      {/* 4. EDGE-ON GALAXY WITH PROMINENT DARK DUST LANE (Distant Left Horizon) */}
      <group position={[-980, 380, -4650]} rotation={[0.15, 0.35, 0.22]}>
        <mesh>
          <planeGeometry args={[900, 450]} />
          <meshBasicMaterial
            map={edgeOnTex}
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      </group>

      {/* 5. DISTANT ELLIPTICAL GALAXIES (Scattered in the cosmic void) */}
      <group position={[280, 850, -4800]} rotation={[0, 0, 0.4]}>
        <mesh>
          <planeGeometry args={[420, 420]} />
          <meshBasicMaterial
            map={ellipticalTex}
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      </group>

      <group position={[-380, 180, -4750]} rotation={[0, 0, -0.3]}>
        <mesh>
          <planeGeometry args={[340, 340]} />
          <meshBasicMaterial
            map={ellipticalTex}
            transparent
            opacity={0.68}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      </group>
    </group>
  );
}

