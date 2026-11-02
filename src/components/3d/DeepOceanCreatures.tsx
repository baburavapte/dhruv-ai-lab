"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shared materials for deep-sea bioluminescent organisms — SUBTLE, not neon
const creatureMaterials = {
  // Jellyfish bell — translucent, faintly luminous
  jellyBell: new THREE.MeshStandardMaterial({
    color: "#2a5a7a",
    emissive: "#0a2838",
    emissiveIntensity: 0.4,
    roughness: 0.25,
    transparent: true,
    opacity: 0.55,
  }),
  // Jellyfish internal organs — subtle glow
  jellyCore: new THREE.MeshStandardMaterial({
    color: "#8a6aaa",
    emissive: "#3a1a5a",
    emissiveIntensity: 0.6,
    roughness: 0.2,
  }),
  // Jellyfish tentacles — nearly transparent
  jellyTentacle: new THREE.MeshStandardMaterial({
    color: "#4a7a8a",
    emissive: "#1a3a4a",
    emissiveIntensity: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.45,
  }),
  // Siphonophore zooids — subtle cool glow
  siphonophoreZooid: new THREE.MeshStandardMaterial({
    color: "#2a8a7a",
    emissive: "#0a3a2a",
    emissiveIntensity: 0.45,
    roughness: 0.3,
    transparent: true,
    opacity: 0.65,
  }),
  // Comb jelly body — translucent with subtle iridescence
  combJellyBody: new THREE.MeshStandardMaterial({
    color: "#5a3a6a",
    emissive: "#2a1a3a",
    emissiveIntensity: 0.35,
    roughness: 0.25,
    transparent: true,
    opacity: 0.5,
  }),
  // Comb jelly cilia — faint shifting color
  combCilia: new THREE.MeshStandardMaterial({
    color: "#3a6a8a",
    emissive: "#1a3a4a",
    emissiveIntensity: 0.5,
    roughness: 0.2,
  }),
};

// Reusable scratch objects
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();

/**
 * DeepOceanCreatures — Biologically believable bioluminescent bathypelagic life forms.
 *
 * MASTER REALISM PASS:
 * - Bioluminescence is SPARSE, SUBTLE, ORGANIC — not neon flooding
 * - Natural biological coloration (muted blues, purples, teals)
 * - Emissive intensities significantly reduced
 * - More translucent materials for jellyfish
 * - Longer, more organic tentacles on jellyfish
 * - Added more tentacle segments for realism
 * - The abyss remains DARK — creatures are isolated lights in darkness
 * - Spans Z: -415 to -535.
 * - Zero per-frame allocations in useFrame.
 */
