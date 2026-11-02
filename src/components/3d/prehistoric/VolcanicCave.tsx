"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR } from "../OceanSky";

/**
 * -----------------------------------------------------------------------------
 * MASTER CINEMATIC VOLCANIC CAVERN & SOARING ROCK ARCH
 * Inspired by the Master Reference Image:
 * - Colossal natural basalt cavern overhang framing the top and upper sides
 * - Deep, weathered volcanic rock with crags, fissures, and dripping rock ledges
 * - Warm golden Cretaceous sunlight raking across the outer lip of the arch
 * - Organic 3D procedural displacement eliminating all geometric ribbing / stripes
 * - Wide flared entrance providing 100% unobstructed panoramic view of the valley,
 *   Triceratops bluff, turquoise river, and colossal waterfalls
 * -----------------------------------------------------------------------------
 */

const caveVertexShader = /* glsl */ `
  #include <fog_pars_vertex>

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const caveFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform float uTime;
  uniform vec3 uSunDirection;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.50;
    mat2 rot = mat2(cos(0.52), sin(0.52), -sin(0.52), cos(0.52));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.05;
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    // 3D Triplanar-style noise coordinates to avoid texture stretching & rings
    vec2 uvXY = vWorldPosition.xy * 0.045;
    vec2 uvXZ = vWorldPosition.xz * 0.045;
    vec2 uvYZ = vWorldPosition.yz * 0.045;

    float nXY = fbm(uvXY * 1.5 + vec2(0.12, 0.34));
    float nXZ = fbm(uvXZ * 1.5 + vec2(0.45, 0.78));
    float nYZ = fbm(uvYZ * 1.5 + vec2(0.89, 0.23));

    vec3 weights = abs(N);
    weights /= (weights.x + weights.y + weights.z + 0.001);
    float rockTexture = weights.x * nYZ + weights.y * nXZ + weights.z * nXY;
    float fineCrags = noise(vWorldPosition.xy * 0.25 + vWorldPosition.z * 0.18);

    // Deep volcanic basalt and warm terracotta / sunlit rock
    vec3 deepBasalt      = vec3(0.13, 0.12, 0.14);
    vec3 weatheredBasalt = vec3(0.24, 0.21, 0.20);
    vec3 warmSandstone   = vec3(0.68, 0.50, 0.33); // Golden sunlit arch lip
    vec3 mossTint        = vec3(0.22, 0.38, 0.15);

    vec3 baseRock = mix(deepBasalt, weatheredBasalt, rockTexture);
    baseRock = mix(baseRock, vec3(0.18, 0.17, 0.18), fineCrags * 0.4);

    // Daylight emergence & warm sunlit rim at the cave arch lip (Z < -1098)
    float archLipFactor = smoothstep(-1085.0, -1115.0, vWorldPosition.z);
    
    // Golden sunlight hitting the arch overhang
    float sunHit = max(0.0, dot(N, L));
    vec3 sunlitArch = mix(baseRock, warmSandstone, 0.75) * (1.0 + sunHit * 0.8);
    baseRock = mix(baseRock, sunlitArch, archLipFactor * 0.70);

    // Hanging ancient moss and rainforest foliage on moist cavern mouth
    float mossMask = smoothstep(0.35, 0.80, rockTexture) * archLipFactor;
    baseRock = mix(baseRock, vec3(0.14, 0.36, 0.12), mossMask * 0.65);

    // Glowing magma fissures inside the deep volcanic interior (Z > -1085)
    float interiorDepth = smoothstep(-1085.0, -1045.0, vWorldPosition.z);
    if (interiorDepth > 0.01) {
      float fissureNoise = fbm(vWorldPosition.xz * 0.18 + vec2(vWorldPosition.y * 0.22, 0.0));
      float fissureMask = smoothstep(0.72, 0.88, fissureNoise) * interiorDepth;

      float pulse = 0.88 + 0.22 * sin(uTime * 2.4 + vWorldPosition.y * 0.4);
      vec3 hotCore = vec3(2.5, 1.8, 0.8);
      vec3 lavaGlow = vec3(1.8, 0.55, 0.06);
      vec3 magmaColor = mix(lavaGlow, hotCore, smoothstep(0.72, 0.86, fissureNoise)) * pulse * 3.2;
      baseRock += magmaColor * (fissureMask * 2.0);
    }

    // Specular wet sheen
    vec3 H = normalize(L + V);
    float spec = pow(max(0.0, dot(N, H)), 42.0) * (0.08 + archLipFactor * 0.35);

    // Soft daylight illumination entering the mouth
    float diff = max(0.24, dot(N, L) * 0.65 + 0.35);
    vec3 daylightLighting = vec3(0.96, 0.92, 0.84) * (0.30 + archLipFactor * 1.6);
    vec3 finalColor = baseRock * diff + daylightLighting * baseRock * 0.35 + vec3(0.98, 0.94, 0.88) * spec;

    gl_FragColor = vec4(finalColor, 1.0);

    #include <fog_fragment>
  }
`;

