"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Lighting from "./Lighting";
import Castle from "./Castle";
import Dragon from "./Dragon";
import Lava from "./Lava";
import LavaFalls from "./LavaFalls";
import CameraController from "./CameraController";
import Particles from "./Particles";
import EntryTransition from "./EntryTransition";
import AIResearchChamber from "./AIResearchChamber";
import TransitionTunnel from "./TransitionTunnel";
import QuantumAtomicTransition from "./QuantumAtomicTransition";
import AtomicWorld from "./AtomicWorld";
import AtomicCellularTransition from "./AtomicCellularTransition";
import CellularWorld from "./CellularWorld";
import CellularOceanTransition from "./CellularOceanTransition";
import DeepOceanWorld from "./DeepOceanWorld";
import PrehistoricWorld from "./prehistoric/PrehistoricWorld";
import RomeWorld from "./rome/RomeWorld";
import CyberWorld from "./cyber/CyberWorld";
import { worldProgressState } from "@/lib/worldProgress";

// Pre-allocated static colors for StageFogController to eliminate per-frame allocations
const _fortressFogColor = new THREE.Color("#0a0814");
const _tunnelFogColor = new THREE.Color("#040408");
const _aiLabFogColor = new THREE.Color("#050c18");
const _trans2FogColor = new THREE.Color("#030208");
const _atomicFogColor = new THREE.Color("#0d061f");
const _trans3FogColor = new THREE.Color("#020813");
const _cellularFogColor = new THREE.Color("#020914");
const _trans4FogColor = new THREE.Color("#010915");
const _oceanAbyssFogColor = new THREE.Color("#010814");
const _oceanSurfaceFogColor = new THREE.Color("#004d7a");
const _oceanAirFogColor = new THREE.Color("#b3d1e8");
const _oceanCaveFogColor = new THREE.Color("#080c14");
const _curOceanFogColor = new THREE.Color("#010814");
const _prehistoricFogColor = new THREE.Color("#0f2a28"); // Cool blue-green / teal humid rainforest mist
const _prehistoricAshColor = new THREE.Color("#161a18");
const _prehistoricCaveColor = new THREE.Color("#0c1212");
const _curPrehistoricFogColor = new THREE.Color("#0f2a28");
const _romeFogColor = new THREE.Color("#ebd7bd"); // Luminous golden-hour Roman atmosphere
const _curRomeFogColor = new THREE.Color("#ebd7bd");
const _cyberFogColor = new THREE.Color("#050b14"); // Deep cosmic cyan/indigo cyberpunk depth
const _spaceFogColor = new THREE.Color("#02040a");
const _targetFogColor = new THREE.Color();

/**
 * ScenePrewarmer — Proactively compiles all materials, shaders, and geometry buffers
 * into GPU cache on initial mount. This guarantees that when the user travels between
 * worlds, ZERO shaders are compiled during traversal, completely eliminating the 40-80ms
 * frame-time hitches at transition boundaries.
 */
