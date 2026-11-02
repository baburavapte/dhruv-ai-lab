"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SUN_DIR } from "./OceanSky";
import { worldProgressState } from "@/lib/worldProgress";

export const OCEAN_SURFACE_Y = 6.0;

/**
 * -----------------------------------------------------------------------------
 * MASTER TWO-SIDED REALISTIC OCEAN WATER SHADER
 *
 * Features:
 * 1. Multidirectional Gerstner wave formulation (6 wave trains):
 *    - Deep ocean long swell (110m, 68m)
 *    - Cross-sea rolling waves (42m, 26m)
 *    - Wind chop & capillary waves (16m, 9m)
 * 2. Camera-Height-Aware Dual-Sided Rendering:
 *    - ABOVE WATER (Looking down or across):
 *      * Exact Schlick Fresnel with water IOR = 1.333
 *      * Deep oceanic volumetric absorption (rich navy/indigo body)
 *      * Subsurface scattering & upwelling light in wave crests
 *      * Multi-scale solar glitter path (GGX-inspired wave-slope glint)
 *      * Seamless exponential horizon blending into sky haze
 *    - BELOW WATER (Looking up at moving underside of surface):
 *      * Snell's Window physics (critical angle theta_c = 48.6 deg)
 *      * Refracted bright sky and sun streaming through the waves
 *      * Wave crest dynamic lens caustics and light transmission
 *      * Moving wave silhouettes against the illuminated sky
 *      * Total Internal Reflection reflecting deep marine water
 * 3. Translucency & DepthWrite management:
 *    - When underwater, depthWrite is disabled so the surface acts as a transparent
 *      fluid boundary that does not occlude marine life or the sky dome.
 * -----------------------------------------------------------------------------
 */

