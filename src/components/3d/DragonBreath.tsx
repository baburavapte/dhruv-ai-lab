"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DragonBreathProps {
  mouthOpenRef: RefObject<number>;
  headRef?: RefObject<THREE.Group | null>;
}

interface ParticleData {
  type: "nostril-l1" | "nostril-l2" | "mouth";
  isLeft: boolean;
  life: number;
  maxLife: number;
  initialSize: number;
  targetSize: number;
  baseOpacity: number;
  baseColor: THREE.Color;
  spawnOffsetX: number;
  spawnOffsetY: number;
  spawnOffsetZ: number;
  vx: number;
  vy: number;
  vz: number;
  swirlAmp: number;
  swirlFreq: number;
  swirlPhase: number;
}

const _dummy = new THREE.Object3D();
const _tempColor = new THREE.Color();

function createPseudoRandom(seed = 12345) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Procedural soft volumetric radial smoke texture
function createSmokeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  grad.addColorStop(0.2, "rgba(240, 240, 240, 0.80)");
  grad.addColorStop(0.45, "rgba(210, 210, 210, 0.45)");
  grad.addColorStop(0.7, "rgba(180, 180, 180, 0.18)");
  grad.addColorStop(1, "rgba(140, 140, 140, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// Procedural warm heat glow texture for nostrils
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 120, 30, 0.95)");
  grad.addColorStop(0.25, "rgba(255, 70, 10, 0.65)");
  grad.addColorStop(0.6, "rgba(220, 40, 0, 0.20)");
  grad.addColorStop(1, "rgba(150, 20, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function initParticleData(): ParticleData[] {
  const list: ParticleData[] = [];
  const random = createPseudoRandom(4321);

  const colLayer1 = new THREE.Color("#786558");
  const colLayer2 = new THREE.Color("#9c938b");
  const colMouth = new THREE.Color("#827265");

  const nostrilParticlesPerSide = 32;
  for (let side = 0; side < 2; side++) {
    const isLeft = side === 0;
    for (let i = 0; i < nostrilParticlesPerSide; i++) {
      const isLayer1 = i < 16;
      const maxLife = isLayer1 ? 1.0 + random() * 0.3 : 1.5 + random() * 0.4;
      const initialLife = random() * maxLife;

      list.push({
        type: isLayer1 ? "nostril-l1" : "nostril-l2",
        isLeft,
        life: initialLife,
        maxLife,
        initialSize: isLayer1 ? 0.20 + random() * 0.10 : 0.35 + random() * 0.15,
        targetSize: isLayer1 ? 0.60 + random() * 0.20 : 1.1 + random() * 0.25,
        baseOpacity: isLayer1 ? 0.28 : 0.20,
        baseColor: isLayer1 ? colLayer1 : colLayer2,
        spawnOffsetX: (random() - 0.5) * 0.1,
        spawnOffsetY: (random() - 0.5) * 0.08,
        spawnOffsetZ: (random() - 0.5) * 0.12,
        vy: isLayer1 ? 0.5 + random() * 0.2 : 0.8 + random() * 0.3,
        vz: isLayer1 ? 0.5 + random() * 0.2 : 0.7 + random() * 0.3,
        vx: (isLeft ? -1 : 1) * (isLayer1 ? 0.12 + random() * 0.1 : 0.22 + random() * 0.15),
        swirlAmp: 0.12 + random() * 0.1,
        swirlFreq: 2.5 + random() * 1.5,
        swirlPhase: random() * Math.PI * 2,
      });
    }
  }

  for (let i = 0; i < 16; i++) {
    const maxLife = 2.0 + random() * 0.8;
    const initialLife = random() * maxLife;
    list.push({
      type: "mouth",
      isLeft: false,
      life: initialLife,
      maxLife,
      initialSize: 0.4 + random() * 0.2,
      targetSize: 1.4 + random() * 0.35,
      baseOpacity: 0.24,
      baseColor: colMouth,
      spawnOffsetX: (random() - 0.5) * 0.8,
      spawnOffsetY: 2.8 + (random() - 0.5) * 0.4,
      spawnOffsetZ: 4.8 + (random() - 0.5) * 0.5,
      vy: 0.35 + random() * 0.2,
      vz: 0.8 + random() * 0.3,
      vx: (random() - 0.5) * 0.25,
      swirlAmp: 0.15 + random() * 0.1,
      swirlFreq: 2.0 + random() * 1.0,
      swirlPhase: random() * Math.PI * 2,
    });
  }

  return list;
}