export default function DeepOceanCreatures() {
  const jellyGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const siphonophoreInstRef = useRef<THREE.InstancedMesh>(null);
  const combJellyRefs = useRef<(THREE.Group | null)[]>([]);

  // Pre-generate 5 Bathypelagic Jellyfish — widely spaced
  const jellyfishData = useMemo(() => {
    return [
      { pos: [-7.0, -7.0, -428.0] as [number, number, number], scale: 1.4, pulseSpeed: 1.1 },
      { pos: [8.0, -10.0, -455.0] as [number, number, number], scale: 1.8, pulseSpeed: 0.9 },
      { pos: [-5.5, -14.0, -480.0] as [number, number, number], scale: 2.0, pulseSpeed: 0.8 },
      { pos: [6.5, -15.5, -508.0] as [number, number, number], scale: 1.6, pulseSpeed: 1.0 },
      { pos: [-9.0, -17.0, -530.0] as [number, number, number], scale: 1.5, pulseSpeed: 1.1 },
    ];
  }, []);

  // Pre-generate Siphonophore Colony Chain (30 instanced zooids — sparser)
  const siphonophoreZooids = useMemo(() => {
    const list: { u: number; basePos: [number, number, number]; scale: number }[] = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-438.0, -488.0, u);
      const x = -9.0 + Math.sin(u * Math.PI * 2.5) * 3.0;
      const y = -11.0 + Math.cos(u * Math.PI * 2) * 2.0;
      list.push({
        u,
        basePos: [x, y, z],
        scale: 0.25 + (i % 3) * 0.06,
      });
    }
    return list;
  }, []);

  // Pre-generate 3 Comb Jellies — subtle, drifting
  const combJellies = useMemo(() => {
    return [
      { pos: [4.0, -8.0, -440.0] as [number, number, number], speed: 0.4 },
      { pos: [-4.5, -12.0, -470.0] as [number, number, number], speed: 0.5 },
      { pos: [5.5, -16.0, -518.0] as [number, number, number], speed: 0.35 },
    ];
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Jellyfish: slow rhythmic bell contraction and gentle vertical bobbing
    for (let i = 0; i < jellyfishData.length; i++) {
      const g = jellyGroupRefs.current[i];
      if (!g) continue;
      const d = jellyfishData[i];
      const pulse = Math.sin(t * d.pulseSpeed + i * 1.5);
      const bellScaleY = 1.0 + pulse * 0.14;
      const bellScaleXZ = 1.0 - pulse * 0.08;

      // Gentle drift
      g.position.y = d.pos[1] + Math.sin(t * 0.35 + i) * 0.5;
      g.position.x = d.pos[0] + Math.cos(t * 0.25 + i) * 0.3;
      g.scale.set(d.scale * bellScaleXZ, d.scale * bellScaleY, d.scale * bellScaleXZ);
      g.rotation.z = Math.sin(t * 0.3 + i) * 0.05;
    }

    // Siphonophore undulating chain — slow, sinuous
    if (siphonophoreInstRef.current) {
      for (let i = 0; i < siphonophoreZooids.length; i++) {
        const z = siphonophoreZooids[i];
        const waveX = Math.sin(t * 0.7 + z.u * Math.PI * 4) * 0.8;
        const waveY = Math.cos(t * 0.5 + z.u * Math.PI * 3) * 0.5;
        _pos.set(z.basePos[0] + waveX, z.basePos[1] + waveY, z.basePos[2]);
        _scale.setScalar(z.scale * (1 + Math.sin(t * 1.2 + i) * 0.1));
        _quat.identity();
        _mat4.compose(_pos, _quat, _scale);
        siphonophoreInstRef.current.setMatrixAt(i, _mat4);
      }
      siphonophoreInstRef.current.instanceMatrix.needsUpdate = true;
    }

    // Comb jellies — slow lazy rotation and drift
    for (let i = 0; i < combJellies.length; i++) {
      const g = combJellyRefs.current[i];
      if (!g) continue;
      const c = combJellies[i];
      g.rotation.y += safeDelta * c.speed;
      g.position.y = c.pos[1] + Math.sin(t * 0.4 + i) * 0.35;
    }
  });

  return (
    <group name="deep-ocean-creatures">
      {/* Bathypelagic Jellyfish — translucent, sparse, subtle glow */}
      {jellyfishData.map((j, idx) => (
        <group
          key={`jelly-${idx}`}
          ref={(el) => {
            jellyGroupRefs.current[idx] = el;
          }}
          position={j.pos}
        >
          {/* Outer Translucent Bell */}
          <mesh material={creatureMaterials.jellyBell}>
            <sphereGeometry args={[1.0, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>

          {/* Internal Organs / Gonads — subtle glow source */}
          <mesh position={[0, -0.25, 0]} material={creatureMaterials.jellyCore}>
            <sphereGeometry args={[0.32, 10, 8]} />
          </mesh>

          {/* Trailing Tentacles — more numerous, thinner, longer */}
          {[-0.5, -0.25, 0.0, 0.25, 0.5].map((tx, ti) => (
            <mesh
              key={`tentacle-${ti}`}
              position={[tx * 0.9, -2.2, (ti % 2 === 0 ? 0.2 : -0.2)]}
              material={creatureMaterials.jellyTentacle}
            >
              <cylinderGeometry args={[0.02, 0.008, 3.2, 4]} />
            </mesh>
          ))}

          {/* Oral Arms — shorter, thicker */}
          {[-0.15, 0.15].map((ax, ai) => (
            <mesh
              key={`arm-${ai}`}
              position={[ax, -1.0, ai === 0 ? 0.1 : -0.1]}
              material={creatureMaterials.jellyTentacle}
            >
              <cylinderGeometry args={[0.04, 0.02, 1.4, 4]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Siphonophore Instanced Chain Colony — subtle zooids */}
      <instancedMesh
        ref={siphonophoreInstRef}
        args={[undefined, undefined, siphonophoreZooids.length]}
        material={creatureMaterials.siphonophoreZooid}
      >
        <sphereGeometry args={[1, 8, 8]} />
      </instancedMesh>

      {/* Comb Jellies (Ctenophores) — subtle iridescent drifters */}
      {combJellies.map((c, idx) => (
        <group
          key={`comb-${idx}`}
          ref={(el) => {
            combJellyRefs.current[idx] = el;
          }}
          position={c.pos}
        >
          <mesh material={creatureMaterials.combJellyBody}>
            <sphereGeometry args={[0.55, 10, 10]} />
          </mesh>
          {/* Cilia Ribs */}
          <mesh material={creatureMaterials.combCilia}>
            <torusGeometry args={[0.58, 0.02, 4, 16]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={creatureMaterials.combCilia}>
            <torusGeometry args={[0.58, 0.02, 4, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
