"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR } from "../OceanSky";

/**
 * -----------------------------------------------------------------------------
 * MASTER CINEMATIC PREHISTORIC TERRAIN SHADER
 * Faithfully recreating the Master Reference Image:
 * - Natural craggy sandstone, limestone, and basalt canyon amphitheaters
 * - Rich vertical rock weathering and organic fissures (NO periodic stripes!)
 * - Warm golden sunlit highlights on the canyon rim and cliff shelves
 * - Lush ancient moss turf and fertile earth on ledges, bluffs, and riverbanks
 * - Glistening wet rock with specular highlights near river rapids and waterfalls
 * - Distant mountain aerial haze creating grand atmospheric scale
 * -----------------------------------------------------------------------------
 */

const terrainVertexShader = /* glsl */ `
  #include <fog_pars_vertex>

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vSlope;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);

    vSlope = 1.0 - clamp(abs(vNormal.y), 0.0, 1.0);

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const terrainFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform vec3 uSunDirection;
  uniform float uTime;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vSlope;

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
    mat2 rot = mat2(cos(0.55), sin(0.55), -sin(0.55), cos(0.55));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.08;
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDirection);
    vec3 V = normalize(cameraPosition - vWorldPosition);

    // Multi-scale 3D organic procedural noise
    vec2 pXZ = vWorldPosition.xz * 0.025;
    float nMacro = fbm(pXZ * 1.2);
    float nDetail = fbm(pXZ * 4.5);

    // Vertical rock weathering streaks & fissures
    vec2 pVert = vec2(vWorldPosition.x * 0.03 + vWorldPosition.z * 0.02, vWorldPosition.y * 0.04);
    float rockNoise = fbm(pVert * 2.2 + nMacro * 0.35);
    float vertErosion = noise(vec2(vWorldPosition.x * 0.22 + vWorldPosition.z * 0.16, vWorldPosition.y * 0.02));

    // Geological Color Palettes matching Ancient Rainforest Reference Image:
    // Dark weathered basalt, mossy granite, damp forest loam, and velvety emerald moss
    vec3 deepBasaltRock  = vec3(0.13, 0.15, 0.14); // Dark weathered volcanic basalt
    vec3 mossyGranite    = vec3(0.20, 0.24, 0.20); // Lichen-covered canyon rock
    vec3 dampCliffRock   = vec3(0.22, 0.19, 0.16); // Moisture-drenched cliff body
    vec3 deepLushMoss    = vec3(0.11, 0.30, 0.08); // Deep shaded rainforest moss
    vec3 emeraldMossTurf = vec3(0.16, 0.40, 0.11); // Velvety primeval moss
    vec3 brightMossLedge = vec3(0.26, 0.54, 0.15); // Dappled sunlit moss on shelves
    vec3 dampHumusLoam   = vec3(0.16, 0.13, 0.10); // Rich forest floor humus & leaf mold
    vec3 wetRockColor    = vec3(0.08, 0.10, 0.10); // Glistening wet stone near river rapids

    vec3 cliffStone = mix(deepBasaltRock, dampCliffRock, rockNoise * 0.70 + vertErosion * 0.30);
    cliffStone = mix(cliffStone, mossyGranite, smoothstep(0.3, 0.65, nDetail));

    // Natural rock weathering & moss pockets on cliff surfaces
    float strataNoise = fbm(vec2(vWorldPosition.x * 0.018 + 0.3, vWorldPosition.y * 0.055));
    float strataDetail = noise(vec2(vWorldPosition.x * 0.040 + vWorldPosition.z * 0.012, vWorldPosition.y * 0.095));
    float strataBand = strataNoise * 0.65 + strataDetail * 0.35;
    cliffStone = mix(cliffStone, mossyGranite, strataBand * 0.45);
    
    // Slopes catch thick moss and climbing vegetation (typical of humid rainforest)
    float rockMix = smoothstep(0.15, 0.42, vSlope + nDetail * 0.10);

    // Ledges across cliffs catch dense hanging moss and fern pockets
    float ledgeMoss = (1.0 - rockMix) * smoothstep(4.0, 48.0, vWorldPosition.y);
    vec3 mossColor = mix(deepLushMoss, emeraldMossTurf, smoothstep(0.25, 0.70, nDetail));
    mossColor = mix(mossColor, brightMossLedge, smoothstep(0.65, 0.95, nMacro));

    // Forest floor: dense carpet of moss turf, exposed roots, and rich fertile soil
    vec3 groundColor = mix(mossColor, dampHumusLoam, smoothstep(0.35, 0.75, nMacro));

    float waterlineDist = abs(vWorldPosition.y - 5.2);
    vec3 sandGravel = vec3(0.28, 0.26, 0.22);
    float shoreSand = smoothstep(1.5, 0.2, waterlineDist) * (1.0 - rockMix);
    groundColor = mix(groundColor, sandGravel, shoreSand * 0.55);

    vec3 baseColor = mix(groundColor, cliffStone, rockMix);
    baseColor = mix(baseColor, mossColor, ledgeMoss * 0.85);

    // Wet rock along riverbanks & waterfall impact zones
    float wetShoreline = smoothstep(1.4, 0.1, waterlineDist);
    float rightFallDist = length(vWorldPosition.xz - vec2(42.0, -1172.0));
    float leftFallDist = length(vWorldPosition.xz - vec2(-54.0, -1210.0));
    float wetSpray = max(smoothstep(48.0, 8.0, rightFallDist), smoothstep(28.0, 6.0, leftFallDist));
    float totalWetness = max(wetShoreline * 0.92, wetSpray);

    baseColor = mix(baseColor, wetRockColor, totalWetness * 0.90);

    // Rainforest filtered lighting calculation
    float wrapNdotL = max(0.0, (dot(N, L) + 0.30) / 1.30);
    vec3 sunLight = vec3(0.96, 0.98, 0.88) * (wrapNdotL * 1.15);
    vec3 skyLight = vec3(0.14, 0.36, 0.34) * (N.y * 0.5 + 0.5) * 0.70;
    vec3 groundBounce = vec3(0.10, 0.26, 0.08) * max(0.0, -N.y * 0.5 + 0.5) * 0.45;
    vec3 ambient = vec3(0.18, 0.28, 0.26);

    vec3 litColor = baseColor * (sunLight + skyLight + groundBounce + ambient);

    // Wet rock specular glints
    if (totalWetness > 0.05) {
      vec3 H = normalize(L + V);
      float wetSpec = pow(max(0.0, dot(N, H)), 56.0) * totalWetness * 0.85;
      litColor += vec3(0.85, 0.95, 0.92) * wetSpec;
    }

    // Atmospheric aerial depth haze: cool blue-green / teal humid rainforest mist
    float distToCam = length(vWorldPosition - cameraPosition);
    float atmosHaze = smoothstep(35.0, 380.0, distToCam);
    vec3 forestHaze = vec3(0.06, 0.16, 0.16);
    litColor = mix(litColor, forestHaze, atmosHaze * 0.72);

    gl_FragColor = vec4(litColor, 1.0);

    #include <fog_fragment>
  }
`;