export default function DragonBreath({ mouthOpenRef, headRef }: DragonBreathProps) {
  const instancedSmokeRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<ParticleData[]>(initParticleData());

  // Nostril smoldering heat glow sprites
  const leftGlowRef = useRef<THREE.Sprite>(null);
  const rightGlowRef = useRef<THREE.Sprite>(null);
  const leftGlowMatRef = useRef<THREE.SpriteMaterial>(null);
  const rightGlowMatRef = useRef<THREE.SpriteMaterial>(null);

  // Throat fiery embers
  const throatEmbersRef = useRef<THREE.Points>(null);
  const throatMatRef = useRef<THREE.PointsMaterial>(null);

  // Pre-generate throat ember buffer data
  const emberCount = 65;
  const [emberPos, emberVel] = useMemo(() => {
    const random = createPseudoRandom(888);
    const pos = new Float32Array(emberCount * 3);
    const vel = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      pos[i * 3] = (random() - 0.5) * 2.2;
      pos[i * 3 + 1] = 3.6 + (random() - 0.5) * 1.2;
      pos[i * 3 + 2] = 2.0 + random() * 3.2;

      vel[i * 3] = (random() - 0.5) * 0.45;
      vel[i * 3 + 1] = random() * 0.7 + 0.3;
      vel[i * 3 + 2] = random() * 1.4 + 0.9;
    }

    return [pos, vel];
  }, []);

  // Shared textures and materials
  const textures = useMemo(() => {
    return {
      smoke: createSmokeTexture(),
      glow: createGlowTexture(),
    };
  }, []);

  const particleCount = 80;

  const smokeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: textures.smoke,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
  }, [textures.smoke]);

  useEffect(() => {
    return () => {
      textures.smoke.dispose();
      textures.glow.dispose();
      smokeMaterial.dispose();
    };
  }, [textures, smokeMaterial]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouthFactor = mouthOpenRef.current ?? 0;

    const headY = headRef?.current?.position.y ?? 6.8;
    const headX = headRef?.current?.position.x ?? 0;
    const headZ = headRef?.current?.position.z ?? 1.0;

    const leftNostrilX = headX - 0.75;
    const rightNostrilX = headX + 0.75;
    const nostrilY = headY - 0.22;
    const nostrilZ = headZ + 5.5;

    // 1. Update Nostril Smoldering Heat Glow
    const breathPulse = 0.85 + Math.sin(t * 3.0) * 0.15;
    const glowOpacity = 0.5 + breathPulse * 0.2 + mouthFactor * 0.25;
    const glowScale = 0.35 + breathPulse * 0.1;

    if (leftGlowRef.current && leftGlowMatRef.current) {
      leftGlowRef.current.position.set(leftNostrilX, nostrilY, nostrilZ + 0.1);
      leftGlowRef.current.scale.set(glowScale, glowScale, 1);
      leftGlowMatRef.current.opacity = Math.min(0.95, glowOpacity);
    }
    if (rightGlowRef.current && rightGlowMatRef.current) {
      rightGlowRef.current.position.set(rightNostrilX, nostrilY, nostrilZ + 0.1);
      rightGlowRef.current.scale.set(glowScale, glowScale, 1);
      rightGlowMatRef.current.opacity = Math.min(0.95, glowOpacity);
    }

    // 2. Animate Instanced Smoke Particles (Single Draw Call!)
    const instMesh = instancedSmokeRef.current;
    if (instMesh) {
      const speedMult = 1.0 + mouthFactor * 0.45;
      const camQuat = state.camera.quaternion;
      const pts = particlesRef.current;
      for (let i = 0; i < particleCount; i++) {
        const p = pts[i];
        p.life += delta * speedMult;
        if (p.life >= p.maxLife) {
          p.life = 0;
        }

        const u = p.life / p.maxLife;

        let originX: number;
        let originY: number;
        let originZ: number;

        if (p.type === "mouth") {
          originX = p.spawnOffsetX;
          originY = p.spawnOffsetY - mouthFactor * 0.3;
          originZ = p.spawnOffsetZ;
        } else {
          originX = (p.isLeft ? leftNostrilX : rightNostrilX) + p.spawnOffsetX;
          originY = nostrilY + p.spawnOffsetY;
          originZ = nostrilZ + p.spawnOffsetZ;
        }

        const swirl = Math.sin(p.swirlPhase + u * p.swirlFreq) * p.swirlAmp * u;
        const posX = originX + p.vx * p.life + swirl;
        const posY = originY + p.vy * p.life;
        const posZ = originZ + p.vz * p.life;

        const expansionFactor = Math.pow(u, 0.65);
        const currentSize = THREE.MathUtils.lerp(p.initialSize, p.targetSize, expansionFactor);

        let alphaEnvelope = Math.sin(u * Math.PI);
        if (u < 0.2) {
          alphaEnvelope = Math.pow(u / 0.2, 0.8);
        } else {
          alphaEnvelope = Math.pow(1 - (u - 0.2) / 0.8, 1.2);
        }

        let opacity = alphaEnvelope * p.baseOpacity;
        if (p.type === "mouth") {
          opacity *= 0.2 + mouthFactor * 0.8;
        } else {
          opacity *= 1.0 + mouthFactor * 0.25;
        }
        opacity = Math.max(0, Math.min(0.85, opacity));

        _dummy.position.set(posX, posY, posZ);
        _dummy.quaternion.copy(camQuat);
        _dummy.scale.set(currentSize, currentSize, 1);
        _dummy.updateMatrix();
        instMesh.setMatrixAt(i, _dummy.matrix);

        _tempColor.copy(p.baseColor).multiplyScalar(Math.max(0.01, opacity * 1.2));
        instMesh.setColorAt(i, _tempColor);
      }

      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;
    }

    // 3. Animate Throat Fiery Embers
    if (throatMatRef.current) {
      throatMatRef.current.opacity = 0.5 + mouthFactor * 0.45;
    }

    if (throatEmbersRef.current) {
      const posAttr = throatEmbersRef.current.geometry.attributes.position;
      const array = posAttr.array as Float32Array;
      const emberSpeed = 1.0 + mouthFactor * 1.8;

      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3;
        array[idx] += emberVel[idx] * delta * emberSpeed;
        array[idx + 1] += emberVel[idx + 1] * delta * emberSpeed;
        array[idx + 2] += emberVel[idx + 2] * delta * emberSpeed;

        if (array[idx + 2] > 9.5 || array[idx + 1] > 8.5) {
          array[idx] = Math.sin(i * 1.7) * 1.1;
          array[idx + 1] = 3.6 + Math.cos(i * 2.3) * 0.6;
          array[idx + 2] = 2.0 + (i % 5) * 0.4;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="dragon-breath-system">
      {/* 1. Nostril Smoldering Heat Glow Sprites (2 instances) */}
      <sprite ref={leftGlowRef}>
        <spriteMaterial
          ref={leftGlowMatRef}
          map={textures.glow}
          color="#ff6611"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={rightGlowRef}>
        <spriteMaterial
          ref={rightGlowMatRef}
          map={textures.glow}
          color="#ff6611"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* 2. Instanced Volumetric Smoke (Batched into 1 single GPU draw call) */}
      <instancedMesh
        ref={instancedSmokeRef}
        args={[undefined, undefined, particleCount]}
        material={smokeMaterial}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>

      {/* 3. Fiery Throat Embers Escaping Maw */}
      <points ref={throatEmbersRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={throatMatRef}
          map={textures.glow}
          size={0.14}
          color="#ff7711"
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
