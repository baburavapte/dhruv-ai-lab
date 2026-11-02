"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Deterministic PRNG for React purity
function createPseudoRandom(seed = 9876) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Procedural animated magma surface texture generator with strict molten color hierarchy
// ABSOLUTE RULE: NO PURE WHITE LAVA (Core capped at #FFB52E)
function createLavaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Deep molten lava base: #5A0800
  ctx.fillStyle = "#5A0800";
  ctx.fillRect(0, 0, 256, 256);

  // Layered glowing magma veins following strict molten hierarchy
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 18 + Math.random() * 36;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    // Hottest core: #FFB52E (warm golden orange, zero white)
    grad.addColorStop(0, "rgba(255, 181, 46, 0.95)");
    // Hot orange: #FF8A1A
    grad.addColorStop(0.28, "rgba(255, 138, 26, 0.90)");
    // Main orange: #FF5A0A
    grad.addColorStop(0.52, "rgba(255, 90, 10, 0.85)");
    // Red-orange: #C8320A
    grad.addColorStop(0.74, "rgba(200, 50, 10, 0.60)");
    // Dark red: #8F1608 into Deep lava: #5A0800
    grad.addColorStop(1, "rgba(90, 8, 0, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark cooling basalt crust flakes floating on magma (cooling obsidian rock)
  ctx.fillStyle = "rgba(20, 14, 22, 0.92)";
  for (let i = 0; i < 34; i++) {
    const cx = Math.random() * 256;
    const cy = Math.random() * 256;
    const w = 14 + Math.random() * 26;
    const h = 8 + Math.random() * 18;
    ctx.beginPath();
    ctx.roundRect(cx, cy, w, h, 6);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  return texture;
}

export default function Lava() {
  const leftLavaMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const rightLavaMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const rightShelfMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const leftLavaLightRef = useRef<THREE.PointLight>(null);
  const rightLavaLightRef = useRef<THREE.PointLight>(null);
  const rightShelfLightRef = useRef<THREE.PointLight>(null);

  // Basalt dark stone and lava crack materials with rich stylized low-poly shading
  const materials = useMemo(() => {
    return {
      basaltShore: new THREE.MeshStandardMaterial({
        color: "#1c1822",
        roughness: 0.82,
        metalness: 0.18,
        flatShading: true,
      }),
      basaltCliff: new THREE.MeshStandardMaterial({
        color: "#241f2a",
        roughness: 0.78,
        metalness: 0.22,
        flatShading: true,
      }),
      lavaFissure: new THREE.MeshBasicMaterial({
        color: "#FF5A0A",
      }),
      lavaFissureHot: new THREE.MeshBasicMaterial({
        color: "#FF8A1A",
      }),
    };
  }, []);

  // Low-profile shoreline rocks: frames the avenue without blocking the lava seas
  // Positioned outward (abs(X) >= 8.2) and keeping Z <= 4 to prevent camera obstruction
  const leftShoreRocks = useMemo(() => {
    const random = createPseudoRandom(1245);
    const rocks = [];
    for (let z = -26; z <= 4; z += 4.2) {
      // Natural jagged offset with gaps exposing lava
      if (Math.abs(z - (-10)) < 2 || Math.abs(z - (-2)) < 2) continue; // deliberate visual gaps to see lava
      const x = -(8.4 + random() * 1.6);
      const y = -0.1 + random() * 0.25;
      const scale: [number, number, number] = [
        1.1 + random() * 0.5,
        0.35 + random() * 0.35,
        1.8 + random() * 0.8,
      ];
      const rot: [number, number, number] = [
        (random() - 0.5) * 0.2,
        random() * Math.PI,
        (random() - 0.5) * 0.2,
      ];
      rocks.push({ x, y, z, scale, rot });
    }
    return rocks;
  }, []);

  const rightShoreRocks = useMemo(() => {
    const random = createPseudoRandom(5432);
    const rocks = [];
    for (let z = -26; z <= 4; z += 4.2) {
      if (Math.abs(z - (-14)) < 2 || Math.abs(z - (-6)) < 2) continue; // deliberate visual gaps to see lava
      const x = 8.4 + random() * 1.6;
      const y = -0.1 + random() * 0.25;
      const scale: [number, number, number] = [
        1.1 + random() * 0.5,
        0.35 + random() * 0.35,
        1.8 + random() * 0.8,
      ];
      const rot: [number, number, number] = [
        (random() - 0.5) * 0.2,
        random() * Math.PI,
        (random() - 0.5) * 0.2,
      ];
      rocks.push({ x, y, z, scale, rot });
    }
    return rocks;
  }, []);

  // Midground and background layered basalt cliffs on the right side
  const rightCliffs = useMemo(() => {
    const random = createPseudoRandom(8765);
    const cliffs = [];

    // Midground basalt bluff shelf (X: 18 to 28, Z: -28 to -8)
    for (let i = 0; i < 10; i++) {
      const x = 18.0 + random() * 8.0;
      const z = -28.0 + random() * 20.0;
      const y = 1.0 + random() * 2.2;
      const scale: [number, number, number] = [
        2.8 + random() * 2.0,
        1.5 + random() * 1.8,
        3.0 + random() * 2.0,
      ];
      const rot: [number, number, number] = [
        (random() - 0.5) * 0.3,
        random() * Math.PI,
        (random() - 0.5) * 0.2,
      ];
      cliffs.push({ x, y, z, scale, rot });
    }

    // Outer volcanic pillars (X: 26 to 34, Z: -32 to -14)
    for (let i = 0; i < 6; i++) {
      const x = 26.0 + random() * 8.0;
      const z = -30.0 + random() * 16.0;
      const y = 2.8 + random() * 3.5;
      const scale: [number, number, number] = [
        3.2 + random() * 2.2,
        2.8 + random() * 3.0,
        3.5 + random() * 2.2,
      ];
      const rot: [number, number, number] = [
        (random() - 0.5) * 0.25,
        random() * Math.PI,
        (random() - 0.5) * 0.2,
      ];
      cliffs.push({ x, y, z, scale, rot });
    }

    return cliffs;
  }, []);

  // Glowing lava cracks branching through right-side cliffs
  const rightCracks = useMemo(() => {
    const random = createPseudoRandom(2341);
    const cracks = [];
    for (let i = 0; i < 14; i++) {
      const x = 16.0 + random() * 12.0;
      const y = 0.6 + random() * 2.8;
      const z = -26.0 + random() * 18.0;
      const length = 1.5 + random() * 2.2;
      const rotY = (random() - 0.5) * 1.8;
      const rotZ = (random() - 0.5) * 0.5;
      const isHot = random() > 0.5;
      cracks.push({ x, y, z, length, rotY, rotZ, isHot });
    }
    return cracks;
  }, []);

  // Similar balanced cliffs on left side for organic symmetry
  const leftCliffs = useMemo(() => {
    const random = createPseudoRandom(6789);
    const cliffs = [];
    for (let i = 0; i < 10; i++) {
      const x = -(18.0 + random() * 8.0);
      const z = -28.0 + random() * 20.0;
      const y = 1.0 + random() * 2.2;
      const scale: [number, number, number] = [
        2.8 + random() * 2.0,
        1.5 + random() * 1.8,
        3.0 + random() * 2.0,
      ];
      const rot: [number, number, number] = [
        (random() - 0.5) * 0.3,
        random() * Math.PI,
        (random() - 0.5) * 0.2,
      ];
      cliffs.push({ x, y, z, scale, rot });
    }
    return cliffs;
  }, []);

  useEffect(() => {
    const tex = createLavaTexture();
    textureRef.current = tex;

    [leftLavaMatRef, rightLavaMatRef, rightShelfMatRef].forEach((ref) => {
      if (ref.current) {
        ref.current.map = tex;
        ref.current.emissiveMap = tex;
        ref.current.needsUpdate = true;
      }
    });

    return () => {
      tex.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Viscous magma surface scrolling
    if (textureRef.current) {
      textureRef.current.offset.y += delta * 0.022;
      textureRef.current.offset.x = Math.sin(t * 0.28) * 0.04;
    }

    // Thermal pulsation (controlled emissive intensity to prevent white blowout)
    const lavaPulse = 0.94 + Math.sin(t * 2.2) * 0.08;
    const secondaryPulse = 0.92 + Math.cos(t * 1.7) * 0.09;

    if (leftLavaMatRef.current) {
      leftLavaMatRef.current.emissiveIntensity = 1.15 * lavaPulse;
    }
    if (rightLavaMatRef.current) {
      rightLavaMatRef.current.emissiveIntensity = 1.15 * lavaPulse;
    }
    if (rightShelfMatRef.current) {
      rightShelfMatRef.current.emissiveIntensity = 1.25 * secondaryPulse;
    }

    if (leftLavaLightRef.current) {
      leftLavaLightRef.current.intensity = 12.0 * lavaPulse;
    }
    if (rightLavaLightRef.current) {
      rightLavaLightRef.current.intensity = 12.0 * lavaPulse;
    }
    if (rightShelfLightRef.current) {
      rightShelfLightRef.current.intensity = 10.0 * secondaryPulse;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ------------------------------------------------------------- */}
      {/* 1. VAST OPEN MOLTEN LAVA SEAS (LEFT & RIGHT BALANCED)         */}
      {/* ------------------------------------------------------------- */}
      {/* Left Magma Sea: Positioned right along the bridge for wide visibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-32, -0.15, -10]} receiveShadow>
        <planeGeometry args={[56, 80]} />
        <meshStandardMaterial
          ref={leftLavaMatRef}
          color="#C8320A"
          emissive="#8F1608"
          emissiveIntensity={1.15}
          roughness={0.52}
          metalness={0.04}
        />
      </mesh>

      {/* Right Magma Sea: Matching open expanse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[32, -0.15, -10]} receiveShadow>
        <planeGeometry args={[56, 80]} />
        <meshStandardMaterial
          ref={rightLavaMatRef}
          color="#C8320A"
          emissive="#8F1608"
          emissiveIntensity={1.15}
          roughness={0.52}
          metalness={0.04}
        />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. RIGHT-SIDE ELEVATED CASCADING LAVA TERRACE (Midground)     */}
      {/* ------------------------------------------------------------- */}
      <group position={[18.5, 2.2, -18]}>
        <mesh rotation={[-Math.PI / 2, 0, -0.05]} receiveShadow>
          <planeGeometry args={[12, 14]} />
          <meshStandardMaterial
            ref={rightShelfMatRef}
            color="#FF5A0A"
            emissive="#C8320A"
            emissiveIntensity={1.25}
            roughness={0.48}
          />
        </mesh>
        {/* Glowing magma lip spilling over edge */}
        <mesh
          position={[-5.8, -0.1, 0]}
          rotation={[0, 0, -0.3]}
          material={materials.lavaFissure}
        >
          <boxGeometry args={[0.5, 0.4, 13.5]} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. LOW-PROFILE BASALT SHORELINE FLANKING THE CENTRAL BRIDGE   */}
      {/* ------------------------------------------------------------- */}
      <group>
        {leftShoreRocks.map((r, i) => (
          <mesh
            key={`l-shore-${i}`}
            position={[r.x, r.y, r.z]}
            rotation={r.rot}
            scale={r.scale}
            receiveShadow
            material={materials.basaltShore}
          >
            {i % 2 === 0 ? (
              <dodecahedronGeometry args={[1, 0]} />
            ) : (
              <boxGeometry args={[1.4, 0.8, 1.8]} />
            )}
          </mesh>
        ))}
      </group>

      <group>
        {rightShoreRocks.map((r, i) => (
          <mesh
            key={`r-shore-${i}`}
            position={[r.x, r.y, r.z]}
            rotation={r.rot}
            scale={r.scale}
            receiveShadow
            material={materials.basaltShore}
          >
            {i % 2 === 0 ? (
              <dodecahedronGeometry args={[1, 0]} />
            ) : (
              <boxGeometry args={[1.4, 0.8, 1.8]} />
            )}
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. LAYERED VOLCANIC CLIFFS & BLUFFS (MIDGROUND & BACKGROUND)  */}
      {/* ------------------------------------------------------------- */}
      <group>
        {rightCliffs.map((c, i) => (
          <mesh
            key={`r-cliff-${i}`}
            position={[c.x, c.y, c.z]}
            rotation={c.rot}
            scale={c.scale}
            receiveShadow
            material={materials.basaltCliff}
          >
            {i % 2 === 0 ? (
              <dodecahedronGeometry args={[1, 0]} />
            ) : (
              <icosahedronGeometry args={[1, 0]} />
            )}
          </mesh>
        ))}
      </group>

      <group>
        {leftCliffs.map((c, i) => (
          <mesh
            key={`l-cliff-${i}`}
            position={[c.x, c.y, c.z]}
            rotation={c.rot}
            scale={c.scale}
            receiveShadow
            material={materials.basaltCliff}
          >
            {i % 2 === 0 ? (
              <dodecahedronGeometry args={[1, 0]} />
            ) : (
              <icosahedronGeometry args={[1, 0]} />
            )}
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. GLOWING LAVA CRACKS ON RIGHT VOLCANIC CLIFFS               */}
      {/* ------------------------------------------------------------- */}
      <group>
        {rightCracks.map((c, i) => (
          <mesh
            key={`r-crack-${i}`}
            position={[c.x, c.y, c.z]}
            rotation={[0.1, c.rotY, c.rotZ]}
            material={c.isHot ? materials.lavaFissureHot : materials.lavaFissure}
          >
            <boxGeometry args={[c.length, 0.08, 0.12]} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. STRATEGIC LAVA LIGHTING (BALANCED LEFT & RIGHT)            */}
      {/* ------------------------------------------------------------- */}
      {/* Left primary lava light */}
      <pointLight
        ref={leftLavaLightRef}
        position={[-16, 2.8, -10]}
        color="#ff4800"
        distance={36}
        decay={2}
      />

      {/* Right primary lava lake light */}
      <pointLight
        ref={rightLavaLightRef}
        position={[16, 2.8, -10]}
        color="#ff4800"
        distance={36}
        decay={2}
      />

      {/* Right cascading terrace lava light */}
      <pointLight
        ref={rightShelfLightRef}
        position={[18.5, 4.2, -18]}
        color="#ff5a14"
        distance={28}
        decay={2}
      />

      {/* Bridge underside magma reflection */}
      <pointLight
        position={[0, 1.2, -24]}
        color="#ff3800"
        intensity={7.5}
        distance={24}
        decay={2}
      />
    </group>
  );
}