/**
 * -----------------------------------------------------------------------------
 * MASTER TURQUOISE RIVER WATER SHADER
 * -----------------------------------------------------------------------------
 */
const riverVertexShader = /* glsl */ `
  #include <fog_pars_vertex>

  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);

    float flowZ = worldPos.z + uTime * 2.8;
    float wave1 = sin(worldPos.x * 0.35 + flowZ * 0.38) * 0.09;
    float wave2 = cos(worldPos.x * 0.70 - flowZ * 0.62) * 0.05;
    worldPos.y += wave1 + wave2;

    vWorldPosition = worldPos.xyz;
    vNormal = normalize(vec3(-wave1 * 0.45, 1.0, -wave2 * 0.60));

    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const riverFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform vec3 uSunDirection;
  uniform float uTime;

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

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    float NdotV = max(0.001, dot(N, V));
    float fresnel = pow(1.0 - NdotV, 3.8);

    vec3 deepTurquoise     = vec3(0.02, 0.38, 0.38); 
    vec3 shallowAquamarine = vec3(0.10, 0.68, 0.62); 
    vec3 emeraldShallows   = vec3(0.16, 0.78, 0.68); 
    vec3 skyReflect        = vec3(0.68, 0.86, 0.98); 
    vec3 whiteFoam         = vec3(0.97, 0.99, 1.00); 

    float bankDist = abs(vUv.x - 0.5) * 2.0;
    
    float flowZ = vWorldPosition.z + uTime * 2.8;
    float nWave1 = noise(vec2(vWorldPosition.x * 0.45, flowZ * 0.36));
    float nWave2 = noise(vec2(vWorldPosition.x * 0.95 - 0.3, flowZ * 0.75));
    float ripple = nWave1 * 0.65 + nWave2 * 0.35;

    vec3 waterBody = mix(deepTurquoise, shallowAquamarine, smoothstep(0.18, 0.85, bankDist));
    waterBody = mix(waterBody, emeraldShallows, ripple * 0.28);

    vec3 waterColor = mix(waterBody, skyReflect, fresnel * 0.42 + 0.10);

    float nFoam = noise(vec2(vUv.x * 26.0, vUv.y * 45.0 - uTime * 2.6));
    float shoreFoam = smoothstep(0.78, 0.98, bankDist + nFoam * 0.18) * 0.78;
    
    // Natural rapids bar across river
    float rapidsZone = smoothstep(16.0, 0.0, abs(vWorldPosition.z - (-1166.0)));
    float rapidsFoam = smoothstep(0.38, 0.85, ripple + nFoam * 0.32) * rapidsZone * 0.88;

    float totalFoam = clamp(shoreFoam + rapidsFoam, 0.0, 1.0);
    waterColor = mix(waterColor, whiteFoam, totalFoam * 0.94);

    vec3 H = normalize(L + V);
    float specSharp = pow(max(0.0, dot(N, H)), 180.0) * 0.95;
    waterColor += vec3(1.0, 0.98, 0.92) * specSharp;

    float alpha = mix(0.95, 0.85, bankDist);

    gl_FragColor = vec4(waterColor, alpha);

    #include <fog_fragment>
  }
`;

