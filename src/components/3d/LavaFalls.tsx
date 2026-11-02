"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Deterministic PRNG for pure React rendering
function createPseudoRandom(seed = 4321) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Procedural vertical streaming lava waterfall texture with rich molten tones (NO washout)
function createLavaFallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Deep molten magma background: #5A0800
  ctx.fillStyle = "#5A0800";
  ctx.fillRect(0, 0, 64, 256);

  // Fast vertical molten torrent streaks with fiery orange-red gradient
  for (let i = 0; i < 36; i++) {
    const x = Math.random() * 64;
    const w = 4 + Math.random() * 12;
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, "rgba(143, 22, 8, 0.55)"); // #8F1608
    grad.addColorStop(0.3, "rgba(200, 50, 10, 0.90)"); // #C8320A
    grad.addColorStop(0.5, "rgba(255, 90, 10, 0.95)"); // #FF5A0A
    grad.addColorStop(0.7, "rgba(200, 50, 10, 0.90)"); // #C8320A
    grad.addColorStop(1, "rgba(143, 22, 8, 0.55)"); // #8F1608

    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, w, 256);
  }

  // Hot orange & golden ribbons (no pure white, max #FFB52E)
  for (let i = 0; i < 6; i++) {
    const x = 12 + Math.random() * 40;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 138, 26, 0.85)" : "rgba(255, 181, 46, 0.75)";
    ctx.fillRect(x, 0, 2, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

// Procedural soft round steam texture for rising volcanic vapor
function createSteamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 90, 10, 0.40)"); // #FF5A0A
  grad.addColorStop(0.35, "rgba(200, 50, 10, 0.22)"); // #C8320A
  grad.addColorStop(0.7, "rgba(90, 8, 0, 0.08)"); // #5A0800
  grad.addColorStop(1, "rgba(30, 8, 4, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

interface FallSpec {
  pos: [number, number, number];
  size: [number, number];
  rotY: number;
  isPrimary?: boolean;
}

interface StreamProps {
  fall: FallSpec;
  chasmRockMat: THREE.Material;
  streamMat: THREE.Material;
  coreMat: THREE.Material;
}

function LavaFallStream({ fall, chasmRockMat, streamMat, coreMat }: StreamProps) {
  return (
    <group position={fall.pos} rotation={[0, fall.rotY, 0]}>
      {/* Main streaming molten torrent (Main orange #FF5A0A) */}
      <mesh material={streamMat}>
        <planeGeometry args={[fall.size[0], fall.size[1]]} />
      </mesh>

      {/* Hot orange core ribbon (#FF8A1A, zero white) */}
      <mesh position={[0, 0, 0.04]} material={coreMat}>
        <planeGeometry args={[fall.size[0] * 0.40, fall.size[1]]} />
      </mesh>

      {/* Flanking dark basalt gorge rock framing the fall */}
      <mesh position={[-fall.size[0] * 0.65, 0, -0.22]} material={chasmRockMat}>
        <boxGeometry args={[0.6, fall.size[1], 0.8]} />
      </mesh>
      <mesh position={[fall.size[0] * 0.65, 0, -0.22]} material={chasmRockMat}>
        <boxGeometry args={[0.6, fall.size[1], 0.8]} />
      </mesh>

      {/* Rocky ledge lip at crest */}
      <mesh position={[0, fall.size[1] * 0.49, -0.25]} material={chasmRockMat}>
        <boxGeometry args={[fall.size[0] * 1.6, 0.5, 1.0]} />
      </mesh>
    </group>
  );
}

interface LavaFallsResources {
  tex: THREE.CanvasTexture;
  sTex: THREE.CanvasTexture;
  chasmRockMat: THREE.MeshStandardMaterial;
  streamMat: THREE.MeshBasicMaterial;
  coreMat: THREE.MeshBasicMaterial;
}

function initLavaFallsResources(): LavaFallsResources {
  const tex = createLavaFallTexture();
  const sTex = createSteamTexture();
  const chasmRockMat = new THREE.MeshStandardMaterial({
    color: "#18151f",
    roughness: 0.88,
    metalness: 0.15,
  });
  const streamMat = new THREE.MeshBasicMaterial({
    color: "#FF5A0A",
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    map: tex,
  });
  const coreMat = new THREE.MeshBasicMaterial({
    color: "#FF8A1A",
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  return { tex, sTex, chasmRockMat, streamMat, coreMat };
}

export default function LavaFalls() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const splashPointsRef = useRef<THREE.Points>(null);
  const steamPointsRef = useRef<THREE.Points>(null);
  const steamMatRef = useRef<THREE.PointsMaterial>(null);

  const [resources] = useState<LavaFallsResources>(() => initLavaFallsResources());

  // Balanced Cascading Waterfall Specifications (Left & Right Balanced Density)
  const falls: FallSpec[] = useMemo(
    () => [
      // ==============================================================
      // 1. LEFT BASTION & VOLCANIC CLIFF FALLS
      // ==============================================================
      { pos: [-17.5, 10.0, -30], size: [1.7, 20], rotY: 0.1, isPrimary: true },
      { pos: [-24.0, 8.5, -26], size: [1.4, 17], rotY: 0.28 },
      { pos: [-12.5, 6.8, -21], size: [1.1, 13.5], rotY: 0.18 },
      { pos: [-10.2, 3.4, -14], size: [0.75, 6.8], rotY: 0.12 },

      // ==============================================================
      // 2. RIGHT-SIDE BALANCED CASCADING WATERFALL SYSTEM
      // ==============================================================
      // Primary High Waterfall (Falls from fortress cliff onto mid-tier shelf)
      { pos: [17.5, 10.0, -30], size: [1.7, 20], rotY: -0.1, isPrimary: true },
      // Cascading Terrace Fall (Upper fall cascading onto mid-tier shelf)
      { pos: [18.2, 8.5, -22], size: [1.5, 12], rotY: -0.25, isPrimary: true },
      // Cascading Terrace Spill (Spills from mid shelf down into main lava sea)
      { pos: [13.8, 3.8, -16], size: [1.8, 7.6], rotY: -0.22, isPrimary: true },
      // Outer cliff gorge torrent
      { pos: [24.0, 8.5, -26], size: [1.4, 17], rotY: -0.28 },
      // Bastion inner flank plunge
      { pos: [11.8, 6.8, -21], size: [1.1, 13.5], rotY: -0.18 },
      // Midground rock stream
      { pos: [10.5, 3.4, -14], size: [0.75, 6.8], rotY: -0.14 },

      // ==============================================================
      // 3. REAR DEEP ABYSS FALLS (BEHIND FORTRESS ARCH)
      // ==============================================================
      { pos: [-5.0, 11.0, -38], size: [1.2, 22], rotY: 0 },
      { pos: [5.0, 11.0, -38], size: [1.2, 22], rotY: 0 },
    ],
    []
  );

  // Splash spark particles at waterfall impact zones
  const splashCount = 70;
  const [splashPos, splashVel, splashBaseAnchors] = useMemo(() => {
    const random = createPseudoRandom(777);
    const pos = new Float32Array(splashCount * 3);
    const vel = new Float32Array(splashCount * 3);
    const baseAnchors: [number, number, number][] = [];

    falls.forEach((f) => {
      const bottomY = f.pos[1] - f.size[1] / 2;
      baseAnchors.push([f.pos[0], Math.max(0.1, bottomY), f.pos[2]]);
    });

    for (let i = 0; i < splashCount; i++) {
      const anchor = baseAnchors[i % baseAnchors.length];
      pos[i * 3] = anchor[0] + (random() - 0.5) * 1.6;
      pos[i * 3 + 1] = anchor[1] + random() * 0.5;
      pos[i * 3 + 2] = anchor[2] + (random() - 0.5) * 1.6;

      vel[i * 3] = (random() - 0.5) * 1.2;
      vel[i * 3 + 1] = random() * 2.4 + 1.0; // Bounce upward
      vel[i * 3 + 2] = (random() - 0.5) * 1.2;
    }

    return [pos, vel, baseAnchors];
  }, [falls]);

  // Rising Volcanic Steam / Vapor Particles
  const steamCount = 50;
  const [steamPos, steamVel, steamBaseAnchors] = useMemo(() => {
    const random = createPseudoRandom(1294);
    const pos = new Float32Array(steamCount * 3);
    const vel = new Float32Array(steamCount * 3);
    const anchors: [number, number, number][] = [];

    const keyFalls = falls.filter((f) => f.isPrimary || f.size[0] >= 1.4);
    keyFalls.forEach((f) => {
      const bottomY = f.pos[1] - f.size[1] / 2;
      anchors.push([f.pos[0], Math.max(0.2, bottomY), f.pos[2]]);
    });

    for (let i = 0; i < steamCount; i++) {
      const anchor = anchors[i % anchors.length];
      pos[i * 3] = anchor[0] + (random() - 0.5) * 2.2;
      pos[i * 3 + 1] = anchor[1] + random() * 3.5;
      pos[i * 3 + 2] = anchor[2] + (random() - 0.5) * 2.2;

      vel[i * 3] = (random() - 0.5) * 0.35;
      vel[i * 3 + 1] = random() * 1.5 + 0.7; // Drift upward
      vel[i * 3 + 2] = (random() - 0.5) * 0.35;
    }

    return [pos, vel, anchors];
  }, [falls]);

  useEffect(() => {
    textureRef.current = resources.tex;

    if (steamMatRef.current) {
      steamMatRef.current.map = resources.sTex;
      steamMatRef.current.needsUpdate = true;
    }

    return () => {
      resources.tex.dispose();
      resources.sTex.dispose();
      resources.chasmRockMat.dispose();
      resources.streamMat.dispose();
      resources.coreMat.dispose();
    };
  }, [resources]);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05);

    // Downward streaming UV animation
    if (textureRef.current) {
      textureRef.current.offset.y -= safeDelta * 1.6;
    }

    // 1. Animate Boiling Splash Sparks
    if (splashPointsRef.current) {
      const posAttr = splashPointsRef.current.geometry.attributes.position;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < splashCount; i++) {
        const idx = i * 3;
        array[idx] += splashVel[idx] * safeDelta;
        array[idx + 1] += splashVel[idx + 1] * safeDelta;
        array[idx + 2] += splashVel[idx + 2] * safeDelta;

        const anchor = splashBaseAnchors[i % splashBaseAnchors.length];
        if (array[idx + 1] > anchor[1] + 3.0 || array[idx + 1] < anchor[1]) {
          array[idx] = anchor[0] + (Math.random() - 0.5) * 1.4;
          array[idx + 1] = anchor[1] + 0.1;
          array[idx + 2] = anchor[2] + (Math.random() - 0.5) * 1.4;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Animate Rising Volcanic Steam / Vapor
    if (steamPointsRef.current) {
      const posAttr = steamPointsRef.current.geometry.attributes.position;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < steamCount; i++) {
        const idx = i * 3;
        array[idx] += steamVel[idx] * safeDelta;
        array[idx + 1] += steamVel[idx + 1] * safeDelta;
        array[idx + 2] += steamVel[idx + 2] * safeDelta;

        const anchor = steamBaseAnchors[i % steamBaseAnchors.length];
        if (array[idx + 1] > anchor[1] + 7.5) {
          array[idx] = anchor[0] + (Math.random() - 0.5) * 2.0;
          array[idx + 1] = anchor[1] + 0.2;
          array[idx + 2] = anchor[2] + (Math.random() - 0.5) * 2.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ------------------------------------------------------------- */}
      {/* 1. CASCADING MOLTEN LAVA WATERFALL STREAMS                     */}
      {/* ------------------------------------------------------------- */}
      {falls.map((fall, i) => (
        <LavaFallStream
          key={`lavafall-${i}`}
          fall={fall}
          chasmRockMat={resources.chasmRockMat}
          streamMat={resources.streamMat}
          coreMat={resources.coreMat}
        />
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 2. CHURNING SPLASH SPARKS AT WATERFALL IMPACTS                */}
      {/* ------------------------------------------------------------- */}
      <points ref={splashPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[splashPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.26}
          color="#ff7214"
          transparent
          opacity={0.82}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ------------------------------------------------------------- */}
      {/* 3. RISING VOLCANIC STEAM / VAPOR                              */}
      {/* ------------------------------------------------------------- */}
      <points ref={steamPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[steamPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={steamMatRef}
          size={1.6}
          color="#382226"
          transparent
          opacity={0.32}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ------------------------------------------------------------- */}
      {/* 4. WARM MOLTEN ROCK ILLUMINATION ON SURROUNDING BASALT CHASM  */}
      {/* ------------------------------------------------------------- */}
      <pointLight
        position={[-17.5, 3.2, -28]}
        color="#FF5A0A"
        intensity={9.0}
        distance={22}
        decay={2}
      />
      <pointLight
        position={[17.5, 3.2, -28]}
        color="#FF5A0A"
        intensity={9.0}
        distance={22}
        decay={2}
      />
      <pointLight
        position={[13.8, 2.0, -16]}
        color="#FF8A1A"
        intensity={7.5}
        distance={18}
        decay={2}
      />
    </group>
  );
}
