"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_SURFACE_Y } from "./OceanSurface";
import { worldProgressState } from "@/lib/worldProgress";

/**
 * -----------------------------------------------------------------------------
 * WATERLINE BREACH & SURFACE MENISCUS SHADER
 *
 * Physical optical effect when the camera crosses the ocean boundary (Y = 6.0):
 * - Organic water meniscus line that sweeps across the camera view as height changes
 * - Water lens distortion, subtle surface refraction, and vanishing droplets
 * - Completely transparent when comfortably in air (Y > 6.8) or deep water (Y < 4.8)
 * -----------------------------------------------------------------------------
 */
const breachVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const breachFragmentShader = /* glsl */ `
  uniform float uMeniscusIntensity;
  uniform float uWaterlineScreenY;
  uniform float uTime;
  uniform float uSubmergedFactor;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    if (uMeniscusIntensity < 0.01) {
      discard;
    }

    vec2 uv = vUv;

    // Organic wavy meniscus line across screen
    float waveDistort = sin(uv.x * 14.0 + uTime * 4.0) * 0.025 + cos(uv.x * 28.0 - uTime * 6.0) * 0.012;
    float lineY = uWaterlineScreenY + waveDistort;

    float distToLine = abs(uv.y - lineY);

    // Meniscus refraction band (thickens near the water plane)
    float meniscus = smoothstep(0.08, 0.0, distToLine) * uMeniscusIntensity;

    // Water droplet beads on camera lens immediately after breaching
    float dropletGrid = hash(floor(uv * 18.0));
    float dropletDist = length(fract(uv * 18.0) - 0.5);
    float droplet = smoothstep(0.35, 0.0, dropletDist) * step(0.85, dropletGrid) * uMeniscusIntensity * 0.65;

    // Water refraction colors: sunlit cyan-blue meniscus rim
    vec3 waterTint = vec3(0.04, 0.45, 0.68);
    vec3 highlight = vec3(0.95, 0.98, 1.0);

    vec3 finalColor = mix(waterTint, highlight, pow(meniscus, 2.5));

    float totalAlpha = clamp(meniscus * 0.85 + droplet * 0.70, 0.0, 0.90);

    gl_FragColor = vec4(finalColor, totalAlpha);
  }
`;

export default function WaterlineBreach() {
  const meshRef = useRef<THREE.Mesh>(null);

  const breachMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: breachVertexShader,
      fragmentShader: breachFragmentShader,
      uniforms: {
        uMeniscusIntensity: { value: 0 },
        uWaterlineScreenY: { value: 0.5 },
        uTime: { value: 0 },
        uSubmergedFactor: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    const p = worldProgressState.progress;
    // Active only around ocean phase and surface breakthrough (p: 180 to 226)
    if (p < 180 || p > 226) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    const camY = state.camera.position.y;
    const dy = camY - OCEAN_SURFACE_Y; // height relative to water level

    // Meniscus is active when camera is within 0.75m of the water surface
    const meniscusDist = Math.abs(dy);
    const meniscusIntensity = THREE.MathUtils.clamp(1.0 - meniscusDist / 0.75, 0.0, 1.0);

    // Screen Y position of the waterline based on camera height & pitch
    const screenY = THREE.MathUtils.clamp(0.5 - dy * 0.8, 0.05, 0.95);

    // Submerged factor (1 when below surface, 0 when above)
    const submergedFactor = THREE.MathUtils.clamp((OCEAN_SURFACE_Y - camY) / 1.0, 0.0, 1.0);

    if (meshRef.current) {
      meshRef.current.visible = meniscusIntensity > 0.005;
    }

    breachMaterial.uniforms.uMeniscusIntensity.value = meniscusIntensity;
    breachMaterial.uniforms.uWaterlineScreenY.value = screenY;
    breachMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    breachMaterial.uniforms.uSubmergedFactor.value = submergedFactor;
  });

  return (
    <mesh ref={meshRef} material={breachMaterial} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

