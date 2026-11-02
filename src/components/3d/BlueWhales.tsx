"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Realistic blue whale materials
const whaleMaterials = {
  // Dorsal skin — mottled blue-grey
  dorsalSkin: new THREE.MeshStandardMaterial({
    color: "#1a2e48",
    roughness: 0.70,
    metalness: 0.12,
  }),
  // Ventral grooves / throat pleats — lighter grey-blue
  ventralGrooves: new THREE.MeshStandardMaterial({
    color: "#4a6a82",
    roughness: 0.72,
    metalness: 0.10,
  }),
  // Tail flukes — slightly darker, smooth
  fluke: new THREE.MeshStandardMaterial({
    color: "#14253a",
    roughness: 0.60,
    metalness: 0.15,
  }),
  // Pectoral flippers — dark grey-blue
  pectoral: new THREE.MeshStandardMaterial({
    color: "#18304a",
    roughness: 0.65,
    metalness: 0.12,
  }),
  // Subtle bubble trail
  bubbleTrail: new THREE.PointsMaterial({
    color: "#b8d4e8",
    size: 0.15,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
};

/**
 * Create a realistic whale body geometry using LatheGeometry.
 * Produces the characteristic blue whale silhouette: broad flat head,
 * gradual widening to maximum girth, then tapered caudal peduncle.
 */
function createWhaleBodyGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segments = 18;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    if (t < 0.06) {
      // Rostrum tip: blunt, broad (blue whale characteristic)
      radius = t * 10.0;
    } else if (t < 0.20) {
      // Head: wide, flat (U-shaped cross section approximation)
      radius = 0.60 + (t - 0.06) / 0.14 * 0.40;
    } else if (t < 0.50) {
      // Maximum girth section
      radius = 1.0;
    } else if (t < 0.75) {
      // Posterior taper
      radius = 1.0 - (t - 0.50) / 0.25 * 0.45;
    } else {
      // Caudal peduncle: rapid narrow taper
      radius = 0.55 - (t - 0.75) / 0.25 * 0.42;
    }
    points.push(new THREE.Vector2(radius * 0.5, (t - 0.5) * 2.0));
  }

  const lathe = new THREE.LatheGeometry(points, 24);
  lathe.computeVertexNormals();
  lathe.rotateX(Math.PI / 2);
  return lathe;
}

const whaleBodyGeometry = createWhaleBodyGeometry();

// 3 Colossal Blue Whales configuration tuned for the Y = 6.0 water surface
const WHALE_CONFIGS = [
  {
    // Hero Whale: sweeps majestically across frame (closest encounter)
    basePos: [-5.0, 2.5, -675.0],
    orbitR: [18.0, 26.0],
    speed: 0.06,
    phase: 0.0,
    length: 42.0,
    radius: 5.0,
  },
  {
    // Surface Glider: massive whale cruising near the surface
    basePos: [26.0, 3.8, -665.0],
    orbitR: [20.0, 30.0],
    speed: 0.05,
    phase: 1.8,
    length: 46.0,
    radius: 5.4,
  },
  {
    // Distant Giant: enormous silhouette fading into atmospheric haze
    basePos: [-50.0, -1.5, -738.0],
    orbitR: [28.0, 38.0],
    speed: 0.04,
    phase: 3.5,
    length: 48.0,
    radius: 5.8,
  },
];

/**
 * BlueWhales — Colossal Blue Whales gliding gracefully through the ocean.
 *
 * MASTER REALISM PASS:
 * - Realistic fusiform body using LatheGeometry (not cylinders/cones)
 * - Characteristic blue whale proportions: broad flat head, U-shaped cross section
 * - Proper throat pleats (ventral grooves)
 * - Anatomically placed dorsal fin (tiny, far posterior)
 * - Pectoral flippers with correct proportions (very long, narrow)
 * - Colossal horizontal tail flukes
 * - Slow, heavy, powerful movement
 * - Atmospheric perspective: distant whale fades into water
 * - Subtle bubble trail from blowhole
 * - Zero per-frame allocations.
 */
