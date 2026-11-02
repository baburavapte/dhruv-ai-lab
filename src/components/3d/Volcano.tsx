"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR, OCEAN_HORIZON_COLOR } from "./OceanSky";
import { worldProgressState } from "@/lib/worldProgress";

// Master Mount Fuji Stratovolcano Coordinates
// Positioned between the Open Ocean (Z > -900) and the Prehistoric Continent (Z < -1060)
export const VOLCANO_CENTER_X = -35.0;
export const VOLCANO_CENTER_Z = -1060.0;
export const VOLCANO_SUMMIT_Y = 195.0;
export const VOLCANO_CRATER_Y = 175.0;
export const VOLCANO_BASE_RADIUS = 160.0;
export const VOLCANO_CRATER_RADIUS = 18.0;

/**
 * -----------------------------------------------------------------------------
 * GEOLOGICAL VOLCANIC ROCK & ACTIVE LAVA COULEES SHADER
 * -----------------------------------------------------------------------------
 */
const volcanoVertexShader = /* glsl */ `
  #include <fog_pars_vertex>

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;
  varying float vRadialDist;
  varying float vAngle;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vElevation = worldPos.y;
    
    vec2 rel = worldPos.xz - vec2(${VOLCANO_CENTER_X.toFixed(1)}, ${VOLCANO_CENTER_Z.toFixed(1)});
    vRadialDist = length(rel);
    vAngle = atan(rel.y, rel.x);

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const volcanoFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uHorizonColor;
  uniform float uLavaPulse;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;
  varying float vRadialDist;
  varying float vAngle;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    vec2 localXZ = vWorldPosition.xz - vec2(${VOLCANO_CENTER_X.toFixed(1)}, ${VOLCANO_CENTER_Z.toFixed(1)});

    // --- 1. GEOLOGICAL ROCK TEXTURES & PROCEDURAL NORMAL CRAGS ---
    vec2 rockUV = localXZ * 0.05 + vec2(vElevation * 0.07, 0.0);
    float rockNoise = fbm(rockUV);
    float detailNoise = vnoise(localXZ * 0.35 + vec2(vElevation * 0.25, 0.0));

    // Geological surface normal perturbation for rugged rock ridges & facets
    vec3 bump = vec3(
      vnoise(localXZ * 0.16 + vec2(1.7, 0.0)) - 0.5,
      0.0,
      vnoise(localXZ * 0.16 + vec2(0.0, 3.2)) - 0.5
    ) * 0.38;
    vec3 rockN = normalize(N + bump);

    vec3 darkBasalt     = vec3(0.08, 0.07, 0.09);
    vec3 ashTephra      = vec3(0.18, 0.16, 0.17);
    vec3 oxidizedOchre  = vec3(0.28, 0.18, 0.13);
    vec3 sulfurBrown    = vec3(0.22, 0.15, 0.11);

    float strata = sin(vElevation * 0.18 + rockNoise * 2.5) * 0.5 + 0.5;
    vec3 baseRock = mix(darkBasalt, ashTephra, rockNoise);
    baseRock = mix(baseRock, oxidizedOchre, strata * 0.35);
    baseRock = mix(baseRock, sulfurBrown, detailNoise * 0.25);

    // Waterline wet rock at sea level (Y = 6.0)
    float waterlineDist = abs(vElevation - 6.0);
    float wetness = clamp(1.0 - waterlineDist / 3.0, 0.0, 1.0);
    baseRock = mix(baseRock, vec3(0.035, 0.045, 0.055), wetness * 0.75);

    // --- 2. ACTIVE FRACTURED MOLTEN LAVA CHANNELS & FISSURES ---
    float lavaSpeed = uTime * 0.12;
    float normElevation = clamp((vElevation - 6.0) / (${(VOLCANO_SUMMIT_Y - 6.0).toFixed(1)}), 0.0, 1.0);

    float edgeNoise = (vnoise(vec2(vAngle * 32.0, vElevation * 0.14)) - 0.5) * 0.028;

    // Coulee 1: South-facing primary lava torrent
    float flow1Angle = 1.57 + sin(vElevation * 0.045) * 0.065 + cos(vElevation * 0.11) * 0.028;
    float angleDiff1 = abs(vAngle - flow1Angle) + edgeNoise;
    float channelWidth1 = 0.022 + (1.0 - normElevation) * 0.018;
    float inChannel1 = smoothstep(channelWidth1, channelWidth1 * 0.15, angleDiff1);

    // Coulee 2: South-East branching coulee
    float flow2Angle = 1.25 + cos(vElevation * 0.040) * 0.055 - sin(vElevation * 0.095) * 0.025;
    float angleDiff2 = abs(vAngle - flow2Angle) + edgeNoise;
    float channelWidth2 = 0.018 + (1.0 - normElevation) * 0.014;
    float inChannel2 = smoothstep(channelWidth2, channelWidth2 * 0.15, angleDiff2);

    // Coulee 3: South-West branching coulee
    float flow3Angle = 1.88 + sin(vElevation * 0.052) * 0.050 + cos(vElevation * 0.12) * 0.020;
    float angleDiff3 = abs(vAngle - flow3Angle) + edgeNoise;
    float channelWidth3 = 0.018 + (1.0 - normElevation) * 0.014;
    float inChannel3 = smoothstep(channelWidth3, channelWidth3 * 0.15, angleDiff3);

    // Elevation range: flows from crater down to lower mountain slope
    float slopeRange = smoothstep(24.0, 50.0, vElevation) * smoothstep(${VOLCANO_SUMMIT_Y.toFixed(1)} + 6.0, ${VOLCANO_SUMMIT_Y.toFixed(1)} - 6.0, vElevation);

    // Caldera crater interior molten magma glow
    float inCrater = smoothstep(${VOLCANO_CRATER_RADIUS.toFixed(1)} + 3.0, ${VOLCANO_CRATER_RADIUS.toFixed(1)} - 3.0, vRadialDist)
                   * smoothstep(${VOLCANO_SUMMIT_Y.toFixed(1)}, ${VOLCANO_CRATER_Y.toFixed(1)} + 3.0, vElevation);

    float lavaMask = max(max(inChannel1, inChannel2 * 0.88), inChannel3 * 0.82) * slopeRange;
    lavaMask = max(lavaMask, inCrater);

    vec3 lavaEmissive = vec3(0.0);
    if (lavaMask > 0.01) {
      vec2 flowUV = vec2(vAngle * 28.0, vElevation * 0.14 - lavaSpeed);
      float flowNoise1 = fbm(flowUV);
      float flowNoise2 = fbm(flowUV * 2.5 + vec2(uTime * 0.05, 0.0));
      float moltenHeat = flowNoise1 * 0.62 + flowNoise2 * 0.38;

      float crust = smoothstep(0.32, 0.65, moltenHeat);
      vec3 moltenWhiteYellow = vec3(1.50, 1.35, 0.85); // 1400°C incandescence
      vec3 moltenOrange       = vec3(1.35, 0.55, 0.06); // 1100°C liquid magma
      vec3 moltenRed          = vec3(0.92, 0.14, 0.02); // 850°C viscous lava
      vec3 darkCrust          = vec3(0.12, 0.04, 0.02); // cooling obsidian crust

      vec3 liquidLava = mix(moltenRed, moltenOrange, smoothstep(0.15, 0.55, moltenHeat));
      liquidLava = mix(liquidLava, moltenWhiteYellow, smoothstep(0.58, 0.92, moltenHeat));
      
      vec3 finalLava = mix(liquidLava, darkCrust, crust * 0.70);
      
      float pulse = 0.88 + 0.18 * sin(uTime * 2.4 + vElevation * 0.08) + 0.08 * sin(uTime * 4.9);
      lavaEmissive = finalLava * lavaMask * pulse * 2.8;
    }

    // --- 3. SUNLIGHT & DIRECTIONAL GEOLOGICAL SHADING ---
    float NdotL = max(0.0, dot(rockN, L));
    float wrapDiff = max(0.0, (dot(rockN, L) + 0.28) / 1.28);
    vec3 rockDiffuse = baseRock * (uSunColor * wrapDiff * 1.65 + vec3(0.24, 0.30, 0.40) * 0.85);

    vec3 H = normalize(L + V);
    float NdotH = max(0.0, dot(rockN, H));
    float specRock = pow(NdotH, 24.0) * 0.05;
    float specWet = pow(NdotH, 110.0) * wetness * 0.85;
    vec3 specular = uSunColor * (specRock + specWet);

    vec3 surfaceColor = mix(rockDiffuse, lavaEmissive, lavaMask * 0.85) + lavaEmissive + specular;

    // Thermal proximity glow
    float minAngleDiff = min(angleDiff1 - channelWidth1, min(angleDiff2 - channelWidth2, angleDiff3 - channelWidth3));
    float proximityGlow = smoothstep(0.25, 0.0, minAngleDiff) * slopeRange * 0.35;
    surfaceColor += vec3(0.70, 0.22, 0.03) * proximityGlow * (0.85 + 0.15 * sin(uTime * 2.8));

    // --- 4. REALISTIC MARITIME ATMOSPHERIC PERSPECTIVE ---
    float dist = length(vWorldPosition - cameraPosition);
    float altitudeFalloff = clamp(1.0 - (vElevation - 6.0) / (${VOLCANO_SUMMIT_Y.toFixed(1)}), 0.08, 1.0);
    float hazeFactor = (1.0 - exp(-dist * 0.0014)) * altitudeFalloff;
    hazeFactor = clamp(hazeFactor * 0.58, 0.0, 0.78);

    vec3 finalColor = mix(surfaceColor, uHorizonColor, hazeFactor);

    gl_FragColor = vec4(finalColor, 1.0);

    #include <fog_fragment>
  }
`;

