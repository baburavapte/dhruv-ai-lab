"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  LOOP_LENGTH,
  positiveModulo,
  getCameraTransform,
  getStageInfo,
  updateWorldProgress,
  type StageInfo,
} from "@/lib/worldProgress";

interface CameraControllerProps {
  onProgressChange?: (progress: number, stage: StageInfo, fadeOpacity: number) => void;
  onFadeChange?: (fadeOpacity: number) => void;
}

/**
 * Centralized Camera Speed & Traversal Configuration
 * Tuned for fast cinematic flight (~1.5x - 1.8x boost) while maintaining
 * environmental readability and rock-solid ~60 FPS stability.
 */
export const CAMERA_SPEED_CONFIG = {
  // Global velocity multiplier for instant overall tuning
  GLOBAL_MULTIPLIER: 1.0,

  // Fortress Approach (p: 0 -> 20): fast cinematic flight over the obsidian courtyard
  FORTRESS: 5.4, // was 3.2 (~1.69x)

  // Dragon Guardian Approach (p: 20 -> 32): momentum builds as dragon awakens
  DRAGON_APPROACH: 5.8, // was 3.2 (~1.81x)

  // Dragon Mouth Entry (p: 32 -> 36): fast controlled entry between jaws
  DRAGON_MOUTH: 4.2, // was 2.4 (~1.75x)

  // Dimensional Throat Passage (p: 36 -> 48): accelerating conduit into Quantum Lab
  THROAT_ENTRY: 5.2, // was 3.2 (~1.63x)
  THROAT_EXIT: 6.4, // accelerates to ~2.0x as user rushes into Quantum Lab

  // Quantum Research Laboratory (p: 48 -> 76): fast cruising through huge research facility
  // User travels briskly through the architecture while retaining full visual readability
  // of observation decks, GPU/server infrastructure, glass walls, and the giant hanging chandelier
  QUANTUM_LAB: 4.4, // was 2.8 (~1.57x)

  // Transition to Atomic World (p: 76 -> 82): fast subatomic compression
  QUANTUM_TO_ATOMIC: 4.8, // was 3.0 (~1.60x)

  // Atomic World Exploration (p: 82 -> 94): energetic orbital flight
  ATOMIC_WORLD: 4.4, // was 2.8 (~1.57x)

  // Transition to Cellular World (p: 94 -> 104): fast molecular synthesis and lipid condensation
  ATOMIC_TO_CELLULAR: 4.8,

  // Cellular / Life World Exploration (p: 104 -> 134): fast cinematic flight through colossal living universe
  CELLULAR_WORLD: 4.4,

  // Transition to Deep Ocean World (p: 134 -> 146): aqueous dive from cell to pelagic depth
  CELLULAR_TO_OCEAN: 4.8,

  // Deep Ocean & Pelagic Surface World (p: 146 -> 226)
  OCEAN_ABYSS: 4.5,
  OCEAN_ASCENT: 5.8,
  OCEAN_SURFACE: 5.2,
  OCEAN_COASTLINE: 4.8,
  OCEAN_BEACH_LAND: 4.2,

  // Prehistoric Earth World & Transitions (p: 226 -> 302)
  PREHISTORIC_TRANSITION: 4.8,
  PREHISTORIC_WORLD: 4.6,
  PREHISTORIC_EXIT: 5.2,

  // Ancient Rome World (p: 298 -> 364)
  ROME_APPROACH: 4.8,
  ROME_STREET: 4.5,
  ROME_TEMPLE: 3.8,

  // Celestial Rift Transition (p: 364 -> 376)
  CELESTIAL_RIFT: 5.2,

  // Cybernetic Space Frontier (p: 376 -> 442)
  CYBER_PROMENADE: 4.8,
  CYBER_DISTRICT: 4.6,
  CYBER_GATEWAY: 4.2,
  CYBER_SPACEPORT: 5.4,
  CYBER_ORBITAL: 6.2,

  // Cosmic Hyperdrive Loop Return (p: 442 -> 450)
  HYPERDRIVE_TRANSITION: 6.8,

  // Responsiveness Damping Rates (frame-rate-independent lambda)
  ACCEL_DAMPING: 18.0, // immediate acceleration on ArrowUp/Down press (~50ms to 80% speed)
  REVERSE_DAMPING: 24.0, // swift, crisp direction switching without snapping
  DECEL_DAMPING: 14.0, // smooth cinematic glide when keys are released
} as const;

/**
 * Calculates current target traversal speed based on progress along the continuous loop.
 * Pure scalar math — ZERO heap allocations.
 */
