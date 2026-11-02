import * as THREE from "three";
import { evaluateCinematicTrajectory } from "./cinematicTrajectory";
import { getActiveJourneySegment } from "./discoveryChain";

export const LOOP_LENGTH = 450;

export type StageId =
  | "DRAGON_FORTRESS_WORLD"
  | "DRAGON_FORTRESS"
  | "DRAGON_GATEWAY"
  | "DRAGON_MOUTH"
  | "THROAT_TRANSITION"
  | "QUANTUM_LAB_WORLD"
  | "QUANTUM_LAB"
  | "QUANTUM_COMPUTER"
  | "QUANTUM_TO_ATOMIC_TRANSITION"
  | "QUANTUM_TO_ATOMIC"
  | "ATOMIC_WORLD"
  | "ATOMIC_TO_CELLULAR_TRANSITION"
  | "CELLULAR_WORLD"
  | "CELLULAR_TO_OCEAN_TRANSITION"
  | "DEEP_OCEAN_WORLD"
  | "VOLCANO_TO_PREHISTORIC_TRANSITION"
  | "PREHISTORIC_WORLD"
  | "PREHISTORIC_TO_ROME_TRANSITION"
  | "PREHISTORIC_TO_HUMAN_TRANSITION"
  | "ANCIENT_ROME_WORLD"
  | "ROME_TO_FORTRESS_TRANSITION"
  | "ROME_TO_CYBER_TRANSITION"
  | "CYBERNETIC_SPACE_WORLD"
  | "CYBER_TO_SPACE_TRANSITION"
  | "COSMIC_HYPERDRIVE_RETURN"
  | "SPACE_OBSERVATION_DOME"
  | "DIMENSIONAL_RIFT_RETURN";

export interface StageInfo {
  id: StageId;
  label: string;
  sublabel: string;
}

/**
 * Continuous Stage Weights for Strict World Separation:
 *
 * WORLD 1: DRAGON FORTRESS WORLD (0 .. 36)
 * TRANSITION 1: DIMENSIONAL PASSAGE (36 .. 48)
 * WORLD 2: QUANTUM RESEARCH LABORATORY (48 .. 76)
 * TRANSITION 2: SUBATOMIC SCALE TRANSITION (76 .. 82)
 * WORLD 3: ATOMIC WORLD (82 .. 94)
 * TRANSITION 3: MOLECULAR / CHEMICAL COMPLEXITY TRANSITION (94 .. 104)
 * WORLD 4: CELLULAR / LIFE WORLD (104 .. 134)
 * TRANSITION 4: BIOLOGICAL / ORGANIC TRANSITION TO OCEAN (134 .. 146)
 * WORLD 5: DEEP OCEAN & ACTIVE VOLCANO (146 .. 226)
 * TRANSITION 5: VOLCANIC ASH & BASALT PASSAGE (226 .. 236)
 * WORLD 6 (Stage 7): PREHISTORIC EARTH WORLD (236 .. 286)
 * TRANSITION 6: VIA APPIA IMPERIAL ROAD (286 .. 298)
 * WORLD 7 (Stage 8): ANCIENT ROME WORLD (298 .. 362)
 * TRANSITION 7: IMPERIAL TRIUMPHAL RIFT RETURN (362 .. 370)
 */
export interface StageWeights {
  fortress: number;
  dragon: number;
  throat: number;
  portal: number;
  aiLab: number;
  quantumToAtomic: number;
  atomic: number;
  atomicToCellular: number;
  cellular: number;
  cellularToOcean: number;
  deepOcean: number;
  prehistoric: number;
  rome: number;
  cyber: number;
  space: number;
  rift: number;
}

export function positiveModulo(val: number, max: number = LOOP_LENGTH): number {
  return ((val % max) + max) % max;
}

// Hermite smoothstep for cinematic easing
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getStageInfo(progress: number): StageInfo {
  const segment = getActiveJourneySegment(progress);
  return {
    id: segment.id as StageId,
    label: segment.name.toUpperCase(),
    sublabel:
      segment.type === "WORLD"
        ? segment.category.replace(/_/g, " ")
        : `TRANSITION: ${segment.sourceWorld} → ${segment.destinationWorld}`,
  };
}

/**
 * Computes smooth stage weights respecting strict world separation.
 * The user travels through complete worlds with dedicated transition spaces.
 */
