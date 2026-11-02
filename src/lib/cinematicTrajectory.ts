import * as THREE from "three";
import { LOOP_LENGTH, positiveModulo } from "./worldProgress";

/**
 * DHRUV AI LAB — CINEMATIC TRAJECTORY SYSTEM
 *
 * Core Trajectory Principles:
 * - THE USER DOES NOT TRAVEL FROM ATTRACTION TO ATTRACTION.
 * - THE USER TRAVELS THROUGH WORLDS.
 * - Each world has a continuous, smooth traversal through real architectural space.
 * - No scripted stops, no tight orbital spinning, no cable dives.
 * - Camera roll normally remains close to zero (subtle banking <= 0.015 on wide curves).
 * - Heavy, intentional, physically believable cinematic momentum.
 * - Zero per-frame allocations inside useFrame (reusable Vector3/Quaternion math).
 */

export interface CameraTransformResult {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  up: THREE.Vector3;
  roll: number;
  fov: number;
  fadeOpacity: number;
}

// Pre-allocated static vectors & objects for zero-garbage evaluation
const _pos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _rotMat = new THREE.Matrix4();
const _result: CameraTransformResult = {
  position: _pos,
  lookAt: _lookAt,
  up: _up,
  roll: 0,
  fov: 56,
  fadeOpacity: 0,
};

const QPU_CENTER_Z = -126;
const ATOMIC_CENTER_Z = -182;
const CELLULAR_NUCLEUS_Z = -290;

// Hermite smoothstep utility
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Evaluates the continuous cinematic 3D trajectory at any given progress [0..LOOP_LENGTH].
 */