function ScenePrewarmer({
  fortressRef,
  tunnelRef,
  aiLabRef,
  transition2Ref,
  atomicRef,
  trans3Ref,
  cellularRef,
  trans4Ref,
  oceanRef,
  prehistoricRef,
  romeRef,
  cyberRef,
}: {
  fortressRef: React.RefObject<THREE.Group | null>;
  tunnelRef: React.RefObject<THREE.Group | null>;
  aiLabRef: React.RefObject<THREE.Group | null>;
  transition2Ref: React.RefObject<THREE.Group | null>;
  atomicRef: React.RefObject<THREE.Group | null>;
  trans3Ref: React.RefObject<THREE.Group | null>;
  cellularRef: React.RefObject<THREE.Group | null>;
  trans4Ref: React.RefObject<THREE.Group | null>;
  oceanRef: React.RefObject<THREE.Group | null>;
  prehistoricRef: React.RefObject<THREE.Group | null>;
  romeRef: React.RefObject<THREE.Group | null>;
  cyberRef: React.RefObject<THREE.Group | null>;
}) {
  const { gl, scene } = useThree();
  const prewarmedRef = useRef(false);

  useEffect(() => {
    if (prewarmedRef.current) return;
    prewarmedRef.current = true;

    // Small delay ensures child geometries & textures have completed initial mount
    const timer = setTimeout(() => {
      try {
        const groups = [
          fortressRef.current,
          tunnelRef.current,
          aiLabRef.current,
          transition2Ref.current,
          atomicRef.current,
          trans3Ref.current,
          cellularRef.current,
          trans4Ref.current,
          oceanRef.current,
          prehistoricRef.current,
          romeRef.current,
          cyberRef.current,
        ].filter(Boolean) as THREE.Group[];

        const prevVis = groups.map((g) => g.visible);

        const prewarmCam = new THREE.PerspectiveCamera(90, 1, 0.1, 500);

        // Warm up each key zone so GPU shaders are fully resident in cache
        const passes = [
          // 1. Dragon Fortress World
          {
            vis: [true, false, false, false, false, false, false, false, false, false, false],
            pos: [0, 4, 12],
            look: [0, 5, -35],
          },
          // 2. Dragon Mouth & Throat Transition
          {
            vis: [true, true, false, false, false, false, false, false, false, false, false],
            pos: [0, 4.5, -28],
            look: [0, 4.5, -45],
          },
          // 3. AI Research Chamber & Hero Quantum Chandelier
          {
            vis: [false, true, true, false, false, false, false, false, false, false, false],
            pos: [0, 5, -55],
            look: [0, 5, -65],
          },
          // 4. Subatomic Waveguide Transition
          {
            vis: [false, false, true, true, false, false, false, false, false, false, false],
            pos: [0, 4, -95],
            look: [0, 4, -120],
          },
          // 5. Atomic World Realm
          {
            vis: [false, false, false, true, true, false, false, false, false, false, false],
            pos: [0, 2.6, -175],
            look: [0, 2.6, -185],
          },
          // 6. Molecular / Chemical Synthesis Transition
          {
            vis: [false, false, false, false, true, true, false, false, false, false, false],
            pos: [0, 3.0, -202],
            look: [0, 3.2, -220],
          },
          // 7. Cellular / Life World Realm
          {
            vis: [false, false, false, false, false, true, true, false, false, false, false],
            pos: [0, 3.5, -280],
            look: [0, 4.0, -295],
          },
          // 8. Biological / Cellular to Ocean Transition
          {
            vis: [false, false, false, false, false, false, true, true, false, false, false],
            pos: [0, 0, -375],
            look: [0, -3, -395],
          },
          // 9. Deep Ocean / Abyss World Realm
          {
            vis: [false, false, false, false, false, false, false, true, true, false, false],
            pos: [0, -10, -460],
            look: [0, -12, -490],
          },
          // 10. Deep Ocean Surface & Blue Whales
          {
            vis: [false, false, false, false, false, false, false, false, true, false, false],
            pos: [0, 4, -680],
            look: [0, 3, -710],
          },
          // 11. Coastal Land & Volcano Approach
          {
            vis: [false, false, false, false, false, false, false, false, true, false, false],
            pos: [0, 7, -795],
            look: [0, 8, -815],
          },
          // 12. Prehistoric Earth — Ancient Fern Valley & Dinosaurs
          {
            vis: [false, false, false, false, false, false, false, false, false, true, false],
            pos: [12, 10, -1020],
            look: [12, 12, -1080],
          },
          // 13. Ancient Rome — Via Sacra, Marketplace & Colosseum
          {
            vis: [false, false, false, false, false, false, false, false, false, false, true, false],
            pos: [0, 3.4, -1815],
            look: [0, 18, -2300],
          },
          // 14. Cybernetic Space Frontier — Megacity, Ring Gateway, Colossal Planet
          {
            vis: [false, false, false, false, false, false, false, false, false, false, false, true],
            pos: [0, 3.6, -2520],
            look: [0, 16, -2850],
          },
        ];

        passes.forEach((p) => {
          groups.forEach((g, idx) => {
            if (idx < p.vis.length) {
              g.visible = p.vis[idx];
            }
          });
          prewarmCam.position.set(p.pos[0], p.pos[1], p.pos[2]);
          prewarmCam.lookAt(p.look[0], p.look[1], p.look[2]);
          prewarmCam.updateMatrixWorld();
          prewarmCam.updateProjectionMatrix();
          gl.compile(scene, prewarmCam);
          gl.render(scene, prewarmCam);
        });

        // Restore initial visibilities based on current progress
        groups.forEach((g, i) => {
          g.visible = prevVis[i];
        });

        if (typeof window !== "undefined") {
          (window as unknown as { __isPrewarmed?: boolean }).__isPrewarmed = true;
        }
      } catch (err) {
        console.warn("ScenePrewarmer notice:", err);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [gl, scene, fortressRef, tunnelRef, aiLabRef, transition2Ref, atomicRef, trans3Ref, cellularRef, trans4Ref, oceanRef, prehistoricRef, romeRef, cyberRef]);

  return null;
}

/**
 * StageFogController — Mathematically continuous normalized convex combination of
 * world fog states. Eliminates all fog popping and density jumps across boundaries.
 * Zero per-frame allocations inside useFrame.
 */
function StageFogController() {
  const fogRef = useRef<THREE.Fog | null>(null);

  useFrame((state, delta) => {
    if (!fogRef.current) {
      fogRef.current = new THREE.Fog("#0a0814", 38, 130);
      state.scene.fog = fogRef.current;
    }
    const fog = fogRef.current;
    const safeDelta = Math.min(delta, 0.05);

    const { weights, progress: p } = worldProgressState;
    const wf = Math.max(weights.fortress, weights.dragon);
    const wt = Math.max(weights.throat, weights.portal);
    const wl = weights.aiLab;
    const wq = weights.quantumToAtomic;
    const wa = weights.atomic;
    const wt3 = weights.atomicToCellular ?? 0;
    const wc = weights.cellular ?? 0;
    const wt4 = weights.cellularToOcean ?? 0;
    const wo = weights.deepOcean ?? 0;
    const wp = weights.prehistoric ?? 0;
    const wr = weights.rome ?? 0;
    const wcy = weights.cyber ?? 0;
    const ws = weights.space ?? 0;

    const sum = wf + wt + wl + wq + wa + wt3 + wc + wt4 + wo + wp + wr + wcy + ws;
    const inv = sum > 0.0001 ? 1 / sum : 1;

    const nf = wf * inv;
    const nt = wt * inv;
    const nl = wl * inv;
    const nq = wq * inv;
    const na = wa * inv;
    const nt3 = wt3 * inv;
    const nc = wc * inv;
    const nt4 = wt4 * inv;
    const no = wo * inv;
    const np = wp * inv;
    const nr = wr * inv;
    const ncy = wcy * inv;
    const ns = ws * inv;

    // Physical Ocean Water Surface Level is Y = 6.0
    // Ocean fog dynamically shifts through physical zones driven by BOTH progress AND actual camera height:
    const camY = state.camera.position.y;
    // Submerged factor smoothly tracks actual physical height:
    // 1.0 when securely underwater (Y <= 5.5), 0.0 when in open air (Y >= 6.4)
    const submergedFactor = THREE.MathUtils.clamp((6.0 - camY) / 0.8 + 0.5, 0.0, 1.0);

    let oceanTargetNear = 16 * no;
    let oceanTargetFar = 110 * no;

    if (p < 226) {
      if (submergedFactor > 0.0) {
        // UNDERWATER: depth-dependent color attenuation (Beer-Lambert law approximation)
        const depthBelow = Math.max(0.0, 6.0 - camY);
        // Normalized depth progress: 0 at surface (Y = 6.0), 1 in deep abyss (Y <= -16.0)
        const depthNorm = THREE.MathUtils.clamp(depthBelow / 22.0, 0.0, 1.0);

        // Interpolate between deep abyss (#010814) and sunlit underwater azure (#005080)
        _curOceanFogColor.lerpColors(_oceanSurfaceFogColor, _oceanAbyssFogColor, depthNorm);

        // Visibility scales with depth and water clarity
        const underNear = THREE.MathUtils.lerp(28, 14, depthNorm);
        const underFar = THREE.MathUtils.lerp(260, 95, depthNorm);

        // Continuous smooth blending across water boundary into air
        if (submergedFactor < 1.0) {
          _curOceanFogColor.lerp(_oceanAirFogColor, 1.0 - submergedFactor);
          oceanTargetNear = THREE.MathUtils.lerp(120, underNear, submergedFactor) * no;
          oceanTargetFar = THREE.MathUtils.lerp(2400, underFar, submergedFactor) * no;
        } else {
          oceanTargetNear = underNear * no;
          oceanTargetFar = underFar * no;
        }
      } else {
        // OPEN AIR: clear maritime sky horizon haze
        _curOceanFogColor.copy(_oceanAirFogColor);
        oceanTargetNear = 120 * no;
        oceanTargetFar = 2400 * no;
      }
    } else {
      const u = Math.min(1, (p - 226) / 8);
      _curOceanFogColor.lerpColors(_oceanAirFogColor, _prehistoricAshColor, u);
      oceanTargetNear = THREE.MathUtils.lerp(120, 25, u) * no;
      oceanTargetFar = THREE.MathUtils.lerp(2400, 450, u) * no;
    }

    // Prehistoric Rainforest Fog (Cool blue-green humid atmospheric haze)
    let prehistoricTargetNear = 28 * np;
    let prehistoricTargetFar = 380 * np;

    if (p < 236) {
      const u = Math.min(1, Math.max(0, (p - 226) / 10));
      _curPrehistoricFogColor.lerpColors(_prehistoricAshColor, _prehistoricFogColor, u);
      prehistoricTargetNear = THREE.MathUtils.lerp(18, 28, u) * np;
      prehistoricTargetFar = THREE.MathUtils.lerp(180, 380, u) * np;
    } else if (p < 286) {
      _curPrehistoricFogColor.copy(_prehistoricFogColor);
      prehistoricTargetNear = 28 * np;
      prehistoricTargetFar = 380 * np;
    } else {
      // Transitioning from prehistoric valley towards Rome Via Appia
      const u = Math.min(1, (p - 286) / 8);
      _curPrehistoricFogColor.lerpColors(_prehistoricFogColor, _romeFogColor, u);
      prehistoricTargetNear = THREE.MathUtils.lerp(28, 35, u) * np;
      prehistoricTargetFar = THREE.MathUtils.lerp(380, 850, u) * np;
    }

    // Ancient Rome Fog (Luminous golden-hour Mediterranean atmospheric depth)
    const romeTargetNear = 95 * nr;
    const romeTargetFar = 2200 * nr;

    // Cybernetic Space Frontier Fog (Infinite clear cosmic atmosphere with deep blue-cyan distance)
    const cyberTargetNear = 40 * ncy;
    const cyberTargetFar = 5500 * ncy;

    _targetFogColor.setRGB(
      _fortressFogColor.r * nf + _tunnelFogColor.r * nt + _aiLabFogColor.r * nl + _trans2FogColor.r * nq + _atomicFogColor.r * na + _trans3FogColor.r * nt3 + _cellularFogColor.r * nc + _trans4FogColor.r * nt4 + _curOceanFogColor.r * no + _curPrehistoricFogColor.r * np + _romeFogColor.r * nr + _cyberFogColor.r * ncy + _spaceFogColor.r * ns,
      _fortressFogColor.g * nf + _tunnelFogColor.g * nt + _aiLabFogColor.g * nl + _trans2FogColor.g * nq + _atomicFogColor.g * na + _trans3FogColor.g * nt3 + _cellularFogColor.g * nc + _trans4FogColor.g * nt4 + _curOceanFogColor.g * no + _curPrehistoricFogColor.g * np + _romeFogColor.g * nr + _cyberFogColor.g * ncy + _spaceFogColor.g * ns,
      _fortressFogColor.b * nf + _tunnelFogColor.b * nt + _aiLabFogColor.b * nl + _trans2FogColor.b * nq + _atomicFogColor.b * na + _trans3FogColor.b * nt3 + _cellularFogColor.b * nc + _trans4FogColor.b * nt4 + _curOceanFogColor.b * no + _curPrehistoricFogColor.b * np + _romeFogColor.b * nr + _cyberFogColor.b * ncy + _spaceFogColor.b * ns
    );

    fog.color.lerp(_targetFogColor, Math.min(1, safeDelta * 12));
    if (state.scene.background !== fog.color) {
      state.scene.background = fog.color;
    }

    if (typeof window !== "undefined") {
      (window as any).__threeScene = state.scene;
      (window as any).__threeCamera = state.camera;
      (window as any).__THREE = THREE;
    }

    const targetNear = 38 * nf + 8 * nt + 24 * nl + 10 * nq + 14 * na + 10 * nt3 + 20 * nc + 14 * nt4 + oceanTargetNear + prehistoricTargetNear + romeTargetNear + cyberTargetNear + 40 * ns;
    const targetFar = 130 * nf + 45 * nt + 130 * nl + 40 * nq + 95 * na + 50 * nt3 + 140 * nc + 70 * nt4 + oceanTargetFar + prehistoricTargetFar + romeTargetFar + cyberTargetFar + 5500 * ns;

    fog.near = THREE.MathUtils.damp(fog.near, targetNear, 10, safeDelta);
    fog.far = THREE.MathUtils.damp(fog.far, targetFar, 10, safeDelta);
  });

  return null;
}

/**
 * StageVisibilityCoordinator — Controls GPU rendering active windows with pre-warm overlap.
 * Keeps adjacent worlds technically alive in GPU memory without mount/unmount spikes.
 *
 * Strict World Separation Principle:
 * - Inside Quantum Lab: Atomic World visual contribution is strictly 0.
 * - Inside Atomic World: Quantum Lab and Cellular World are strictly invisible.
 * - Transition space: Dedicated bridge spaces synthesize matter between worlds.
 * - Inside Cellular World: Atomic World visuals are strictly 0.
 * - Inside Deep Ocean World: Cellular World visuals are strictly 0.
 */
function StageVisibilityCoordinator({
  fortressRef,
  tunnelRef,
  aiLabRef,
  transition2Ref,
  atomicRef,
  trans3Ref,
  cellularRef,
  trans4Ref,
  oceanRef,
  prehistoricRef,
  romeRef,
  cyberRef,
}: {
  fortressRef: React.RefObject<THREE.Group | null>;
  tunnelRef: React.RefObject<THREE.Group | null>;
  aiLabRef: React.RefObject<THREE.Group | null>;
  transition2Ref: React.RefObject<THREE.Group | null>;
  atomicRef: React.RefObject<THREE.Group | null>;
  trans3Ref: React.RefObject<THREE.Group | null>;
  cellularRef: React.RefObject<THREE.Group | null>;
  trans4Ref: React.RefObject<THREE.Group | null>;
  oceanRef: React.RefObject<THREE.Group | null>;
  prehistoricRef: React.RefObject<THREE.Group | null>;
  romeRef: React.RefObject<THREE.Group | null>;
  cyberRef: React.RefObject<THREE.Group | null>;
}) {
  useFrame(() => {
    const p = worldProgressState.progress;

    // Generous overlapping visibility windows:
    // Worlds are activated well in advance before the camera reaches them,
    // but completely distant worlds are excluded from the render list.
    const fortressVis = p <= 42 || p >= 442;
    const tunnelVis = p >= 30 && p <= 54;
    const aiLabVis = p >= 42 && p <= 82;
    const trans2Vis = p >= 72 && p <= 86;
    const atomicVis = p >= 78 && p <= 98;
    const trans3Vis = p >= 90 && p <= 108;
    const cellularVis = p >= 100 && p <= 148;
    const trans4Vis = p >= 132 && p <= 150;
    const oceanVis = p >= 142 && p <= 298;
    const prehistoricVis = p >= 226 && p <= 298;
    const romeVis = p >= 284 && p <= 376;
    const cyberVis = p >= 362 && p <= 450;

    if (fortressRef.current && fortressRef.current.visible !== fortressVis) {
      fortressRef.current.visible = fortressVis;
    }
    if (tunnelRef.current && tunnelRef.current.visible !== tunnelVis) {
      tunnelRef.current.visible = tunnelVis;
    }
    if (aiLabRef.current && aiLabRef.current.visible !== aiLabVis) {
      aiLabRef.current.visible = aiLabVis;
    }
    if (transition2Ref.current && transition2Ref.current.visible !== trans2Vis) {
      transition2Ref.current.visible = trans2Vis;
    }
    if (atomicRef.current && atomicRef.current.visible !== atomicVis) {
      atomicRef.current.visible = atomicVis;
    }
    if (trans3Ref.current && trans3Ref.current.visible !== trans3Vis) {
      trans3Ref.current.visible = trans3Vis;
    }
    if (cellularRef.current && cellularRef.current.visible !== cellularVis) {
      cellularRef.current.visible = cellularVis;
    }
    if (trans4Ref.current && trans4Ref.current.visible !== trans4Vis) {
      trans4Ref.current.visible = trans4Vis;
    }
    if (oceanRef.current && oceanRef.current.visible !== oceanVis) {
      oceanRef.current.visible = oceanVis;
    }
    if (prehistoricRef.current && prehistoricRef.current.visible !== prehistoricVis) {
      prehistoricRef.current.visible = prehistoricVis;
    }
    if (romeRef.current && romeRef.current.visible !== romeVis) {
      romeRef.current.visible = romeVis;
    }
    if (cyberRef.current && cyberRef.current.visible !== cyberVis) {
      cyberRef.current.visible = cyberVis;
    }
  });

  return null;
}

function AdaptiveQualityWatcher({
  onDegradeQuality,
}: {
  onDegradeQuality: () => void;
}) {
  const slowFramesRef = useRef(0);
  const totalFramesRef = useRef(0);
  const degradedRef = useRef(false);

  useFrame((_, delta) => {
    totalFramesRef.current++;
    if (totalFramesRef.current < 80) return; // allow initial warm-up

    if (delta > 0.033) {
      slowFramesRef.current++;
      // If sustained low performance (>40 slow frames) detected, gracefully degrade non-essentials
      if (slowFramesRef.current > 40 && !degradedRef.current) {
        degradedRef.current = true;
        onDegradeQuality();
      }
    } else if (slowFramesRef.current > 0) {
      slowFramesRef.current = Math.max(0, slowFramesRef.current - 1);
    }
  });

  return null;
}

function getInitialDeviceCapability(): {
  dpr: [number, number];
  particleCount: number;
  shadowMapSize: number;
} {
  if (typeof window === "undefined") {
    return { dpr: [1, 1.5], particleCount: 320, shadowMapSize: 1024 };
  }
  const width = window.innerWidth;
  const isTouch =
    "ontouchstart" in window || (Boolean(navigator.maxTouchPoints) && navigator.maxTouchPoints > 0);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile || (isTouch && cores <= 4)) {
    return { dpr: [1, 1.25], particleCount: 140, shadowMapSize: 512 };
  }
  if (isTablet) {
    return { dpr: [1, 1.35], particleCount: 220, shadowMapSize: 1024 };
  }
  return { dpr: [1, 1.5], particleCount: 320, shadowMapSize: 1024 };
}

export default function Scene() {
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const fortressRef = useRef<THREE.Group>(null);
  const tunnelRef = useRef<THREE.Group>(null);
  const aiLabRef = useRef<THREE.Group>(null);
  const transition2Ref = useRef<THREE.Group>(null);
  const atomicRef = useRef<THREE.Group>(null);
  const trans3Ref = useRef<THREE.Group>(null);
  const cellularRef = useRef<THREE.Group>(null);
  const trans4Ref = useRef<THREE.Group>(null);
  const oceanRef = useRef<THREE.Group>(null);
  const prehistoricRef = useRef<THREE.Group>(null);
  const romeRef = useRef<THREE.Group>(null);
  const cyberRef = useRef<THREE.Group>(null);

  // Device-aware adaptive 3D quality configuration with runtime auto-degradation
  const [capability, setCapability] = useState(getInitialDeviceCapability);

  const jumpToProgress = (p: number) => {
    if (typeof window !== "undefined") {
      (window as unknown as { __setWorldProgress?: (v: number) => void }).__setWorldProgress?.(p);
      window.dispatchEvent(new CustomEvent("setProgress", { detail: p }));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("progress");
      if (p !== null) {
        const val = parseFloat(p);
        if (!isNaN(val)) jumpToProgress(val);
      } else if (window.location.hash) {
        const hVal = parseFloat(window.location.hash.replace(/[^0-9.]/g, ""));
        if (!isNaN(hVal)) jumpToProgress(hVal);
      }
    };
    readUrl();
    window.addEventListener("hashchange", readUrl);
    window.addEventListener("popstate", readUrl);
    return () => {
      window.removeEventListener("hashchange", readUrl);
      window.removeEventListener("popstate", readUrl);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#06050a] select-none">
      {/* Responsive Fullscreen Seamless Fade Overlay for Rift transitions (Direct DOM updates) */}
      <div
        ref={fadeOverlayRef}
        className="pointer-events-none fixed inset-0 z-50 bg-black opacity-0"
        style={{
          transition: "opacity 60ms linear",
        }}
        aria-hidden="true"
      />

      {/* 3D WebGL Canvas with device-adaptive DPR and high-performance settings */}
      <Canvas
        dpr={capability.dpr}
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{
          position: [0, 3.6, 12],
          fov: 56,
          near: 0.1,
          far: 6000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        className="h-full w-full"
      >
        {/* Dynamic Fog Controller (smooth transition between environments) */}
        <StageFogController />

        {/* Stage Visibility Coordinator (strict world separation, zero unmount spikes) */}
        <StageVisibilityCoordinator
          fortressRef={fortressRef}
          tunnelRef={tunnelRef}
          aiLabRef={aiLabRef}
          transition2Ref={transition2Ref}
          atomicRef={atomicRef}
          trans3Ref={trans3Ref}
          cellularRef={cellularRef}
          trans4Ref={trans4Ref}
          oceanRef={oceanRef}
          prehistoricRef={prehistoricRef}
          romeRef={romeRef}
          cyberRef={cyberRef}
        />

        {/* Scene Prewarmer: Proactively compiles shaders at startup to eliminate transition hitches */}
        <ScenePrewarmer
          fortressRef={fortressRef}
          tunnelRef={tunnelRef}
          aiLabRef={aiLabRef}
          transition2Ref={transition2Ref}
          atomicRef={atomicRef}
          trans3Ref={trans3Ref}
          cellularRef={cellularRef}
          trans4Ref={trans4Ref}
          oceanRef={oceanRef}
          prehistoricRef={prehistoricRef}
          romeRef={romeRef}
          cyberRef={cyberRef}
        />

        {/* Adaptive Quality Watcher: Detects sustained low FPS and steps down non-essentials gracefully */}
        <AdaptiveQualityWatcher
          onDegradeQuality={() => {
            setCapability((prev) => ({
              ...prev,
              dpr: [1, 1],
              particleCount: Math.max(80, Math.round(prev.particleCount * 0.6)),
              shadowMapSize: 512,
            }));
          }}
        />

        {/* 1. Fortress World: Preserved in GPU memory, rendered when visible */}
        <group ref={fortressRef} name="stage-fortress">
          <Lighting shadowMapSize={capability.shadowMapSize} />
          <Lava />
          <LavaFalls />
          <Castle />
          <Dragon />
          <Particles count={capability.particleCount} />
          <EntryTransition />
        </group>

        {/* 2. Transition Tunnel 1: Dimensional passage between Fortress and AI Lab */}
        <group ref={tunnelRef} name="stage-tunnel">
          <TransitionTunnel />
        </group>

        {/* 3. AI Research Chamber: Massive futuristic facility with hero quantum computer */}
        <group ref={aiLabRef} name="stage-ai-lab">
          <AIResearchChamber />
        </group>

        {/* 4. Transition 2: Cryogenic microwave waveguide & scale transformation irises */}
        <group ref={transition2Ref} name="stage-transition2">
          <QuantumAtomicTransition />
        </group>

        {/* 5. Atomic Realm: Complete separate subatomic world (monumental scale) */}
        <group ref={atomicRef} name="stage-atomic">
          <AtomicWorld />
        </group>

        {/* 6. Transition 3: Molecular synthesis & covalent bond condensation */}
        <group ref={trans3Ref} name="stage-transition3">
          <AtomicCellularTransition />
        </group>

        {/* 7. Cellular / Life World: Massive living biological universe */}
        <group ref={cellularRef} name="stage-cellular">
          <CellularWorld />
        </group>

        {/* 8. Transition 4: Biological / Cellular to Ocean Transition */}
        <group ref={trans4Ref} name="stage-transition4">
          <CellularOceanTransition />
        </group>

        {/* 9. Deep Ocean / Abyss World: Monumental deep oceanic realm */}
        <group ref={oceanRef} name="stage-deep-ocean">
          <DeepOceanWorld />
        </group>

        {/* 10. Prehistoric Earth World: Ancient jungle, giant ferns, and dinosaurs */}
        <group ref={prehistoricRef} name="stage-prehistoric">
          <PrehistoricWorld />
        </group>

        {/* 11. Ancient Rome World: Monumental Imperial city, Via Sacra, Colosseum, and Grand Temple */}
        <group ref={romeRef} name="stage-rome">
          <RomeWorld />
        </group>

        {/* 12. Cybernetic Space Frontier World: Megacity, Promenade, Ring Gateway, Colossal Planet & Galaxy */}
        <group ref={cyberRef} name="stage-cyber">
          <CyberWorld />
        </group>

        {/* Continuous Loop Camera Controller */}
        <CameraController
          onFadeChange={(fade) => {
            if (fadeOverlayRef.current) {
              const clamped = Math.min(1, Math.max(0, fade));
              fadeOverlayRef.current.style.opacity = `${clamped}`;
            }
          }}
        />
      </Canvas>
    </div>
  );
}