export function getStageWeights(progress: number): StageWeights {
  const p = positiveModulo(progress, LOOP_LENGTH);

  // 1. FORTRESS WORLD: fully active 0-34, fades out 34-40, returns 444-450
  let fortress = 0;
  if (p < 34) {
    fortress = 1;
  } else if (p >= 34 && p < 40) {
    fortress = 1 - smoothstep(34, 40, p);
  } else if (p >= 444 && p <= 450) {
    fortress = smoothstep(444, 448, p);
  }

  // 2. DRAGON GUARDIAN: active 16-36, fades out 36-40
  let dragon = 0;
  if (p >= 16 && p < 22) {
    dragon = smoothstep(16, 22, p);
  } else if (p >= 22 && p < 34) {
    dragon = 1;
  } else if (p >= 34 && p < 40) {
    dragon = 1 - smoothstep(34, 40, p);
  }

  // 3. THROAT PASSAGE (Transition 1): fades in 34-38, active 38-46, fades out 46-50
  let throat = 0;
  if (p >= 34 && p < 38) {
    throat = smoothstep(34, 38, p);
  } else if (p >= 38 && p < 46) {
    throat = 1;
  } else if (p >= 46 && p < 50) {
    throat = 1 - smoothstep(46, 50, p);
  }

  // 4. PORTAL RING: active 40-48
  let portal = 0;
  if (p >= 40 && p < 44) {
    portal = smoothstep(40, 44, p);
  } else if (p >= 44 && p < 48) {
    portal = 1;
  } else if (p >= 48 && p < 51) {
    portal = 1 - smoothstep(48, 51, p);
  }

  // 5. QUANTUM RESEARCH LAB (World 2):
  // Fades in 46-50, FULLY ACTIVE 50-76 (pure complete Quantum Lab world!)
  // Fades out 76-78. Strictly 0 when p >= 78 and p < 46!
  let aiLab = 0;
  if (p >= 46 && p < 50) {
    aiLab = smoothstep(46, 50, p);
  } else if (p >= 50 && p < 76) {
    aiLab = 1;
  } else if (p >= 76 && p < 78) {
    aiLab = 1 - smoothstep(76, 78, p);
  }

  // 6. SUBATOMIC SCALE TRANSITION (Transition 2):
  // Fades in 75-77, active 77-80, fades out 80-83
  let quantumToAtomic = 0;
  if (p >= 75 && p < 77) {
    quantumToAtomic = smoothstep(75, 77, p);
  } else if (p >= 77 && p < 80) {
    quantumToAtomic = 1;
  } else if (p >= 80 && p < 83) {
    quantumToAtomic = 1 - smoothstep(80, 83, p);
  }

  // 7. ATOMIC WORLD (World 3):
  // Strictly 0 when p < 80! Fades in 80-83, FULLY ACTIVE 83-94 (pure complete Atomic World!)
  // Fades out 94-96. Strictly 0 when p >= 96!
  let atomic = 0;
  if (p >= 80 && p < 83) {
    atomic = smoothstep(80, 83, p);
  } else if (p >= 83 && p < 94) {
    atomic = 1;
  } else if (p >= 94 && p < 96) {
    atomic = 1 - smoothstep(94, 96, p);
  }

  // 8. MOLECULAR / CHEMICAL COMPLEXITY TRANSITION (Transition 3):
  // Atoms bond into molecules, chains form, organic precursors appear.
  // Fades in 93-96, fully active 96-103, fades out 103-105. Strictly 0 when p >= 105 or p < 93!
  let atomicToCellular = 0;
  if (p >= 93 && p < 96) {
    atomicToCellular = smoothstep(93, 96, p);
  } else if (p >= 96 && p < 103) {
    atomicToCellular = 1;
  } else if (p >= 103 && p < 105) {
    atomicToCellular = 1 - smoothstep(103, 105, p);
  }

  // 9. CELLULAR / LIFE WORLD (World 4):
  // Monumental living biological universe.
  // Strictly 0 when p < 102! Fades in 102-105, FULLY ACTIVE 105-134 (vast 30-unit journey!)
  // Fades out 134-136. Strictly 0 when p >= 136!
  let cellular = 0;
  if (p >= 102 && p < 105) {
    cellular = smoothstep(102, 105, p);
  } else if (p >= 105 && p < 134) {
    cellular = 1;
  } else if (p >= 134 && p < 136) {
    cellular = 1 - smoothstep(134, 136, p);
  }

  // 10. CELLULAR TO OCEAN TRANSITION (Transition 4: Biological / Organic Transition):
  // From biological scale into aquatic fluid, increasing volume, marine snow, deep water density.
  // Fades in 133-136, fully active 136-144, fades out 144-147. Strictly 0 when p >= 147 or p < 133!
  let cellularToOcean = 0;
  if (p >= 133 && p < 136) {
    cellularToOcean = smoothstep(133, 136, p);
  } else if (p >= 136 && p < 144) {
    cellularToOcean = 1;
  } else if (p >= 144 && p < 147) {
    cellularToOcean = 1 - smoothstep(144, 147, p);
  }

  // 11. DEEP OCEAN & ACTIVE VOLCANO (World 5 / Stage 6):
  let deepOcean = 0;
  if (p >= 144 && p < 147) {
    deepOcean = smoothstep(144, 147, p);
  } else if (p >= 147 && p < 226) {
    deepOcean = 1;
  } else if (p >= 226 && p < 236) {
    deepOcean = 1 - smoothstep(226, 236, p);
  }

  // 12. PREHISTORIC EARTH WORLD (Stage 7):
  // Volcanic flank pass -> ancient continent reveal -> colossal herbivores -> T-Rex primeval gorge -> ancient passage
  let prehistoric = 0;
  if (p >= 226 && p < 238) {
    prehistoric = smoothstep(226, 238, p);
  } else if (p >= 238 && p < 286) {
    prehistoric = 1;
  } else if (p >= 286 && p < 294) {
    prehistoric = 1 - smoothstep(286, 294, p);
  }

  // 13. ANCIENT ROME WORLD (Stage 8):
  // Monumental imperial city, Via Sacra, bustling forum marketplace, Colosseum, aqueducts & Grand Temple
  let rome = 0;
  if (p >= 290 && p < 298) {
    rome = smoothstep(290, 298, p);
  } else if (p >= 298 && p < 364) {
    rome = 1;
  } else if (p >= 364 && p < 372) {
    rome = 1 - smoothstep(364, 372, p);
  }

  // 14. IMPERIAL CELESTIAL RIFT TRANSITION (Transition 7: Rome to Cyber Frontier):
  let rift = 0;
  if (p >= 364 && p < 370) {
    rift = smoothstep(364, 370, p);
  } else if (p >= 370 && p < 376) {
    rift = 1 - smoothstep(370, 376, p);
  }

  // 15. CYBERNETIC SPACE FRONTIER WORLD (Stage 9):
  // Megacity avenue, reflective promenade, DHRUV AI LAB, ring gateway, colossal planet, space station & galaxy
  let cyber = 0;
  if (p >= 370 && p < 376) {
    cyber = smoothstep(370, 376, p);
  } else if (p >= 376 && p < 444) {
    cyber = 1;
  } else if (p >= 444 && p <= 450) {
    cyber = 1 - smoothstep(444, 448, p);
  }

  // 16. COSMIC SPACE OVERLAY / HYPERDRIVE:
  let space = 0;
  if (p >= 424 && p < 444) {
    space = smoothstep(424, 434, p);
  } else if (p >= 444 && p <= 450) {
    space = 1 - smoothstep(444, 450, p);
  }

  return { fortress, dragon, throat, portal, aiLab, quantumToAtomic, atomic, atomicToCellular, cellular, cellularToOcean, deepOcean, prehistoric, rome, cyber, space, rift };
}

