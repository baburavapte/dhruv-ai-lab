"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface EntryTransitionProps {
  approachProgress?: number; // 0 to 1
  throatProgress?: number; // 0 to 1
}

// Deterministic PRNG for ember particles
function createPseudoRandom(seed = 7711) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createThroatEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 181, 46, 1.0)");
  grad.addColorStop(0.3, "rgba(255, 90, 10, 0.8)");
  grad.addColorStop(0.65, "rgba(180, 40, 10, 0.3)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export default function EntryTransition({
  approachProgress,
  throatProgress,
}: EntryTransitionProps) {
  const portalRingRef = useRef<THREE.Group>(null);
  const portalVortexRef = useRef<THREE.Mesh>(null);
  const portalLightRef = useRef<THREE.PointLight>(null);
  const throatLight1Ref = useRef<THREE.PointLight>(null);
  const throatLight2Ref = useRef<THREE.PointLight>(null);
  const magmaVeinsRef = useRef<THREE.MeshBasicMaterial>(null);
  const embersRef = useRef<THREE.Points>(null);
  const embersMatRef = useRef<THREE.PointsMaterial>(null);
  const emberTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Rib arch positions along the throat tunnel: from Z = -26 to Z = -46
  const ribZPositions = useMemo(() => [-26.5, -30.5, -34.5, -38.5, -42.5], []);

  // Procedural throat ember particles
  const [emberPositions, emberSpeeds] = useMemo(() => {
    const count = 48;
    const random = createPseudoRandom(8844);
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Inside throat cavity: X: -2.8 to 2.8, Y: 1.5 to 5.8, Z: -26 to -46
      pos[i * 3] = (random() - 0.5) * 5.6;
      pos[i * 3 + 1] = random() * 4.3 + 1.5;
      pos[i * 3 + 2] = -26 - random() * 20;

      sp[i * 3] = (random() - 0.5) * 0.2;
      sp[i * 3 + 1] = random() * 0.4 + 0.15;
      sp[i * 3 + 2] = random() * 0.3 + 0.1; // slow drift toward mouth
    }
    return [pos, sp];
  }, []);

  // Organic throat materials
  const materials = useMemo(() => {
    return {
      // Dark volcanic fleshy basalt for throat tunnel interior
      throatBasalt: new THREE.MeshStandardMaterial({
        color: "#18141e",
        roughness: 0.88,
        metalness: 0.15,
        side: THREE.BackSide,
      }),
      // Organic ossified rib arches
      throatRib: new THREE.MeshStandardMaterial({
        color: "#2a1c22",
        roughness: 0.75,
        metalness: 0.25,
      }),
      // Crimson lining
      crimsonTissue: new THREE.MeshStandardMaterial({
        color: "#3d0812",
        roughness: 0.85,
        metalness: 0.1,
      }),
      // Dark obsidian portal frame
      portalFrame: new THREE.MeshStandardMaterial({
        color: "#120f18",
        roughness: 0.35,
        metalness: 0.85,
      }),
      // Bronze runic accents
      portalBronze: new THREE.MeshStandardMaterial({
        color: "#966832",
        roughness: 0.4,
        metalness: 0.7,
      }),
      // Fiery inner portal accretion disc
      portalCore: new THREE.MeshBasicMaterial({
        color: "#030206",
      }),
      portalRimFire: new THREE.MeshBasicMaterial({
        color: "#FF5A0A",
        toneMapped: false,
      }),
      portalRimCyan: new THREE.MeshBasicMaterial({
        color: "#00d4ff",
        toneMapped: false,
        transparent: true,
        opacity: 0.65,
      }),
    };
  }, []);

  useEffect(() => {
    const tex = createThroatEmberTexture();
    emberTextureRef.current = tex;
    if (embersMatRef.current) {
      embersMatRef.current.map = tex;
      embersMatRef.current.needsUpdate = true;
    }
    return () => {
      tex.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // 1. Portal Swirl and Animation
    if (portalVortexRef.current) {
      portalVortexRef.current.rotation.z -= safeDelta * 0.6;
    }
    if (portalRingRef.current) {
      portalRingRef.current.rotation.z += safeDelta * 0.3;
    }

    const effApproach =
      approachProgress !== undefined
        ? approachProgress
        : worldProgressState.approachProgress;
    const effThroat =
      throatProgress !== undefined
        ? throatProgress
        : worldProgressState.throatProgress;

    // 2. Portal Glow flare as player draws near
    if (portalLightRef.current) {
      // Base pulse + surge when throatProgress increases
      const basePulse = 3.5 + Math.sin(t * 4.0) * 0.8;
      const surge = effThroat * 14.0;
      portalLightRef.current.intensity = basePulse + surge;
    }

    // 3. Flickering throat firelight
    if (throatLight1Ref.current) {
      throatLight1Ref.current.intensity =
        6.5 + Math.sin(t * 7.2) * 1.2 + Math.cos(t * 13.5) * 0.6;
    }
    if (throatLight2Ref.current) {
      throatLight2Ref.current.intensity =
        5.8 + Math.sin(t * 6.5 + 2.1) * 1.0 + Math.cos(t * 11.8) * 0.5;
    }

    // 4. Magma veins pulsing with approach and throat progress
    if (magmaVeinsRef.current) {
      magmaVeinsRef.current.opacity =
        0.5 + effApproach * 0.2 + Math.sin(t * 3.0) * 0.2;
    }

    // 5. Throat ember animation
    if (embersRef.current) {
      const posAttr = embersRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const count = arr.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        arr[idx] += emberSpeeds[idx] * safeDelta;
        arr[idx + 1] += emberSpeeds[idx + 1] * safeDelta;
        arr[idx + 2] += emberSpeeds[idx + 2] * safeDelta;

        // Reset if drifted past mouth or too high
        if (arr[idx + 2] > -25.5 || arr[idx + 1] > 6.0) {
          arr[idx + 2] = -46.0;
          arr[idx + 1] = 1.6 + Math.random() * 2.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="entry-transition">
      {/* ------------------------------------------------------------- */}
      {/* 1. HOLLOW VOLCANIC THROAT CAVITY TUNNEL                       */}
      {/* Centered along X=0, Y=3.7, spanning Z from -25 to -47         */}
      {/* ------------------------------------------------------------- */}
      <mesh
        position={[0, 3.7, -36]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.throatBasalt}
      >
        {/* Cylinder with radius 4.5, height 22 (Z: -25 to -47) */}
        <cylinderGeometry args={[4.5, 4.8, 22, 28, 1, true]} />
      </mesh>

      {/* Deep throat floor basalt bed */}
      <mesh position={[0, 0.4, -36]} material={materials.crimsonTissue}>
        <boxGeometry args={[6.8, 0.6, 22]} />
      </mesh>

      {/* Glowing Magma Fissures along the Throat Floor */}
      <mesh position={[0, 0.72, -36]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 21]} />
        <meshBasicMaterial
          ref={magmaVeinsRef}
          color="#FF5A0A"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. SKELETAL BASALT RIB ARCHES                                 */}
      {/* ------------------------------------------------------------- */}
      {ribZPositions.map((rz, i) => (
        <group key={`throat-rib-${i}`} position={[0, 3.7, rz]}>
          {/* Outer semi-torus arch rib */}
          <mesh material={materials.throatRib}>
            <torusGeometry args={[4.4, 0.38, 8, 24, Math.PI]} />
          </mesh>
          {/* Left rib anchor strut */}
          <mesh
            position={[-4.3, -1.6, 0]}
            rotation={[0, 0, -0.15]}
            material={materials.throatRib}
          >
            <boxGeometry args={[0.7, 3.4, 0.7]} />
          </mesh>
          {/* Right rib anchor strut */}
          <mesh
            position={[4.3, -1.6, 0]}
            rotation={[0, 0, 0.15]}
            material={materials.throatRib}
          >
            <boxGeometry args={[0.7, 3.4, 0.7]} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 3. THROAT INTERNAL FIRELIGHT                                  */}
      {/* ------------------------------------------------------------- */}
      <pointLight
        ref={throatLight1Ref}
        position={[0, 3.8, -32.0]}
        color="#FF5A0A"
        distance={22}
        decay={2}
      />
      <pointLight
        ref={throatLight2Ref}
        position={[0, 3.8, -41.0]}
        color="#C8320A"
        distance={22}
        decay={2}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. THROAT FLOATING EMBERS                                     */}
      {/* ------------------------------------------------------------- */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[emberPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={embersMatRef}
          size={0.12}
          color="#FF8A1A"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ------------------------------------------------------------- */}
      {/* 5. DEEP TRANSITION PORTAL (Z = -46.5)                          */}
      {/* Circular mysterious portal connecting ancient fire to AI Lab   */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 3.7, -46.5]}>
        {/* Massive Back Wall sealing the tunnel behind the portal */}
        <mesh position={[0, 0, -0.6]} material={materials.throatBasalt}>
          <boxGeometry args={[12, 10, 1.2]} />
        </mesh>

        {/* Outer Heavy Obsidian Portal Ring */}
        <mesh material={materials.portalFrame}>
          <torusGeometry args={[3.6, 0.45, 16, 40]} />
        </mesh>

        {/* Bronze Rune Inscriptions around Rim */}
        <group ref={portalRingRef}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * 3.6;
            const y = Math.sin(rad) * 3.6;
            return (
              <mesh
                key={`rune-${i}`}
                position={[x, y, 0.1]}
                rotation={[0, 0, rad]}
                material={materials.portalBronze}
              >
                <boxGeometry args={[0.35, 0.7, 0.2]} />
              </mesh>
            );
          })}
        </group>

        {/* Fiery Molten Inner Accretion Rim */}
        <mesh position={[0, 0, 0.05]} material={materials.portalRimFire}>
          <torusGeometry args={[3.2, 0.12, 12, 40]} />
        </mesh>

        {/* Subtle Technological Cyan Rim — Hint of the AI Lab Ahead */}
        <mesh position={[0, 0, 0.08]} material={materials.portalRimCyan}>
          <torusGeometry args={[3.0, 0.06, 12, 40]} />
        </mesh>

        {/* Deep Black Mysterious Center Vortex */}
        <mesh ref={portalVortexRef} position={[0, 0, 0.02]}>
          <circleGeometry args={[3.15, 36]} />
          <meshBasicMaterial color="#020105" />
        </mesh>

        {/* Inner Event Horizon Glow Light */}
        <pointLight
          ref={portalLightRef}
          position={[0, 0, 0.8]}
          color="#FF5A0A"
          distance={18}
          decay={2}
        />
      </group>
    </group>
  );
}