/**
 * Procedural Prehistoric Elevation Function
 */
export function getPrehistoricElevation(x: number, z: number): number {
  const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;
  const distFromRiver = Math.abs(x - riverX);

  // 1. Riverbed & Immediate Channel (Water surface is Y = 5.2)
  const riverBedWidth = 16.0;
  let y = 5.2;

  if (distFromRiver < riverBedWidth) {
    const rFrac = distFromRiver / riverBedWidth;
    y = 3.6 + Math.pow(rFrac, 1.8) * 1.8;
    return y;
  }

  // 2. Left Foreground Overlook Bluff (Hero Triceratops site: X: -10 to -34, Z: -1115 to -1155)
  if (x < -10.0 && x > -36.0 && z > -1155.0 && z < -1110.0) {
    const bluffCenter = -20.0;
    const distToCenter = Math.abs(x - bluffCenter);
    const bluffBase = 8.6 - Math.pow(distToCenter / 14.0, 2.0) * 2.2;
    const rockRipples = Math.sin(x * 0.4 + z * 0.3) * 0.35;
    return bluffBase + rockRipples;
  }

  // 3. Valley Floor & Gentle Savannah Terraces
  const valleyFloorWidth = 75.0;
  if (distFromRiver < valleyFloorWidth) {
    const mFrac = (distFromRiver - riverBedWidth) / (valleyFloorWidth - riverBedWidth);
    y = 5.4 + Math.sin(mFrac * Math.PI * 0.5) * 5.2;
    y += Math.sin(x * 0.04 + z * 0.025) * 0.6;
  } else {
    // 4. Grand Sandstone Amphitheater Canyon Walls with stepped vegetation terraces
    const cDist = distFromRiver - valleyFloorWidth;
    // Layered cliff rise with natural rock shelves every ~15m
    const cliffBase = 10.6 + Math.pow(cDist * 0.12, 1.35) * 18.0;
    const shelfStepping = Math.sin(cliffBase * 0.16) * 2.2;
    const organicCrags = Math.sin(cDist * 0.06 + Math.cos(z * 0.03) * 2.5) * 2.0;
    y = cliffBase + shelfStepping + organicCrags;
  }

  // 5. Right Cliff Waterfall Bedrock Terraces (X: 34 to 75, Z: -1150 to -1215)
  if (x > 34.0 && x < 75.0 && z < -1150.0 && z > -1215.0) {
    const fallDist = Math.abs(x - 48.0);
    if (fallDist < 20.0) {
      if (y > 38.0 && y < 52.0) y = 43.0 + Math.sin(x * 0.3) * 0.6;
      else if (y > 22.0 && y < 34.0) y = 26.0 + Math.sin(x * 0.3) * 0.5;
      else if (y > 10.0 && y < 19.0) y = 14.0 + Math.sin(x * 0.3) * 0.4;
    }
  }

  // 6. Northern Distant Cretaceous Mountain Ridges (Z < -1500)
  if (z < -1500.0) {
    const northDist = -1500.0 - z;
    if (Math.abs(x) > 22.0) {
      const cDist = Math.abs(x) - 22.0;
      const ridge1 = Math.sin(x * 0.03) * 22.0 + Math.cos(x * 0.06 + z * 0.02) * 12.0;
      const ridgeElevation = Math.max(0.0, 24.0 + ridge1) * Math.min(1.0, cDist / 20.0);
      y += Math.min(55.0, ridgeElevation * Math.min(1.0, northDist / 140.0));
    }
  }

  return y;
}

