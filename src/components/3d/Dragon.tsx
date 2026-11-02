"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DragonBreath from "./DragonBreath";
import { worldProgressState } from "@/lib/worldProgress";

interface DragonProps {
  approachProgress?: number; // 0 to 1 from camera
  mouthOpenFactor?: number; // 0 to 1 direct from loop
}

export default function Dragon({
  approachProgress = 0,
  mouthOpenFactor,
}: DragonProps) {
  const headGroupRef = useRef<THREE.Group>(null);
  const jawPivotRef = useRef<THREE.Group>(null);
  const eyeLeftLightRef = useRef<THREE.PointLight>(null);
  const eyeRightLightRef = useRef<THREE.PointLight>(null);
  const throatLightRef = useRef<THREE.PointLight>(null);

  // Smoothly interpolated mouth opening factor (0 = closed, 1 = fully open)
  const mouthOpenFactorRef = useRef(0);

  // Stylized dark fantasy materials with distinct volcanic obsidian tones and clear contrast against fortress
  const materials = useMemo(() => {
    return {
      // Dark volcanic obsidian scales (deeper than castle stone #35313d)
      dragonScale: new THREE.MeshStandardMaterial({
        color: "#181520",
        roughness: 0.58,
        metalness: 0.30,
      }),
      // Mid-tone armored plates for cranial ridge and snout
      dragonPlate: new THREE.MeshStandardMaterial({
        color: "#282332",
        roughness: 0.50,
        metalness: 0.38,
      }),
      // Crisp edge-highlight plates for brow, cheekbones, and jaw borders (provides clean silhouette separation)
      dragonPlateHighlight: new THREE.MeshStandardMaterial({
        color: "#423850",
        roughness: 0.42,
        metalness: 0.45,
      }),
      // Aged volcanic bronze accents on horns and spinal crests
      dragonBronze: new THREE.MeshStandardMaterial({
        color: "#967032",
        roughness: 0.35,
        metalness: 0.75,
      }),
      // Polished volcanic glass black horns (catches rim lighting cleanly)
      dragonHorn: new THREE.MeshStandardMaterial({
        color: "#131018",
        roughness: 0.28,
        metalness: 0.65,
      }),
      // Ancient fossilized ivory dragon bone teeth
      dragonBone: new THREE.MeshStandardMaterial({
        color: "#dfd7c6",
        roughness: 0.32,
        metalness: 0.08,
      }),
      // Deep dark throat void (abyssal interior)
      throatCavity: new THREE.MeshStandardMaterial({
        color: "#150308",
        roughness: 0.95,
        metalness: 0.02,
      }),
      // Molten orange/red glowing eyes (restrained, no neon washout)
      dragonEye: new THREE.MeshBasicMaterial({
        color: "#FF5A0A",
        toneMapped: false,
      }),
      eyeCore: new THREE.MeshBasicMaterial({
        color: "#FF8A1A",
        toneMapped: false,
      }),
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Dynamic mouth opening: supports direct mouthOpenFactor or global worldProgressState
    const mFactor = mouthOpenFactor ?? worldProgressState.mouthOpen;
    const aProgress = approachProgress ?? worldProgressState.approachProgress;

    let targetOpen = 0;
    if (mFactor !== undefined) {
      targetOpen = THREE.MathUtils.clamp(mFactor, 0, 1);
    } else if (aProgress > 0.40) {
      const u = Math.min(1, Math.max(0, (aProgress - 0.40) / 0.60));
      targetOpen = u * u * u * (u * (u * 6 - 15) + 10);
    }

    // Smooth frame-rate-independent damping between current and target opening
    mouthOpenFactorRef.current = THREE.MathUtils.damp(
      mouthOpenFactorRef.current,
      targetOpen,
      8.0,
      safeDelta
    );
    const mOpen = mouthOpenFactorRef.current;

    // 2. Idle Organic Breathing Animation (Subtle Head & Neck sway)
    const breathCycle = Math.sin(t * 1.5);
    if (headGroupRef.current) {
      // Subtle vertical breathing bob
      headGroupRef.current.position.y = 6.8 + breathCycle * 0.06;
      // Majestic tilt as maw widens
      headGroupRef.current.rotation.x = breathCycle * 0.012 - mOpen * 0.04;
      headGroupRef.current.rotation.y = Math.sin(t * 0.75) * 0.01;
    }

    // 3. Anatomical Lower Jaw Hinge Arc
    // Pivots smoothly downward around rear mandible hinge while teeth move as children
    if (jawPivotRef.current) {
      jawPivotRef.current.rotation.x = mOpen * 0.46;
      jawPivotRef.current.position.y = 3.2 - mOpen * 0.38;
      jawPivotRef.current.position.z = 1.0 - mOpen * 0.20;
    }

    // 4. Molten Dragon Eye Glow Pulse (always visible even in darkness)
    const eyePulse = 0.92 + Math.sin(t * 3.8) * 0.10;
    if (eyeLeftLightRef.current) eyeLeftLightRef.current.intensity = (2.2 + aProgress * 1.5) * eyePulse;
    if (eyeRightLightRef.current) eyeRightLightRef.current.intensity = (2.2 + aProgress * 1.5) * eyePulse;

    // 5. Deeper Crimson Magma Throat Light
    if (throatLightRef.current) {
      throatLightRef.current.intensity = 1.5 + mOpen * 11.0;
    }
  });

  return (
    // Positioned at Z = -31.5 proudly anchoring the gatehouse entrance
    <group position={[0, 0, -31.5]}>
      {/* ------------------------------------------------------------- */}
      {/* 1. SCALED COLLAR & ARMORED BUTTRESSES FRAMING GATEWAY         */}
      {/* ------------------------------------------------------------- */}
      <group position={[-6.0, 6.0, -0.6]}>
        <mesh castShadow receiveShadow material={materials.dragonScale}>
          <boxGeometry args={[2.8, 12, 4.2]} />
        </mesh>
        {[1, 3, 5, 7, 9, 11].map((y, i) => (
          <mesh
            key={`scute-l-${i}`}
            position={[0.3, y - 6.0, 2.1]}
            rotation={[0.22, 0.12, -0.05]}
            castShadow
            material={materials.dragonPlate}
          >
            <boxGeometry args={[2.6, 1.3, 0.65]} />
          </mesh>
        ))}
      </group>

      <group position={[6.0, 6.0, -0.6]}>
        <mesh castShadow receiveShadow material={materials.dragonScale}>
          <boxGeometry args={[2.8, 12, 4.2]} />
        </mesh>
        {[1, 3, 5, 7, 9, 11].map((y, i) => (
          <mesh
            key={`scute-r-${i}`}
            position={[-0.3, y - 6.0, 2.1]}
            rotation={[0.22, -0.12, 0.05]}
            castShadow
            material={materials.dragonPlate}
          >
            <boxGeometry args={[2.6, 1.3, 0.65]} />
          </mesh>
        ))}
      </group>

      {/* Massive dragon collar crest crowning over gatehouse arch */}
      <group position={[0, 13.0, -0.2]}>
        <mesh castShadow receiveShadow material={materials.dragonPlate}>
          <boxGeometry args={[11.8, 2.6, 4.0]} />
        </mesh>
        <mesh position={[0, 1.6, 0.6]} castShadow material={materials.dragonBronze}>
          <boxGeometry args={[10.2, 0.5, 3.0]} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. DRAGON UPPER HEAD & SKULL (Animated Bob / Tilt)            */}
      {/* ------------------------------------------------------------- */}
      <group ref={headGroupRef} position={[0, 6.8, 1.8]}>
        {/* Cranium / Tapered Skull Vault */}
        <mesh position={[0, 1.5, -0.3]} castShadow receiveShadow material={materials.dragonScale}>
          <boxGeometry args={[4.2, 3.0, 4.4]} />
        </mesh>

        {/* Central Dorsal Crest / Sagittal Ridge with bronze spines */}
        <mesh position={[0, 3.3, -0.5]} rotation={[-0.22, 0, 0]} castShadow material={materials.dragonBronze}>
          <coneGeometry args={[0.65, 3.6, 8]} />
        </mesh>
        {[-1.0, 0.6, 2.2].map((z, i) => (
          <mesh
            key={`dorsal-spike-${i}`}
            position={[0, 3.1 - i * 0.38, z]}
            rotation={[-0.18, 0, 0]}
            material={materials.dragonBronze}
          >
            <coneGeometry args={[0.26, 1.2, 6]} />
          </mesh>
        ))}

        {/* --- MAJESTIC SWEEPING HORNS (Curving Up, Back and Outward) --- */}
        {/* Left Primary Horn: Clearly silhouetted against gate arch */}
        <group position={[-2.3, 2.8, -1.0]}>
          <mesh rotation={[-0.52, -0.32, -0.32]} castShadow material={materials.dragonHorn}>
            <cylinderGeometry args={[0.62, 0.92, 3.2, 8]} />
          </mesh>
          <mesh position={[-0.95, 2.3, -1.5]} rotation={[-0.82, -0.42, -0.52]} castShadow material={materials.dragonHorn}>
            <cylinderGeometry args={[0.38, 0.62, 3.0, 8]} />
          </mesh>
          <mesh position={[-1.8, 4.4, -3.2]} rotation={[-1.12, -0.42, -0.62]} castShadow material={materials.dragonHorn}>
            <coneGeometry args={[0.38, 3.2, 8]} />
          </mesh>
          <mesh position={[-0.3, 0.75, -0.45]} rotation={[-0.52, -0.32, -0.32]} material={materials.dragonBronze}>
            <torusGeometry args={[0.88, 0.11, 6, 16]} />
          </mesh>
        </group>

        {/* Right Primary Horn */}
        <group position={[2.3, 2.8, -1.0]}>
          <mesh rotation={[-0.52, 0.32, 0.32]} castShadow material={materials.dragonHorn}>
            <cylinderGeometry args={[0.62, 0.92, 3.2, 8]} />
          </mesh>
          <mesh position={[0.95, 2.3, -1.5]} rotation={[-0.82, 0.42, 0.52]} castShadow material={materials.dragonHorn}>
            <cylinderGeometry args={[0.38, 0.62, 3.0, 8]} />
          </mesh>
          <mesh position={[1.8, 4.4, -3.2]} rotation={[-1.12, 0.42, 0.62]} castShadow material={materials.dragonHorn}>
            <coneGeometry args={[0.38, 3.2, 8]} />
          </mesh>
          <mesh position={[0.3, 0.75, -0.45]} rotation={[-0.52, 0.32, 0.32]} material={materials.dragonBronze}>
            <torusGeometry args={[0.88, 0.11, 6, 16]} />
          </mesh>
        </group>

        {/* Secondary Brow Spikes */}
        <mesh position={[-1.75, 2.2, 1.4]} rotation={[-0.32, -0.22, -0.28]} castShadow material={materials.dragonBronze}>
          <coneGeometry args={[0.30, 1.7, 6]} />
        </mesh>
        <mesh position={[1.75, 2.2, 1.4]} rotation={[-0.32, 0.22, 0.28]} castShadow material={materials.dragonBronze}>
          <coneGeometry args={[0.30, 1.7, 6]} />
        </mesh>

        {/* Flared Armored Cheek Plates: Defines wide predatory jaw base */}
        <mesh position={[-2.7, 0.2, 0.8]} rotation={[0.1, 0.28, 0.32]} castShadow material={materials.dragonPlateHighlight}>
          <boxGeometry args={[0.55, 2.1, 3.0]} />
        </mesh>
        <mesh position={[2.7, 0.2, 0.8]} rotation={[0.1, -0.28, -0.32]} castShadow material={materials.dragonPlateHighlight}>
          <boxGeometry args={[0.55, 2.1, 3.0]} />
        </mesh>

        {/* --- PROMINENT REPTILIAN BROW CREST --- */}
        <mesh position={[0, 1.82, 2.3]} rotation={[0.28, 0, 0]} castShadow material={materials.dragonPlateHighlight}>
          <boxGeometry args={[4.4, 0.68, 1.8]} />
        </mesh>

        {/* --- RESTING MOLTEN AMBER/ORANGE GLOWING EYES --- */}
        {/* Left Eye: Almond-shaped socket hooded beneath brow */}
        <group position={[-1.72, 1.25, 2.65]} rotation={[0, 0.15, -0.08]}>
          <mesh material={materials.dragonPlate}>
            <boxGeometry args={[0.92, 0.78, 0.6]} />
          </mesh>
          <mesh position={[0, 0, 0.34]} material={materials.dragonEye}>
            <sphereGeometry args={[0.44, 12, 12]} />
          </mesh>
          <mesh position={[0, 0, 0.50]} scale={[0.45, 0.85, 0.45]} material={materials.eyeCore}>
            <sphereGeometry args={[0.26, 8, 8]} />
          </mesh>
          <pointLight
            ref={eyeLeftLightRef}
            position={[0, 0, 0.65]}
            color="#ff5500"
            distance={10}
            decay={2}
          />
        </group>

        {/* Right Eye */}
        <group position={[1.72, 1.25, 2.65]} rotation={[0, -0.15, 0.08]}>
          <mesh material={materials.dragonPlate}>
            <boxGeometry args={[0.92, 0.78, 0.6]} />
          </mesh>
          <mesh position={[0, 0, 0.34]} material={materials.dragonEye}>
            <sphereGeometry args={[0.44, 12, 12]} />
          </mesh>
          <mesh position={[0, 0, 0.50]} scale={[0.45, 0.85, 0.45]} material={materials.eyeCore}>
            <sphereGeometry args={[0.26, 8, 8]} />
          </mesh>
          <pointLight
            ref={eyeRightLightRef}
            position={[0, 0, 0.65]}
            color="#ff5500"
            distance={10}
            decay={2}
          />
        </group>

        {/* --- DOWNWARD TAPERING PREDATORY SNOUT --- */}
        <mesh position={[0, -0.05, 3.4]} rotation={[-0.08, 0, 0]} castShadow receiveShadow material={materials.dragonPlate}>
          <boxGeometry args={[2.9, 1.25, 3.5]} />
        </mesh>
        <mesh position={[0, -0.32, 4.9]} castShadow material={materials.dragonPlateHighlight}>
          <boxGeometry args={[2.3, 1.05, 1.4]} />
        </mesh>

        {/* Nostril Insets & Beveled Armor Shells */}
        <group position={[-0.72, -0.22, 5.4]}>
          <mesh castShadow material={materials.dragonPlateHighlight}>
            <boxGeometry args={[0.52, 0.52, 0.58]} />
          </mesh>
          <mesh position={[0, 0, 0.18]} rotation={[0.38, 0, 0]} material={materials.throatCavity}>
            <cylinderGeometry args={[0.20, 0.10, 0.38, 6]} />
          </mesh>
        </group>
        <group position={[0.72, -0.22, 5.4]}>
          <mesh castShadow material={materials.dragonPlateHighlight}>
            <boxGeometry args={[0.52, 0.52, 0.58]} />
          </mesh>
          <mesh position={[0, 0, 0.18]} rotation={[0.38, 0, 0]} material={materials.throatCavity}>
            <cylinderGeometry args={[0.20, 0.10, 0.38, 6]} />
          </mesh>
        </group>

        {/* Snout Dorsal Spikes */}
        {[2.7, 3.7, 4.7].map((z, i) => (
          <mesh
            key={`snout-spike-${i}`}
            position={[0, 0.92 - i * 0.14, z]}
            rotation={[-0.18, 0, 0]}
            material={materials.dragonBronze}
          >
            <coneGeometry args={[0.20, 0.75, 6]} />
          </mesh>
        ))}

        {/* ----------------------------------------------------------- */}
        {/* UPPER JAW TEETH (ALL POINTING DOWNWARD SYMMETRICALLY)       */}
        {/* ----------------------------------------------------------- */}
        {/* Giant Left Front Saber Fang (Apex pointing straight DOWN) */}
        <mesh position={[-1.22, -0.85, 4.7]} rotation={[Math.PI - 0.08, 0, 0.05]} castShadow material={materials.dragonBone}>
          <coneGeometry args={[0.25, 1.35, 8]} />
        </mesh>
        {/* Giant Right Front Saber Fang (Apex pointing straight DOWN) */}
        <mesh position={[1.22, -0.85, 4.7]} rotation={[Math.PI - 0.08, 0, -0.05]} castShadow material={materials.dragonBone}>
          <coneGeometry args={[0.25, 1.35, 8]} />
        </mesh>

        {/* Upper Front Symmetrical Incisors */}
        {[-0.42, 0.42].map((x, i) => (
          <mesh
            key={`upper-front-tooth-${i}`}
            position={[x, -0.74, 5.0]}
            rotation={[Math.PI - 0.06, 0, 0]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.14, 0.72, 6]} />
          </mesh>
        ))}

        {/* Upper Side Symmetrical Premolars (Points DOWN) */}
        {[-1.35, -1.30, -1.25].map((x, i) => (
          <mesh
            key={`upper-side-l-${i}`}
            position={[x, -0.74, 3.7 - i * 0.8]}
            rotation={[Math.PI, 0, 0.12]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.15, 0.78, 6]} />
          </mesh>
        ))}
        {[1.35, 1.30, 1.25].map((x, i) => (
          <mesh
            key={`upper-side-r-${i}`}
            position={[x, -0.74, 3.7 - i * 0.8]}
            rotation={[Math.PI, 0, -0.12]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.15, 0.78, 6]} />
          </mesh>
        ))}

        {/* Upper Mouth Palate Roof */}
        <mesh position={[0, -0.65, 3.3]} material={materials.throatCavity}>
          <boxGeometry args={[2.9, 0.28, 4.0]} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. HINGED LOWER JAW (Animated Mouth Opening)                  */}
      {/* ------------------------------------------------------------- */}
      <group ref={jawPivotRef} position={[0, 3.2, 1.0]}>
        {/* Main Lower Mandible Frame */}
        <mesh position={[0, -0.38, 2.7]} castShadow receiveShadow material={materials.dragonPlate}>
          <boxGeometry args={[3.1, 1.05, 4.4]} />
        </mesh>

        {/* Sculpted Chin Armor Block */}
        <mesh position={[0, -0.68, 4.7]} castShadow material={materials.dragonPlateHighlight}>
          <boxGeometry args={[2.4, 1.35, 1.7]} />
        </mesh>

        {/* Lower Chin Beard Spikes */}
        <mesh position={[0, -1.65, 4.8]} rotation={[0.38, 0, 0]} material={materials.dragonBronze}>
          <coneGeometry args={[0.28, 1.25, 6]} />
        </mesh>
        <mesh position={[-0.75, -1.45, 4.3]} rotation={[0.28, 0, -0.18]} material={materials.dragonBronze}>
          <coneGeometry args={[0.20, 0.95, 6]} />
        </mesh>
        <mesh position={[0.75, -1.45, 4.3]} rotation={[0.28, 0, 0.18]} material={materials.dragonBronze}>
          <coneGeometry args={[0.20, 0.95, 6]} />
        </mesh>

        {/* ----------------------------------------------------------- */}
        {/* LOWER JAW TEETH (ALL POINTING UPWARD SYMMETRICALLY)         */}
        {/* ----------------------------------------------------------- */}
        {/* Giant Left Lower Tusk (Points UP, interlocks with upper fangs) */}
        <mesh position={[-1.0, 0.70, 4.8]} rotation={[-0.08, 0, -0.05]} castShadow material={materials.dragonBone}>
          <coneGeometry args={[0.23, 1.30, 8]} />
        </mesh>
        {/* Giant Right Lower Tusk */}
        <mesh position={[1.0, 0.70, 4.8]} rotation={[-0.08, 0, 0.05]} castShadow material={materials.dragonBone}>
          <coneGeometry args={[0.23, 1.30, 8]} />
        </mesh>

        {/* Lower Front Symmetrical Incisors (Points UP) */}
        {[-0.32, 0.32].map((x, i) => (
          <mesh
            key={`lower-front-tooth-${i}`}
            position={[x, 0.50, 4.8]}
            rotation={[0.07, 0, 0]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.13, 0.68, 6]} />
          </mesh>
        ))}

        {/* Lower Side Symmetrical Teeth Rows (Points UP) */}
        {[-1.22, -1.17, -1.12].map((x, i) => (
          <mesh
            key={`lower-side-l-${i}`}
            position={[x, 0.46, 3.5 - i * 0.8]}
            rotation={[0, 0, -0.1]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.14, 0.68, 6]} />
          </mesh>
        ))}
        {[1.22, 1.17, 1.12].map((x, i) => (
          <mesh
            key={`lower-side-r-${i}`}
            position={[x, 0.46, 3.5 - i * 0.8]}
            rotation={[0, 0, 0.1]}
            castShadow
            material={materials.dragonBone}
          >
            <coneGeometry args={[0.14, 0.68, 6]} />
          </mesh>
        ))}

        {/* Lower Jaw Floor / Gullet */}
        <mesh position={[0, 0.14, 2.7]} material={materials.throatCavity}>
          <boxGeometry args={[2.9, 0.18, 4.0]} />
        </mesh>
      </group>

      {/* Deep inner crimson magma throat illumination */}
      <pointLight
        ref={throatLightRef}
        position={[0, 4.4, -0.5]}
        color="#c82414"
        distance={26}
        decay={2}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. DRAGON BREATH SMOKE & THROAT EMBERS                        */}
      {/* ------------------------------------------------------------- */}
      <DragonBreath mouthOpenRef={mouthOpenFactorRef} headRef={headGroupRef} />
    </group>
  );
}