const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCameraPos;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vWaveHeight;
  varying vec2 vUv;

  // Gerstner wave displacement and analytical normal contribution
  vec3 gerstnerWave(
    vec2 dir,
    float wavelength,
    float steepness,
    float speedMultiplier,
    vec2 pos,
    float time,
    inout vec3 normal
  ) {
    float k = 2.0 * 3.14159265 / wavelength;
    float c = sqrt(9.80665 / k) * speedMultiplier;
    float a = steepness / k;
    float f = k * (dot(dir, pos) - c * time);

    float cosF = cos(f);
    float sinF = sin(f);

    normal.x -= dir.x * (k * a) * cosF;
    normal.z -= dir.y * (k * a) * cosF;
    normal.y -= steepness * sinF;

    return vec3(
      dir.x * (a * cosF),
      a * sinF,
      dir.y * (a * cosF)
    );
  }

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec2 posXZ = worldPos.xz;
    float t = uTime * 0.65;

    vec3 normal = vec3(0.0, 1.0, 0.0);
    vec3 disp = vec3(0.0);

    // 6-train multidirectional Gerstner wave spectrum:
    // Swell 1: Primary deep ocean swell
    disp += gerstnerWave(normalize(vec2(0.85, 0.52)), 110.0, 0.16, 0.85, posXZ, t, normal);

    // Swell 2: Secondary angled swell
    disp += gerstnerWave(normalize(vec2(0.58, 0.81)), 68.0, 0.14, 0.92, posXZ, t, normal);

    // Swell 3: Cross-sea rolling wave
    disp += gerstnerWave(normalize(vec2(-0.42, 0.91)), 42.0, 0.12, 1.05, posXZ, t, normal);

    // Swell 4: Medium wind wave
    disp += gerstnerWave(normalize(vec2(0.92, -0.38)), 26.0, 0.09, 1.18, posXZ, t, normal);

    // Swell 5: Short wind chop
    disp += gerstnerWave(normalize(vec2(0.72, 0.69)), 16.0, 0.06, 1.35, posXZ, t, normal);

    // Swell 6: Capillary surface ripple
    disp += gerstnerWave(normalize(vec2(-0.25, 0.97)), 9.0, 0.04, 1.55, posXZ, t, normal);

    worldPos.xyz += disp;

    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normal);
    vWaveHeight = disp.y;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uCameraPos;
  uniform float uWaterLevel;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vWaveHeight;
  varying vec2 vUv;

  // Schlick Fresnel approximation for water (n = 1.333)
  float schlickFresnel(float cosTheta) {
    float r0 = 0.0204;
    return r0 + (1.0 - r0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  // Multi-frequency procedural capillary ripple evaluation
  vec2 getCapillaryRipples(vec2 posXZ, float time, float nearFade, float midFade) {
    float t = time * 1.25;
    // Layer 1: Medium ripple waves (~3.2m - 1.8m)
    float r1 = sin(posXZ.x * 1.95 + posXZ.y * 1.15 + t * 2.1);
    float r2 = cos(-posXZ.x * 1.35 + posXZ.y * 2.25 + t * 2.6);

    // Layer 2: Fine capillary ripples (~0.7m - 0.4m)
    float r3 = sin(posXZ.x * 5.2 - posXZ.y * 3.8 + t * 4.2);
    float r4 = cos(posXZ.x * 3.4 + posXZ.y * 6.1 + t * 4.9);

    // Layer 3: High-frequency wind glitter (~0.25m)
    float r5 = sin(posXZ.x * 11.0 + posXZ.y * 9.5 + t * 7.5);
    float r6 = cos(-posXZ.x * 8.5 + posXZ.y * 12.0 + t * 8.2);

    return vec2(
      (r1 * 0.022) * midFade + (r3 * 0.015 + r5 * 0.008) * nearFade,
      (r2 * 0.022) * midFade + (r4 * 0.015 + r6 * 0.008) * nearFade
    );
  }

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    vec3 sunDir = normalize(uSunDirection);

    float dist = length(vWorldPosition.xz - uCameraPos.xz);
    float nearFade = clamp(1.0 - dist / 75.0, 0.0, 1.0);
    float midFade = clamp(1.0 - dist / 220.0, 0.0, 1.0);

    vec2 rippleOffset = getCapillaryRipples(vWorldPosition.xz, uTime, nearFade, midFade);

    bool isUnderwater = (uCameraPos.y < uWaterLevel);

    // -------------------------------------------------------------------------
    // CASE A: CAMERA IS ABOVE WATER SURFACE
    // -------------------------------------------------------------------------
    if (!isUnderwater) {
      vec3 norm = normalize(vNormal + vec3(rippleOffset.x, 0.0, rippleOffset.y));
      if (dot(viewDir, norm) < 0.0) norm = -norm;

      float cosIncidence = clamp(dot(viewDir, norm), 0.0, 1.0);
      float fresnel = schlickFresnel(cosIncidence);

      // 1. Water Body Color & Subsurface Light Upwelling
      vec3 deepNavy = vec3(0.006, 0.038, 0.092);
      vec3 troughDark = vec3(0.003, 0.022, 0.055);
      vec3 crestScatter = vec3(0.022, 0.165, 0.245);

      float scatter = clamp(vWaveHeight * 0.48 + 0.52, 0.0, 1.0);
      vec3 waterBodyColor = mix(troughDark, deepNavy, scatter * 0.75 + 0.25);
      waterBodyColor = mix(waterBodyColor, crestScatter, pow(scatter, 2.2) * 0.70);

      float sunFacing = max(0.0, dot(norm, sunDir));
      vec3 emeraldTint = vec3(0.025, 0.190, 0.210);
      waterBodyColor = mix(waterBodyColor, emeraldTint, sunFacing * scatter * 0.35);

      // 2. Atmospheric Sky Reflection
      vec3 reflectDir = reflect(-viewDir, norm);
      vec3 skyZenith  = vec3(0.07, 0.30, 0.72);
      vec3 skyMid     = vec3(0.26, 0.56, 0.85);
      vec3 skyHorizon = vec3(0.72, 0.84, 0.94);

      float reflectUp = clamp(reflectDir.y, 0.0, 1.0);
      vec3 skyReflection = mix(skyHorizon, skyMid, smoothstep(0.0, 0.40, reflectUp));
      skyReflection = mix(skyReflection, skyZenith, smoothstep(0.40, 1.0, reflectUp));

      vec3 surfaceColor = mix(waterBodyColor, skyReflection, clamp(fresnel * 0.88 + 0.04, 0.0, 1.0));

      // 3. Multi-Scale Sunlight Glitter Path (Sun Glint)
      vec3 halfVec = normalize(sunDir + viewDir);
      float dotNH = max(0.0, dot(norm, halfVec));

      vec3 sunLightColor = vec3(1.0, 0.97, 0.90);
      float specBroad   = pow(dotNH, 38.0) * 0.30;
      float specMedium  = pow(dotNH, 160.0) * 1.6;
      float specSharp   = pow(dotNH, 800.0) * 5.8;
      float specSparkle = pow(dotNH, 3200.0) * 18.0 * nearFade;

      vec3 sunSpecular = sunLightColor * (specBroad + specMedium + specSharp + specSparkle);
      vec3 finalColor = surfaceColor + sunSpecular;

      // 4. Seamless Huge Open-Ocean Horizon Blending
      float horizonHaze = smoothstep(600.0, 1400.0, dist);
      finalColor = mix(finalColor, skyHorizon, horizonHaze);

      gl_FragColor = vec4(finalColor, 1.0);
    }
    // -------------------------------------------------------------------------
    // CASE B: CAMERA IS UNDERWATER (Looking up at moving underside of surface)
    // -------------------------------------------------------------------------
    else {
      // Normal points downward into water volume
      vec3 underNorm = normalize(-vNormal + vec3(-rippleOffset.x, 0.0, -rippleOffset.y));

      // View vector pointing FROM camera TO water surface
      vec3 eyeToSurface = normalize(vWorldPosition - uCameraPos);
      float cosIncidence = clamp(dot(eyeToSurface, -underNorm), 0.0, 1.0);

      // Snell's Window Critical Angle (~48.6 deg):
      // When looking upward within cone: light from the world above enters water
      // When looking at grazing angles: Total Internal Reflection (TIR) reflects water volume
      float windowCone = smoothstep(0.42, 0.72, eyeToSurface.y);

      // Refracted sky through the moving waves
      vec3 skyZenith  = vec3(0.10, 0.45, 0.88);
      vec3 skyMid     = vec3(0.32, 0.65, 0.92);
      vec3 skyHorizon = vec3(0.60, 0.80, 0.92);

      float waveDistort = vWaveHeight * 0.15;
      vec3 refractedSky = mix(skyHorizon, skyMid, smoothstep(0.1, 0.5, eyeToSurface.y + waveDistort));
      refractedSky = mix(refractedSky, skyZenith, smoothstep(0.5, 0.95, eyeToSurface.y + waveDistort));

      // Focused solar rays breaking through wave crests
      float sunAlign = max(0.0, dot(eyeToSurface, sunDir));
      float sunGlint = pow(sunAlign, 24.0) * 2.2 + pow(sunAlign, 250.0) * 14.0;
      refractedSky += vec3(1.0, 0.97, 0.88) * sunGlint;

      // Dynamic wave lens caustic brightness on underside of wave crests
      float crestGlow = clamp(vWaveHeight * 0.75 + 0.55, 0.0, 1.0);
      refractedSky += vec3(0.08, 0.45, 0.65) * pow(crestGlow, 2.5) * 0.75;

      // Total Internal Reflection (TIR): deep blue-green ocean volume
      vec3 deepWaterTIR = vec3(0.015, 0.120, 0.280);

      // Blend Snell's window with total internal reflection
      vec3 undersideColor = mix(deepWaterTIR, refractedSky, windowCone);

      // Atmospheric water attenuation between camera and surface
      float depthToSurface = max(0.0, uWaterLevel - uCameraPos.y);
      float waterClarity = exp(-depthToSurface * 0.06);
      undersideColor = mix(deepWaterTIR, undersideColor, waterClarity);

      // Alpha is semi-transparent so the sky, clouds, and marine life are naturally visible
      float alpha = mix(0.72, 0.92, 1.0 - windowCone);

      gl_FragColor = vec4(undersideColor, alpha);
    }
  }
`;

export default function OceanSurface() {
  const surfaceMeshRef = useRef<THREE.Mesh>(null);

  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: OCEAN_SUN_DIR.clone() },
        uCameraPos: { value: new THREE.Vector3() },
        uWaterLevel: { value: OCEAN_SURFACE_Y },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });
  }, []);

  useFrame((state) => {
    const p = worldProgressState.progress;
    // Visible for entire deep ocean and ocean surface phase (p: 142 -> 226)
    if (surfaceMeshRef.current) {
      const isOcean = p >= 142 && p <= 226;
      surfaceMeshRef.current.visible = isOcean;
      if (!isOcean) return;

      const oceanZ = Math.max(state.camera.position.z, -840.0);
      surfaceMeshRef.current.position.set(
        state.camera.position.x,
        OCEAN_SURFACE_Y,
        oceanZ
      );
    }

    const isUnderwater = state.camera.position.y < OCEAN_SURFACE_Y;

    // When underwater, disable depthWrite so water surface acts as a transparent boundary
    // that never creates an opaque black wall occluding sky or marine life
    waterMaterial.depthWrite = !isUnderwater;

    waterMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    waterMaterial.uniforms.uCameraPos.value.copy(state.camera.position);
    waterMaterial.uniforms.uWaterLevel.value = OCEAN_SURFACE_Y;
  });

  return (
    <group name="ocean-surface-master-realism">
      <mesh
        ref={surfaceMeshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        material={waterMaterial}
      >
        <planeGeometry args={[2800, 2800, 260, 260]} />
      </mesh>
    </group>
  );
}