function getTargetSpeedForProgress(p: number): number {
  if (p < 20) {
    return CAMERA_SPEED_CONFIG.FORTRESS;
  }
  if (p < 32) {
    return CAMERA_SPEED_CONFIG.DRAGON_APPROACH;
  }
  if (p <= 36) {
    return CAMERA_SPEED_CONFIG.DRAGON_MOUTH;
  }
  if (p <= 48) {
    // Throat: accelerating conduit
    const t = (p - 36) / 12;
    return THREE.MathUtils.lerp(
      CAMERA_SPEED_CONFIG.THROAT_ENTRY,
      CAMERA_SPEED_CONFIG.THROAT_EXIT,
      t
    );
  }
  if (p <= 76) {
    return CAMERA_SPEED_CONFIG.QUANTUM_LAB;
  }
  if (p <= 82) {
    return CAMERA_SPEED_CONFIG.QUANTUM_TO_ATOMIC;
  }
  if (p <= 94) {
    return CAMERA_SPEED_CONFIG.ATOMIC_WORLD;
  }
  if (p <= 104) {
    return CAMERA_SPEED_CONFIG.ATOMIC_TO_CELLULAR;
  }
  if (p <= 134) {
    return CAMERA_SPEED_CONFIG.CELLULAR_WORLD;
  }
  if (p <= 146) {
    return CAMERA_SPEED_CONFIG.CELLULAR_TO_OCEAN;
  }
  if (p <= 176) {
    return CAMERA_SPEED_CONFIG.OCEAN_ABYSS;
  }
  if (p <= 188) {
    const t = (p - 176) / 12;
    return THREE.MathUtils.lerp(
      CAMERA_SPEED_CONFIG.OCEAN_ABYSS,
      CAMERA_SPEED_CONFIG.OCEAN_ASCENT,
      t
    );
  }
  if (p <= 206) {
    return CAMERA_SPEED_CONFIG.OCEAN_SURFACE;
  }
  if (p <= 216) {
    const t = (p - 206) / 10;
    return THREE.MathUtils.lerp(
      CAMERA_SPEED_CONFIG.OCEAN_SURFACE,
      CAMERA_SPEED_CONFIG.OCEAN_COASTLINE,
      t
    );
  }
  if (p <= 226) {
    return CAMERA_SPEED_CONFIG.OCEAN_BEACH_LAND;
  }
  if (p <= 238) {
    return CAMERA_SPEED_CONFIG.PREHISTORIC_TRANSITION;
  }
  if (p <= 286) {
    return CAMERA_SPEED_CONFIG.PREHISTORIC_WORLD;
  }
  if (p <= 298) {
    return CAMERA_SPEED_CONFIG.ROME_APPROACH;
  }
  if (p <= 356) {
    return CAMERA_SPEED_CONFIG.ROME_STREET;
  }
  if (p <= 364) {
    return CAMERA_SPEED_CONFIG.ROME_TEMPLE;
  }
  if (p <= 376) {
    return CAMERA_SPEED_CONFIG.CELESTIAL_RIFT;
  }
  if (p <= 396) {
    return CAMERA_SPEED_CONFIG.CYBER_PROMENADE;
  }
  if (p <= 412) {
    return CAMERA_SPEED_CONFIG.CYBER_DISTRICT;
  }
  if (p <= 424) {
    return CAMERA_SPEED_CONFIG.CYBER_GATEWAY;
  }
  if (p <= 434) {
    return CAMERA_SPEED_CONFIG.CYBER_SPACEPORT;
  }
  if (p <= 444) {
    return CAMERA_SPEED_CONFIG.CYBER_ORBITAL;
  }
  return CAMERA_SPEED_CONFIG.HYPERDRIVE_TRANSITION;
}

