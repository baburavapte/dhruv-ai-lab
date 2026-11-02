"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
}

// Pure deterministic pseudo-random generator
function createPseudoRandom(seed = 42) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Procedural circular soft ember texture with natural glow falloff (no square pixels)
function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 181, 46, 1.0)"); // #FFB52E
  grad.addColorStop(0.25, "rgba(255, 90, 10, 0.85)"); // #FF5A0A
  grad.addColorStop(0.55, "rgba(200, 50, 10, 0.45)"); // #C8320A
  grad.addColorStop(0.85, "rgba(90, 8, 0, 0.15)"); // #5A0800
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Particles({ count = 220 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const [positions, speeds] = useMemo(() => {
    const random = createPseudoRandom(1337);
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Flank along the lava seas and outer colonnades, keeping the center corridor clear
      const side = random() > 0.5 ? 1 : -1;
      const x = side * (4.8 + random() * 18.0);
      const y = 0.4 + random() * 11.5;
      const z = -44 + random() * 56;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Gentle upward drift with subtle organic draft
      sp[i * 3] = (random() - 0.5) * 0.25;
      sp[i * 3 + 1] = 0.35 + random() * 0.55;
      sp[i * 3 + 2] = (random() - 0.5) * 0.25;
    }

    return [pos, sp];
  }, [count]);

  useEffect(() => {
    const tex = createEmberTexture();
    textureRef.current = tex;
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }
    return () => {
      tex.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;
    const safeDelta = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Upward float
      array[idx + 1] += speeds[idx + 1] * safeDelta;
      // Gentle horizontal sway
      array[idx] += Math.sin(array[idx + 1] * 0.7 + i) * 0.15 * safeDelta;

      // Reset when floating too high
      if (array[idx + 1] > 13.5) {
        array[idx + 1] = 0.3;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.22}
        color="#ff7a18"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