/**
 * -----------------------------------------------------------------------------
 * VOLCANO CRATER MAGMA POOL SHADER
 * -----------------------------------------------------------------------------
 */
const magmaVertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    worldPos.y += sin(worldPos.x * 0.4 + uTime * 2.2) * cos(worldPos.z * 0.4 + uTime * 1.8) * 0.5;
    vWorldPosition = worldPos.xyz;
    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const magmaFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float dist = length(uv);
    if (dist > 1.0) discard;

    float t = uTime * 0.38;
    float n1 = vnoise(uv * 4.5 + vec2(t * 0.35, t * 0.2));
    float n2 = vnoise(uv * 9.0 - vec2(t * 0.25, t * 0.45));
    float churn = n1 * 0.6 + n2 * 0.4;

    vec3 hotCore = vec3(1.5, 1.35, 0.75);
    vec3 orange  = vec3(1.35, 0.58, 0.08);
    vec3 red     = vec3(0.92, 0.16, 0.02);
    vec3 crust   = vec3(0.14, 0.05, 0.03);

    vec3 col = mix(red, orange, smoothstep(0.2, 0.6, churn));
    col = mix(col, hotCore, smoothstep(0.65, 0.95, churn));
    col = mix(col, crust, smoothstep(0.4, 0.6, n1) * 0.60);

    float pulse = 0.92 + 0.15 * sin(uTime * 3.4);
    col *= pulse * 2.8;

    gl_FragColor = vec4(col, 1.0);

    #include <fog_fragment>
  }
