"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR } from "../OceanSky";
import { createSoftCircleTexture } from "./PrehistoricAtmosphere";

/**
 * -----------------------------------------------------------------------------
 * MASTER CINEMATIC MULTI-TIERED PREHISTORIC WATERFALLS
 * Faithfully recreating the spectacular cascading waterfall system from Image 2:
 * 1. Colossal Right-Cliff Multi-Tiered Hero Waterfall:
 *    - Tier 1 (Summit Plunge): High cliff torrents pouring through rock clefts (Y: 68m -> 46m)
 *    - Tier 2A & 2B (Middle Cascade Amphitheater): Wide churning terraces spreading over mossy ledges (Y: 48m -> 26m)
 *    - Tier 3 (Broad Lower Rapids): Massive foaming cataracts crashing into turquoise river (Y: 26m -> 5.2m)
 * 2. Slender Left-Cliff Ribbon Waterfall (Y: 54m -> 5.2m)
 * 3. Physical Bedrock Ledges, Mossy Granite Boulders, and Splashing Pools
 * 4. Realistic Whitewater Fluid Shaders with gravitational acceleration & aerated froth
 * 5. Volumetric Billowing Mist Clouds catching warm Cretaceous sunlight
 * -----------------------------------------------------------------------------
 */

const realisticWaterfallVertexShader = /* glsl */ `
  #include <fog_pars_vertex>

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDropFactor;

  void main() {
    vUv = uv;
    vDropFactor = 1.0 - uv.y;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const realisticWaterfallFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform float uFlowSpeed;
  uniform float uFoamIntensity;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDropFactor;

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

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    // Gravitational acceleration down the cliff
    float accel = 1.0 + vDropFactor * 1.25;
    float flowY = vUv.y * 18.0 - uTime * uFlowSpeed * accel;

    // Multi-octave braided fluid streams & tearing ribbons
    vec2 streamUV1 = vec2(vUv.x * 9.0, flowY);
    vec2 streamUV2 = vec2(vUv.x * 20.0 + 0.4, flowY * 1.55);
    vec2 streamUV3 = vec2(vUv.x * 40.0 - 0.3, flowY * 2.4);

    float n1 = noise(streamUV1);
    float n2 = noise(streamUV2);
    float n3 = noise(streamUV3);
    float streamPattern = n1 * 0.50 + n2 * 0.35 + n3 * 0.15;

    // Natural irregular edge erosion
    float edgeDist = abs(vUv.x - 0.5) * 2.0;
    float edgeNoise = noise(vec2(vUv.y * 16.0 - uTime * 2.8, vUv.x * 7.0)) * 0.24;
    float raggedEdge = edgeDist + edgeNoise;

    if (raggedEdge > 1.02) discard;

    // Dense aerated whitewater foam with micro-froth aeration
    float topLipFoam = smoothstep(0.14, 0.0, vUv.y) * 0.90;
    float bottomPlungeFoam = smoothstep(0.65, 1.0, vUv.y) * 0.96;
    float internalTurbulence = smoothstep(0.28, 0.72, streamPattern);
    float edgeFoam = smoothstep(0.55, 0.94, raggedEdge);

    float microFroth = noise(vec2(vUv.x * 45.0, flowY * 2.8));
    float aeration = smoothstep(0.22, 0.62, streamPattern * 0.65 + microFroth * 0.35);

    float totalFoam = clamp(
      (aeration * 0.70 + internalTurbulence * 0.45 + topLipFoam * 0.85 + bottomPlungeFoam * 0.95 + edgeFoam * 0.60) * uFoamIntensity,
      0.0,
      1.0
    );

    // Cretaceous water palette matching reference image:
    // Predominantly luminous white aerated foam with deep turquoise in rushing crevices
    vec3 deepTurquoise = vec3(0.04, 0.42, 0.44);
    vec3 brightCyan    = vec3(0.18, 0.74, 0.70);
    vec3 skyReflection = vec3(0.72, 0.88, 0.98);
    vec3 whiteFoam     = vec3(0.99, 0.99, 1.00);

    vec3 waterColor = mix(deepTurquoise, brightCyan, streamPattern);
    // Foam dominates the cascade, creating the brilliant white roaring appearance
    waterColor = mix(waterColor, whiteFoam, 0.62 + totalFoam * 0.38);

    // Luminous aerated whitewater scattering
    vec3 sunLight = vec3(1.22, 1.14, 0.98) * max(0.70, dot(N, L) * 0.40 + 0.60);
    waterColor = waterColor * sunLight;

    // Fresnel reflection
    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.8);
    waterColor = mix(waterColor, skyReflection, fresnel * 0.25);

    // Golden sun specular glints on water ripples
    vec3 H = normalize(L + V);
    float sunSpec = pow(max(0.0, dot(N, H)), 90.0) * (0.85 + totalFoam * 0.45);
    waterColor += vec3(1.0, 0.96, 0.88) * sunSpec;

    float alpha = mix(0.94, 0.99, totalFoam);
    alpha *= smoothstep(1.02, 0.82, raggedEdge);

    gl_FragColor = vec4(waterColor, alpha);

    #include <fog_fragment>
  }
`;