/**
 * Computes dragon mouth opening factor [0, 1] from world loop progress.
 */
export function getDragonMouthOpen(progress: number): number {
  const p = positiveModulo(progress, LOOP_LENGTH);

  if (p < 16) return 0;
  if (p >= 16 && p <= 32) {
    const u = (p - 16) / 16;
    return u * u * u * (u * (u * 6 - 15) + 10);
  }
  if (p > 32 && p <= 40) return 1.0;
  if (p > 40 && p <= 48) {
    const u = 1 - (p - 40) / 8;
    return u * u * u * (u * (u * 6 - 15) + 10);
  }
  return 0;
}

// AI Lab world center offset
const AI_LAB_CENTER_Z = -120;
const AI_LAB_CENTER_Y = 0;

export interface WorldProgressState {
  progress: number;
  weights: StageWeights;
  mouthOpen: number;
  approachProgress: number;
  throatProgress: number;
  fadeOpacity: number;
  stage: StageInfo;
}

export const worldProgressState: WorldProgressState = {
  progress: 0,
  weights: getStageWeights(0),
  mouthOpen: getDragonMouthOpen(0),
  approachProgress: 0,
  throatProgress: 0,
  fadeOpacity: 0,
  stage: getStageInfo(0),
};

export function updateWorldProgress(progress: number, fadeOpacity: number = 0): void {
  const p = positiveModulo(progress, LOOP_LENGTH);
  worldProgressState.progress = p;
  worldProgressState.weights = getStageWeights(p);
  worldProgressState.mouthOpen = getDragonMouthOpen(p);
  worldProgressState.approachProgress = Math.min(1, Math.max(0, p / 32));
  worldProgressState.throatProgress = Math.min(1, Math.max(0, (p - 34) / 14));
  worldProgressState.fadeOpacity = fadeOpacity;
  worldProgressState.stage = getStageInfo(p);
}

// Pre-allocated reusable vectors for zero-allocation getCameraTransform
const _sharedCameraPos = new THREE.Vector3();
const _sharedCameraLookAt = new THREE.Vector3();
const _sharedCameraUp = new THREE.Vector3(0, 1, 0);
const _sharedCameraTransform = {
  position: _sharedCameraPos,
  lookAt: _sharedCameraLookAt,
  up: _sharedCameraUp,
  roll: 0,
  fov: 56,
  fadeOpacity: 0,
};

export function getCameraTransform(progress: number): {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  up: THREE.Vector3;
  roll: number;
  fov: number;
  fadeOpacity: number;
} {
  const result = evaluateCinematicTrajectory(progress);
  _sharedCameraPos.copy(result.position);
  _sharedCameraLookAt.copy(result.lookAt);
  _sharedCameraUp.copy(result.up);
  _sharedCameraTransform.roll = result.roll;
  _sharedCameraTransform.fov = result.fov;
  _sharedCameraTransform.fadeOpacity = result.fadeOpacity;
  return _sharedCameraTransform;
}

export function getAILabWorldOffset(): { x: number; y: number; z: number } {
  return { x: 0, y: AI_LAB_CENTER_Y, z: AI_LAB_CENTER_Z };
}
