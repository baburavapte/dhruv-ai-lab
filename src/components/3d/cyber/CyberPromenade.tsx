"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Procedural Wet Reflective High-Tech Promenade Texture
 * Modular dark composite slate panels with narrow illuminated expansion joints
 * and subtle wet sheen that reflects cyan, purple, and amber lights.
 */
function createCyberPromenadeTexture(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = 1024;
  rCanvas.height = 1024;
  const rCtx = rCanvas.getContext("2d");

  if (!ctx || !rCtx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return { map: dummy, roughnessMap: dummy };
  }

  // Base dark titanium/graphite composite slate
  ctx.fillStyle = "#0c1017";
  ctx.fillRect(0, 0, 1024, 1024);

  // Low roughness base (slick wet surface ~0.2 - 0.35)
  rCtx.fillStyle = "#383838";
  rCtx.fillRect(0, 0, 1024, 1024);

  // Grid of large modular futuristic panels (16 cols x 32 rows)
  const cols = 16;
  const rows = 32;
  const w = 1024 / cols;
  const h = 1024 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * w;
      const y = r * h;

      // Slight tonal variation between panels (dark gunmetal / deep midnight)
      const tone = Math.sin(r * 7 + c * 13);
      ctx.fillStyle = tone > 0.3 ? "#131a24" : tone < -0.3 ? "#0a0e14" : "#0f141d";
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

      // Wet puddles with lower roughness for glossy specular reflections
      rCtx.fillStyle = Math.abs(tone) > 0.4 ? "#202020" : "#454545";
      rCtx.fillRect(x + 1, y + 1, w - 2, h - 2);

      // Embedded subtle micro-circuits / expansion grooves
      if ((r + c) % 6 === 0) {
        ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
        ctx.fillRect(x + 4, y + h / 2 - 1, w - 8, 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 24);
  map.generateMipmaps = true;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 24);
  roughnessMap.generateMipmaps = true;

  return { map, roughnessMap };
}

/**
 * Stylized Futuristic Pink Cherry Blossom Tree
 * Matching the reference image: vibrant pink/magenta canopy contrasting with dark cyber architecture
 */
function CyberCherryBlossomTree({
  position,
  scale = 1.0,
  rotationY = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  const clusterOffsets = useMemo(
    () => [
      { pos: [0, 3.6, 0] as [number, number, number], r: 1.6, col: "#ff66b2" },
      { pos: [-0.9, 3.2, 0.6] as [number, number, number], r: 1.3, col: "#ff85c2" },
      { pos: [1.0, 3.4, -0.5] as [number, number, number], r: 1.35, col: "#ff4da6" },
      { pos: [0.3, 4.3, 0.4] as [number, number, number], r: 1.15, col: "#ffa3d1" },
      { pos: [-0.7, 4.0, -0.7] as [number, number, number], r: 1.2, col: "#ff66b2" },
      { pos: [0.8, 2.7, 0.8] as [number, number, number], r: 1.0, col: "#ff85c2" },
    ],
    []
  );

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Dark sculpted trunk */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.22, 0.38, 2.8, 8]} />
        <meshStandardMaterial color="#221815" roughness={0.85} />
      </mesh>
      {/* Main primary branches */}
      <mesh position={[-0.4, 2.5, 0.3]} rotation={[0.4, 0.2, 0.5]}>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 6]} />
        <meshStandardMaterial color="#221815" roughness={0.85} />
      </mesh>
      <mesh position={[0.45, 2.6, -0.2]} rotation={[-0.3, -0.4, -0.5]}>
        <cylinderGeometry args={[0.11, 0.17, 1.7, 6]} />
        <meshStandardMaterial color="#221815" roughness={0.85} />
      </mesh>

      {/* Cloud-like Blossom Clusters */}
      {clusterOffsets.map((c, idx) => (
        <mesh key={`blossom-${idx}`} position={c.pos} scale={[1.1, 0.85, 1.1]}>
          <dodecahedronGeometry args={[c.r, 1]} />
          <meshStandardMaterial
            color={c.col}
            emissive={c.col}
            emissiveIntensity={0.25}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Subtle under-canopy upward glow */}
      <pointLight color="#ff66b2" intensity={0.4} distance={6} position={[0, 2.2, 0]} />
    </group>
  );
}

