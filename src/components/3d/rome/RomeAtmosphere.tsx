"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Procedural canvas texture for authentic Roman SPQR Crimson & Gold Banners.
 * Deep Roman imperial crimson silk (#8b0018) with gold laurel wreath,
 * Roman aquila (eagle), and bold serif "S • P • Q • R" gold lettering.
 */
function createSPQRBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep Imperial Crimson Background
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, "#820917");
  grad.addColorStop(0.3, "#9b1022");
  grad.addColorStop(0.7, "#780814");
  grad.addColorStop(1, "#59050d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle silk fabric weave pattern
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  for (let y = 0; y < 1024; y += 4) {
    ctx.fillRect(0, y, 512, 1.5);
  }

  // Golden Greek key / meander border
  ctx.strokeStyle = "#e6be44";
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, 456, 968);

  ctx.strokeStyle = "#b38822";
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 42, 428, 940);

  // Gold decorative corner rosettes
  const corners = [
    [28, 28],
    [484, 28],
    [28, 996],
    [484, 996],
  ];
  ctx.fillStyle = "#f5d061";
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  // Roman Aquila (Eagle) at the top
  ctx.fillStyle = "#ffd54f";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;

  // Wings
  ctx.beginPath();
  ctx.moveTo(256, 170);
  ctx.bezierCurveTo(220, 110, 150, 115, 120, 145);
  ctx.bezierCurveTo(155, 160, 200, 185, 235, 210);
  ctx.bezierCurveTo(245, 230, 256, 250, 256, 250);
  ctx.bezierCurveTo(256, 250, 267, 230, 277, 210);
  ctx.bezierCurveTo(312, 185, 357, 160, 392, 145);
  ctx.bezierCurveTo(362, 115, 292, 110, 256, 170);
  ctx.fill();

  // Eagle head and body
  ctx.beginPath();
  ctx.arc(256, 165, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(250, 162);
  ctx.lineTo(238, 166);
  ctx.lineTo(250, 170);
  ctx.fill();

  // Golden Laurel Wreath (Central Emblem)
  const wreathY = 460;
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(256, wreathY, 115, 0.4 * Math.PI, 1.6 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(256, wreathY, 115, -0.6 * Math.PI, 0.6 * Math.PI);
  ctx.stroke();

  // Laurel leaves
  for (let a = 0.45 * Math.PI; a <= 1.55 * Math.PI; a += 0.12) {
    const lx = 256 + Math.cos(a) * 115;
    const ly = wreathY + Math.sin(a) * 115;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd54f";
    ctx.fill();
    ctx.restore();
  }
  for (let a = -0.55 * Math.PI; a <= 0.55 * Math.PI; a += 0.12) {
    const lx = 256 + Math.cos(a) * 115;
    const ly = wreathY + Math.sin(a) * 115;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd54f";
    ctx.fill();
    ctx.restore();
  }

  // Wreath ribbon tie
  ctx.beginPath();
  ctx.arc(256, wreathY + 115, 14, 0, Math.PI * 2);
  ctx.fill();

  // Bold Golden "S • P • Q • R"
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.font = "bold 78px 'Cinzel', 'Times New Roman', Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffe082";
  ctx.fillText("S • P • Q • R", 256, wreathY);

  // Subtitle: SENATVS POPVLVSQVE ROMANVS
  ctx.font = "bold 20px 'Cinzel', 'Times New Roman', Georgia, serif";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#e6be44";
  ctx.fillText("SENATVS POPVLVSQVE ROMANVS", 256, wreathY + 70);

  // Golden bottom fringe / tassels
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffd54f";
  for (let i = 40; i < 472; i += 16) {
    ctx.fillRect(i, 984, 10, 36);
    ctx.beginPath();
    ctx.arc(i + 5, 1020, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Animated SPQR Silk Banner Mesh with wave cloth vertex movement
 */
function SPQRBannerMesh({
  position,
  scale = [2.2, 5.5, 1],
  rotation = [0, 0, 0],
  waveOffset = 0,
}: {
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  waveOffset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createSPQRBannerTexture(), []);

  // Plane geometry with segments for smooth wind deformation
  const geom = useMemo(() => new THREE.PlaneGeometry(1, 1, 12, 24), []);
  const initialPositions = useMemo(() => {
    return geom.attributes.position.array.slice() as Float32Array;
  }, [geom]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.getElapsedTime() * 1.6 + waveOffset;

    for (let i = 0; i < arr.length; i += 3) {
      const origY = initialPositions[i + 1];
      const origX = initialPositions[i];
      // Wind displacement increases down the hanging cloth
      const hangFactor = Math.max(0, 0.5 - origY);
      const wave =
        Math.sin(t * 1.8 + origY * 4.0) * 0.08 * hangFactor +
        Math.cos(t * 2.5 + origX * 5.0) * 0.04 * hangFactor;
      arr[i + 2] = wave;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Top golden mounting pole */}
      <mesh position={[0, 0.51, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.15, 12]} />
        <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Pole golden finials */}
      <mesh position={[-0.58, 0.51, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.58, 0.51, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* The animated cloth banner */}
      <mesh ref={meshRef} geometry={geom}>
        <meshStandardMaterial
          map={texture}
          roughness={0.65}
          metalness={0.15}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Mediterranean Italian Cypress Tree (Cupressus sempervirens)
 * Slender, towering columnar/conical dark evergreen silhouette.
 */
function CypressTree({
  position,
  scale = 1.0,
  swayOffset = 0,
}: {
  position: [number, number, number];
  scale?: number;
  swayOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 0.9 + swayOffset;
    // Gentle natural wind sway at top of tall tree
    groupRef.current.rotation.z = Math.sin(t) * 0.015;
    groupRef.current.rotation.x = Math.cos(t * 0.8) * 0.012;
  });

  return (
    <group position={position} scale={scale}>
      <group ref={groupRef}>
        {/* Slender trunk */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.22, 0.38, 5.0, 10]} />
          <meshStandardMaterial color="#423021" roughness={0.95} />
        </mesh>
        {/* Tiered tapered columnar foliage layers for rich organic depth */}
        <mesh position={[0, 4.2, 0]}>
          <coneGeometry args={[1.15, 6.5, 12]} />
          <meshStandardMaterial color="#1b381e" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0, 6.8, 0]}>
          <coneGeometry args={[1.0, 6.8, 12]} />
          <meshStandardMaterial color="#214224" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0, 9.4, 0]}>
          <coneGeometry args={[0.75, 6.2, 10]} />
          <meshStandardMaterial color="#264e2a" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0, 11.8, 0]}>
          <coneGeometry args={[0.45, 4.8, 8]} />
          <meshStandardMaterial color="#2c5a31" roughness={0.85} flatShading />
        </mesh>
        {/* Subtle irregular outer foliage puffs */}
        <mesh position={[0.3, 5.0, 0.2]} scale={[0.65, 1.2, 0.65]}>
          <dodecahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#1f3e22" roughness={0.9} />
        </mesh>
        <mesh position={[-0.28, 7.2, -0.2]} scale={[0.55, 1.1, 0.55]}>
          <dodecahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#274f2b" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Golden-Hour Sun Dust Motes
 * Floating particles catching direct afternoon sunlight.
 */