function getTrajectoryPath(z: number): { x: number; y: number } {
  if (z >= -1030.0) {
    return { x: -35.0, y: 206.0 };
  } else if (z >= -1066.0) {
    const u = (-1030.0 - z) / (-1030.0 - (-1066.0));
    const s = u * u * (3.0 - 2.0 * u);
    return {
      x: THREE.MathUtils.lerp(-35.0, -28.0, s),
      y: THREE.MathUtils.lerp(206.0, 85.0, s),
    };
  } else {
    const u = Math.min(1.0, (-1066.0 - z) / (-1066.0 - (-1115.0)));
    const s = u * u * (3.0 - 2.0 * u);
    return {
      x: THREE.MathUtils.lerp(-28.0, 2.0, s),
      y: THREE.MathUtils.lerp(85.0, 13.5, s),
    };
  }
}

/**
 * Procedural Natural Cavern & Grand Rock Arch Overhang Geometry
 */
function createVolcanicTunnelGeometry(): THREE.BufferGeometry {
  const zSegments = 96;
  const radialSegments = 54;
  const numVertices = (zSegments + 1) * (radialSegments + 1);

  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices: number[] = [];

  let vIdx = 0;
  let uvIdx = 0;

  const zStart = -1035.0;
  const zEnd = -1118.0;

  for (let j = 0; j <= zSegments; j++) {
    const v = j / zSegments;
    const z = zStart + (zEnd - zStart) * v;

    const path = getTrajectoryPath(z);
    const camX = path.x;
    const camY = path.y;

    // Interior tunnel clearance
    let halfWidth = THREE.MathUtils.lerp(18.0, 48.0, v);
    let floorHeight = camY - 14.0;
    let ceilingHeight = camY + 16.0;

    // Dramatic arch flare at the valley mouth (Z: -1090 -> -1120)
    // Raises the ceiling high (up to 44m) and widens the walls so it frames the view
    // like a grand natural rock amphitheater without blocking the open sky
    if (z < -1090.0) {
      const mouthU = Math.min(1.0, (-1090.0 - z) / 30.0);
      const smoothMouth = mouthU * mouthU * (3.0 - 2.0 * mouthU);
      halfWidth = THREE.MathUtils.lerp(48.0, 140.0, smoothMouth);
      floorHeight = THREE.MathUtils.lerp(camY - 14.0, 4.6, smoothMouth);
      ceilingHeight = THREE.MathUtils.lerp(camY + 16.0, 44.0, smoothMouth);
    }

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const angle = u * Math.PI * 2.0;

      let x = camX - Math.cos(angle) * halfWidth;
      let y =
        angle <= Math.PI
          ? camY + Math.sin(angle) * (ceilingHeight - camY)
          : camY + Math.sin(angle) * (camY - floorHeight);

      // Smooth, natural organic rock displacement without periodic Z-frequency rings
      const crag1 = Math.sin(angle * 3.0 + 0.8) * 1.8 + Math.cos(angle * 5.0 - 1.2) * 1.2;
      const crag2 = Math.sin(x * 0.08 + y * 0.06) * 1.5;
      const totalCrag = (crag1 + crag2) * (1.0 - 0.35 * Math.sin(u * Math.PI));

      x += Math.sin(angle) * totalCrag * 0.35;
      y += Math.cos(angle) * totalCrag * 0.30;

      positions[vIdx * 3 + 0] = x;
      positions[vIdx * 3 + 1] = y;
      positions[vIdx * 3 + 2] = z;

      uvs[uvIdx * 2 + 0] = u;
      uvs[uvIdx * 2 + 1] = v;

      vIdx++;
      uvIdx++;
    }
  }

  for (let j = 0; j < zSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const a = j * (radialSegments + 1) + i;
      const b = (j + 1) * (radialSegments + 1) + i;
      const c = (j + 1) * (radialSegments + 1) + (i + 1);
      const d = j * (radialSegments + 1) + (i + 1);

      indices.push(a, d, b);
      indices.push(d, c, b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Basalt Arch Overhead Ledges & Stalactite Formations framing the top
 */
function createArchOverhangRockFormations(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Dramatic craggy basalt overhang formations framing the upper arch (Z: -1108 to -1116, Y: 22 to 34)
  const formations = [
    { x: -32.0, y: 26.0, z: -1112.0, scale: [14.0, 8.0, 10.0] },
    { x: -14.0, y: 31.0, z: -1114.0, scale: [16.0, 7.0, 11.0] },
    { x: 12.0, y: 32.0, z: -1114.0, scale: [18.0, 8.0, 12.0] },
    { x: 38.0, y: 27.0, z: -1112.0, scale: [16.0, 9.0, 11.0] },
    { x: -55.0, y: 18.0, z: -1108.0, scale: [15.0, 12.0, 14.0] },
    { x: 58.0, y: 19.0, z: -1108.0, scale: [15.0, 12.0, 14.0] },
  ];

  formations.forEach((f) => {
    const geo = new THREE.DodecahedronGeometry(1.0, 2);
    geo.scale(f.scale[0], f.scale[1], f.scale[2]);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const pz = pos.getZ(i);
      const crag = Math.sin(px * 0.4) * Math.cos(pz * 0.3) * 0.7;
      pos.setXYZ(i, px + crag, py + crag * 0.5, pz + crag);
    }
    geo.computeVertexNormals();
    geo.translate(f.x, f.y, f.z);
    geometries.push(geo);
  });

  let totalVerts = 0;
  geometries.forEach((g) => { totalVerts += g.attributes.position.count; });
  const mergedPos = new Float32Array(totalVerts * 3);
  const mergedNorm = new Float32Array(totalVerts * 3);
  const mergedIndices: number[] = [];

  let vOffset = 0;
  geometries.forEach((g) => {
    mergedPos.set(g.attributes.position.array, vOffset * 3);
    if (g.attributes.normal) {
      mergedNorm.set(g.attributes.normal.array, vOffset * 3);
    }
    if (g.index) {
      for (let k = 0; k < g.index.array.length; k++) {
        mergedIndices.push(g.index.array[k] + vOffset);
      }
    }
    vOffset += g.attributes.position.count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
  merged.setIndex(mergedIndices);
  merged.computeVertexNormals();
  return merged;
}

export default function VolcanicCave() {
  const tunnelGeometry = useMemo(() => createVolcanicTunnelGeometry(), []);
  const overhangGeometry = useMemo(() => createArchOverhangRockFormations(), []);

  const caveMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: caveVertexShader,
      fragmentShader: caveFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR },
        ...THREE.UniformsLib.fog,
      },
      side: THREE.DoubleSide,
      fog: true,
    });
  }, []);

  useFrame((state) => {
    if (caveMaterial) {
      caveMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group name="colossal-volcanic-cave">
      <mesh geometry={tunnelGeometry} material={caveMaterial} />
      <mesh geometry={overhangGeometry} material={caveMaterial} />
    </group>
  );
}