/**
 * Architectural Glass Waterfall & Neon Water Channel
 * Matching the reference image: vertical cascading water over glass terraces into glowing channels
 */
function CyberWaterfall({
  position,
  width = 3.6,
  height = 7.0,
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
}) {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (waterRef.current && waterRef.current.map) {
      waterRef.current.map.offset.y = -(state.clock.elapsedTime * 0.9) % 1;
    }
  });

  const waterTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = "#021c2e";
    ctx.fillRect(0, 0, 128, 512);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 512;
      const w = 2 + Math.random() * 6;
      const h = 40 + Math.random() * 80;
      ctx.fillStyle = "rgba(0, 240, 255, 0.45)";
      ctx.fillRect(x, y, w, h);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
  }, []);

  return (
    <group position={position}>
      {/* Architectural backing frame */}
      <mesh position={[0, height / 2, -0.2]}>
        <boxGeometry args={[width + 0.6, height + 0.4, 0.3]} />
        <meshStandardMaterial color="#0e1722" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Cascading falling water sheet */}
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={waterRef}
          map={waterTexture}
          color="#00e5ff"
          emissive="#00b4d8"
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Illuminated Basin Pool at base */}
      <mesh position={[0, 0.1, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.4, 2.4]} />
        <meshStandardMaterial
          color="#0077b6"
          emissive="#0096c7"
          emissiveIntensity={0.5}
          roughness={0.12}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Base water glow */}
      <pointLight color="#00e5ff" intensity={1.2} distance={8} position={[0, 0.6, 1.2]} />
    </group>
  );
}

/**
 * Master Cybernetic Promenade Component:
 * - Ultra-wide wet reflective composite avenue (Z: -2480 to -2850, Width: 22m)
 * - Radiant cyan and orange neon strip borders
 * - Multi-level elevated pedestrian walkways and terraces
 * - Terraced gardens with blooming cherry blossom trees
 * - Architectural cascading glass waterfalls & glowing pools
 * - Futuristic railings, light pillars, and structural plinths
 */
