"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shared materials for hydrothermal vents — realistic mineral coloration
const ventMaterials = {
  // Dark mineral chimney — rough basalt/pyritic crust
  chimneyBase: new THREE.MeshStandardMaterial({
    color: "#0e0a08",
    roughness: 0.92,
    metalness: 0.20,
  }),
  chimneyUpper: new THREE.MeshStandardMaterial({
    color: "#1a1410",
    roughness: 0.88,
    metalness: 0.25,
  }),
  // Sulfur/mineral deposit crust — muted warm mineral color, NOT glowing
  sulfurCrust: new THREE.MeshStandardMaterial({
    color: "#8c6b3d",
    emissive: "#2a1c0a",
    emissiveIntensity: 0.15,
    roughness: 0.72,
  }),
  // Thermal plume — dark smoky particles, NOT fire
  plumeOuter: new THREE.MeshBasicMaterial({
    color: "#181410",
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  // Slightly warmer inner core of plume
  plumeInner: new THREE.MeshBasicMaterial({
    color: "#2a1e14",
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  // Tube worm chitinous stalk — white/cream
  tubeWormStalk: new THREE.MeshStandardMaterial({
    color: "#e8e4dc",
    roughness: 0.55,
    metalness: 0.05,
  }),
  // Tube worm hemoglobin-rich branchial plume — deep crimson
  tubeWormTip: new THREE.MeshStandardMaterial({
    color: "#8b1a1a",
    emissive: "#3a0808",
    emissiveIntensity: 0.35,
    roughness: 0.4,
  }),
  // Microbial mat — muted greenish-brown chemosynthetic colonies
  microbialMat: new THREE.MeshStandardMaterial({
    color: "#2a5a4a",
    emissive: "#0a1a14",
    emissiveIntensity: 0.15,
    roughness: 0.7,
  }),
  // Scattered mineral deposit — dark metallic sulfide
  mineralDeposit: new THREE.MeshStandardMaterial({
    color: "#1a1614",
    roughness: 0.80,
    metalness: 0.35,
  }),
};

/**
 * HydrothermalVents — Monumental deep-sea black smoker chimneys.
 *
 * MASTER REALISM PASS:
 * - Irregular chimney structures (varied radius, not perfect cones)
 * - Dark mineral coloration (not orange/fire-like)
 * - Realistic thermal plume = dark mineral-rich smoke, NOT fire/lava
 * - Tube worm colonies with natural crimson tips
 * - Surrounding mineral deposits and uneven seabed
 * - Vent lights reduced to subtle warm glow (not orange spotlights)
 * - Spans Z: -480 to -525, Y: -26 to -6.
 * - Zero per-frame allocations in useFrame.
 */
export default function HydrothermalVents() {
  const plumesRef = useRef<(THREE.Group | null)[]>([]);

  // 5 Chimney structures with variation
  const chimneys = useMemo(() => {
    return [
      { pos: [-9.0, -26.0, -485.0], height: 14.0, radius: 2.0, topRadius: 1.2, rotY: 0.4, lean: 0.04 },
      { pos: [8.5, -26.0, -495.0], height: 18.0, radius: 2.4, topRadius: 1.6, rotY: -0.6, lean: -0.03 },
      { pos: [-7.0, -26.0, -512.0], height: 16.0, radius: 2.2, topRadius: 1.4, rotY: 0.8, lean: 0.05 },
      { pos: [6.5, -26.0, -524.0], height: 13.0, radius: 1.8, topRadius: 1.0, rotY: -0.2, lean: -0.04 },
      { pos: [0.5, -26.0, -502.0], height: 10.0, radius: 1.5, topRadius: 0.9, rotY: 1.2, lean: 0.02 },
    ];
  }, []);

  // Pre-generate tube worm clusters — 6 per chimney base
  const tubeWormClusters = useMemo(() => {
    const list: { pos: [number, number, number]; rotZ: number; height: number }[] = [];
    chimneys.forEach((c) => {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + (c.rotY * 0.5);
        const rad = c.radius + 0.8 + (i % 3) * 0.3;
        const x = c.pos[0] + Math.cos(angle) * rad;
        const z = c.pos[2] + Math.sin(angle) * rad;
        list.push({
          pos: [x, c.pos[1] + 0.8, z],
          rotZ: Math.cos(angle) * 0.2,
          height: 1.8 + (i % 3) * 0.6,
        });
      }
    });
    return list;
  }, [chimneys]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Animate rising billow of mineral smoke plumes — slow, heavy
    for (let i = 0; i < chimneys.length; i++) {
      const g = plumesRef.current[i];
      if (!g) continue;
      // Slow turbulent sway
      const sway = Math.sin(t * 0.6 + i * 1.8) * 0.08;
      g.rotation.z = sway;
      // Breathing expansion
      const stretchY = 1.0 + Math.sin(t * 0.8 + i) * 0.06;
      g.scale.set(1.0, stretchY, 1.0);
      g.rotation.y += safeDelta * 0.05;
    }
  });

  return (
    <group name="hydrothermal-vent-field">
      {/* Chimney Pillars and Rising Plumes */}
      {chimneys.map((c, idx) => {
        const topY = c.pos[1] + c.height;
        return (
          <group key={`chimney-${idx}`}>
            {/* Basal Mineral Chimney Stack — irregular, slightly leaning */}
            <mesh
              position={[c.pos[0], c.pos[1] + c.height * 0.5, c.pos[2]]}
              rotation={[c.lean, c.rotY, c.lean * 0.5]}
              material={ventMaterials.chimneyBase}
            >
              <cylinderGeometry args={[c.topRadius, c.radius, c.height, 8]} />
            </mesh>

            {/* Upper chimney section — slightly different mineral coloration */}
            <mesh
              position={[c.pos[0], topY - 1.5, c.pos[2]]}
              rotation={[c.lean, c.rotY, 0]}
              material={ventMaterials.chimneyUpper}
            >
              <cylinderGeometry args={[c.topRadius * 1.1, c.topRadius * 0.9, 3.0, 8]} />
            </mesh>

            {/* Sulfur / Mineral Crust Ring near Vent Top — subtle, muted */}
            <mesh
              position={[c.pos[0], topY - 0.8, c.pos[2]]}
              material={ventMaterials.sulfurCrust}
            >
              <torusGeometry args={[c.topRadius * 0.7, 0.25, 6, 12]} />
            </mesh>

            {/* Surrounding mineral deposits at chimney base */}
            <mesh
              position={[c.pos[0], c.pos[1] + 0.3, c.pos[2]]}
              rotation={[-Math.PI / 2, 0, c.rotY]}
              material={ventMaterials.mineralDeposit}
            >
              <circleGeometry args={[c.radius + 1.5, 8]} />
            </mesh>

            {/* Subtle warm geothermal glow at vent mouth — NOT orange spotlight */}
            <pointLight
              position={[c.pos[0], topY + 0.5, c.pos[2]]}
              color="#6b3a1a"
              intensity={1.8}
              distance={12}
              castShadow={false}
            />

            {/* Rising Hydrothermal Black Smoke Plume — dark, not fiery */}
            <group
              ref={(el) => {
                plumesRef.current[idx] = el;
              }}
              position={[c.pos[0], topY, c.pos[2]]}
            >
              {/* Outer billow — dark mineral smoke */}
              <mesh position={[0, 8, 0]} material={ventMaterials.plumeOuter}>
                <coneGeometry args={[3.8, 16, 10, 1, true]} />
              </mesh>
              {/* Inner slightly warmer core */}
              <mesh position={[0, 3.5, 0]} material={ventMaterials.plumeInner}>
                <coneGeometry args={[1.5, 7, 8, 1, true]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Tube Worm Chemosynthetic Colonies */}
      {tubeWormClusters.map((w, idx) => (
        <group key={`worm-${idx}`} position={w.pos} rotation={[0, 0, w.rotZ]}>
          {/* White Chitinous Stalk */}
          <mesh position={[0, w.height * 0.5, 0]} material={ventMaterials.tubeWormStalk}>
            <cylinderGeometry args={[0.05, 0.07, w.height, 5]} />
          </mesh>
          {/* Hemoglobin-Rich Red Branchial Plume Tip */}
          <mesh position={[0, w.height + 0.2, 0]} material={ventMaterials.tubeWormTip}>
            <coneGeometry args={[0.12, 0.5, 5]} />
          </mesh>
        </group>
      ))}

      {/* Chemosynthetic Microbial Mats (Irregular Seabed Patches) */}
      {[-8.0, 7.5, -6.5, 5.0, -2.0].map((mx, mi) => (
        <mesh
          key={`mat-${mi}`}
          position={[mx, -25.7, -488 - mi * 8]}
          rotation={[-Math.PI / 2, 0, mi * 0.8]}
          material={ventMaterials.microbialMat}
        >
          <circleGeometry args={[3.0 + mi * 0.4, 8]} />
        </mesh>
      ))}
    </group>
  );
}
