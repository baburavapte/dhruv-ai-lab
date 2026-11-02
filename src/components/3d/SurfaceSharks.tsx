"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Realistic shark materials — countershading
const sharkMaterials = {
  // Dorsal — dark steel blue-grey
  dorsal: new THREE.MeshStandardMaterial({
    color: "#1a2a38",
    roughness: 0.50,
    metalness: 0.18,
  }),
  // Ventral — pale grey-white (countershading)
  ventral: new THREE.MeshStandardMaterial({
    color: "#8a9aaa",
    roughness: 0.55,
    metalness: 0.10,
  }),
  // Fin material — slightly darker than dorsal
  fin: new THREE.MeshStandardMaterial({
    color: "#162230",
    roughness: 0.48,
    metalness: 0.15,
  }),
};

/**
 * Create a realistic shark body geometry using LatheGeometry.
 * Produces a streamlined fusiform shape with pointed snout and tapered tail.
 */
function createSharkBodyGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segments = 14;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    if (t < 0.08) {
      // Snout: sharp pointed nose
      radius = t * 7.0;
    } else if (t < 0.35) {
      // Forward body: widening to max girth
      radius = 0.56 + Math.sin((t - 0.08) / 0.27 * Math.PI * 0.5) * 0.44;
    } else if (t < 0.65) {
      // Mid body: maintaining girth
      radius = 1.0 - (t - 0.35) / 0.30 * 0.15;
    } else {
      // Caudal peduncle: rapid taper
      radius = 0.85 - (t - 0.65) / 0.35 * 0.72;
    }
    points.push(new THREE.Vector2(radius * 0.5, (t - 0.5) * 2.0));
  }

  const lathe = new THREE.LatheGeometry(points, 10);
  lathe.rotateX(Math.PI / 2);
  return lathe;
}

const sharkBodyGeometry = createSharkBodyGeometry();

// Shark trajectory configurations: 4 sharks at varying depths and orbits
const SHARK_CONFIGS = [
  {
    basePos: [14.0, 1.5, -650.0],
    orbitR: [14.0, 20.0],
    speed: 0.22,
    phase: 0.0,
    scale: 2.8,
  },
  {
    basePos: [-12.0, 4.0, -680.0],
    orbitR: [16.0, 24.0],
    speed: 0.18,
    phase: 2.1,
    scale: 3.2,
  },
  {
    basePos: [6.0, -4.0, -700.0],
    orbitR: [15.0, 18.0],
    speed: 0.20,
    phase: 4.2,
    scale: 2.5,
  },
  {
    basePos: [-20.0, -1.5, -725.0],
    orbitR: [20.0, 26.0],
    speed: 0.15,
    phase: 1.2,
    scale: 3.6,
  },
];

/**
 * SurfaceSharks — Realistic pelagic sharks cruising through the ocean.
 *
 * MASTER REALISM PASS:
 * - Realistic fusiform body shape (LatheGeometry, not cones/boxes)
 * - Proper countershading (dark dorsal, pale ventral)
 * - Anatomically correct fin placement and proportions
 * - Slow, powerful tail propulsion (not hyperactive)
 * - Subtle body roll when banking through turns
 * - Separate pectoral, dorsal, anal, and caudal fin geometry
 * - Spans Z: -630 to -740, Y: -5 to +5.
 * - Zero per-frame allocations in useFrame.
 */
