"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Helper to generate a soft gaussian circular particle texture for mist and spores.
 */
export function createSoftCircleTexture(): THREE.Texture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  const radius = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy) / radius;
      const alpha = Math.max(0, Math.min(1, Math.cos(Math.min(dist, 1) * Math.PI * 0.5)));
      const val = Math.floor(alpha * 255);
      data[idx + 0] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = val;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/**
 * -----------------------------------------------------------------------------
 * PREHISTORIC ATMOSPHERE SYSTEM
 * Matching Master Reference Image:
 * 1. Plumes of waterfall spray & river gorge morning vapor
 * 2. Primeval golden sunlit spores and dust motes
 * 3. Volumetric Cretaceous sunbeams / god rays piercing the canyon gap
 * -----------------------------------------------------------------------------
 */
export default function PrehistoricAtmosphere() {
  const sporesRef = useRef<THREE.Points>(null);
  const riverHazeRef = useRef<THREE.Points>(null);
  const waterfallMistRef = useRef<THREE.Points>(null);
  const godRaysGroupRef = useRef<THREE.Group>(null);

  const softTex = useMemo(() => createSoftCircleTexture(), []);

  // 1. Primeval Golden Sunlit Spores
  const sporeCount = 95;
  const [sporePositions, sporePhases] = useMemo(() => {
    const pos = new Float32Array(sporeCount * 3);
    const ph = new Float32Array(sporeCount);
    for (let i = 0; i < sporeCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 110.0;
      pos[i * 3 + 1] = 6.0 + Math.random() * 22.0;
      pos[i * 3 + 2] = -1110.0 - Math.random() * 610.0;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [sporeCount]);

  // 2. River Gorge Humid Morning Haze
  const hazeCount = 55;
  const [hazePositions, hazePhases] = useMemo(() => {
    const pos = new Float32Array(hazeCount * 3);
    const ph = new Float32Array(hazeCount);
    for (let i = 0; i < hazeCount; i++) {
      const z = -1125.0 - (i / hazeCount) * 525.0;
      const riverX = Math.sin((z + 1100) * 0.014) * 22.0 + Math.cos((z + 1250) * 0.024) * 12.0;
      pos[i * 3 + 0] = riverX + (Math.random() - 0.5) * 26.0;
      pos[i * 3 + 1] = 5.4 + Math.random() * 3.5;
      pos[i * 3 + 2] = z;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [hazeCount]);

  // 3. Volumetric Waterfall Mist Clusters (aligned with new hero waterfall)
  const mistCount = 70;
  const [mistPositions, mistPhases, mistOrigins] = useMemo(() => {
    const pos = new Float32Array(mistCount * 3);
    const ph = new Float32Array(mistCount);
    const origins: [number, number, number][] = [];

    const falls = [
      { x: 30.0, y: 5.2, z: -1140.0, count: 35, radius: 18.0 },
      { x: 38.0, y: 32.0, z: -1146.0, count: 22, radius: 14.0 },
      { x: -54.0, y: 5.2, z: -1210.0, count: 13, radius: 8.0 },
    ];

    let pIdx = 0;
    falls.forEach((fall) => {
      for (let k = 0; k < fall.count; k++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() * fall.radius;
        pos[pIdx * 3 + 0] = fall.x + Math.cos(ang) * r;
        pos[pIdx * 3 + 1] = fall.y + Math.random() * 8.0;
        pos[pIdx * 3 + 2] = fall.z + Math.sin(ang) * r;
        ph[pIdx] = Math.random() * Math.PI * 2;
        origins.push([fall.x, fall.y, fall.z]);
        pIdx++;
      }
    });

    return [pos, ph, origins];
  }, [mistCount]);

  // 4. Volumetric Cretaceous God Rays Geometry & Soft Rimless Shader
  const godRaysGeo = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const rays = [
      { x: 12.0, y: 32.0, z: -1160.0, rotZ: 0.38, rotX: -0.15, length: 80.0, radiusTop: 2.0, radiusBot: 12.0 },
      { x: 22.0, y: 36.0, z: -1152.0, rotZ: 0.42, rotX: -0.12, length: 85.0, radiusTop: 2.5, radiusBot: 14.0 },
      { x: -4.0, y: 28.0, z: -1170.0, rotZ: 0.36, rotX: -0.18, length: 75.0, radiusTop: 1.8, radiusBot: 10.0 },
      { x: 32.0, y: 40.0, z: -1146.0, rotZ: 0.45, rotX: -0.10, length: 90.0, radiusTop: 2.8, radiusBot: 15.0 },
      { x: 4.0, y: 26.0, z: -1178.0, rotZ: 0.34, rotX: -0.20, length: 70.0, radiusTop: 1.6, radiusBot: 9.0 },
    ];

    rays.forEach((r) => {
      // 8 height segments for smooth vertical gradient
      const cyl = new THREE.CylinderGeometry(r.radiusTop, r.radiusBot, r.length, 16, 8, true);
      cyl.rotateZ(r.rotZ);
      cyl.rotateX(r.rotX);
      cyl.translate(r.x, r.y, r.z);
      geometries.push(cyl);
    });

    let totalVerts = 0;
    geometries.forEach((g) => { totalVerts += g.attributes.position.count; });
    const mergedPos = new Float32Array(totalVerts * 3);
    const mergedUvs = new Float32Array(totalVerts * 2);
    const mergedIndices: number[] = [];
    let vOffset = 0;
    let uvOffset = 0;
    geometries.forEach((g) => {
      mergedPos.set(g.attributes.position.array, vOffset * 3);
      if (g.attributes.uv) {
        mergedUvs.set(g.attributes.uv.array, uvOffset * 2);
      }
      if (g.index) {
        for (let k = 0; k < g.index.array.length; k++) {
          mergedIndices.push(g.index.array[k] + vOffset);
        }
      }
      vOffset += g.attributes.position.count;
      uvOffset += g.attributes.position.count;
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
    merged.setAttribute("uv", new THREE.BufferAttribute(mergedUvs, 2));
    if (mergedIndices.length > 0) merged.setIndex(mergedIndices);
    return merged;
  }, []);

  const godRaysMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          // Zero opacity at cylinder top & bottom edges: absolutely NO rings or hard rims
          float edgeFade = smoothstep(0.0, 0.32, vUv.y) * smoothstep(1.0, 0.68, vUv.y);
          vec3 warmSunColor = vec3(0.92, 0.98, 0.84);
          gl_FragColor = vec4(warmSunColor, edgeFade * uOpacity);
        }
      `,
      uniforms: {
        uOpacity: { value: 0.032 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (sporesRef.current) {
      const posAttr = sporesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < sporeCount; i++) {
        arr[i * 3 + 1] += Math.sin(t * 0.75 + sporePhases[i]) * 0.02;
        arr[i * 3 + 0] += Math.cos(t * 0.45 + sporePhases[i]) * 0.025;
      }
      posAttr.needsUpdate = true;
    }

    if (riverHazeRef.current) {
      const posAttr = riverHazeRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < hazeCount; i++) {
        arr[i * 3 + 1] += Math.sin(t * 0.5 + hazePhases[i]) * 0.015;
        arr[i * 3 + 0] += Math.cos(t * 0.3 + hazePhases[i]) * 0.025;
      }
      posAttr.needsUpdate = true;
    }

    if (waterfallMistRef.current) {
      const posAttr = waterfallMistRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < mistCount; i++) {
        arr[i * 3 + 1] += 0.045;
        arr[i * 3 + 0] += Math.sin(t * 1.2 + mistPhases[i]) * 0.02;
        arr[i * 3 + 2] += Math.cos(t * 1.0 + mistPhases[i]) * 0.02;
        if (arr[i * 3 + 1] > mistOrigins[i][1] + 16.0) {
          arr[i * 3 + 1] = mistOrigins[i][1] + Math.random() * 2.0;
        }
      }
      posAttr.needsUpdate = true;
    }

    if (godRaysGroupRef.current) {
      godRaysMaterial.uniforms.uOpacity.value = 0.032 + Math.sin(t * 0.8) * 0.008;
    }
  });

  return (
    <group name="prehistoric-atmosphere">
      {/* 1. Luminous Rainforest Spores & Ambient Motes */}
      <points ref={sporesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sporePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          color="#84f0dc"
          size={1.6}
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={true}
        />
      </points>

      {/* 2. Cool Blue-Green / Teal Humid Forest Mist */}
      <points ref={riverHazeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[hazePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          color="#144440"
          size={28.0}
          transparent
          opacity={0.16}
          blending={THREE.NormalBlending}
          depthWrite={false}
          fog={true}
        />
      </points>

      {/* 3. Soft Waterfall Mist Billows */}
      <points ref={waterfallMistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          size={26.0}
          color="#d2ece8"
          transparent
          opacity={0.15}
          blending={THREE.NormalBlending}
          depthWrite={false}
          fog={true}
        />
      </points>

      {/* 4. Filtered Canopy Light Shafts */}
      <group ref={godRaysGroupRef}>
        <mesh geometry={godRaysGeo} material={godRaysMaterial} />
      </group>
    </group>
  );
}