function GoldenSunMotes({ count = 280 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distributed along the Via Sacra avenue corridor
      pos[i * 3 + 0] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = 1.0 + Math.random() * 14;
      pos[i * 3 + 2] = -1800 - Math.random() * 320;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 1] += Math.sin(t * 0.7 + phases[i]) * 0.006;
      arr[idx + 0] += Math.cos(t * 0.5 + phases[i]) * 0.004;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#ffe299"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Master Rome Atmosphere Component:
 * - Hanging SPQR Crimson & Gold Banners along colonnade and triumphal gates
 * - Mediterranean Italian Cypress trees framing hills and streets
 * - Golden-Hour Sunbeam Dust Motes
 */
export default function RomeAtmosphere() {
  // Placement of SPQR banners matching the reference image:
  // Several hanging prominently from the tall columns on the left foreground,
  // and from the triumphal monuments down the street.
  const banners = useMemo(
    () => [
      { pos: [-6.8, 8.2, -1814] as [number, number, number], rot: [0, 0.08, 0] as [number, number, number], scale: [2.1, 5.2, 1] as [number, number, number], offset: 0 },
      { pos: [-6.8, 8.2, -1828] as [number, number, number], rot: [0, 0.05, 0] as [number, number, number], scale: [2.1, 5.2, 1] as [number, number, number], offset: 1.2 },
      { pos: [-6.8, 8.2, -1842] as [number, number, number], rot: [0, 0.04, 0] as [number, number, number], scale: [2.1, 5.2, 1] as [number, number, number], offset: 2.4 },
      { pos: [-6.8, 8.2, -1865] as [number, number, number], rot: [0, 0.02, 0] as [number, number, number], scale: [2.1, 5.2, 1] as [number, number, number], offset: 3.6 },
      // Across avenue on right buildings
      { pos: [7.8, 7.8, -1848] as [number, number, number], rot: [0, -0.06, 0] as [number, number, number], scale: [1.8, 4.5, 1] as [number, number, number], offset: 4.2 },
      { pos: [7.8, 7.8, -1880] as [number, number, number], rot: [0, -0.05, 0] as [number, number, number], scale: [1.8, 4.5, 1] as [number, number, number], offset: 5.1 },
      // Further down the avenue towards temple
      { pos: [-7.2, 8.5, -2020] as [number, number, number], rot: [0, 0.03, 0] as [number, number, number], scale: [2.4, 5.8, 1] as [number, number, number], offset: 1.8 },
      { pos: [7.2, 8.5, -2020] as [number, number, number], rot: [0, -0.03, 0] as [number, number, number], scale: [2.4, 5.8, 1] as [number, number, number], offset: 2.9 },
    ],
    []
  );

  // Placements of Italian Cypress trees:
  // Slender evergreens lining the hillside terraces, Capitoline slopes, and background
  const cypresses = useMemo(
    () => [
      // Left terrace & background hills
      { pos: [-16, 0, -1830] as [number, number, number], s: 1.1, off: 0.1 },
      { pos: [-18, 0, -1860] as [number, number, number], s: 1.25, off: 0.5 },
      { pos: [-22, 2, -1890] as [number, number, number], s: 1.35, off: 1.1 },
      { pos: [-26, 5, -1930] as [number, number, number], s: 1.45, off: 1.7 },
      { pos: [-28, 8, -1980] as [number, number, number], s: 1.5, off: 2.3 },
      { pos: [-32, 12, -2040] as [number, number, number], s: 1.6, off: 2.8 },
      { pos: [-35, 16, -2110] as [number, number, number], s: 1.7, off: 3.4 },
      // Right side framing Colosseum
      { pos: [18, 0, -1820] as [number, number, number], s: 1.05, off: 0.8 },
      { pos: [22, 0, -1855] as [number, number, number], s: 1.2, off: 1.4 },
      { pos: [25, 0, -1900] as [number, number, number], s: 1.3, off: 2.0 },
      { pos: [32, 0, -1950] as [number, number, number], s: 1.5, off: 2.7 },
      { pos: [38, 0, -2020] as [number, number, number], s: 1.55, off: 3.2 },
      { pos: [28, 0, -2070] as [number, number, number], s: 1.4, off: 3.9 },
      // Capitoline hill slopes framing Grand Temple
      { pos: [-18, 14, -2220] as [number, number, number], s: 1.4, off: 0.3 },
      { pos: [-24, 20, -2260] as [number, number, number], s: 1.6, off: 1.2 },
      { pos: [-30, 24, -2290] as [number, number, number], s: 1.8, off: 2.1 },
      { pos: [18, 14, -2220] as [number, number, number], s: 1.4, off: 0.7 },
      { pos: [24, 20, -2260] as [number, number, number], s: 1.6, off: 1.5 },
      { pos: [30, 24, -2290] as [number, number, number], s: 1.8, off: 2.5 },
      // Distant ridges along aqueduct
      { pos: [-65, 12, -2100] as [number, number, number], s: 1.9, off: 1.9 },
      { pos: [-95, 18, -2180] as [number, number, number], s: 2.1, off: 2.6 },
      { pos: [-120, 22, -2240] as [number, number, number], s: 2.3, off: 3.1 },
    ],
    []
  );

  return (
    <group name="rome-atmosphere">
      {/* SPQR Banners */}
      {banners.map((b, idx) => (
        <SPQRBannerMesh
          key={`spqr-banner-${idx}`}
          position={b.pos}
          rotation={b.rot}
          scale={b.scale}
          waveOffset={b.offset}
        />
      ))}

      {/* Italian Cypress Trees */}
      {cypresses.map((c, idx) => (
        <CypressTree
          key={`cypress-${idx}`}
          position={c.pos}
          scale={c.s}
          swayOffset={c.off}
        />
      ))}

      {/* Golden-Hour Sun Dust Motes */}
      <GoldenSunMotes count={260} />
    </group>
  );
}

