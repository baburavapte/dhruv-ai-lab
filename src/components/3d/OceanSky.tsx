"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shared physically normalized sun direction vector for 100% consistent lighting & specular alignment
// Positioned at ~25 degrees elevation in the forward-right sky for cinematic ocean composition
export const OCEAN_SUN_DIR = new THREE.Vector3(0.22, 0.44, -0.87).normalize();
export const OCEAN_SUN_POSITION = new THREE.Vector3(
  OCEAN_SUN_DIR.x * 400.0,
  OCEAN_SUN_DIR.y * 400.0,
  OCEAN_SUN_DIR.z * 400.0
);

// Matching horizon haze color shared across sky, fog, and water horizon blending
export const OCEAN_HORIZON_COLOR = new THREE.Color(0.70, 0.82, 0.92);

const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(worldPos.xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const skyFragmentShader = /* glsl */ `
  uniform vec3 uSunDirection;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vec3 dir = normalize(vWorldPosition - cameraPosition);
    float y = dir.y;

    // Physically motivated Rayleigh/Mie atmospheric scattering gradient
    // Clear daylight sky: deep cobalt/cerulean zenith → natural azure → soft maritime horizon haze
    vec3 zenithColor   = vec3(0.08, 0.35, 0.75);   // Luminous clear sky zenith
    vec3 midSkyColor   = vec3(0.28, 0.58, 0.88);   // Natural daylight azure
    vec3 lowerSkyColor = vec3(0.55, 0.74, 0.90);   // Lower tropospheric blue
    vec3 horizonColor  = vec3(0.74, 0.86, 0.95);   // Radiant sunlit horizon haze
    vec3 belowHorizon  = vec3(0.65, 0.78, 0.88);   // Soft aerial horizon haze

    vec3 skyColor;

    // Camera height awareness: when camera is underwater (Y < 6.0)
    // The background is deep oceanic water volume in horizontal and downward directions
    if (cameraPosition.y < 6.0) {
      float depthFactor = clamp((6.0 - cameraPosition.y) / 18.0, 0.0, 1.0);
      vec3 deepAbyssWater = vec3(0.003, 0.015, 0.038);
      vec3 shallowAzureWater = vec3(0.012, 0.110, 0.240);
      vec3 underwaterVolume = mix(shallowAzureWater, deepAbyssWater, depthFactor);

      if (y > 0.0) {
        // Looking up through water towards sky
        float tUp = smoothstep(0.0, 0.55, y);
        vec3 sunlitSky = mix(shallowAzureWater, zenithColor, tUp);
        skyColor = mix(underwaterVolume, sunlitSky, smoothstep(0.02, 0.28, y));
      } else {
        // Looking horizontal or down into deep sea: deep blue-green marine volume
        skyColor = underwaterVolume;
      }
    } else {
      // Above water open-air sky dome
      if (y > 0.0) {
        float tLow = smoothstep(0.0, 0.18, y);
        float tMid = smoothstep(0.18, 0.55, y);
        float tHigh = smoothstep(0.55, 0.98, y);

        vec3 lower = mix(horizonColor, lowerSkyColor, tLow);
        vec3 mid = mix(lower, midSkyColor, tMid);
        skyColor = mix(mid, zenithColor, tHigh);

        // Natural horizon haze band (exponential atmospheric extinction)
        float haze = exp(-y * 12.0);
        skyColor = mix(skyColor, horizonColor, haze * 0.45);
      } else {
        float tBelow = smoothstep(0.0, -0.40, y);
        skyColor = mix(horizonColor, belowHorizon, tBelow);
      }
    }

    // --- Physically-based distant real sun (analytical solar disc & scattering) ---
    float cosTheta = max(0.0, dot(vViewDirection, uSunDirection));

    // 1. Broad Rayleigh atmospheric forward-scattering glow
    float rayleighGlow = pow(cosTheta, 3.5) * 0.16;
    vec3 scatterColor = vec3(1.0, 0.94, 0.82) * rayleighGlow;

    // 2. Mie forward-scattering aureole around the solar disc
    float mieGlow = pow(cosTheta, 28.0) * 0.45 + pow(cosTheta, 96.0) * 0.90;
    vec3 mieColor = vec3(1.0, 0.96, 0.88) * mieGlow;

    // 3. Sharp physical solar disc (angular diameter ~0.53°)
    float sunDisc = pow(cosTheta, 7500.0) * 22.0;
    vec3 sunColor = vec3(1.0, 0.99, 0.96) * sunDisc;

    // 4. Subtle limb darkening at the solar disc perimeter
    float limbSoft = pow(cosTheta, 1800.0) * 3.2;
    vec3 limbColor = vec3(1.0, 0.95, 0.86) * limbSoft;

    vec3 finalColor = skyColor + scatterColor + mieColor + sunColor + limbColor;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function OceanSky() {
  const meshRef = useRef<THREE.Mesh>(null);

  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        uSunDirection: { value: OCEAN_SUN_DIR.clone() },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    // Keep sky dome centered on camera position
    if (meshRef.current) {
      meshRef.current.position.copy(state.camera.position);
    }
  });

  return (
    <mesh ref={meshRef} material={skyMaterial} frustumCulled={false}>
      <sphereGeometry args={[1200, 32, 24]} />
    </mesh>
  );
}