function createPrehistoricTerrainGeometry(): THREE.BufferGeometry {
  const xSegments = 170;
  const zSegments = 230;
  const xMin = -340;
  const xMax = 340;
  const zMin = -1100; // Starts right under the cave arch for seamless continuity
  const zMax = -1800;

  const numVertices = (xSegments + 1) * (zSegments + 1);
  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices: number[] = [];

  let vertIdx = 0;
  let uvIdx = 0;

  for (let j = 0; j <= zSegments; j++) {
    const v = j / zSegments;
    const z = zMin + (zMax - zMin) * v;

    for (let i = 0; i <= xSegments; i++) {
      const u = i / xSegments;
      const x = xMin + (xMax - xMin) * u;
      const y = getPrehistoricElevation(x, z);

      positions[vertIdx * 3 + 0] = x;
      positions[vertIdx * 3 + 1] = y;
      positions[vertIdx * 3 + 2] = z;

      uvs[uvIdx * 2 + 0] = u;
      uvs[uvIdx * 2 + 1] = v;

      vertIdx++;
      uvIdx++;
    }
  }

  for (let j = 0; j < zSegments; j++) {
    for (let i = 0; i < xSegments; i++) {
      const a = j * (xSegments + 1) + i;
      const b = (j + 1) * (xSegments + 1) + i;
      const c = (j + 1) * (xSegments + 1) + (i + 1);
      const d = j * (xSegments + 1) + (i + 1);

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
 * Procedural River Ribbon Geometry
 */
function createRiverGeometry(): THREE.BufferGeometry {
  const segments = 170;
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const indices: number[] = [];

  const zMin = -1100;
  const zMax = -1740;
  const halfWidth = 17.5;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const z = zMin + (zMax - zMin) * t;
    const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;

    const leftX = riverX - halfWidth;
    const rightX = riverX + halfWidth;
    const y = 5.2;

    const idxLeft = i * 2;
    const idxRight = i * 2 + 1;

    positions[idxLeft * 3 + 0] = leftX;
    positions[idxLeft * 3 + 1] = y;
    positions[idxLeft * 3 + 2] = z;

    positions[idxRight * 3 + 0] = rightX;
    positions[idxRight * 3 + 1] = y;
    positions[idxRight * 3 + 2] = z;

    uvs[idxLeft * 2 + 0] = 0.0;
    uvs[idxLeft * 2 + 1] = t;

    uvs[idxRight * 2 + 0] = 1.0;
    uvs[idxRight * 2 + 1] = t;

    if (i < segments) {
      const a = idxLeft;
      const b = idxRight;
      const c = (i + 1) * 2 + 1;
      const d = (i + 1) * 2;

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
 * Natural Stepped Riverbed Boulders, Rapids & Foreground Overlook Rocks
 */
function createRiverBouldersGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // 0. Immediate Foreground Riverbed Shallows & Rapids (Z: -1112 to -1128, X: -8 to +14)
  for (let i = 0; i < 22; i++) {
    const rx = -7.5 + (i % 6) * 3.6 + Math.sin(i * 1.7) * 1.1;
    const rz = -1114.0 - Math.floor(i / 6) * 4.0 + Math.cos(i * 2.1) * 0.9;
    const ry = 4.6 + Math.abs(Math.sin(i * 1.5)) * 0.65;

    const rock = new THREE.DodecahedronGeometry(1.5 + (i % 3) * 0.45, 1);
    rock.scale(1.4, 0.65, 1.3);
    rock.translate(rx, ry, rz);
    geometries.push(rock);
  }

  // 1. Natural Stepping Rapids Bar across the river (Z: -1164 to -1172)
  for (let i = 0; i < 24; i++) {
    const frac = i / 24;
    const rx = -14.0 + frac * 28.0 + Math.sin(i * 1.9) * 1.3;
    const rz = -1166.0 + Math.sin(frac * Math.PI) * 3.8 + Math.cos(i) * 1.1;
    const ry = 4.7 + Math.sin(i * 2.3) * 0.48;

    const rock = new THREE.DodecahedronGeometry(1.7 + (i % 3) * 0.5, 1);
    rock.scale(1.5, 0.62, 1.4);
    rock.translate(rx, ry, rz);
    geometries.push(rock);
  }

  // 2. Foreground Overlook Boulders surrounding the Hero Triceratops Bluff (Z: -1122 to -1145, X: -24 to -8)
  for (let i = 0; i < 20; i++) {
    const rx = -20.0 + (i % 4) * 4.2 + Math.sin(i * 1.5) * 1.3;
    const rz = -1124.0 - Math.floor(i / 4) * 4.2 + Math.cos(i) * 1.1;
    const ry = 7.8 + Math.abs(Math.sin(i * 1.7)) * 0.6;

    const rock = new THREE.DodecahedronGeometry(2.1 + (i % 3) * 0.45, 1);
    rock.scale(1.45, 0.75, 1.35);
    rock.translate(rx, ry, rz);
    geometries.push(rock);
  }

  // 3. Foreground Right Riverbank Boulders (Z: -1128 to -1148, X: 16 to 32)
  for (let i = 0; i < 14; i++) {
    const rx = 17.0 + (i % 3) * 4.5 + Math.sin(i * 1.8) * 1.3;
    const rz = -1130.0 - Math.floor(i / 3) * 4.8;
    const ry = 5.4 + Math.sin(i * 1.4) * 0.55;

    const rock = new THREE.DodecahedronGeometry(2.2 + (i % 3) * 0.45, 1);
    rock.scale(1.4, 0.72, 1.35);
    rock.translate(rx, ry, rz);
    geometries.push(rock);
  }

  // 4. Middle & Distant River Boulders
  const boulderCount = 38;
  for (let i = 0; i < boulderCount; i++) {
    const t = i / boulderCount;
    const z = -1175.0 - t * 460.0;
    const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;

    const side = (i % 2 === 0 ? 1 : -1);
    const offset = side * (8.5 + (i % 4) * 3.0);
    const bx = riverX + offset;
    const by = 4.8 + Math.sin(i * 1.6) * 0.48;

    const rock = new THREE.DodecahedronGeometry(2.3 + (i % 3) * 0.65, 1);
    rock.scale(1.4, 0.70, 1.3);
    rock.translate(bx, by, z);
    geometries.push(rock);
  }

  let totalVerts = 0;
  geometries.forEach((g) => { totalVerts += g.attributes.position.count; });
  const mergedPos = new Float32Array(totalVerts * 3);
  const mergedNorm = new Float32Array(totalVerts * 3);
  const mergedColors = new Float32Array(totalVerts * 3);
  const mergedIndices: number[] = [];

  let vOffset = 0;
  geometries.forEach((g) => {
    const posArr = g.attributes.position.array;
    const count = g.attributes.position.count;
    mergedPos.set(posArr, vOffset * 3);
    if (g.attributes.normal) {
      mergedNorm.set(g.attributes.normal.array, vOffset * 3);
    }
    
    for (let k = 0; k < count; k++) {
      const ny = g.attributes.normal ? g.attributes.normal.getY(k) : 0.5;
      const mossFactor = Math.max(0.0, Math.min(1.0, (ny - 0.2) / 0.7));
      const r = 0.12 + mossFactor * 0.08;
      const gCol = 0.14 + mossFactor * 0.32;
      const b = 0.12 + mossFactor * 0.04;
      mergedColors[(vOffset + k) * 3 + 0] = r;
      mergedColors[(vOffset + k) * 3 + 1] = gCol;
      mergedColors[(vOffset + k) * 3 + 2] = b;
    }

    if (g.index) {
      for (let k = 0; k < g.index.array.length; k++) {
        mergedIndices.push(g.index.array[k] + vOffset);
      }
    }
    vOffset += count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
  merged.setAttribute("color", new THREE.BufferAttribute(mergedColors, 3));
  merged.setIndex(mergedIndices);
  merged.computeVertexNormals();
  return merged;
}

export default function PrehistoricTerrain() {
  const terrainGeo = useMemo(() => createPrehistoricTerrainGeometry(), []);
  const riverGeo = useMemo(() => createRiverGeometry(), []);
  const bouldersGeo = useMemo(() => createRiverBouldersGeometry(), []);

  const terrainMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR },
        ...THREE.UniformsLib.fog,
      },
      fog: true,
    });
  }, []);

  const riverMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: riverVertexShader,
      fragmentShader: riverFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR },
        ...THREE.UniformsLib.fog,
      },
      transparent: true,
      side: THREE.DoubleSide,
      fog: true,
    });
  }, []);

  const bouldersMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.52,
      metalness: 0.05,
      fog: true,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (terrainMaterial) terrainMaterial.uniforms.uTime.value = t;
    if (riverMaterial) riverMaterial.uniforms.uTime.value = t;
  });

  return (
    <group name="prehistoric-terrain-system">
      {/* 1. Valley Terrain & Stepped Canyon Cliffs */}
      <mesh geometry={terrainGeo} material={terrainMaterial} receiveShadow />

      {/* 2. Crystalline Turquoise River Water */}
      <mesh geometry={riverGeo} material={riverMaterial} />

      {/* 3. Riverbed Stepping Rapids, Boulders & Overlook Rocks */}
      <mesh geometry={bouldersGeo} material={bouldersMaterial} castShadow receiveShadow />
    </group>
  );
}