`;

/**
 * -----------------------------------------------------------------------------
 * COLOSSAL BASALT SUMMIT CAVE ENTRANCE PORTAL GEOMETRY
 * -----------------------------------------------------------------------------
 */
function createMountFujiGeometry() {
  const radialSegments = 160;
  const heightSegments = 110;
  const numVertices = (radialSegments + 1) * (heightSegments + 1);

  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices: number[] = [];

  let vertIdx = 0;
  let uvIdx = 0;

  for (let j = 0; j <= heightSegments; j++) {
    const v = j / heightSegments;

    let r = 0;
    let y = 0;

    if (v < 0.10) {
      // ZONE 1: Caldera crater bowl (r: 0 -> VOLCANO_CRATER_RADIUS)
      const uCrater = v / 0.10;
      r = uCrater * VOLCANO_CRATER_RADIUS;
      y = VOLCANO_CRATER_Y + (VOLCANO_SUMMIT_Y - VOLCANO_CRATER_Y) * Math.pow(uCrater, 1.85);
    } else if (v < 0.86) {
      // ZONE 2: Mount Fuji Iconic Concave Slope
      const uSlope = (v - 0.10) / (0.86 - 0.10);
      r = VOLCANO_CRATER_RADIUS + (VOLCANO_BASE_RADIUS - VOLCANO_CRATER_RADIUS) * Math.pow(uSlope, 0.72);

      // Mount Fuji exponential concave elevation curve
      const invU = 1.0 - uSlope;
      y = 6.0 + (VOLCANO_SUMMIT_Y - 6.0) * invU * Math.exp(-1.35 * uSlope);
    } else {
      // ZONE 3: Submerged Ocean Skirt (r: VOLCANO_BASE_RADIUS -> 200.0, y: 6.0 -> -110.0)
      const uSkirt = (v - 0.86) / (1.0 - 0.86);
      r = VOLCANO_BASE_RADIUS + 40.0 * uSkirt;
      y = 6.0 - 116.0 * Math.pow(uSkirt, 1.25);
    }

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const angle = u * Math.PI * 2;

      let rPerturb = r;
      let yPerturb = y;

      if (v >= 0.08 && v <= 0.86) {
        // Geological barranco ravines and radial buttresses
        const barrancos =
          Math.sin(angle * 12.0) * 0.42 +
          Math.sin(angle * 24.0 + 1.2) * 0.22 +
          Math.sin(angle * 48.0 - 0.6) * 0.10;

        const rockUndulation =
          Math.sin(angle * 3.0 + 0.4) * 0.030 +
          Math.cos(angle * 5.0 - 0.8) * 0.020;

        const midSlopeFactor = Math.sin((v - 0.08) / 0.78 * Math.PI);
        rPerturb = r * (1.0 + rockUndulation + barrancos * 0.038 * midSlopeFactor);
        yPerturb = y + barrancos * 3.2 * midSlopeFactor;
      } else if (v < 0.10) {
        // Jagged crater rim with natural southern caldera notch facing observer
        const southNotch = Math.cos(angle - Math.PI / 2);
        const notchDip = Math.max(0.0, southNotch) * 4.2 * (v / 0.10);
        const rimJag = (Math.sin(angle * 7.0) * 1.5 + Math.cos(angle * 13.0) * 0.9) * (v / 0.10);
        yPerturb += rimJag - notchDip;
      }

      let x = Math.cos(angle) * rPerturb + VOLCANO_CENTER_X;
      let z = Math.sin(angle) * rPerturb + VOLCANO_CENTER_Z;

      positions[vertIdx * 3 + 0] = x;
      positions[vertIdx * 3 + 1] = yPerturb;
      positions[vertIdx * 3 + 2] = z;

      uvs[uvIdx * 2 + 0] = u;
      uvs[uvIdx * 2 + 1] = v;

      vertIdx++;
      uvIdx++;
    }
  }

  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const a = j * (radialSegments + 1) + i;
      const b = (j + 1) * (radialSegments + 1) + i;
      const c = (j + 1) * (radialSegments + 1) + (i + 1);
      const d = j * (radialSegments + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
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
 * -----------------------------------------------------------------------------
 * CAMERA-FACING VOLCANIC ASH & SMOKE BILLOW PLUME
 * -----------------------------------------------------------------------------
 */
function VolcanicPlume() {
  const count = 42;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const configs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      return {
        speed: 0.15 + (i % 5) * 0.03,
        scale: 22.0 + t * 36.0,
        driftX: (Math.sin(i * 1.7) * 5.0) + t * 26.0,
        driftZ: (Math.cos(i * 2.1) * 5.0) - t * 14.0,
        rotSpeed: (i % 2 === 0 ? 1 : -1) * 0.07,
        radius: 4.0 + t * 26.0,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  const smokeMaterial = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0.0, "rgba(255, 255, 255, 0.48)");
      grad.addColorStop(0.35, "rgba(235, 225, 215, 0.34)");
      grad.addColorStop(0.75, "rgba(195, 185, 185, 0.12)");
      grad.addColorStop(1.0, "rgba(180, 180, 180, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.MeshBasicMaterial({
      map: texture,
      color: "#282328",
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const camPos = state.camera.position;

    configs.forEach((cfg, i) => {
      const progress = (time * cfg.speed * 45.0 + (i / count) * 140.0) % 140.0;
      const t = progress / 140.0;

      const y = VOLCANO_SUMMIT_Y + progress;
      const angle = i * 0.8 + time * cfg.rotSpeed;
      const expandR = cfg.radius + t * 28.0;
      const x = VOLCANO_CENTER_X + Math.cos(angle) * expandR + t * cfg.driftX;
      const z = VOLCANO_CENTER_Z + Math.sin(angle) * expandR + t * cfg.driftZ;
      const s = cfg.scale * (0.88 + Math.sin(time * 0.8 + cfg.phase) * 0.12) * 1.25;

      dummy.position.set(x, y, z);
      dummy.lookAt(camPos);
      dummy.scale.set(s, s, 1);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      material={smokeMaterial}
    >
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

/**
 * -----------------------------------------------------------------------------
 * GLOWING VOLCANIC EMBERS & LAPILLI
 * -----------------------------------------------------------------------------
 */
function VolcanicEmbers() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 90;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * VOLCANO_CRATER_RADIUS;
      pos[i * 3 + 0] = VOLCANO_CENTER_X + Math.cos(angle) * r;
      pos[i * 3 + 1] = VOLCANO_CRATER_Y + Math.random() * 25.0;
      pos[i * 3 + 2] = VOLCANO_CENTER_Z + Math.sin(angle) * r;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.35;
      arr[i * 3 + 0] += Math.sin(time * 1.5 + phases[i]) * 0.12;
      arr[i * 3 + 2] += Math.cos(time * 1.2 + phases[i]) * 0.12;

      if (arr[i * 3 + 1] > VOLCANO_SUMMIT_Y + 70.0) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (VOLCANO_CRATER_RADIUS * 0.85);
        arr[i * 3 + 0] = VOLCANO_CENTER_X + Math.cos(angle) * r;
        arr[i * 3 + 1] = VOLCANO_CRATER_Y + Math.random() * 2.0;
        arr[i * 3 + 2] = VOLCANO_CENTER_Z + Math.sin(angle) * r;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffaa22"
        size={1.4}
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={true}
      />
    </points>
  );
}

/**
 * -----------------------------------------------------------------------------
 * MASSIVE ACTIVE MOUNT FUJI STRATOVOLCANO MASTER COMPONENT
 * -----------------------------------------------------------------------------
 */
export default function Volcano() {
  const volcanoGroupRef = useRef<THREE.Group>(null);

  // 1. Procedural Mount Fuji BufferGeometry
  const mountainGeometry = useMemo(() => {
    return createMountFujiGeometry();
  }, []);

  // 2. Volcanic Shader Materials
  const mountainMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: volcanoVertexShader,
      fragmentShader: volcanoFragmentShader,
      uniforms: {
        ...THREE.UniformsLib.fog,
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR.clone() },
        uSunColor: { value: new THREE.Color("#fff5dc") },
        uHorizonColor: { value: OCEAN_HORIZON_COLOR.clone() },
        uLavaPulse: { value: 1.0 },
      },
      side: THREE.DoubleSide,
      depthWrite: true,
      fog: true,
    });
  }, []);

  const magmaPoolMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: magmaVertexShader,
      fragmentShader: magmaFragmentShader,
      uniforms: {
        ...THREE.UniformsLib.fog,
        uTime: { value: 0 },
      },
      side: THREE.DoubleSide,
      depthWrite: true,
      fog: true,
    });
  }, []);

  useFrame((state) => {
    const p = worldProgressState.progress;

    // Pre-warmed and resident for surface approach, slope ascent, and summit cave entry (p: 202 to 234)
    // Turns off inside the subterranean cavern so it never obstructs the prehistoric valley reveal!
    if (volcanoGroupRef.current) {
      const isVisible = p >= 202 && p <= 234;
      volcanoGroupRef.current.visible = isVisible;
      if (!isVisible) return;
    }

    const t = state.clock.getElapsedTime();
    mountainMaterial.uniforms.uTime.value = t;
    mountainMaterial.uniforms.uLavaPulse.value = 0.9 + 0.15 * Math.sin(t * 2.8);
    magmaPoolMaterial.uniforms.uTime.value = t;
  });

  return (
    <group ref={volcanoGroupRef} name="massive-active-mount-fuji-volcano">
      {/* 1. MONUMENTAL STRATOVOLCANO MOUNTAIN MESH */}
      <mesh
        geometry={mountainGeometry}
        material={mountainMaterial}
        castShadow={false}
        receiveShadow={false}
      />

      {/* 2. SUMMIT CALDERA BOILING MAGMA CONDUIT (Open central vent for subterranean descent) */}
      <mesh
        position={[VOLCANO_CENTER_X, VOLCANO_CRATER_Y + 0.5, VOLCANO_CENTER_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={magmaPoolMaterial}
      >
        <ringGeometry args={[8.5, VOLCANO_CRATER_RADIUS * 0.92, 48]} />
      </mesh>

      {/* 3. CALDERA CRATER INTERNAL RADIANT LIGHT */}
      <pointLight
        position={[VOLCANO_CENTER_X, VOLCANO_CRATER_Y + 12.0, VOLCANO_CENTER_Z]}
        color="#ff5500"
        intensity={32.0}
        distance={350.0}
        castShadow={false}
      />

      {/* 4. BILLOWING VOLCANIC ASH & SMOKE PLUME */}
      <VolcanicPlume />

      {/* 5. GLOWING CALDERA EMBERS & LAPILLI */}
      <VolcanicEmbers />
    </group>
  );
}