export default function CyberPromenade() {
  const { map, roughnessMap } = useMemo(() => createCyberPromenadeTexture(), []);

  return (
    <group name="cyber-promenade">
      {/* 1. Main Central Wet Reflective Promenade (Z: -2480 to -2860, length 380m) */}
      <mesh position={[0, 0, -2670]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 380]} />
        <meshStandardMaterial
          map={map}
          roughnessMap={roughnessMap}
          roughness={0.16}
          metalness={0.45}
          color="#e0e8f0"
        />
      </mesh>

      {/* 2. Embedded Radiant Neon Strips running along the entire avenue */}
      {/* Left Cyan Outer Edge Strip */}
      <mesh position={[-10.8, 0.04, -2670]}>
        <boxGeometry args={[0.22, 0.08, 380]} />
        <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.2} />
      </mesh>
      {/* Right Cyan Outer Edge Strip */}
      <mesh position={[10.8, 0.04, -2670]}>
        <boxGeometry args={[0.22, 0.08, 380]} />
        <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.2} />
      </mesh>

      {/* Inner Orange / Amber Guideway Strips (Matching reference image foreground lines) */}
      <mesh position={[-6.2, 0.03, -2670]}>
        <boxGeometry args={[0.16, 0.06, 380]} />
        <meshStandardMaterial color="#ff9100" emissive="#ff6d00" emissiveIntensity={3.5} />
      </mesh>
      <mesh position={[6.2, 0.03, -2670]}>
        <boxGeometry args={[0.16, 0.06, 380]} />
        <meshStandardMaterial color="#ff9100" emissive="#ff6d00" emissiveIntensity={3.5} />
      </mesh>

      {/* Left & Right Raised Sidewalk Terraces (X: ±11 to ±18, Y = 0.35) */}
      {/* Left Terrace */}
      <mesh position={[-15.0, 0.2, -2670]}>
        <boxGeometry args={[8.0, 0.4, 380]} />
        <meshStandardMaterial color="#111822" roughness={0.6} metalness={0.65} />
      </mesh>
      {/* Right Terrace */}
      <mesh position={[15.0, 0.2, -2670]}>
        <boxGeometry args={[8.0, 0.4, 380]} />
        <meshStandardMaterial color="#111822" roughness={0.6} metalness={0.65} />
      </mesh>

      {/* Glass Balustrade Handrails with Glowing Top Rail */}
      {/* Left Railing */}
      <group position={[-11.2, 0.35, -2670]}>
        {/* Glass panel */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.08, 1.0, 380]} />
          <meshStandardMaterial color="#00bcd4" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* Glowing top handrail */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.14, 0.08, 380]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Right Railing */}
      <group position={[11.2, 0.35, -2670]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.08, 1.0, 380]} />
          <meshStandardMaterial color="#00bcd4" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.14, 0.08, 380]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* 3. Terraced Architectural Gardens with Blooming Pink Cherry Blossom Trees */}
      {/* Left side trees lining the promenade */}
      {[-2500, -2530, -2565, -2605, -2650, -2700, -2750, -2800].map((tz, tidx) => (
        <React.Fragment key={`left-tree-${tidx}`}>
          <CyberCherryBlossomTree
            position={[-15.2, 0.4, tz]}
            scale={1.1 + (tidx % 3) * 0.15}
            rotationY={tidx * 1.2}
          />
          {/* Garden Planter Box with magenta glowing floral border */}
          <mesh position={[-15.2, 0.5, tz]}>
            <boxGeometry args={[3.8, 0.3, 3.8]} />
            <meshStandardMaterial color="#1a2332" roughness={0.7} />
          </mesh>
          <mesh position={[-15.2, 0.68, tz]}>
            <boxGeometry args={[3.9, 0.08, 3.9]} />
            <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={2.0} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Right side trees lining the promenade */}
      {[-2510, -2545, -2580, -2620, -2670, -2720, -2770, -2815].map((tz, tidx) => (
        <React.Fragment key={`right-tree-${tidx}`}>
          <CyberCherryBlossomTree
            position={[15.2, 0.4, tz]}
            scale={1.15 + (tidx % 2) * 0.12}
            rotationY={tidx * 0.9 + 2}
          />
          <mesh position={[15.2, 0.5, tz]}>
            <boxGeometry args={[3.8, 0.3, 3.8]} />
            <meshStandardMaterial color="#1a2332" roughness={0.7} />
          </mesh>
          <mesh position={[15.2, 0.68, tz]}>
            <boxGeometry args={[3.9, 0.08, 3.9]} />
            <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={2.0} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 4. Cascading Architectural Glass Waterfalls (Matching Reference Image) */}
      {/* Left Waterfall cascading from terrace */}
      <CyberWaterfall position={[-11.5, 0.4, -2550]} width={4.2} height={6.5} />
      {/* Right Waterfall cascading into illuminated channel */}
      <CyberWaterfall position={[11.5, 0.4, -2590]} width={4.2} height={6.5} />
      <CyberWaterfall position={[-11.5, 0.4, -2710]} width={4.5} height={7.0} />
      <CyberWaterfall position={[11.5, 0.4, -2750]} width={4.5} height={7.0} />

      {/* 5. Gateway Plaza Extension (Z: -2840 to -2890, Width: 46m) */}
      {/* Broad circular plaza supporting the monumental Ring Gateway */}
      <mesh position={[0, 0.02, -2860]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[28, 48]} />
        <meshStandardMaterial
          map={map}
          roughnessMap={roughnessMap}
          roughness={0.3}
          metalness={0.4}
          color="#cfd8dc"
        />
      </mesh>
      {/* Concentric Neon Rings embedded in Gateway Plaza */}
      <mesh position={[0, 0.06, -2860]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[23.6, 24.0, 48]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.0} />
      </mesh>
      <mesh position={[0, 0.06, -2860]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[17.6, 18.0, 48]} />
        <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={3.0} />
      </mesh>
    </group>
  );
}
