"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Creates texture for prominent bright stars with 4-point diffraction cross spikes
 * and soft radial glow, matching realistic astronomical photography.
 */
function createDiffractionStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 128;
  const cy = 128;

  // Soft spherical central aura
  const coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 64);
  coreGlow.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  coreGlow.addColorStop(0.12, "rgba(200, 230, 255, 0.85)");
  coreGlow.addColorStop(0.35, "rgba(100, 180, 255, 0.35)");
  coreGlow.addColorStop(0.7, "rgba(60, 120, 220, 0.08)");
  coreGlow.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = coreGlow;
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal diffraction spike
  const hSpike = ctx.createLinearGradient(0, cy, 256, cy);
  hSpike.addColorStop(0.0, "rgba(255, 255, 255, 0.0)");
  hSpike.addColorStop(0.4, "rgba(200, 235, 255, 0.35)");
  hSpike.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  hSpike.addColorStop(0.6, "rgba(200, 235, 255, 0.35)");
  hSpike.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = hSpike;
  ctx.beginPath();
  ctx.moveTo(10, cy);
  ctx.lineTo(cx, cy - 2.5);
  ctx.lineTo(246, cy);
  ctx.lineTo(cx, cy + 2.5);
  ctx.closePath();
  ctx.fill();

  // Vertical diffraction spike
  const vSpike = ctx.createLinearGradient(cx, 0, cx, 256);
  vSpike.addColorStop(0.0, "rgba(255, 255, 255, 0.0)");
  vSpike.addColorStop(0.4, "rgba(200, 235, 255, 0.35)");
  vSpike.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  vSpike.addColorStop(0.6, "rgba(200, 235, 255, 0.35)");
  vSpike.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = vSpike;
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx - 2.5, cy);
  ctx.lineTo(cx, 246);
  ctx.lineTo(cx + 2.5, cy);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Dense Natural Cosmic Starfield
 * Features 4,500+ stars distributed with realistic astronomical magnitude
 * and spectral classifications (O/B, A, F, G, K, M) plus prominent diffraction spike stars.
 */
export default function CosmicStarfield() {
  const spikeTex = useMemo(() => createDiffractionStarTexture(), []);

  // 1. Generate 4,500 background stars with non-uniform galactic plane clustering
  const [starGeo] = useMemo(() => {
    const count = 4800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cBlue = new THREE.Color("#9ac8ff");
    const cCyan = new THREE.Color("#aef4ff");
    const cWhite = new THREE.Color("#ffffff");
    const cIvory = new THREE.Color("#fff7e6");
    const cYellow = new THREE.Color("#ffe082");
    const cOrange = new THREE.Color("#ffaa66");
    const cRed = new THREE.Color("#ff7755");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution with bias toward celestial hemisphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.9 - 0.95);
      const dist = 4600 + Math.random() * 800;

      // Add galactic belt concentration
      const inGalacticBelt = Math.random() < 0.45;
      const elevation = inGalacticBelt
        ? (Math.random() - 0.5) * 600 + Math.sin(theta * 2.0) * 450
        : dist * Math.cos(phi);

      const rad = inGalacticBelt ? 4800 + Math.random() * 600 : dist * Math.sin(phi);

      positions[i3 + 0] = Math.cos(theta) * rad;
      positions[i3 + 1] = Math.max(20, elevation + 320); // Keep above horizon
      positions[i3 + 2] = -2400 - Math.abs(Math.sin(theta) * rad);

      // Magnitude distribution: 75% faint pinpricks, 20% medium, 5% bright
      const magRnd = Math.random();
      let chosenColor = cWhite;
      if (magRnd < 0.28) chosenColor = cBlue;
      else if (magRnd < 0.45) chosenColor = cCyan;
      else if (magRnd < 0.72) chosenColor = cWhite;
      else if (magRnd < 0.88) chosenColor = cIvory;
      else if (magRnd < 0.95) chosenColor = cYellow;
      else if (magRnd < 0.98) chosenColor = cOrange;
      else chosenColor = cRed;

      // Realistic intensity falloff (dimmer background stars, occasional gems)
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3 + 0] = chosenColor.r * brightness;
      colors[i3 + 1] = chosenColor.g * brightness;
      colors[i3 + 2] = chosenColor.b * brightness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return [geo];
  }, []);

  // 2. Prominent Bright Stars with 4-point Diffraction Spikes (as seen in the reference)
  const heroStars = useMemo(
    () => [
      { pos: [-420, 680, -4200] as [number, number, number], size: 95, color: "#c8e4ff" },
      { pos: [120, 520, -3900] as [number, number, number], size: 110, color: "#ffffff" },
      { pos: [-650, 480, -4400] as [number, number, number], size: 85, color: "#ffe082" },
      { pos: [780, 720, -4300] as [number, number, number], size: 90, color: "#aae4ff" },
      { pos: [-180, 850, -4600] as [number, number, number], size: 105, color: "#ffffff" },
      { pos: [340, 620, -4100] as [number, number, number], size: 80, color: "#ffc482" },
      { pos: [-880, 590, -4500] as [number, number, number], size: 75, color: "#90c0ff" },
      { pos: [540, 460, -4000] as [number, number, number], size: 85, color: "#ffffff" },
      { pos: [-60, 360, -3800] as [number, number, number], size: 95, color: "#b0e0ff" },
      { pos: [960, 510, -4400] as [number, number, number], size: 75, color: "#ffeaa7" },
    ],
    []
  );

  return (
    <group name="cosmic-starfield">
      {/* Dense 4,800 Star Background */}
      <points geometry={starGeo}>
        <pointsMaterial
          size={5.0}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </points>

      {/* Hero Stars with Realistic Diffraction Spikes */}
      {heroStars.map((s, idx) => (
        <mesh key={`hero-star-${idx}`} position={s.pos}>
          <planeGeometry args={[s.size, s.size]} />
          <meshBasicMaterial
            map={spikeTex}
            color={s.color}
            transparent
            opacity={0.95}
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

