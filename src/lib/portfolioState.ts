// ============================================================================
// PORTFOLIO ↔ 3D WORLD TRANSITION STATE
// Centralized state management for the professional page / world boundary.
// Uses a global mutable object — NO React state, NO per-frame GC.
// ============================================================================

export type PortfolioPhase =
  | "PROFESSIONAL_HOME" // Portfolio visible, 3D hidden
  | "READY_TO_ENTER" // Two ArrowDown presses registered
  | "ENTERING_WORLD" // Cinematic transition playing
  | "WORLD_ACTIVE" // 3D world visible, portfolio hidden
  | "EXITING_WORLD"; // Returning from world to portfolio

export interface PortfolioTransitionState {
  phase: PortfolioPhase;
  transitionProgress: number; // 0 → 1 during transitions
  arrowDownCount: number;
  lastArrowDownTime: number;
  arrowUpHoldStart: number;
  sequenceWindowStart: number;
}

// Global singleton — mutated directly, never triggers React renders
export const portfolioTransition: PortfolioTransitionState = {
  phase: "PROFESSIONAL_HOME",
  transitionProgress: 0,
  arrowDownCount: 0,
  lastArrowDownTime: 0,
  arrowUpHoldStart: 0,
  sequenceWindowStart: 0,
};

// Configuration
const SEQUENCE_WINDOW_MS = 4000; // Max time between first ArrowDown and ArrowUp hold
const ARROW_UP_HOLD_MS = 750; // How long to hold ArrowUp to trigger entry

// Listeners for phase changes
type PhaseListener = (phase: PortfolioPhase, progress: number) => void;
const listeners: PhaseListener[] = [];

export function onPhaseChange(fn: PhaseListener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  for (let i = 0; i < listeners.length; i++) {
    listeners[i](portfolioTransition.phase, portfolioTransition.transitionProgress);
  }
}

export function setPhase(phase: PortfolioPhase, progress: number = 0) {
  portfolioTransition.phase = phase;
  portfolioTransition.transitionProgress = progress;
  notifyListeners();
}

export function resetSequence() {
  portfolioTransition.arrowDownCount = 0;
  portfolioTransition.lastArrowDownTime = 0;
  portfolioTransition.arrowUpHoldStart = 0;
  portfolioTransition.sequenceWindowStart = 0;
}

/**
 * Handle keydown events for the hidden easter-egg sequence.
 * Called from the portfolio page's key handler.
 * Returns true if the event should be consumed (preventDefault).
 */
export function handlePortfolioKeyDown(key: string, now: number): boolean {
  const state = portfolioTransition;

  // Only process in PROFESSIONAL_HOME or READY_TO_ENTER
  if (state.phase !== "PROFESSIONAL_HOME" && state.phase !== "READY_TO_ENTER") {
    return false;
  }

  if (key === "ArrowDown") {
    // Check if we're still within the sequence window
    if (state.arrowDownCount > 0 && now - state.sequenceWindowStart > SEQUENCE_WINDOW_MS) {
      // Window expired, restart
      resetSequence();
    }

    if (state.arrowDownCount === 0) {
      state.sequenceWindowStart = now;
    }

    state.arrowDownCount++;
    state.lastArrowDownTime = now;

    if (state.arrowDownCount >= 2) {
      setPhase("READY_TO_ENTER");
    }

    return true;
  }

  if (key === "ArrowUp" && state.phase === "READY_TO_ENTER") {
    // Check sequence window
    if (now - state.sequenceWindowStart > SEQUENCE_WINDOW_MS) {
      resetSequence();
      setPhase("PROFESSIONAL_HOME");
      return true;
    }

    if (state.arrowUpHoldStart === 0) {
      state.arrowUpHoldStart = now;
    }
    return true;
  }

  // Any non-arrow key resets the sequence
  if (key !== "ArrowUp" && key !== "ArrowDown") {
    if (state.phase === "READY_TO_ENTER") {
      resetSequence();
      setPhase("PROFESSIONAL_HOME");
    }
  }

  return false;
}

/**
 * Handle keyup events. Resets ArrowUp hold tracking.
 */
export function handlePortfolioKeyUp(key: string): boolean {
  if (key === "ArrowUp") {
    portfolioTransition.arrowUpHoldStart = 0;
    return true;
  }
  return false;
}

/**
 * Called on a requestAnimationFrame tick to check if ArrowUp has been held long enough.
 * Returns true when the transition should trigger.
 */
export function checkArrowUpHold(now: number): boolean {
  const state = portfolioTransition;

  if (state.phase !== "READY_TO_ENTER" || state.arrowUpHoldStart === 0) {
    return false;
  }

  // Check if sequence window expired
  if (now - state.sequenceWindowStart > SEQUENCE_WINDOW_MS) {
    resetSequence();
    setPhase("PROFESSIONAL_HOME");
    return false;
  }

  const holdDuration = now - state.arrowUpHoldStart;

  if (holdDuration >= ARROW_UP_HOLD_MS) {
    // Trigger the entry transition
    resetSequence();
    setPhase("ENTERING_WORLD");
    return true;
  }

  return false;
}

/**
 * Trigger exit from 3D world back to professional page.
 * Called when camera reaches the boundary.
 */
export function triggerExitToPortfolio() {
  setPhase("EXITING_WORLD");
  // The transition animation will call setPhase("PROFESSIONAL_HOME") when complete.
}