export default function SurfaceSharks() {
  const sharkGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const tailGroupsRef = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < SHARK_CONFIGS.length; i++) {
      const g = sharkGroupsRef.current[i];
      if (!g) continue;
      const cfg = SHARK_CONFIGS[i];

      const angle = t * cfg.speed + cfg.phase;
      const x = cfg.basePos[0] + Math.sin(angle) * cfg.orbitR[0];
      const z = cfg.basePos[2] + Math.cos(angle) * cfg.orbitR[1];
      const y = cfg.basePos[1] + Math.sin(angle * 1.2) * 1.0;

      g.position.set(x, y, z);

      // Tangent heading angle
      const dx = Math.cos(angle) * cfg.orbitR[0];
      const dz = -Math.sin(angle) * cfg.orbitR[1];
      const heading = Math.atan2(dx, dz);

      // Subtle body roll into the turn
      const roll = Math.sin(angle) * 0.06;
      // Slight pitch undulation
      const pitch = Math.sin(angle * 1.5) * 0.03;
      g.rotation.set(pitch, heading, roll);

      // Slow, powerful caudal tail stroke
      const tail = tailGroupsRef.current[i];
      if (tail) {
        tail.rotation.y = Math.sin(t * cfg.speed * 6.0 + cfg.phase) * 0.20;
      }
    }
  });

  return (
    <group name="surface-sharks-ecosystem">
      {SHARK_CONFIGS.map((cfg, idx) => (
        <group
          key={`shark-${idx}`}
          ref={(el) => {
            sharkGroupsRef.current[idx] = el;
          }}
          scale={[cfg.scale, cfg.scale, cfg.scale]}
        >
          {/* Main Fusiform Body — realistic streamlined shape */}
          <mesh
            position={[0, 0, 0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <primitive object={sharkBodyGeometry} attach="geometry" />
            <meshStandardMaterial
              color="#1a2a38"
              roughness={0.50}
              metalness={0.18}
            />
          </mesh>

          {/* Ventral (Belly) — pale countershading */}
          <mesh position={[0, -0.28, 0.2]} material={sharkMaterials.ventral}>
            <capsuleGeometry args={[0.18, 1.8, 4, 8]} />
          </mesh>

          {/* Prominent Triangular Dorsal Fin */}
          <mesh position={[0, 0.55, -0.15]} rotation={[-0.3, 0, 0]} material={sharkMaterials.fin}>
            <coneGeometry args={[0.18, 0.85, 4]} />
          </mesh>

          {/* Pectoral Fins (Left & Right) — swept back */}
          <mesh position={[-0.55, -0.18, 0.5]} rotation={[0.15, 0.3, -0.55]} material={sharkMaterials.fin}>
            <boxGeometry args={[0.85, 0.06, 0.32]} />
          </mesh>
          <mesh position={[0.55, -0.18, 0.5]} rotation={[0.15, -0.3, 0.55]} material={sharkMaterials.fin}>
            <boxGeometry args={[0.85, 0.06, 0.32]} />
          </mesh>

          {/* Small second dorsal fin */}
          <mesh position={[0, 0.30, -0.7]} rotation={[-0.25, 0, 0]} material={sharkMaterials.fin}>
            <coneGeometry args={[0.08, 0.35, 3]} />
          </mesh>

          {/* Anal fin */}
          <mesh position={[0, -0.25, -0.65]} rotation={[0.3, 0, 0]} material={sharkMaterials.fin}>
            <coneGeometry args={[0.06, 0.25, 3]} />
          </mesh>

          {/* Articulated Caudal Tail Section */}
          <group
            ref={(el) => {
              tailGroupsRef.current[idx] = el;
            }}
            position={[0, 0, -0.95]}
          >
            {/* Tapered Tail Stock / Caudal Peduncle */}
            <mesh
              position={[0, 0, -0.5]}
              rotation={[Math.PI / 2, 0, 0]}
              material={sharkMaterials.dorsal}
            >
              <cylinderGeometry args={[0.08, 0.25, 1.0, 6]} />
            </mesh>

            {/* Heterocercal Caudal Fin — upper lobe larger than lower */}
            <mesh position={[0, 0.25, -1.15]} rotation={[-0.2, 0, 0]} material={sharkMaterials.fin}>
              <boxGeometry args={[0.06, 1.1, 0.45]} />
            </mesh>
            <mesh position={[0, -0.12, -1.05]} rotation={[0.15, 0, 0]} material={sharkMaterials.fin}>
              <boxGeometry args={[0.06, 0.55, 0.35]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