export default function CameraController({ onProgressChange, onFadeChange }: CameraControllerProps) {
  const { pointer } = useThree();

  // Continuous world progress (increases with ArrowUp, decreases with ArrowDown)
  const worldProgressRef = useRef(0);
  const velocityRef = useRef(0);

  // Performance throttling refs for React parent notification
  const lastReportedProgressRef = useRef(-1);
  const lastReportedStageIdRef = useRef<string>("");

  // Cached vector math refs to guarantee ZERO GC allocations in useFrame
  const currentLookAtRef = useRef(new THREE.Vector3(0, 4.8, -35));

  // STRICTLY ArrowUp and ArrowDown ONLY
  const keysRef = useRef<{ ArrowUp: boolean; ArrowDown: boolean }>({
    ArrowUp: false,
    ArrowDown: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        keysRef.current.ArrowUp = true;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        keysRef.current.ArrowDown = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        keysRef.current.ArrowUp = false;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        keysRef.current.ArrowDown = false;
      }
    };

    const handleBlur = () => {
      keysRef.current.ArrowUp = false;
      keysRef.current.ArrowDown = false;
    };

    const syncFromUrl = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const pStr = urlParams.get("progress");
        if (pStr !== null) {
          const val = parseFloat(pStr);
          if (!isNaN(val)) {
            worldProgressRef.current = val;
            velocityRef.current = 0;
            const t = getCameraTransform(positiveModulo(val, LOOP_LENGTH));
            currentLookAtRef.current.copy(t.lookAt);
            return;
          }
        }
        if (window.location.hash) {
          const hashVal = parseFloat(window.location.hash.replace(/[^0-9.]/g, ""));
          if (!isNaN(hashVal)) {
            worldProgressRef.current = hashVal;
            velocityRef.current = 0;
            const t = getCameraTransform(positiveModulo(hashVal, LOOP_LENGTH));
            currentLookAtRef.current.copy(t.lookAt);
          }
        }
      }
    };

    syncFromUrl();

    const handleCustomProgress = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === "number" && !isNaN(customEvent.detail)) {
        worldProgressRef.current = customEvent.detail;
        velocityRef.current = 0;
        const t = getCameraTransform(positiveModulo(customEvent.detail, LOOP_LENGTH));
        currentLookAtRef.current.copy(t.lookAt);
      }
    };

    if (typeof window !== "undefined") {
      (window as unknown as { __getWorldProgress: () => number }).__getWorldProgress =
        () => worldProgressRef.current;
      (window as unknown as { __setWorldProgress: (v: number) => void }).__setWorldProgress =
        (v: number) => {
          worldProgressRef.current = v;
          velocityRef.current = 0;
          const t = getCameraTransform(positiveModulo(v, LOOP_LENGTH));
          currentLookAtRef.current.copy(t.lookAt);
        };
      (window as unknown as { __getCameraVelocity: () => number }).__getCameraVelocity =
        () => velocityRef.current;
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("setProgress", handleCustomProgress);

    // Touch controls for mobile / tablet 3D exploration
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const h = window.innerHeight;
      // Tap/hold top 65% of screen = forward; bottom 35% = backward
      if (t.clientY < h * 0.65) {
        keysRef.current.ArrowUp = true;
        keysRef.current.ArrowDown = false;
      } else {
        keysRef.current.ArrowDown = true;
        keysRef.current.ArrowUp = false;
      }
    };

    const handleTouchEnd = () => {
      keysRef.current.ArrowUp = false;
      keysRef.current.ArrowDown = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("setProgress", handleCustomProgress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    // Clamped frame delta guarantees frame-rate-independent consistent movement (30, 60, 120 FPS)
    const safeDelta = Math.min(delta, 0.05);
    const cam = state.camera;

    const up = keysRef.current.ArrowUp;
    const down = keysRef.current.ArrowDown;

    const currentLooped = positiveModulo(worldProgressRef.current, LOOP_LENGTH);

    // 1. Context-Aware Speed Curve from Centralized Speed Config
    const baseSpeed = getTargetSpeedForProgress(currentLooped);
    const moveSpeed = baseSpeed * CAMERA_SPEED_CONFIG.GLOBAL_MULTIPLIER;

    let targetVelocity = 0;
    if (up && !down) {
      targetVelocity = moveSpeed;
    } else if (down && !up) {
      targetVelocity = -moveSpeed;
    }

    // 2. High-Responsiveness Velocity Damping:
    // - Direction switch (e.g. forward -> reverse): REVERSE_DAMPING (24.0) for immediate, crisp response
    // - Acceleration from rest: ACCEL_DAMPING (18.0) for instant startup
    // - Deceleration on release: DECEL_DAMPING (14.0) for smooth cinematic glide
    let dampingLambda: number = CAMERA_SPEED_CONFIG.DECEL_DAMPING;
    if (targetVelocity !== 0) {
      const isReversingDirection =
        (targetVelocity > 0 && velocityRef.current < -0.1) ||
        (targetVelocity < 0 && velocityRef.current > 0.1);
      dampingLambda = isReversingDirection
        ? CAMERA_SPEED_CONFIG.REVERSE_DAMPING
        : CAMERA_SPEED_CONFIG.ACCEL_DAMPING;
    }

    velocityRef.current = THREE.MathUtils.damp(
      velocityRef.current,
      targetVelocity,
      dampingLambda,
      safeDelta
    );

    if (Math.abs(velocityRef.current) < 0.0001 && targetVelocity === 0) {
      velocityRef.current = 0;
    }

    // 3. Advance Continuous World Progress (Infinity-safe wrapping)
    worldProgressRef.current += velocityRef.current * safeDelta;

    // PORTFOLIO BOUNDARY: Detect backward movement past the fortress start
    // When progress goes significantly negative, the user is trying to exit backward.
    // Dispatch event for the outer portfolio layer to handle the transition.
    if (worldProgressRef.current < -1.5 && velocityRef.current < 0) {
      worldProgressRef.current = 0;
      velocityRef.current = 0;
      keysRef.current.ArrowDown = false;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("returnToPortfolio"));
      }
    }

    // Periodic normalization to prevent float overflow over long sessions
    if (worldProgressRef.current > 5000 || worldProgressRef.current < -5000) {
      worldProgressRef.current = positiveModulo(worldProgressRef.current, LOOP_LENGTH);
    }

    const looped = positiveModulo(worldProgressRef.current, LOOP_LENGTH);

    // 4. Compute Camera Transform, Banking, and Fade from Cinematic Trajectory (Zero-allocation)
    const transform = getCameraTransform(looped);

    // Synchronize global world progress state in memory for all components
    updateWorldProgress(looped, transform.fadeOpacity);

    // Direct DOM notification for rift fade overlay (bypasses React reconciliation)
    onFadeChange?.(transform.fadeOpacity);

    cam.position.copy(transform.position);
    cam.up.copy(transform.up);

    // Dynamic field of view with aspect-ratio-aware responsive compensation
    // On portrait mobile (aspect < 1.0), vertical FOV is widened so horizontal framing
    // of the Dragon, Fortress, Quantum Computer Chandelier, and Space Dome is preserved.
    // On ultrawide (aspect > 2.2), vertical FOV is subtly adjusted to avoid edge distortion.
    const aspect = state.size.width / Math.max(state.size.height, 1);

    const baseFov = transform.fov;
    let targetFov = baseFov;
    if (aspect < 1.0) {
      // Portrait device compensation (phones, vertical tablets)
      const portraitMultiplier = Math.min(1.36, Math.pow(1.5 / Math.max(aspect, 0.42), 0.38));
      targetFov = Math.min(96, baseFov * portraitMultiplier);
    } else if (aspect > 2.2) {
      // Ultrawide compensation
      const ultrawideFactor = THREE.MathUtils.lerp(1.0, 0.92, Math.min(1, (aspect - 2.2) / 1.2));
      targetFov = baseFov * ultrawideFactor;
    }

    const persCam = cam as THREE.PerspectiveCamera;
    if (persCam.isPerspectiveCamera) {
      const requiredFar = looped >= 142 && looped <= 450 ? 6000 : 350;
      if (persCam.near !== 0.1 || persCam.far !== requiredFar) {
        persCam.near = 0.1;
        persCam.far = requiredFar;
        persCam.updateProjectionMatrix();
      }
      if (Math.abs(persCam.fov - targetFov) > 0.02) {
        persCam.fov = THREE.MathUtils.damp(persCam.fov, targetFov, 6.0, safeDelta);
        persCam.updateProjectionMatrix();
      }
    }

    // 5. Subtle Bounded Parallax Look-At (Frame-rate-independent damping)
    const targetLookX = transform.lookAt.x + pointer.x * 0.4;
    const targetLookY = transform.lookAt.y + pointer.y * 0.22;
    const targetLookZ = transform.lookAt.z;

    currentLookAtRef.current.x = THREE.MathUtils.damp(
      currentLookAtRef.current.x,
      targetLookX,
      12.0,
      safeDelta
    );
    currentLookAtRef.current.y = THREE.MathUtils.damp(
      currentLookAtRef.current.y,
      targetLookY,
      12.0,
      safeDelta
    );
    currentLookAtRef.current.z = THREE.MathUtils.damp(
      currentLookAtRef.current.z,
      targetLookZ,
      10.0,
      safeDelta
    );

    cam.lookAt(currentLookAtRef.current);

    // 6. Optional throttled progress callback for external URL syncing
    const stage = getStageInfo(looped);
    const progressDiff = Math.abs(looped - lastReportedProgressRef.current);
    const stageChanged = stage.id !== lastReportedStageIdRef.current;

    if (onProgressChange && (progressDiff > 1.0 || stageChanged || (velocityRef.current === 0 && progressDiff > 0.01))) {
      lastReportedProgressRef.current = looped;
      lastReportedStageIdRef.current = stage.id;
      onProgressChange(looped, stage, transform.fadeOpacity);
    }
  });

  return null;
}
