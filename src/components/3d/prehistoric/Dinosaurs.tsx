"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR } from "../OceanSky";

/**
 * -----------------------------------------------------------------------------
 * ADVANCED PROCEDURAL DINOSAUR SKIN SHADER
 * -----------------------------------------------------------------------------
 */
const dinosaurVertexShader = /* glsl */ `
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

const dinosaurFragmentShader = /* glsl */ `
  #include <fog_pars_fragment>

  uniform vec3 uSunDirection;
  uniform vec3 uBaseColor;
  uniform vec3 uUnderbellyColor;
  uniform vec3 uPatternColor;
  uniform float uPatternType; // 0 = triceratops body, 1 = frill, 2 = horns, 3 = sauropod

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
    mat2 rot = mat2(cos(0.55), sin(0.55), -sin(0.55), cos(0.55));
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.1;
      a *= 0.50;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    vec2 scaleUV = vWorldPosition.xy * 2.6 + vWorldPosition.zy * 2.2;
    float nPebble = noise(scaleUV * 6.0);
    float nWrinkle = fbm(vec2(vWorldPosition.x * 1.6, vWorldPosition.y * 5.2) + vWorldPosition.z * 1.2);
    float macroPattern = fbm(scaleUV * 0.85);

    vec3 skin = uBaseColor;

    if (uPatternType < 0.5) {
      // Triceratops Torso & Limbs
      float underbellyMask = smoothstep(0.3, -0.6, N.y);
      skin = mix(uBaseColor, uUnderbellyColor, underbellyMask * 0.75);
      skin = mix(skin, uPatternColor, macroPattern * 0.45);
      skin *= (0.88 + nPebble * 0.24);
      skin *= (0.90 + nWrinkle * 0.20);
    } else if (uPatternType < 1.5) {
      // Triceratops Cranial Frill: Rich mottled ochre, umber & terracotta patterns
      float spotPattern = fbm(scaleUV * 2.4);
      float centerMottle = smoothstep(0.38, 0.78, spotPattern);
      skin = mix(uBaseColor, uPatternColor, centerMottle * 0.75);
      skin = mix(skin, vec3(0.58, 0.40, 0.25), nPebble * 0.35);
      // Dark scalloped edge rim
      float rimFade = smoothstep(2.5, 4.4, length(vWorldPosition.xy - vec2(-18.5, 12.0)));
      skin = mix(skin, vec3(0.28, 0.20, 0.14), rimFade * 0.65);
    } else if (uPatternType < 2.5) {
      // Horns: Ivory bone base with longitudinal growth striations and dark tip
      float striation = noise(vec2(vWorldPosition.x * 28.0, vWorldPosition.y * 3.5));
      skin = mix(uBaseColor, vec3(0.78, 0.72, 0.62), striation * 0.35);
      // Dark tips gradient
      float tipGradient = smoothstep(10.5, 12.8, vWorldPosition.y + vWorldPosition.z * 0.4);
      skin = mix(skin, vec3(0.16, 0.12, 0.08), tipGradient * 0.88);
    } else {
      // Sauropod: Deep mossy gray-green elephantine hide
      float wrinkle = fbm(vec2(vWorldPosition.z * 1.8, vWorldPosition.y * 4.2));
      skin = mix(uBaseColor, uUnderbellyColor, smoothstep(0.2, -0.5, N.y) * 0.6);
      skin = mix(skin, uPatternColor, macroPattern * 0.35);
      skin *= (0.85 + wrinkle * 0.30);
    }

    // Wrap Lighting for soft organic skin in shaded rainforest
    float wrapNdotL = max(0.0, (dot(N, L) + 0.30) / 1.30);
    vec3 sunLight = vec3(0.96, 0.98, 0.88) * (wrapNdotL * 1.15);
    vec3 skyLight = vec3(0.14, 0.36, 0.34) * (N.y * 0.5 + 0.5) * 0.65;
    vec3 groundBounce = vec3(0.10, 0.26, 0.08) * max(0.0, -N.y * 0.5 + 0.5) * 0.40;
    vec3 ambient = vec3(0.20, 0.28, 0.26);

    vec3 litColor = skin * (sunLight + skyLight + groundBounce + ambient);

    // Subsurface Scattering simulation
    float sss = pow(max(0.0, dot(-L, V)), 2.8) * 0.30;
    litColor += vec3(0.65, 0.45, 0.24) * sss;

    // Cool Rainforest Rim Lighting
    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.2);
    float rimSun = max(0.0, dot(L, -V)) * 0.5 + 0.5;
    vec3 rimColor = vec3(0.68, 0.88, 0.82) * (fresnel * rimSun * 0.55);
    litColor += rimColor;

    // Specular highlight
    vec3 H = normalize(L + V);
    float spec = pow(max(0.0, dot(N, H)), 32.0) * 0.15;
    litColor += vec3(1.0, 0.96, 0.88) * spec;

    gl_FragColor = vec4(litColor, 1.0);

    #include <fog_fragment>
  }