export function evaluateCinematicTrajectory(progress: number): CameraTransformResult {
  const p = positiveModulo(progress, LOOP_LENGTH);
  let roll = 0;
  let fov = 56;
  let fadeOpacity = 0;

  if (p < 20) {
    // -------------------------------------------------------------------------
    // 1. FORTRESS APPROACH (p: 0 -> 20)
    // Ground-level approach toward the ancient obsidian fortress.
    // Heavy cinematic momentum, rock-solid horizon.
    // -------------------------------------------------------------------------
    const t = p / 20;
    const s = smoothstep(0, 1, t);
    const sway = Math.sin(t * Math.PI) * 0.22;

    _pos.x = sway;
    _pos.y = THREE.MathUtils.lerp(3.6, 3.75, s);
    _pos.z = THREE.MathUtils.lerp(12.0, -10.0, s);

    roll = 0;
    fov = 56;

    _lookAt.set(0, 4.8, -35.0);
  } else if (p < 32) {
    // -------------------------------------------------------------------------
    // 2. DRAGON GUARDIAN APPROACH (p: 20 -> 32)
    // Rising upward sweep banking gently toward the colossal dragon head.
    // -------------------------------------------------------------------------
    const t = (p - 20) / 12;
    const s = smoothstep(0, 1, t);
    const curveX = Math.sin(t * Math.PI) * 0.35;

    _pos.x = curveX;
    _pos.y = THREE.MathUtils.lerp(3.75, 3.82, s);
    _pos.z = THREE.MathUtils.lerp(-10.0, -24.5, s);

    roll = -Math.sin(t * Math.PI) * 0.012;
    fov = THREE.MathUtils.lerp(56, 58, s);

    // Look directly toward guardian head and awakening eyes
    _lookAt.set(0, THREE.MathUtils.lerp(4.8, 5.0, s), -35.0);
  } else if (p < 36) {
    // -------------------------------------------------------------------------
    // 3. DRAGON MOUTH ENTRY (p: 32 -> 36)
    // Clean, centered passage between obsidian fangs into mouth threshold.
    // Seamlessly transitions lookAt from guardian eyes into throat corridor.
    // -------------------------------------------------------------------------
    const t = (p - 32) / 4;
    const s = smoothstep(0, 1, t);

    _pos.x = 0;
    _pos.y = THREE.MathUtils.lerp(3.82, 3.60, s);
    _pos.z = THREE.MathUtils.lerp(-24.5, -34.0, s);

    roll = 0;
    fov = THREE.MathUtils.lerp(58, 62, s);

    _lookAt.set(
      0,
      THREE.MathUtils.lerp(5.0, 3.80, s),
      THREE.MathUtils.lerp(-35.0, -55.0, s)
    );
  } else if (p < 48) {
    // -------------------------------------------------------------------------
    // 4. TRANSITION 1: DIMENSIONAL PASSAGE (p: 36 -> 48)
    // Heavy, rock-solid forward traversal down the center of the dimensional tunnel.
    // Zero corkscrewing, continuous FOV transition matching Quantum Lab entry.
    // -------------------------------------------------------------------------
    const t = (p - 36) / 12;
    const s = smoothstep(0, 1, t);

    _pos.x = 0;
    _pos.y = 3.60;
    _pos.z = THREE.MathUtils.lerp(-34.0, -96.0, s);

    roll = 0;
    fov = THREE.MathUtils.lerp(62, 66, s);

    _lookAt.set(
      0,
      THREE.MathUtils.lerp(3.80, 4.0, s),
      THREE.MathUtils.lerp(-55.0, QPU_CENTER_Z, s)
    );
  } else if (p < 76) {
    // -------------------------------------------------------------------------
    // 5. WORLD 2: QUANTUM RESEARCH LABORATORY (p: 48 -> 76)
    //
    // A COMPLETE WORLD EXPERIENCE.
    // ONE continuous, unified, sweeping traversal through the massive 72m circular facility.
    //
    // - Enters through the portal threshold into an immediate wide-angle reveal.
    // - Continuous forward momentum across the reflective metallic floor.
    // - Natural wide architectural curve traversing past workstations, structural columns,
    //   and glass computational walls.
    // - The giant golden Quantum Computer stands as an imposing, real physical landmark
    //   in the center of the chamber.
    // - Continuous C0/C1 boundary into Transition 2.
    // -------------------------------------------------------------------------
    const u = (p - 48) / 28; // Normalized world journey progress [0, 1]

    _pos.z = THREE.MathUtils.lerp(-96.0, -142.0, u);
    _pos.x = -Math.sin(u * Math.PI) * 2.8 + Math.sin(u * 2 * Math.PI) * 1.4;

    // Smooth continuous eye-level elevation (starts at 3.60, gentle rise across dais, ends at 3.60)
    const arcY = Math.sin(u * Math.PI) * 0.55;
    _pos.y = 3.60 + arcY;

    // Subtle cinematic banking matching the gentle architectural arc
    roll = -Math.sin(u * Math.PI) * 0.012;

    // Wide-angle composition: enters at 66, settles to 62 at perimeter (seamless continuity)
    fov = THREE.MathUtils.lerp(66, 62, smoothstep(0.25, 0.9, u));

    // Natural forward look-at:
    if (u < 0.65) {
      const sLook = u / 0.65;
      _lookAt.set(
        _pos.x * 0.15,
        THREE.MathUtils.lerp(4.0, 3.8, sLook),
        QPU_CENTER_Z
      );
    } else {
      const sLook = (u - 0.65) / 0.35;
      _lookAt.set(
        0,
        THREE.MathUtils.lerp(3.8, 3.2, sLook),
        THREE.MathUtils.lerp(QPU_CENTER_Z, -165.0, sLook)
      );
    }
  } else if (p < 82) {
    // -------------------------------------------------------------------------
    // 6. TRANSITION 2: SUBATOMIC SCALE TRANSFORMATION (p: 76 -> 82)
    //
    // Happens naturally AFTER the Quantum Lab has been experienced.
    // C0/C1 smooth connection between Quantum Lab perimeter and Atomic World.
    // -------------------------------------------------------------------------
    const u = (p - 76) / 6;
    const s = smoothstep(0, 1, u);

    _pos.x = 0;
    _pos.y = THREE.MathUtils.lerp(3.60, 2.80, s);
    _pos.z = THREE.MathUtils.lerp(-142.0, -164.0, s);

    roll = 0;
    // Continuous FOV from 62 to 64
    fov = THREE.MathUtils.lerp(62, 64, s);

    // Looking forward into the emerging subatomic realm (starts at 3.2/-165, smoothly reaches 2.6/-182)
    _lookAt.set(
      0,
      THREE.MathUtils.lerp(3.2, 2.6, s),
      THREE.MathUtils.lerp(-165.0, ATOMIC_CENTER_Z, s)
    );
  } else if (p < 94) {
    // -------------------------------------------------------------------------
    // 7. WORLD 3: ATOMIC WORLD (p: 82 -> 94)
    //
    // A COMPLETE SEPARATE WORLD.
    // ONE continuous, elegant traversal through the subatomic realm.
    // -------------------------------------------------------------------------
    const u = (p - 82) / 12; // Normalized atomic world progress [0, 1]

    _pos.z = THREE.MathUtils.lerp(-164.0, -190.0, u);
    _pos.x = Math.sin(u * Math.PI) * 1.5;
    _pos.y = THREE.MathUtils.lerp(2.80, 2.40, u);

    roll = Math.sin(u * Math.PI) * 0.014;
    // Smooth FOV from 64 to 58
    fov = THREE.MathUtils.lerp(64, 58, smoothstep(0, 1, u));

    _lookAt.set(
      0,
      THREE.MathUtils.lerp(2.6, 2.8, u),
      THREE.MathUtils.lerp(ATOMIC_CENTER_Z, -202.0, u)
    );
  } else if (p < 104) {
    // -------------------------------------------------------------------------
    // 8. TRANSITION 3: MOLECULAR / CHEMICAL COMPLEXITY TRANSITION (p: 94 -> 104)
    //
    // Subatomic wavefunctions synthesize into molecular bonds and macromolecules.
    // Seamless continuous connection from Atomic World into Cellular membrane threshold.
    // -------------------------------------------------------------------------
    const u = (p - 94) / 10; // Normalized transition progress [0, 1]
    const s = smoothstep(0, 1, u);

    _pos.x = Math.sin(u * Math.PI) * 0.8;
    _pos.y = THREE.MathUtils.lerp(2.40, 3.20, s);
    _pos.z = THREE.MathUtils.lerp(-190.0, -224.0, s);

    roll = -Math.sin(u * Math.PI) * 0.008;
    fov = THREE.MathUtils.lerp(58, 64, s);

    _lookAt.set(
      _pos.x * 0.4,
      THREE.MathUtils.lerp(2.8, 3.4, s),
      THREE.MathUtils.lerp(-202.0, -242.0, s)
    );
  } else if (p < 134) {
    // -------------------------------------------------------------------------
    // 9. WORLD 4: CELLULAR / LIFE WORLD (p: 104 -> 134)
    //
    // A COMPLETE LIVING BIOLOGICAL UNIVERSE.
    // ONE continuous, breathtaking traversal through the colossal microscopic architecture:
    // - Enters through the massive curved lipid bilayer membrane pore at Z = -224.
    // - Wide-angle grand reveal into the deep bioluminescent cytoplasm.
    // - Traversal through the ER transport labyrinth with glowing ribosomal complexes.
    // - Grand sweep past the towering Mitochondria energy factories.
    // - Landmark pass alongside the gigantic Nucleus, revealing the glowing DNA double helix inside.
    // - Traversal past the Golgi cisternae and directed vesicle streams toward the boundary.
    // -------------------------------------------------------------------------
    const u = (p - 104) / 30; // Normalized world journey progress [0, 1] (30 units!)

    _pos.z = THREE.MathUtils.lerp(-224.0, -355.0, u);
    _pos.x = -Math.sin(u * Math.PI) * 2.8 + Math.sin(u * 2 * Math.PI) * 1.5;

    // Smooth continuous eye-level elevation (soars through the 3D biological architecture)
    const arcY = Math.sin(u * Math.PI) * 1.4 + Math.sin(u * 3 * Math.PI) * 0.3;
    _pos.y = 3.20 + arcY;

    // Subtle cinematic banking matching the organic fluid curves (strictly <= 0.012)
    roll = -Math.sin(u * 2 * Math.PI) * 0.009;

    // Wide-angle composition: enters at 64, settles to 60 for monumental organelle vistas, then 62
    fov = THREE.MathUtils.lerp(64, 60, smoothstep(0.1, 0.45, u));
    if (u > 0.7) {
      fov = THREE.MathUtils.lerp(60, 62, smoothstep(0.7, 1.0, u));
    }

    // Natural forward look-at:
    if (u < 0.4) {
      // Early traversal: gaze forward past ER toward the majestic Nucleus landmark in distance
      const sLook = u / 0.4;
      _lookAt.set(
        _pos.x * 0.2 + THREE.MathUtils.lerp(0.5, 3.2, sLook),
        THREE.MathUtils.lerp(3.4, 4.0, sLook),
        THREE.MathUtils.lerp(-245.0, CELLULAR_NUCLEUS_Z, sLook)
      );
    } else if (u < 0.7) {
      // Mid traversal: sweep past flank of colossal Nucleus, gazing across nuclear pores & DNA helix
      const sLook = (u - 0.4) / 0.3;
      _lookAt.set(
        THREE.MathUtils.lerp(3.2, -1.5, sLook),
        THREE.MathUtils.lerp(4.0, 3.5, sLook),
        THREE.MathUtils.lerp(CELLULAR_NUCLEUS_Z, -325.0, sLook)
      );
    } else {
      // Late traversal: sweep forward past Golgi apparatus toward boundary reorganization
      const sLook = (u - 0.7) / 0.3;
      _lookAt.set(
        THREE.MathUtils.lerp(-1.5, 0, sLook),
        THREE.MathUtils.lerp(3.5, 3.4, sLook),
        THREE.MathUtils.lerp(-325.0, -370.0, sLook)
      );
    }
  } else if (p < 146) {
    // -------------------------------------------------------------------------
    // 10. TRANSITION 4: BIOLOGICAL / ORGANIC TRANSITION TO OCEAN (p: 134 -> 146)
    //
    // Leaves the cell interior through the distal membrane pore at Z = -355.
    // The biological fluid expands into the open aquatic column, pressure increases,
    // and the camera dives downward from Y = 3.20 to Y = -4.0 into oceanic pelagic depth.
    // -------------------------------------------------------------------------
    const u = (p - 134) / 12; // Normalized transition progress [0, 1]
    const s = smoothstep(0, 1, u);

    _pos.x = Math.sin(u * Math.PI) * 1.8;
    _pos.y = THREE.MathUtils.lerp(3.20, -4.0, s);
    _pos.z = THREE.MathUtils.lerp(-355.0, -395.0, s);

    roll = Math.sin(u * Math.PI) * 0.008;
    fov = THREE.MathUtils.lerp(62, 66, s);

    _lookAt.set(
      _pos.x * 0.3,
      THREE.MathUtils.lerp(3.4, -5.5, s),
      THREE.MathUtils.lerp(-370.0, -420.0, s)
    );
  } else if (p < 226) {
    // -------------------------------------------------------------------------
    // 11. WORLD 5: DEEP OCEAN, TRANSPARENT SURFACE & COASTAL LAND WORLD (p: 146 -> 226, 80 units!)
    //
    // A MONUMENTAL UNDERWATER-TO-LAND ODYSSEY:
    // 1. Abyss Exploration (146 -> 176): Pelagic entry, basalt trench, bioluminescence, vents, abyssal cavern.
    // 2. Canyon Portal Turn & Rapid Ascent (176 -> 188): Accelerating upward roller-coaster surge.
    // 3. Underwater Sky View & Ocean Life (188 -> 202): Looking up through transparent water at Sun, Clouds, and Sky,
    //    with fish schools, sleek sharks, and colossal blue whales under sunbeams.
    // 4. Continuous Surface Breakthrough (202 -> 206): Crosses Y = 6.0 water boundary into air without cuts.
    // 5. Open-Air Ocean & Coastline Reveal (206 -> 214): Vast horizon, waves, sun glitter, circling seabirds, distant coast.
    // 6. Shallow Water & Coastline Approach (214 -> 220): Turquoise shallows, sandy bottom, reefs, breaking surf.
    // 7. Beach Arrival & Crossing onto Land (220 -> 224): Glides onto sandy beach, dunes, palms, driftwood.
    // 8. Natural Geological Exit (224 -> 226): Enters arched sea cave carved into coastal cliff base.
    // -------------------------------------------------------------------------
    const u = (p - 146) / 80; // Normalized world journey progress [0, 1]

    if (u < 0.375) {
      // 1. Abyss Exploration (p: 146 -> 176, 30 units)
      const uSub = u / 0.375;
      _pos.z = THREE.MathUtils.lerp(-395.0, -550.0, uSub);
      _pos.x = Math.sin(uSub * Math.PI * 2) * 3.2 + Math.sin(uSub * Math.PI * 4) * 0.8;
      const baseDepth = THREE.MathUtils.lerp(-4.0, -21.0, uSub);
      const trenchDip = -Math.sin(uSub * Math.PI) * 2.5;
      _pos.y = baseDepth + trenchDip;

      roll = -Math.sin(uSub * Math.PI * 2) * 0.010;
      fov = THREE.MathUtils.lerp(64, 60, smoothstep(0, 0.3, uSub));

      _lookAt.set(
        _pos.x * 0.25,
        _pos.y - 1.4,
        THREE.MathUtils.lerp(-420.0, -565.0, uSub)
      );
    } else if (u < 0.525) {
      // 2. Canyon Portal Turn & Rapid Roller-Coaster Ascent (p: 176 -> 188, 12 units)
      const uSub = (u - 0.375) / 0.15;
      const s = smoothstep(0, 1, uSub);

      _pos.z = THREE.MathUtils.lerp(-550.0, -630.0, s);
      _pos.x = Math.sin(s * Math.PI) * 7.0;
      _pos.y = THREE.MathUtils.lerp(-21.0, 2.2, s);

      roll = Math.sin(s * Math.PI) * 0.012; // Bank gracefully into the ascent turn
      fov = THREE.MathUtils.lerp(60, 64, s);

      _lookAt.set(
        _pos.x * 0.4,
        _pos.y + THREE.MathUtils.lerp(2.5, 3.5, s),
        THREE.MathUtils.lerp(-570.0, -660.0, s)
      );
    } else if (u < 0.70) {
      // 3. Underwater Sky View, Transparent Ocean Surface & Marine Life (p: 188 -> 202, 14 units)
      // Camera is safely underwater at Y = 2.2 to 3.8 (below water level at Y = 6.0).
      // Angled upward looking directly through the transparent water at Sun, Clouds, and Blue Sky!
      const uSub = (u - 0.525) / 0.175;

      _pos.z = THREE.MathUtils.lerp(-630.0, -690.0, uSub);
      _pos.x = Math.sin(uSub * Math.PI * 2) * 4.2;
      _pos.y = 2.4 + Math.sin(uSub * Math.PI * 2) * 1.1;

      roll = Math.sin(uSub * Math.PI * 2) * 0.008;
      fov = 66;

      // Look upward and forward through the transparent ocean surface
      _lookAt.set(
        _pos.x * 0.35 + 1.2,
        _pos.y + 5.2,
        _pos.z - 28.0
      );
    } else if (u < 0.75) {
      // 4. Continuous Surface Breakthrough (p: 202 -> 206, 4 units)
      // Camera physically rises from Y = 3.5 through Y = 6.0 to Y = 7.6 into air!
      const uSub = (u - 0.70) / 0.05;
      const s = smoothstep(0, 1, uSub);

      _pos.z = THREE.MathUtils.lerp(-690.0, -715.0, s);
      _pos.x = Math.sin(s * Math.PI) * 2.5;
      _pos.y = THREE.MathUtils.lerp(3.5, 7.6, s);

      roll = Math.sin(s * Math.PI) * 0.006;
      fov = THREE.MathUtils.lerp(66, 64, s);

      // Pitch levels out smoothly from upward sky view to open-ocean horizon
      _lookAt.set(
        _pos.x * 0.25,
        THREE.MathUtils.lerp(_pos.y + 4.5, 9.5, s),
        _pos.z - 45.0
      );
    } else if (u < 0.875) {
      // 5. Open-Air Ocean & Active Volcano Reveal (p: 206 -> 216, 10 units)
      // Gliding across vast open ocean waves beneath radiant sun and clear sky,
      // revealing the spectacular, colossal active Mount Fuji volcano rising from the distant water!
      const uSub = (u - 0.75) / 0.125;

      _pos.z = THREE.MathUtils.lerp(-715.0, -810.0, uSub);
      _pos.x = Math.sin(uSub * Math.PI * 2) * 3.5;
      _pos.y = 8.6 + Math.sin(uSub * Math.PI * 2) * 0.35;

      roll = Math.sin(uSub * Math.PI * 2) * 0.006;
      fov = 65;

      // Frame the monumental volcano, glowing summit crater, and vast open-ocean horizon
      _lookAt.set(
        -35.0 * 0.20,
        24.0,
        -1060.0
      );
    } else {
      // 6. Volcano Approach & Dramatic Summit Ascent (p: 216 -> 226, 10 units)
      // Soaring from coastal waters and ascending the magnificent volcanic slope of Mount Fuji,
      // gaining altitude towards the monumental summit crater caldera and billowing ash plume!
      const uSub = (u - 0.875) / 0.125;
      const s = smoothstep(0, 1, uSub);

      _pos.z = THREE.MathUtils.lerp(-810.0, -1030.0, s);
      _pos.x = THREE.MathUtils.lerp(0.0, -35.0, s);
      _pos.y = THREE.MathUtils.lerp(8.6, 206.0, s);

      roll = -Math.sin(s * Math.PI) * 0.008;
      fov = THREE.MathUtils.lerp(65, 68, s);

      // Aim toward the majestic summit crater and rising volcanic plume
      _lookAt.set(
        -35.0,
        THREE.MathUtils.lerp(50.0, 185.0, s),
        THREE.MathUtils.lerp(-1060.0, -1060.0, s)
      );
    }
  } else if (p < 234) {
    // -------------------------------------------------------------------------
    // 12. STAGE 7: SUMMIT CRATER DESCENT INTO MAGMA CONDUIT (p: 226 -> 234, 8 units)
    //
    // Glides over the crater rim, gazing down into the churning molten caldera lake,
    // and plunges directly into the central volcanic conduit / magma throat!
    // -------------------------------------------------------------------------
    const u = (p - 226) / 8;
    const s = smoothstep(0, 1, u);

    _pos.x = THREE.MathUtils.lerp(-35.0, -28.0, s);
    _pos.y = THREE.MathUtils.lerp(206.0, 85.0, s);
    _pos.z = THREE.MathUtils.lerp(-1030.0, -1066.0, s);

    roll = Math.sin(s * Math.PI) * 0.005;
    fov = THREE.MathUtils.lerp(68, 70, s);

    // Look downward into the volcanic throat during the plunge
    _lookAt.set(
      THREE.MathUtils.lerp(-35.0, -15.0, s),
      THREE.MathUtils.lerp(175.0, 50.0, s),
      THREE.MathUtils.lerp(-1060.0, -1090.0, s)
    );
  } else if (p < 246) {
    // -------------------------------------------------------------------------
    // 13. STAGE 7: SUBTERRANEAN LAVA TUNNEL TO PREHISTORIC EARTH (p: 234 -> 246, 12 units)
    //
    // Navigates the interior volcanic lava tunnel curving from under the crater
    // down to the grand natural rock arch opening at Prehistoric Earth.
    // At p = 246 (Z = -1115): THE SIGNATURE COMPOSITION:
    // - Natural rock arch framing the upper vista
    // - Foreground left: Hero Triceratops on mossy bluff overlooking valley
    // - Center: Crystal turquoise river with rapids & river boulders
    // - Right: Colossal multi-tiered cascading waterfalls with rising mist
    // - Far valley: Wading Brachiosaurus & soaring Pterosaurs in golden sunlight
    // -------------------------------------------------------------------------
    const u = (p - 234) / 12;
    const s = smoothstep(0, 1, u);

    _pos.x = THREE.MathUtils.lerp(-28.0, 0.0, s);
    _pos.y = THREE.MathUtils.lerp(85.0, 14.0, s);
    _pos.z = THREE.MathUtils.lerp(-1066.0, -1106.0, s);

    roll = -Math.sin(s * Math.PI) * 0.004;
    fov = THREE.MathUtils.lerp(70, 70, s);

    _lookAt.set(
      THREE.MathUtils.lerp(-15.0, 4.0, s),
      THREE.MathUtils.lerp(50.0, 11.5, s),
      THREE.MathUtils.lerp(-1090.0, -1185.0, s)
    );
  } else if (p < 260) {
    // -------------------------------------------------------------------------
    // 14. STAGE 7: EMERGING INTO THE SUNLIT PREHISTORIC VALLEY (p: 246 -> 260, 14 units)
    //
    // Glides out past the monumental cave arch into the open ancient paradise.
    // Sweeps along the turquoise river between the waterfalls and the T-Rex promontory,
    // approaching the colossal Brachiosaurus herd.
    // -------------------------------------------------------------------------
    const u = (p - 246) / 14;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1106.0, -1260.0, s);
    _pos.x = THREE.MathUtils.lerp(0.0, 12.0, s) + Math.sin(u * Math.PI) * 2.2;
    _pos.y = THREE.MathUtils.lerp(14.0, 11.0, s);

    roll = Math.sin(s * Math.PI) * 0.005;
    fov = THREE.MathUtils.lerp(72, 65, s);

    _lookAt.set(
      14.0,
      10.5,
      _pos.z - 80.0
    );
  } else if (p < 274) {
    // -------------------------------------------------------------------------
    // 15. STAGE 7: COLOSSAL HERBIVORE BASIN — BRACHIOSAURUS & STEGOSAURUS (p: 260 -> 274, 14 units)
    //
    // River valley opens into wide sauropod basin; Stegosaurus along riverbanks.
    // -------------------------------------------------------------------------
    const u = (p - 260) / 14;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1260.0, -1400.0, s);
    _pos.x = THREE.MathUtils.lerp(12.0, -12.0, s) + Math.sin(u * Math.PI * 2) * 2.8;
    _pos.y = THREE.MathUtils.lerp(11.0, 10.2, s);

    roll = -Math.sin(s * Math.PI) * 0.005;
    fov = 65;

    _lookAt.set(
      _pos.x * 0.4 + 10.0,
      12.0,
      _pos.z - 85.0
    );
  } else if (p < 286) {
    // -------------------------------------------------------------------------
    // 16. STAGE 7: TRICERATOPS SAVANNAH & SOARING PTEROSAURS (p: 274 -> 286, 12 units)
    //
    // Sunlit fern clearing with grazing Triceratops; Pterosaurs circling overhead.
    // -------------------------------------------------------------------------
    const u = (p - 274) / 12;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1400.0, -1550.0, s);
    _pos.x = THREE.MathUtils.lerp(-12.0, 18.0, s) + Math.sin(u * Math.PI * 2) * 2.5;
    _pos.y = THREE.MathUtils.lerp(10.2, 12.0, s);

    roll = Math.sin(s * Math.PI) * 0.005;
    fov = 64;

    _lookAt.set(
      _pos.x * 0.4,
      12.5,
      _pos.z - 85.0
    );
  } else if (p < 298) {
    // -------------------------------------------------------------------------
    // 17. TRANSITION 6: VIA APPIA IMPERIAL ROAD (p: 286 -> 298, 12 units)
    //
    // Primeval rainforest converges into an ancient paved Roman flagstone road,
    // bordered by Italian cypress trees, stone milestones, and approaching
    // the monumental triumphal gateway into Imperial Rome.
    // -------------------------------------------------------------------------
    const u = (p - 286) / 12;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1550.0, -1805.0, s);
    _pos.x = THREE.MathUtils.lerp(18.0, 0.3, s);
    _pos.y = THREE.MathUtils.lerp(12.0, 3.4, s);

    roll = -Math.sin(s * Math.PI) * 0.004;
    fov = THREE.MathUtils.lerp(64, 70, s);

    _lookAt.set(
      0.0,
      12.0,
      _pos.z - 80.0
    );
  } else if (p < 314) {
    // -------------------------------------------------------------------------
    // 18. STAGE 8: ANCIENT ROME — VIA SACRA MARKETPLACE & FOUNTAIN (p: 298 -> 314, 16 units)
    //
    // THE EXACT REFERENCE IMAGE SIGNATURE COMPOSITION:
    // - Wide-angle street level view on broad cobblestone avenue
    // - Right foreground: Classical tiered marble fountain with spouting water jets
    // - Left foreground: Towering Corinthian colonnade with crimson SPQR banners
    // - Flanking both sides: Bustling marketplace stalls with crimson/ochre awnings
    // - Street filled with Roman citizens in togas and legionaries in armor
    // - Distant center: Grand Temple of Jupiter on elevated Capitoline staircase
    // -------------------------------------------------------------------------
    const u = (p - 298) / 16;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1805.0, -1920.0, s);
    _pos.x = THREE.MathUtils.lerp(0.3, -0.6, s) + Math.sin(u * Math.PI * 2) * 0.35;
    _pos.y = 3.3 + Math.sin(u * Math.PI * 4) * 0.04; // subtle natural walking bob

    roll = Math.sin(u * Math.PI * 2) * 0.003;
    fov = 70; // Wide-angle cinematic lens matching reference

    _lookAt.set(
      0.0,
      18.0,
      -2300.0 // Gaze directly towards the monumental Grand Temple in the distance
    );
  } else if (p < 332) {
    // -------------------------------------------------------------------------
    // 19. STAGE 8: MID-AVENUE — COLOSSEUM & AQUEDUCT SKYLINE (p: 314 -> 332, 18 units)
    //
    // Sweeping further down the Via Sacra:
    // - Right side: Monumental Colosseum / Flavian Amphitheatre curving above insulae
    // - Left distant hills: Double-tiered Roman Aqueduct marching across the landscape
    // - Italian cypresses lining hillside terraces
    // - Passing fruit carts, amphorae, and marching Roman legionaries
    // -------------------------------------------------------------------------
    const u = (p - 314) / 18;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-1920.0, -2030.0, s);
    _pos.x = THREE.MathUtils.lerp(-0.6, 0.0, s) + Math.sin(u * Math.PI) * 0.3;
    _pos.y = 3.3 + Math.sin(u * Math.PI * 4) * 0.04;

    roll = -Math.sin(u * Math.PI) * 0.003;
    fov = 68;

    _lookAt.set(0.0, 22.0, -2300.0);
  } else if (p < 336) {
    // -------------------------------------------------------------------------
    // 20. STAGE 8: CAPITOLINE FORUM PLAZA & STAIRCASE ALIGNMENT (p: 332 -> 336, 4 units)
    //
    // Approaching the foot of the monumental Capitoline staircase:
    // - Wide forum cobblestone pavement meeting the bottom marble step at Y = 0.28
    // - Zero gap beneath the stairs — structurally rooted in solid ashlar stone foundation
    // - Flanked by heroic Roman statue plinths at X = ±22.6m
    // - Camera aligns precisely with the center axis (X = 0)
    // -------------------------------------------------------------------------
    const u = (p - 332) / 4;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2030.0, -2070.0, s);
    _pos.x = 0.0;
    _pos.y = THREE.MathUtils.lerp(3.3, 2.4, s);

    roll = 0;
    fov = 66;

    _lookAt.set(
      0.0,
      THREE.MathUtils.lerp(22.0, 26.0, s),
      -2250.0
    );
  } else if (p < 354) {
    // -------------------------------------------------------------------------
    // 21. STAGE 8: PHYSICAL ASCENT OF THE 55 MARBLE STEPS (p: 336 -> 354, 18 units)
    //
    // Camera physically climbs the grand staircase step-by-step:
    // - Starts at bottom step (Z = -2070, Y = 0.28)
    // - Climbs smoothly along the 11.3° incline up to the upper terrace (Z = -2180, Y = 22.0)
    // - Camera height precisely matches the stair surface (eye level 2.2m above physical steps)
    // - Solid retaining walls and balustrades flank the climb on both sides
    // -------------------------------------------------------------------------
    const u = (p - 336) / 18;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2070.0, -2180.0, s);
    _pos.x = 0.0;
    // Step height at any s is s * 22.0; camera eye level is 2.2m above tread
    _pos.y = THREE.MathUtils.lerp(2.4, 24.2, s) + Math.sin(u * Math.PI * 18) * 0.035;

    roll = 0;
    fov = THREE.MathUtils.lerp(66, 64, s);

    _lookAt.set(
      0.0,
      THREE.MathUtils.lerp(26.0, 30.0, s),
      _pos.z - 45.0
    );
  } else if (p < 358) {
    // -------------------------------------------------------------------------
    // 22. STAGE 8: UPPER LANDING TERRACE (PRONAOS) & COLONNADE (p: 354 -> 358, 4 units)
    //
    // Arriving onto the elevated marble portico terrace (Y = 22.0):
    // - Camera passes through the 22m-tall octastyle Corinthian columns
    // - Polished marble terrace extends towards the open monumental portal at Z = -2212
    // - Massive bronze doors swung wide open reveal the warm interior sanctuary
    // -------------------------------------------------------------------------
    const u = (p - 354) / 4;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2180.0, -2212.0, s);
    _pos.x = 0.0;
    _pos.y = 24.2 + Math.sin(u * Math.PI * 4) * 0.03;

    roll = 0;
    fov = 64;

    _lookAt.set(
      0.0,
      26.0,
      -2260.0
    );
  } else if (p < 364) {
    // -------------------------------------------------------------------------
    // 23. STAGE 8: CROSSING PORTAL INTO 3D SANCTUARY CHAMBER (p: 358 -> 364, 6 units)
    //
    // Camera physically passes through the 8m x 13m open portal into the Cella:
    // - 100% real 3D interior architecture (marble floor, crimson walls, coffered ceiling)
    // - Interior fluted Corinthian colonnade and flaming bronze braziers
    // - The exterior Roman city is completely occluded by the solid sanctuary walls
    // - Ahead glows the celestial Imperial Dimensional Rift at Z = -2262
    // -------------------------------------------------------------------------
    const u = (p - 358) / 6;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2212.0, -2258.0, s);
    _pos.x = 0.0;
    _pos.y = 24.2;

    roll = 0;
    fov = THREE.MathUtils.lerp(64, 60, s);

    _lookAt.set(
      0.0,
      27.5,
      -2264.0
    );
  } else if (p < 376) {
    // -------------------------------------------------------------------------
    // 24. TRANSITION 7: CELESTIAL RIFT INTO CYBERNETIC FRONTIER (p: 364 -> 376, 12 units)
    //
    // Inside the enclosed temple cella, camera glides into the radiant celestial rift
    // and emerges smoothly onto the futuristic cybernetic spaceport promenade.
    // -------------------------------------------------------------------------
    const u = (p - 364) / 12;
    fadeOpacity = Math.sin(u * Math.PI);
    roll = 0;

    if (u < 0.5) {
      const subT = u * 2;
      const s = smoothstep(0, 1, subT);
      _pos.set(0, THREE.MathUtils.lerp(24.2, 27.5, s), THREE.MathUtils.lerp(-2258.0, -2262.0, s));
      _lookAt.set(0, 27.5, -2272.0);
      fov = THREE.MathUtils.lerp(60, 56, s);
    } else {
      const subT = (u - 0.5) * 2;
      const s = smoothstep(0, 1, subT);
      _pos.set(0, THREE.MathUtils.lerp(4.5, 3.6, s), THREE.MathUtils.lerp(-2470.0, -2500.0, s));
      _lookAt.set(0, 16.0, -2850.0);
      fov = THREE.MathUtils.lerp(56, 72, s);
    }
  } else if (p < 396) {
    // -------------------------------------------------------------------------
    // 25. STAGE 9: CYBERNETIC PROMENADE & DHRUV AI LAB REVEAL (p: 376 -> 396, 20 units)
    //
    // THE EXACT REFERENCE IMAGE SIGNATURE COMPOSITION:
    // - Wide-angle street level view on broad wet reflective composite avenue
    // - Foreground lone cybernetic protagonist in trench coat with glowing amber spine
    // - Left foreground: Monumental Commander Statue on pedestal, multi-story glass tower,
    //   and towering glowing cyan DHRUV AI LAB holographic billboard with humanoid AI face
    // - Flanking both sides: Terraced gardens with pink cherry blossom trees & waterfalls
    // - Overhead: Curving maglev monorails with animated bullet trains
    // - Distant center: Monumental circular cyan energy ring gateway
    // - Right horizon: Colossal Blue Planet, Orbital Space Station, and Spiral Galaxy
    // -------------------------------------------------------------------------
    const u = (p - 376) / 20;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2495.0, -2620.0, s);
    _pos.x = Math.sin(u * Math.PI) * 0.25;
    _pos.y = 3.6 + Math.sin(u * Math.PI * 4) * 0.035;

    roll = 0;
    fov = 74; // Wide-angle cinematic lens matching reference

    _lookAt.set(
      THREE.MathUtils.lerp(5.0, 1.5, s),
      THREE.MathUtils.lerp(16.5, 16.0, s),
      -2850.0
    );
  } else if (p < 412) {
    // -------------------------------------------------------------------------
    // 26. STAGE 9: COMMERCIAL DISTRICT & MID-AVENUE TRANSIT (p: 396 -> 412, 16 units)
    //
    // Traversing between towering cyberpunk skyscrapers:
    // - Passing rotating 3D holographic hypercubes and pedestrian terraces
    // - Maglev trains gliding overhead across elevated guideways
    // - Deepening vista toward the glowing ring gateway and colossal planet
    // -------------------------------------------------------------------------
    const u = (p - 396) / 16;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2620.0, -2750.0, s);
    _pos.x = -Math.sin(u * Math.PI) * 0.35;
    _pos.y = 3.6 + Math.sin(u * Math.PI * 4) * 0.03;

    roll = 0;
    fov = 70;

    _lookAt.set(0.0, 16.0, -2850.0);
  } else if (p < 424) {
    // -------------------------------------------------------------------------
    // 27. STAGE 9: APPROACHING THE MONUMENTAL RING GATEWAY (p: 412 -> 424, 12 units)
    //
    // Arriving at the broad Gateway Plaza:
    // - Rising smoothly towards the center of the massive circular cyan energy ring
    // - Counter-rotating runic rings and pulsing plasma event horizon
    // -------------------------------------------------------------------------
    const u = (p - 412) / 12;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2750.0, -2835.0, s);
    _pos.x = 0.0;
    _pos.y = THREE.MathUtils.lerp(3.6, 16.0, s);

    roll = 0;
    fov = THREE.MathUtils.lerp(70, 66, s);

    _lookAt.set(0.0, 16.0, -3100.0);
  } else if (p < 434) {
    // -------------------------------------------------------------------------
    // 28. STAGE 9: PASSING THROUGH GATEWAY ONTO ORBITAL SPACEPORT (p: 424 -> 434, 10 units)
    //
    // Camera physically passes through the center of the cyan energy ring at Z = -2850:
    // - Emerges onto the open cantilevered Orbital Departure Deck (Y = 19.2)
    // - Unobstructed panoramic view of the Colossal Planet, Space Station & Galaxy
    // -------------------------------------------------------------------------
    const u = (p - 424) / 10;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-2835.0, -3050.0, s);
    _pos.x = 0.0;
    _pos.y = THREE.MathUtils.lerp(16.0, 19.2, s);

    roll = 0;
    fov = THREE.MathUtils.lerp(66, 74, s);

    _lookAt.set(
      THREE.MathUtils.lerp(0.0, 80.0, s),
      THREE.MathUtils.lerp(16.0, 120.0, s),
      -3800.0
    );
  } else if (p < 444) {
    // -------------------------------------------------------------------------
    // 29. STAGE 9: ORBITAL SPACE LAUNCH & DEEP SPACE CRUISE (p: 434 -> 444, 10 units)
    //
    // Gliding off the launch deck into the breathtaking ultra-wide cosmic panorama:
    // - Lower-left: Colossal Blue Earth-like world with golden sunrise starburst
    // - Upper-left: Massive banded Jupiter-like gas giant with orbiting moon
    // - Upper-right: Majestic Hero Milky Way spiral galaxy
    // - Mid-right: Saturn-like ringed gas giant
    // - Lower-right: 3D curving asteroid field
    // -------------------------------------------------------------------------
    const u = (p - 434) / 10;
    const s = smoothstep(0, 1, u);

    _pos.z = THREE.MathUtils.lerp(-3050.0, -3360.0, s);
    _pos.x = THREE.MathUtils.lerp(0.0, 42.0, s);
    _pos.y = THREE.MathUtils.lerp(19.2, 65.0, s);

    roll = -Math.sin(s * Math.PI) * 0.005;
    fov = THREE.MathUtils.lerp(74, 80, s); // Ultra-wide cinematic field of view matching reference

    _lookAt.set(
      THREE.MathUtils.lerp(80.0, 120.0, s),
      THREE.MathUtils.lerp(120.0, 200.0, s),
      -4200.0
    );
  } else {
    // -------------------------------------------------------------------------
    // 30. TRANSITION 8: COSMIC HYPERDRIVE LOOP RETURN (p: 444 -> 450, 6 units)
    //
    // Accelerates into a cosmic hyperdrive vortex in deep space,
    // seamlessly returning to the Dragon Fortress at p = 0 / 450.
    // -------------------------------------------------------------------------
    const u = (p - 444) / 6;
    fadeOpacity = Math.sin(u * Math.PI);
    roll = 0;

    if (u < 0.5) {
      const subT = u * 2;
      const s = smoothstep(0, 1, subT);
      _pos.set(
        THREE.MathUtils.lerp(42.0, 55.0, s),
        THREE.MathUtils.lerp(65.0, 80.0, s),
        THREE.MathUtils.lerp(-3360.0, -3480.0, s)
      );
      _lookAt.set(160.0, 220.0, -4300.0);
      fov = THREE.MathUtils.lerp(80, 56, s);
    } else {
      const subT = (u - 0.5) * 2;
      const s = smoothstep(0, 1, subT);
      _pos.set(0, THREE.MathUtils.lerp(3.50, 3.60, s), THREE.MathUtils.lerp(14.0, 12.0, s));
      _lookAt.set(0, 4.8, -35.0);
      fov = 56;
    }
  }

  // Compute camera Up vector with dynamic roll/banking
  _forward.subVectors(_lookAt, _pos).normalize();
  _right.crossVectors(_forward, _up).normalize();

  if (Math.abs(roll) > 0.0001) {
    _rotMat.makeRotationAxis(_forward, roll);
    _up.set(0, 1, 0).applyMatrix4(_rotMat);
  } else {
    _up.set(0, 1, 0);
  }

  _result.roll = roll;
  _result.fov = fov;
  _result.fadeOpacity = fadeOpacity;
  return _result;
}