/**
 * Procedural Organic Waterfall Ribbon Geometry Generator
 */
function createOrganicWaterfallGeometry(options: {
  steps: THREE.Vector3[];
  startWidth: number;
  endWidth: number;
  waviness?: number;
}): THREE.BufferGeometry {
  const { steps, startWidth, endWidth, waviness = 1.0 } = options;
  const numSteps = steps.length;
  const vSegments = 40;
  const uSegments = 16;

  const curve = new THREE.CatmullRomCurve3(steps);
  const numVerts = (vSegments + 1) * (uSegments + 1);
  const positions = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const normals = new Float32Array(numVerts * 3);
  const indices: number[] = [];

  let vIdx = 0;
  let uvIdx = 0;

  for (let j = 0; j <= vSegments; j++) {
    const v = j / vSegments;
    const centerPoint = curve.getPoint(v);
    const tangent = curve.getTangent(v);

    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    const currentWidth = THREE.MathUtils.lerp(startWidth, endWidth, v);

    for (let i = 0; i <= uSegments; i++) {
      const u = i / uSegments;
      const uOffset = (u - 0.5) * currentWidth;

      const waveA = Math.sin(v * 16.0 + u * 6.0) * 0.35 * waviness;
      const waveB = Math.cos(v * 28.0 - u * 8.0) * 0.18 * waviness;
      const waveDisp = waveA + waveB;

      const px = centerPoint.x + normal.x * uOffset + binormal.x * waveDisp;
      const py = centerPoint.y + binormal.y * waveDisp;
      const pz = centerPoint.z + normal.z * uOffset + binormal.z * waveDisp;

      positions[vIdx * 3 + 0] = px;
      positions[vIdx * 3 + 1] = py;
      positions[vIdx * 3 + 2] = pz;

      normals[vIdx * 3 + 0] = binormal.x;
      normals[vIdx * 3 + 1] = binormal.y;
      normals[vIdx * 3 + 2] = binormal.z;

      uvs[uvIdx * 2 + 0] = u;
      uvs[uvIdx * 2 + 1] = v;

      vIdx++;
      uvIdx++;
    }
  }

  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = (j + 1) * (uSegments + 1) + i;
      const c = (j + 1) * (uSegments + 1) + (i + 1);
      const d = j * (uSegments + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Bedrock Ledges, Shelves & Boulder Formations Supporting the Waterfalls
 */
function createWaterfallBedrockGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  const shelves = [
    // Summit cliff clefts (Y: 52 to 68)
    { x: 56.0, y: 58.0, z: -1184.0, scale: [16.0, 8.0, 14.0] },
    { x: 62.0, y: 60.0, z: -1188.0, scale: [18.0, 10.0, 16.0] },

    // Middle Terrace Cascade Amphitheater (Y: 34 to 46)
    { x: 50.0, y: 40.0, z: -1176.0, scale: [22.0, 7.0, 18.0] },
    { x: 58.0, y: 42.0, z: -1184.0, scale: [26.0, 8.0, 20.0] },
    { x: 42.0, y: 38.0, z: -1170.0, scale: [18.0, 7.0, 16.0] },

    // Intermediate Shelf (Y: 20 to 28)
    { x: 44.0, y: 24.0, z: -1172.0, scale: [24.0, 6.0, 18.0] },
    { x: 52.0, y: 25.0, z: -1180.0, scale: [28.0, 7.0, 20.0] },
    { x: 36.0, y: 22.0, z: -1166.0, scale: [18.0, 6.0, 15.0] },

    // Base Plunge Pool Boulders (Y: 5.2 to 14.0)
    { x: 34.0, y: 8.5, z: -1164.0, scale: [16.0, 5.5, 15.0] },
    { x: 42.0, y: 9.0, z: -1170.0, scale: [18.0, 6.0, 16.0] },
    { x: 26.0, y: 7.2, z: -1158.0, scale: [14.0, 4.5, 14.0] },
    { x: 48.0, y: 8.0, z: -1176.0, scale: [16.0, 5.0, 14.0] },
  ];

  shelves.forEach((s) => {
    const geo = new THREE.DodecahedronGeometry(1.0, 2);
    geo.scale(s.scale[0], s.scale[1], s.scale[2]);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const pz = pos.getZ(i);
      const crag = Math.sin(px * 0.35) * Math.cos(pz * 0.35) * 0.7;
      pos.setXYZ(i, px + crag, py + crag * 0.4, pz + crag);
    }
    geo.computeVertexNormals();
    geo.translate(s.x, s.y, s.z);
    geometries.push(geo);
  });

  let totalVerts = 0;
  geometries.forEach((g) => { totalVerts += g.attributes.position.count; });
  const mergedPos = new Float32Array(totalVerts * 3);
  const mergedNorm = new Float32Array(totalVerts * 3);
  const mergedColors = new Float32Array(totalVerts * 3);
  const mergedIndices: number[] = [];

  let vOffset = 0;
  geometries.forEach((g) => {
    mergedPos.set(g.attributes.position.array, vOffset * 3);
    if (g.attributes.normal) {
      mergedNorm.set(g.attributes.normal.array, vOffset * 3);
    }
    for (let k = 0; k < g.attributes.position.count; k++) {
      const ny = g.attributes.normal ? g.attributes.normal.getY(k) : 0.5;
      const isWet = Math.max(0.0, (g.attributes.position.getY(k) < 32.0 ? 0.4 : 0.1));
      const moss = Math.max(0.0, Math.min(1.0, (ny - 0.25) / 0.65));
      const r = 0.10 + moss * 0.08 - isWet * 0.04;
      const gCol = 0.14 + moss * 0.32 - isWet * 0.03;
      const b = 0.12 + moss * 0.06 - isWet * 0.04;
      mergedColors[(vOffset + k) * 3 + 0] = r;
      mergedColors[(vOffset + k) * 3 + 1] = gCol;
      mergedColors[(vOffset + k) * 3 + 2] = b;
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
  merged.setAttribute("color", new THREE.BufferAttribute(mergedColors, 3));
  merged.setIndex(mergedIndices);
  merged.computeVertexNormals();
  return merged;
}

export default function PrehistoricWaterfalls() {
  // 1. MASTER HERO WATERFALL (Right Canyon Cliff)
  // Tier 1: Summit Cliff Plunge (Y: 68m -> 46m)
  const mainFallTier1Geo = useMemo(
    () =>
      createOrganicWaterfallGeometry({
        steps: [
          new THREE.Vector3(58.0, 68.0, -1185.0),
          new THREE.Vector3(56.0, 60.0, -1183.0),
          new THREE.Vector3(54.0, 52.0, -1181.0),
          new THREE.Vector3(52.0, 46.0, -1179.0),
        ],
        startWidth: 18.0,
        endWidth: 26.0,
        waviness: 0.85,
      }),
    []
  );

  // Tier 2A: Middle Shelf Left Cataract (Y: 46m -> 26m)
  const mainFallTier2AGeo = useMemo(
    () =>
      createOrganicWaterfallGeometry({
        steps: [
          new THREE.Vector3(50.0, 46.0, -1178.0),
          new THREE.Vector3(47.5, 38.0, -1176.0),
          new THREE.Vector3(45.0, 31.0, -1174.0),
          new THREE.Vector3(42.0, 26.0, -1172.0),
        ],
        startWidth: 20.0,
        endWidth: 30.0,
        waviness: 1.0,
      }),
    []
  );

  // Tier 2B: Middle Shelf Right Cataract (Y: 48m -> 27m)
  const mainFallTier2BGeo = useMemo(
    () =>
      createOrganicWaterfallGeometry({
        steps: [
          new THREE.Vector3(58.0, 48.0, -1186.0),
          new THREE.Vector3(55.5, 40.0, -1184.0),
          new THREE.Vector3(53.5, 33.0, -1182.0),
          new THREE.Vector3(50.5, 27.0, -1180.0),
        ],
        startWidth: 18.0,
        endWidth: 28.0,
        waviness: 0.90,
      }),
    []
  );

  // Tier 3: Broad Lower Amphitheater Rapids cascading directly into Turquoise River (Y: 26m -> 5.2m)
  const mainFallTier3Geo = useMemo(
    () =>
      createOrganicWaterfallGeometry({
        steps: [
          new THREE.Vector3(44.0, 26.0, -1172.0),
          new THREE.Vector3(40.5, 19.0, -1169.0),
          new THREE.Vector3(37.0, 12.0, -1166.0),
          new THREE.Vector3(33.0, 5.2, -1163.0),
        ],
        startWidth: 28.0,
        endWidth: 44.0,
        waviness: 1.15,
      }),
    []
  );

  // 2. SLENDER LEFT CLIFF WATERFALL (Y: 54m -> 5.2m)
  const leftFallGeo = useMemo(
    () =>
      createOrganicWaterfallGeometry({
        steps: [
          new THREE.Vector3(-54.0, 54.0, -1211.0),
          new THREE.Vector3(-53.5, 40.0, -1210.0),
          new THREE.Vector3(-53.0, 26.0, -1209.0),
          new THREE.Vector3(-52.5, 15.0, -1208.0),
          new THREE.Vector3(-52.0, 5.2, -1207.0),
        ],
        startWidth: 7.0,
        endWidth: 12.0,
        waviness: 0.60,
      }),
    []
  );

  // 3. PHYSICAL BEDROCK & BOULDERS
  const bedrockRocksGeo = useMemo(() => createWaterfallBedrockGeometry(), []);

  // Shared Procedural Soft Circle Texture for Mist
  const softCircleTex = useMemo(() => createSoftCircleTexture(), []);

  // Shader Materials
  const waterfallMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: realisticWaterfallVertexShader,
      fragmentShader: realisticWaterfallFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR },
        uFlowSpeed: { value: 3.5 },
        uFoamIntensity: { value: 1.12 },
        ...THREE.UniformsLib.fog,
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: true,
    });
  }, []);

  const bedrockMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.40,
      metalness: 0.08,
      fog: true,
    });
  }, []);

  // Rising Mist Cloud Particles at Main Waterfall Base and Mid-Shelf
  const mistCount = 130;
  const [mistPositions, mistPhases] = useMemo(() => {
    const pos = new Float32Array(mistCount * 3);
    const ph = new Float32Array(mistCount);
    for (let i = 0; i < mistCount; i++) {
      const isMid = i % 3 === 0;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (isMid ? 16.0 : 26.0);
      const cx = isMid ? 50.0 : 36.0;
      const cy = isMid ? 42.0 : 5.2;
      const cz = isMid ? -1178.0 : -1165.0;

      pos[i * 3 + 0] = cx + Math.cos(angle) * r;
      pos[i * 3 + 1] = cy + Math.random() * 10.0;
      pos[i * 3 + 2] = cz + Math.sin(angle) * r;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [mistCount]);

  const mistPointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (waterfallMaterial) waterfallMaterial.uniforms.uTime.value = t;

    if (mistPointsRef.current) {
      const posAttr = mistPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < mistCount; i++) {
        arr[i * 3 + 1] += 0.06;
        arr[i * 3 + 0] += Math.sin(t * 1.1 + mistPhases[i]) * 0.03;
        arr[i * 3 + 2] += Math.cos(t * 0.9 + mistPhases[i]) * 0.03;
        const isMid = i % 3 === 0;
        const maxH = isMid ? 58.0 : 24.0;
        const baseH = isMid ? 42.0 : 5.2;
        if (arr[i * 3 + 1] > maxH) {
          arr[i * 3 + 1] = baseH + Math.random() * 2.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="prehistoric-waterfalls-master-system">
      {/* 1. Physical Supporting Bedrock Ledges & Granite Boulders */}
      <mesh geometry={bedrockRocksGeo} material={bedrockMaterial} castShadow receiveShadow />

      {/* 2. Master Multi-Tiered Hero Waterfall (Right Canyon Cliff) */}
      <mesh geometry={mainFallTier1Geo} material={waterfallMaterial} />
      <mesh geometry={mainFallTier2AGeo} material={waterfallMaterial} />
      <mesh geometry={mainFallTier2BGeo} material={waterfallMaterial} />
      <mesh geometry={mainFallTier3Geo} material={waterfallMaterial} />

      {/* 3. Left Cliff Waterfall */}
      <mesh geometry={leftFallGeo} material={waterfallMaterial} />

      {/* 4. Soft Sunlit Rising Mist Billows */}
      <points ref={mistPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softCircleTex}
          size={26.0}
          color="#f2faf8"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}