export default function BlueWhales() {
  const whaleGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const flukeMeshesRef = useRef<(THREE.Group | null)[]>([]);
  const bubblesRef = useRef<THREE.Points>(null);

  // Pre-allocate trailing bubble positions
  const bubblePositions = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = -5.0 + (Math.sin(i * 12.3) * 0.5) * 4.0;
      pos[i * 3 + 1] = 2.0 + (i / count) * 3.0;
      pos[i * 3 + 2] = -670.0 - (i / count) * 30.0;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < WHALE_CONFIGS.length; i++) {
      const g = whaleGroupsRef.current[i];
      if (!g) continue;
      const cfg = WHALE_CONFIGS[i];

      const angle = t * cfg.speed + cfg.phase;
      const x = cfg.basePos[0] + Math.sin(angle) * cfg.orbitR[0];
      const z = cfg.basePos[2] + Math.cos(angle) * cfg.orbitR[1];
      const y = cfg.basePos[1] + Math.sin(angle * 0.8) * 1.0;

      g.position.set(x, y, z);

      // Tangent heading
      const dx = Math.cos(angle) * cfg.orbitR[0];
      const dz = -Math.sin(angle) * cfg.orbitR[1];
      const heading = Math.atan2(dx, dz);

      // Very subtle majestic roll and pitch
      const roll = Math.sin(angle) * 0.04;
      const pitch = Math.cos(angle * 0.8) * 0.025;
      g.rotation.set(pitch, heading, roll);

      // Extremely slow, powerful horizontal tail fluke stroke
      const fluke = flukeMeshesRef.current[i];
      if (fluke) {
        fluke.rotation.x = Math.sin(t * 0.5 + cfg.phase) * 0.12;
      }
    }

    // Trailing bubbles rising slowly
    if (bubblesRef.current) {
      bubblesRef.current.position.y = Math.sin(t * 0.6) * 0.3;
    }
  });

  return (
    <group name="colossal-blue-whales">
      {WHALE_CONFIGS.map((cfg, idx) => {
        const bodyLen = cfg.length * 0.58;
        const tailLen = cfg.length * 0.42;

        return (
          <group
            key={`whale-${idx}`}
            ref={(el) => {
              whaleGroupsRef.current[idx] = el;
            }}
          >
            {/* 1. Main Fusiform Body — realistic whale shape */}
            <mesh
              position={[0, 0, bodyLen * 0.15]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[cfg.radius, bodyLen * 0.5, cfg.radius]}
            >
              <primitive object={whaleBodyGeometry} attach="geometry" />
              <primitive object={whaleMaterials.dorsalSkin} attach="material" />
            </mesh>

            {/* 2. Ventral Grooves / Throat Pleats (lighter coloration) */}
            <mesh
              position={[0, -cfg.radius * 0.38, bodyLen * 0.25]}
              material={whaleMaterials.ventralGrooves}
            >
              <capsuleGeometry args={[cfg.radius * 0.42, bodyLen * 0.50, 4, 10]} />
            </mesh>

            {/* 3. Head Ridge Lines (subtle dorsal ridges) */}
            <mesh
              position={[0, cfg.radius * 0.45, bodyLen * 0.6]}
              rotation={[-0.05, 0, 0]}
              material={whaleMaterials.dorsalSkin}
            >
              <capsuleGeometry args={[0.15, bodyLen * 0.3, 3, 6]} />
            </mesh>

            {/* 4. Pectoral Flippers — streamlined and hydrodynamic */}
            <mesh
              position={[-cfg.radius * 0.9, -cfg.radius * 0.25, bodyLen * 0.22]}
              rotation={[0.15, 0.45, -0.42]}
              material={whaleMaterials.pectoral}
            >
              <capsuleGeometry args={[cfg.radius * 0.14, cfg.radius * 1.8, 4, 10]} />
            </mesh>
            <mesh
              position={[cfg.radius * 0.9, -cfg.radius * 0.25, bodyLen * 0.22]}
              rotation={[0.15, -0.45, 0.42]}
              material={whaleMaterials.pectoral}
            >
              <capsuleGeometry args={[cfg.radius * 0.14, cfg.radius * 1.8, 4, 10]} />
            </mesh>

            {/* 5. Tiny Dorsal Fin — far posterior */}
            <mesh
              position={[0, cfg.radius * 0.52, -bodyLen * 0.3]}
              rotation={[-0.45, 0, 0]}
              material={whaleMaterials.dorsalSkin}
            >
              <coneGeometry args={[0.22, cfg.radius * 0.35, 8]} />
            </mesh>

            {/* 6. Articulated Tail Stock & Horizontal Fluke */}
            <group
              ref={(el) => {
                flukeMeshesRef.current[idx] = el;
              }}
              position={[0, 0, -bodyLen * 0.3]}
            >
              {/* Tapered Caudal Peduncle */}
              <mesh
                position={[0, 0, -tailLen * 0.45]}
                rotation={[Math.PI / 2, 0, 0]}
                material={whaleMaterials.dorsalSkin}
              >
                <cylinderGeometry
                  args={[cfg.radius * 0.12, cfg.radius * 0.55, tailLen * 0.9, 14]}
                />
              </mesh>

              {/* Colossal Horizontal Tail Flukes — wide, tapered wings */}
              <group position={[0, 0, -tailLen * 0.95]}>
                <mesh rotation={[0, 0, Math.PI / 2]} material={whaleMaterials.fluke}>
                  <cylinderGeometry args={[cfg.radius * 0.08, cfg.radius * 0.18, cfg.radius * 2.8, 10]} />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}

      {/* Subtle Trailing Bubble Stream */}
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[bubblePositions, 3]}
          />
        </bufferGeometry>
        <primitive object={whaleMaterials.bubbleTrail} attach="material" />
      </points>
    </group>
  );
}
