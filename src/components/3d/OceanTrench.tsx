"use client";

import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Dynamic underwater caustic shader injection for rock surfaces
const causticUniform = { value: 0 };

function injectUnderwaterCaustics(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.uniforms.uCausticTime = causticUniform;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    /* glsl */ `
    #include <common>
    varying vec3 vTrenchWorldPos;
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <worldpos_vertex>",
    /* glsl */ `
    #include <worldpos_vertex>
    #if defined( USE_INSTANCING )
      vTrenchWorldPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
    #else
      vTrenchWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
    #endif
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    /* glsl */ `
    #include <common>
    uniform float uCausticTime;
    varying vec3 vTrenchWorldPos;
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <dithering_fragment>",
    /* glsl */ `
    #include <dithering_fragment>
    // Gentle underwater caustic patterns rippling across rock surfaces
    float ct = uCausticTime * 0.75;
    vec2 cp = vTrenchWorldPos.xz * 0.16;
    float c1 = sin(cp.x * 2.4 + cp.y * 1.7 + ct * 1.4);
    float c2 = cos(-cp.x * 1.8 + cp.y * 2.5 - ct * 1.7);
    float c3 = sin((cp.x + cp.y) * 3.2 + ct * 2.1);
    float caustic = pow(clamp((c1 + c2 + c3) / 3.0 + 0.52, 0.0, 1.0), 3.2);

    // Natural light attenuation with depth: bright near surface (Y > 0), fading out in deep abyss (Y < -18)
    float depthAtten = smoothstep(-20.0, 3.5, vTrenchWorldPos.y);
    gl_FragColor.rgb += vec3(0.08, 0.42, 0.55) * caustic * depthAtten * 0.55;
    `
  );
}

// Shared materials for geological rock formations — realistic mineral variation & caustics
const trenchMaterials = {
  basaltDark: new THREE.MeshStandardMaterial({
    color: "#0c1018",
    roughness: 0.88,
    metalness: 0.12,
  }),
  basaltMid: new THREE.MeshStandardMaterial({
    color: "#141c26",
    roughness: 0.82,
    metalness: 0.10,
  }),
  sedimentShelf: new THREE.MeshStandardMaterial({
    color: "#0e161f",
    roughness: 0.92,
    metalness: 0.05,
  }),
  sedimentLight: new THREE.MeshStandardMaterial({
    color: "#171f28",
    roughness: 0.85,
    metalness: 0.08,
  }),
  mineralVein: new THREE.MeshStandardMaterial({
    color: "#1a6e6e",
    emissive: "#0a3535",
    emissiveIntensity: 0.25,
    roughness: 0.55,
  }),
  debrisPatch: new THREE.MeshStandardMaterial({
    color: "#0a0f16",
    roughness: 0.95,
    metalness: 0.04,
  }),
};

// Inject moving caustics into basalt and sediment materials
trenchMaterials.basaltDark.onBeforeCompile = injectUnderwaterCaustics;
trenchMaterials.basaltMid.onBeforeCompile = injectUnderwaterCaustics;
trenchMaterials.sedimentLight.onBeforeCompile = injectUnderwaterCaustics;
trenchMaterials.sedimentShelf.onBeforeCompile = injectUnderwaterCaustics;

// Reusable scratch objects
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();

// Deterministic LCG
let trenchSeed = 29471;
function trenchLcg() {
  trenchSeed = (trenchSeed * 1664525 + 1013904223) % 4294967296;
  return trenchSeed / 4294967296;
}

/**
 * OceanTrench — Monumental underwater geological rock formations with moving caustics.
 *
 * Realism features:
 * - Hexagonal columnar basalt + irregular boulders
 * - Moving underwater caustics that dance across rock surfaces near the surface
 * - Depth-stratified mineral variation
 * - Zero per-frame allocations
 */
export default function OceanTrench() {
  const leftColumnsRef = useRef<THREE.InstancedMesh>(null);
  const rightColumnsRef = useRef<THREE.InstancedMesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const shelfRef = useRef<THREE.InstancedMesh>(null);

  // Pre-generate left canyon basalt columns (44 pillars with variation)
  const leftPillars = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 44;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-412.0, -542.0, u);
      const x = -16.0 - Math.sin(u * Math.PI * 3.2) * 5.0 - trenchLcg() * 4.0;
      const y = -14.0 - Math.sin(u * Math.PI) * 5.0 + trenchLcg() * 3.0;
      const height = 16.0 + trenchLcg() * 14.0;
      const radius = 2.5 + trenchLcg() * 2.0;
      list.push({
        pos: [x, y, z],
        scale: [radius, height, radius],
        rot: [trenchLcg() * 0.08 - 0.04, trenchLcg() * Math.PI, trenchLcg() * 0.06 - 0.03],
      });
    }
    return list;
  }, []);

  // Pre-generate right canyon basalt columns (44 pillars)
  const rightPillars = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 44;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-412.0, -542.0, u);
      const x = 16.0 + Math.sin(u * Math.PI * 2.8) * 5.0 + trenchLcg() * 4.0;
      const y = -14.0 - Math.sin(u * Math.PI) * 5.0 + trenchLcg() * 3.0;
      const height = 16.0 + trenchLcg() * 14.0;
      const radius = 2.5 + trenchLcg() * 2.0;
      list.push({
        pos: [x, y, z],
        scale: [radius, height, radius],
        rot: [trenchLcg() * 0.08 - 0.04, trenchLcg() * Math.PI, trenchLcg() * 0.06 - 0.03],
      });
    }
    return list;
  }, []);

  // Pre-generate loose rock debris and scattered stones (36 rocks)
  const debrisConfigs = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-415.0, -538.0, u) + (trenchLcg() - 0.5) * 8.0;
      const x = (trenchLcg() - 0.5) * 22.0;
      const y = -22.0 + trenchLcg() * 1.5;
      const s = 0.8 + trenchLcg() * 2.2;
      list.push({
        pos: [x, y, z],
        scale: [s * (0.8 + trenchLcg() * 0.4), s * (0.6 + trenchLcg() * 0.4), s * (0.8 + trenchLcg() * 0.4)],
        rot: [trenchLcg() * Math.PI, trenchLcg() * Math.PI, trenchLcg() * Math.PI],
      });
    }
    return list;
  }, []);

  // Pre-generate rock shelves and horizontal ledges (18 ledges)
  const shelfConfigs = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-418.0, -535.0, u);
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (12.0 + trenchLcg() * 6.0);
      const y = -12.0 + (trenchLcg() - 0.5) * 10.0;
      list.push({
        pos: [x, y, z],
        scale: [6.0 + trenchLcg() * 5.0, 1.2 + trenchLcg() * 1.0, 8.0 + trenchLcg() * 6.0],
        rot: [0.03 * (trenchLcg() - 0.5), (trenchLcg() - 0.5) * 0.4, 0.05 * (trenchLcg() - 0.5)],
      });
    }
    return list;
  }, []);

  // Update caustics timer
  useFrame((state) => {
    causticUniform.value = state.clock.getElapsedTime();
  });

  // Static initialization of instance transforms on mount
  useEffect(() => {
    // Left columns
    if (leftColumnsRef.current) {
      for (let i = 0; i < leftPillars.length; i++) {
        const p = leftPillars[i];
        _pos.set(p.pos[0], p.pos[1], p.pos[2]);
        _euler.set(p.rot[0], p.rot[1], p.rot[2]);
        _quat.setFromEuler(_euler);
        _scale.set(p.scale[0], p.scale[1], p.scale[2]);
        _mat4.compose(_pos, _quat, _scale);
        leftColumnsRef.current.setMatrixAt(i, _mat4);
      }
      leftColumnsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Right columns
    if (rightColumnsRef.current) {
      for (let i = 0; i < rightPillars.length; i++) {
        const p = rightPillars[i];
        _pos.set(p.pos[0], p.pos[1], p.pos[2]);
        _euler.set(p.rot[0], p.rot[1], p.rot[2]);
        _quat.setFromEuler(_euler);
        _scale.set(p.scale[0], p.scale[1], p.scale[2]);
        _mat4.compose(_pos, _quat, _scale);
        rightColumnsRef.current.setMatrixAt(i, _mat4);
      }
      rightColumnsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Floor debris
    if (debrisRef.current) {
      for (let i = 0; i < debrisConfigs.length; i++) {
        const d = debrisConfigs[i];
        _pos.set(d.pos[0], d.pos[1], d.pos[2]);
        _euler.set(d.rot[0], d.rot[1], d.rot[2]);
        _quat.setFromEuler(_euler);
        _scale.set(d.scale[0], d.scale[1], d.scale[2]);
        _mat4.compose(_pos, _quat, _scale);
        debrisRef.current.setMatrixAt(i, _mat4);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Rock shelves
    if (shelfRef.current) {
      for (let i = 0; i < shelfConfigs.length; i++) {
        const s = shelfConfigs[i];
        _pos.set(s.pos[0], s.pos[1], s.pos[2]);
        _euler.set(s.rot[0], s.rot[1], s.rot[2]);
        _quat.setFromEuler(_euler);
        _scale.set(s.scale[0], s.scale[1], s.scale[2]);
        _mat4.compose(_pos, _quat, _scale);
        shelfRef.current.setMatrixAt(i, _mat4);
      }
      shelfRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [leftPillars, rightPillars, debrisConfigs, shelfConfigs]);

  return (
    <group name="ocean-trench">
      {/* Left Canyon Wall Basalt Columns */}
      <instancedMesh
        ref={leftColumnsRef}
        args={[undefined, undefined, leftPillars.length]}
        material={trenchMaterials.basaltDark}
      >
        <cylinderGeometry args={[1, 1.05, 1, 6]} />
      </instancedMesh>

      {/* Right Canyon Wall Basalt Columns */}
      <instancedMesh
        ref={rightColumnsRef}
        args={[undefined, undefined, rightPillars.length]}
        material={trenchMaterials.basaltMid}
      >
        <cylinderGeometry args={[1, 1.05, 1, 6]} />
      </instancedMesh>

      {/* Loose rock debris and scattered stones on canyon floor */}
      <instancedMesh
        ref={debrisRef}
        args={[undefined, undefined, debrisConfigs.length]}
        material={trenchMaterials.debrisPatch}
      >
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>

      {/* Rock shelf ledges — geological layering */}
      <instancedMesh
        ref={shelfRef}
        args={[undefined, undefined, shelfConfigs.length]}
        material={trenchMaterials.sedimentLight}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* Massive Overhead Geological Arches */}
      <group position={[0, -2, -455]} rotation={[0, 0.15, 0]}>
        <mesh material={trenchMaterials.sedimentShelf}>
          <torusGeometry args={[18, 3.2, 10, 20, Math.PI]} />
        </mesh>
      </group>
      <group position={[0, -1, -500]} rotation={[0, -0.2, 0]}>
        <mesh material={trenchMaterials.sedimentShelf}>
          <torusGeometry args={[16, 2.8, 10, 20, Math.PI]} />
        </mesh>
      </group>
    </group>
  );
}