`;

/**
 * Creates an anatomically realistic tapered, curving horn geometry
 */
function createTaperedHornGeometry(options: {
  points: THREE.Vector3[];
  baseRadius: number;
  segments?: number;
  radialSegments?: number;
}): THREE.BufferGeometry {
  const { points, baseRadius, segments = 28, radialSegments = 16 } = options;
  const curve = new THREE.CatmullRomCurve3(points);

  const numVerts = (segments + 1) * (radialSegments + 1);
  const positions = new Float32Array(numVerts * 3);
  const normals = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const indices: number[] = [];

  let vIdx = 0;
  let uvIdx = 0;

  for (let j = 0; j <= segments; j++) {
    const t = j / segments;
    const pt = curve.getPoint(t);
    const tangent = curve.getTangent(t);

    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    // Natural bone horn taper: thick at base, sharp needle point at tip
    const currentRadius = Math.max(0.02, baseRadius * Math.pow(1.0 - t, 0.75));

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const angle = u * Math.PI * 2;

      // Elliptical bone cross-section with subtle dorsal ridge
      const rx = Math.cos(angle) * currentRadius * 0.92;
      const ry = Math.sin(angle) * currentRadius * 1.08;

      const px = pt.x + normal.x * rx + binormal.x * ry;
      const py = pt.y + normal.y * rx + binormal.y * ry;
      const pz = pt.z + normal.z * rx + binormal.z * ry;

      positions[vIdx * 3 + 0] = px;
      positions[vIdx * 3 + 1] = py;
      positions[vIdx * 3 + 2] = pz;

      normals[vIdx * 3 + 0] = normal.x * Math.cos(angle) + binormal.x * Math.sin(angle);
      normals[vIdx * 3 + 1] = normal.y * Math.cos(angle) + binormal.y * Math.sin(angle);
      normals[vIdx * 3 + 2] = normal.z * Math.cos(angle) + binormal.z * Math.sin(angle);

      uvs[uvIdx * 2 + 0] = u;
      uvs[uvIdx * 2 + 1] = t;

      vIdx++;
      uvIdx++;
    }
  }

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const a = j * (radialSegments + 1) + i;
      const b = (j + 1) * (radialSegments + 1) + i;
      const c = (j + 1) * (radialSegments + 1) + (i + 1);
      const d = j * (radialSegments + 1) + (i + 1);

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
 * -----------------------------------------------------------------------------
 * 1. MASTER HERO TRICERATOPS
 * Standing proudly on the left mossy bluff in front-three-quarter profile
 * directly facing towards the viewer and the central valley.
 * -----------------------------------------------------------------------------
 */
export function Triceratops({
  position = [-17.0, 8.2, -1136.0],
  rotation = [0, 0.95, 0], // Facing 3/4 towards camera (+X, +Z in local space)
  scale = 1.45,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const headGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      body: new THREE.ShaderMaterial({
        vertexShader: dinosaurVertexShader,
        fragmentShader: dinosaurFragmentShader,
        uniforms: {
          uSunDirection: { value: OCEAN_SUN_DIR },
          uBaseColor: { value: new THREE.Color("#7e6a54") },
          uUnderbellyColor: { value: new THREE.Color("#a28e74") },
          uPatternColor: { value: new THREE.Color("#524232") },
          uPatternType: { value: 0.0 },
          ...THREE.UniformsLib.fog,
        },
        fog: true,
      }),
      frill: new THREE.ShaderMaterial({
        vertexShader: dinosaurVertexShader,
        fragmentShader: dinosaurFragmentShader,
        uniforms: {
          uSunDirection: { value: OCEAN_SUN_DIR },
          uBaseColor: { value: new THREE.Color("#947858") },
          uUnderbellyColor: { value: new THREE.Color("#725a40") },
          uPatternColor: { value: new THREE.Color("#b28e64") },
          uPatternType: { value: 1.0 },
          ...THREE.UniformsLib.fog,
        },
        side: THREE.DoubleSide,
        fog: true,
      }),
      horns: new THREE.ShaderMaterial({
        vertexShader: dinosaurVertexShader,
        fragmentShader: dinosaurFragmentShader,
        uniforms: {
          uSunDirection: { value: OCEAN_SUN_DIR },
          uBaseColor: { value: new THREE.Color("#f0e8d6") },
          uUnderbellyColor: { value: new THREE.Color("#d8ccb0") },
          uPatternColor: { value: new THREE.Color("#423224") },
          uPatternType: { value: 2.0 },
          ...THREE.UniformsLib.fog,
        },
        fog: true,
      }),
      eye: new THREE.MeshStandardMaterial({
        color: "#080604",
        roughness: 0.04,
        metalness: 0.96,
        fog: true,
      }),
      beak: new THREE.MeshStandardMaterial({
        color: "#221810",
        roughness: 0.36,
        metalness: 0.08,
        fog: true,
      }),
      claws: new THREE.MeshStandardMaterial({
        color: "#1a120c",
        roughness: 0.32,
        metalness: 0.10,
        fog: true,
      }),
    };
  }, []);

  // Anatomical Torso with heavy shoulder hump & deep ribcage
  const torsoGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.65, 2.40, 5.6, 22, 10);
    geo.rotateX(Math.PI / 2.05);
    geo.scale(1.24, 1.36, 1.0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const ribBulge = Math.exp(-Math.pow((z - 0.6) / 1.3, 2.0)) * 0.22;
      const hipBulge = Math.exp(-Math.pow((z + 1.5) / 1.1, 2.0)) * 0.16;
      const dorsalSpine = Math.exp(-Math.pow(pos.getX(i) / 0.45, 2.0)) * 0.16 * Math.max(0.0, y);
      pos.setX(i, pos.getX(i) * (1.0 + ribBulge + hipBulge));
      pos.setY(i, pos.getY(i) + dorsalSpine);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Shoulder Musculature Hump
  const shoulderGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.58, 18, 16);
    geo.scale(1.24, 1.40, 1.18);
    geo.translate(0, 0.46, 1.45);
    return geo;
  }, []);

  // Sculpted Cranium with Snout & Brow Ridges
  const craniumGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.72, 1.30, 2.8, 20, 8);
    geo.rotateX(Math.PI / 2.14);
    geo.scale(0.98, 1.22, 1.0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const nostril = Math.exp(-Math.pow((z - 1.2) / 0.5, 2.0)) * 0.12;
      const brow = Math.exp(-Math.pow((z + 0.3) / 0.6, 2.0)) * 0.15 * Math.max(0.0, y);
      pos.setX(i, pos.getX(i) * (1.0 + nostril));
      pos.setY(i, pos.getY(i) + brow);
    }
    geo.computeVertexNormals();
    geo.translate(0, 0.28, 1.25);
    return geo;
  }, []);

  // Scalloped Cranial Frill (Parietal-squamosal crest)
  const frillGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.9, 0);
    shape.quadraticCurveTo(-3.0, 1.5, -2.8, 3.0);
    shape.quadraticCurveTo(-2.0, 4.3, 0, 4.6);
    shape.quadraticCurveTo(2.0, 4.3, 2.8, 3.0);
    shape.quadraticCurveTo(3.0, 1.5, 1.9, 0);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.20,
      bevelThickness: 0.18,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const angle = Math.atan2(y, x);
      const scallop = Math.sin(angle * 12.0) * 0.14;
      pos.setZ(i, pos.getZ(i) + scallop);
    }
    geo.computeVertexNormals();
    geo.rotateX(-Math.PI / 4.1);
    geo.translate(0, 1.15, -0.18);
    return geo;
  }, []);

  // Gracefully Curved, Forward & Upward-Sweeping Tapered Brow Horns
  const browHornGeo = useMemo(() => {
    return createTaperedHornGeometry({
      points: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.85, 1.15),
        new THREE.Vector3(0, 1.95, 2.55),
        new THREE.Vector3(0, 2.85, 3.75),
      ],
      baseRadius: 0.32,
    });
  }, []);

  // Hooked Keratinous Beak
  const beakGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.48, 1.15, 16);
    geo.rotateX(Math.PI / 1.60);
    geo.scale(1.0, 1.35, 1.1);
    geo.translate(0, -0.44, 2.50);
    return geo;
  }, []);

  // Muscular Quadrupedal Limbs
  const foreLimbGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.56, 0.74, 3.1, 16);
    geo.translate(0, -1.55, 0);
    return geo;
  }, []);

  const hindLimbGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.66, 0.85, 3.6, 16);
    geo.translate(0, -1.80, 0);
    return geo;
  }, []);

  const footGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.74, 0.88, 0.54, 16);
    geo.scale(1.0, 1.0, 1.35);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.scale.x = 1.0 + Math.sin(t * 1.4) * 0.015;
      bodyRef.current.scale.y = 1.0 + Math.sin(t * 1.4) * 0.012;
    }
    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = Math.sin(t * 0.45) * 0.045;
      headGroupRef.current.rotation.x = Math.sin(t * 0.75) * 0.025;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 1.0) * 0.085;
      tailRef.current.rotation.z = Math.cos(t * 0.65) * 0.035;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} name="triceratops-hero">
      <group ref={bodyRef} position={[0, 2.8, 0]}>
        <mesh geometry={torsoGeo} material={materials.body} castShadow receiveShadow />
        <mesh geometry={shoulderGeo} material={materials.body} />

        {/* Head, Frill, Horns */}
        <group ref={headGroupRef} position={[0, 0.88, 2.85]}>
          <mesh geometry={craniumGeo} material={materials.body} />
          <mesh geometry={frillGeo} material={materials.frill} />
          <mesh geometry={beakGeo} material={materials.beak} />

          {/* Alert Eyes */}
          <mesh position={[0.70, 0.60, 1.28]} material={materials.eye}>
            <sphereGeometry args={[0.12, 10, 10]} />
          </mesh>
          <mesh position={[-0.70, 0.60, 1.28]} material={materials.eye}>
            <sphereGeometry args={[0.12, 10, 10]} />
          </mesh>

          {/* Forward-Curving Tapered Ivory Brow Horns */}
          <group position={[0.62, 1.18, 0.90]} rotation={[0.10, 0.20, 0.24]}>
            <mesh geometry={browHornGeo} material={materials.horns} />
          </group>
          <group position={[-0.62, 1.18, 0.90]} rotation={[0.10, -0.20, -0.24]}>
            <mesh geometry={browHornGeo} material={materials.horns} />
          </group>

          {/* Sharp Nasal Horn */}
          <mesh position={[0, 0.60, 2.10]} rotation={[Math.PI / 3.3, 0, 0]} material={materials.horns}>
            <coneGeometry args={[0.20, 1.20, 12]} />
          </mesh>
        </group>

        {/* Muscular Tail */}
        <group ref={tailRef} position={[0, 0.25, -2.6]}>
          <mesh material={materials.body} rotation={[Math.PI / 2.15, 0, 0]}>
            <coneGeometry args={[0.85, 5.0, 16]} />
          </mesh>
        </group>
      </group>

      {/* 4 Muscular Limbs planted firmly on mossy stone */}
      <group position={[1.42, 2.7, 1.48]}>
        <mesh geometry={foreLimbGeo} material={materials.body} />
        <mesh position={[0, -3.0, 0.1]} geometry={footGeo} material={materials.claws} />
      </group>
      <group position={[-1.42, 2.7, 1.48]}>
        <mesh geometry={foreLimbGeo} material={materials.body} />
        <mesh position={[0, -3.0, 0.1]} geometry={footGeo} material={materials.claws} />
      </group>
      <group position={[1.32, 3.2, -1.60]}>
        <mesh geometry={hindLimbGeo} material={materials.body} />
        <mesh position={[0, -3.4, 0.1]} geometry={footGeo} material={materials.claws} />
      </group>
      <group position={[-1.32, 3.2, -1.60]}>
        <mesh geometry={hindLimbGeo} material={materials.body} />
        <mesh position={[0, -3.4, 0.1]} geometry={footGeo} material={materials.claws} />
      </group>
    </group>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 2. COLOSSAL HERO BRACHIOSAURUS
 * -----------------------------------------------------------------------------
 */
export function Brachiosaurus({
  position = [10.0, 4.8, -1182.0],
  rotation = [0, -0.65, 0],
  scale = 1.22,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const neckRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      body: new THREE.ShaderMaterial({
        vertexShader: dinosaurVertexShader,
        fragmentShader: dinosaurFragmentShader,
        uniforms: {
          uSunDirection: { value: OCEAN_SUN_DIR },
          uBaseColor: { value: new THREE.Color("#444842") },
          uUnderbellyColor: { value: new THREE.Color("#5a6056") },
          uPatternColor: { value: new THREE.Color("#323630") },
          uPatternType: { value: 3.0 },
          ...THREE.UniformsLib.fog,
        },
        fog: true,
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: "#080808",
        roughness: 0.05,
        metalness: 0.95,
        fog: true,
      }),
      waterSplash: new THREE.MeshBasicMaterial({
        color: "#e8f8f8",
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    };
  }, []);

  const torsoGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(2.4, 3.8, 8.5, 20, 8);
    geo.rotateX(Math.PI / 2.12);
    geo.scale(1.28, 1.48, 1.0);
    return geo;
  }, []);

  const neckGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 3.5, 1.2),
      new THREE.Vector3(0, 7.8, 1.8),
      new THREE.Vector3(0, 12.2, 1.4),
      new THREE.Vector3(0, 16.5, 0.4),
      new THREE.Vector3(0, 19.5, -0.5),
    ]);
    return new THREE.TubeGeometry(curve, 26, 0.85, 14, false);
  }, []);

  const headGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.48, 0.78, 2.2, 16, 6);
    geo.rotateX(Math.PI / 2.2);
    geo.scale(0.92, 1.25, 1.0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const crest = Math.exp(-Math.pow((z - 0.2) / 0.5, 2.0)) * 0.28 * Math.max(0.0, y);
      pos.setY(i, pos.getY(i) + crest);
    }
    geo.computeVertexNormals();
    geo.translate(0, 0.2, 0.9);
    return geo;
  }, []);

  const foreLegGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.82, 1.05, 8.2, 16);
    geo.translate(0, -4.1, 0);
    return geo;
  }, []);

  const hindLegGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.88, 1.15, 6.8, 16);
    geo.translate(0, -3.4, 0);
    return geo;
  }, []);

  const tailGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.6, -3.5),
      new THREE.Vector3(0, -1.8, -7.5),
      new THREE.Vector3(0, -2.5, -11.5),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.75, 12, false);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (neckRef.current) {
      neckRef.current.rotation.z = Math.sin(t * 0.35) * 0.035;
      neckRef.current.rotation.x = Math.sin(t * 0.25) * 0.02;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.03;
      headRef.current.rotation.y = Math.cos(t * 0.35) * 0.04;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 0.6) * 0.07;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} name="brachiosaurus-hero">
      <group ref={bodyRef} position={[0, 6.8, 0]}>
        <mesh geometry={torsoGeo} material={materials.body} castShadow receiveShadow />

        <group ref={neckRef} position={[0, 2.2, 3.6]}>
          <mesh geometry={neckGeo} material={materials.body} />
          <group ref={headRef} position={[0, 19.5, -0.5]}>
            <mesh geometry={headGeo} material={materials.body} />
            <mesh position={[0.42, 0.45, 0.8]} material={materials.eyes}>
              <sphereGeometry args={[0.08, 8, 8]} />
            </mesh>
            <mesh position={[-0.42, 0.45, 0.8]} material={materials.eyes}>
              <sphereGeometry args={[0.08, 8, 8]} />
            </mesh>
          </group>
        </group>

        <group ref={tailRef} position={[0, 0.8, -4.2]}>
          <mesh geometry={tailGeo} material={materials.body} />
        </group>
      </group>

      <group position={[1.8, 6.8, 2.6]}>
        <mesh geometry={foreLegGeo} material={materials.body} />
        <mesh position={[0, -6.8, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.waterSplash}>
          <ringGeometry args={[1.0, 1.8, 16]} />
        </mesh>
      </group>
      <group position={[-1.8, 6.8, 2.6]}>
        <mesh geometry={foreLegGeo} material={materials.body} />
        <mesh position={[0, -6.8, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.waterSplash}>
          <ringGeometry args={[1.0, 1.8, 16]} />
        </mesh>
      </group>
      <group position={[1.7, 5.8, -2.4]}>
        <mesh geometry={hindLegGeo} material={materials.body} />
        <mesh position={[0, -5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.waterSplash}>
          <ringGeometry args={[1.1, 1.9, 16]} />
        </mesh>
      </group>
      <group position={[-1.7, 5.8, -2.4]}>
        <mesh geometry={hindLegGeo} material={materials.body} />
        <mesh position={[0, -5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.waterSplash}>
          <ringGeometry args={[1.1, 1.9, 16]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 3. HIGH CANYON SOARING PTEROSAURS
 * -----------------------------------------------------------------------------
 */
function SoaringPterosaurs() {
  const groupRef = useRef<THREE.Group>(null);
  const p1WingL = useRef<THREE.Group>(null);
  const p1WingR = useRef<THREE.Group>(null);
  const p2WingL = useRef<THREE.Group>(null);
  const p2WingR = useRef<THREE.Group>(null);
  const p3WingL = useRef<THREE.Group>(null);
  const p3WingR = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color: "#6b5d48",
        roughness: 0.52,
        metalness: 0.05,
        fog: true,
      }),
      wingMembrane: new THREE.MeshStandardMaterial({
        color: "#b49876",
        roughness: 0.40,
        metalness: 0.03,
        side: THREE.DoubleSide,
        fog: true,
      }),
    };
  }, []);

  const wingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(4.8, 0.4);
    shape.quadraticCurveTo(3.2, -1.8, 0, -1.2);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(t * 0.18) * 16.0;
      groupRef.current.position.z = Math.cos(t * 0.14) * 20.0;
    }

    const flap1 = Math.sin(t * 2.2) * 0.18;
    if (p1WingL.current) p1WingL.current.rotation.z = flap1;
    if (p1WingR.current) p1WingR.current.rotation.z = -flap1;

    const flap2 = Math.sin(t * 2.2 + 1.2) * 0.16;
    if (p2WingL.current) p2WingL.current.rotation.z = flap2;
    if (p2WingR.current) p2WingR.current.rotation.z = -flap2;

    const flap3 = Math.sin(t * 2.2 + 2.4) * 0.14;
    if (p3WingL.current) p3WingL.current.rotation.z = flap3;
    if (p3WingR.current) p3WingR.current.rotation.z = -flap3;
  });

  return (
    <group ref={groupRef} name="soaring-pterosaurs">
      <group position={[12.0, 58.0, -1180.0]} rotation={[-0.15, -0.4, 0.25]} scale={1.35}>
        <mesh material={materials.body}>
          <coneGeometry args={[0.22, 2.2, 10]} />
        </mesh>
        <mesh position={[0, 0.35, 0.9]} rotation={[Math.PI / 2.3, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.18, 1.8, 8]} />
        </mesh>
        <mesh position={[0, 0.55, -0.6]} rotation={[-Math.PI / 3.0, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.12, 1.4, 8]} />
        </mesh>
        <group ref={p1WingL} position={[0.25, 0, 0]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
        <group ref={p1WingR} position={[-0.25, 0, 0]} scale={[-1, 1, 1]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      </group>

      <group position={[28.0, 66.0, -1195.0]} rotation={[-0.20, -0.65, 0.38]} scale={1.15}>
        <mesh material={materials.body}>
          <coneGeometry args={[0.20, 2.0, 10]} />
        </mesh>
        <mesh position={[0, 0.30, 0.8]} rotation={[Math.PI / 2.3, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.16, 1.6, 8]} />
        </mesh>
        <mesh position={[0, 0.50, -0.5]} rotation={[-Math.PI / 3.0, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.10, 1.2, 8]} />
        </mesh>
        <group ref={p2WingL} position={[0.22, 0, 0]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
        <group ref={p2WingR} position={[-0.22, 0, 0]} scale={[-1, 1, 1]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      </group>

      <group position={[-16.0, 72.0, -1230.0]} rotation={[-0.10, 0.35, -0.22]} scale={0.95}>
        <mesh material={materials.body}>
          <coneGeometry args={[0.18, 1.8, 8]} />
        </mesh>
        <mesh position={[0, 0.28, 0.7]} rotation={[Math.PI / 2.3, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.14, 1.4, 8]} />
        </mesh>
        <mesh position={[0, 0.45, -0.45]} rotation={[-Math.PI / 3.0, 0, 0]} material={materials.body}>
          <coneGeometry args={[0.09, 1.1, 8]} />
        </mesh>
        <group ref={p3WingL} position={[0.20, 0, 0]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
        <group ref={p3WingR} position={[-0.20, 0, 0]} scale={[-1, 1, 1]}>
          <mesh geometry={wingGeo} material={materials.wingMembrane} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      </group>
    </group>
  );
}

/**
 * -----------------------------------------------------------------------------
 * MASTER DINOSAURS EXPORT
 * -----------------------------------------------------------------------------
 */
export default function Dinosaurs() {
  return (
    <group name="master-prehistoric-dinosaurs">
      {/* 1. Hero Triceratops proudly standing on the Foreground Left Mossy Bluff */}
      <Triceratops position={[-17.0, 8.2, -1136.0]} rotation={[0, 0.95, 0]} scale={1.45} />

      {/* 2. Secondary Triceratops further on the bluff overlooking the river */}
      <Triceratops position={[-28.0, 8.8, -1154.0]} rotation={[0, 1.35, 0]} scale={1.05} />

      {/* 3. Hero Brachiosaurus Wading in the Turquoise River */}
      <Brachiosaurus position={[10.0, 4.8, -1182.0]} rotation={[0, -0.65, 0]} scale={1.22} />

      {/* 4. Secondary Brachiosaurus Grazing along the Riverbanks */}
      <Brachiosaurus position={[-20.0, 5.4, -1224.0]} rotation={[0, 0.85, 0]} scale={0.95} />
      <Brachiosaurus position={[-32.0, 5.8, -1266.0]} rotation={[0, 1.35, 0]} scale={0.85} />

      {/* 5. High Canyon Soaring Pterosaurs */}
      <SoaringPterosaurs />
    </group>
  );
}
