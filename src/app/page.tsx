"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ProfessionalHome from "@/components/portfolio/ProfessionalHome";
import CinematicCloudTransition from "@/components/transitions/CinematicCloudTransition";
import {
  setPhase,
  onPhaseChange,
} from "@/lib/portfolioState";

// Dynamic import with clean null fallback to prevent any DOM flash
const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export type EntranceState =
  | "IDLE"
  | "PREPARING_WORLD"
  | "CLOUDS_COVERING"
  | "WORLD_REVEAL"
  | "ENTERED";

export default function Home() {
  // Authoritative Entrance State Machine
  const [entranceState, setEntranceState] = useState<EntranceState>("IDLE");
  const entranceLockRef = useRef(false);

  // World readiness tracking
  const [worldMounted, setWorldMounted] = useState(false);
  const [isWorldReady, setIsWorldReady] = useState(false);

  // Visual visibility layers
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [cloudTransitionActive, setCloudTransitionActive] = useState(false);

  // Background pre-warming of 3D Scene after initial hydration
  // Compiles shaders, textures & geometry before user even clicks the button
  useEffect(() => {
    const timer = setTimeout(() => {
      setWorldMounted(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Listen for 3D world ready signal from Scene.tsx
  useEffect(() => {
    const handleThreeReady = () => {
      setIsWorldReady(true);
    };

    if (
      typeof window !== "undefined" &&
      Boolean((window as unknown as { __threeWorldReady?: boolean }).__threeWorldReady)
    ) {
      setIsWorldReady(true);
    }

    window.addEventListener("threeWorldReady", handleThreeReady);
    return () => window.removeEventListener("threeWorldReady", handleThreeReady);
  }, []);

  // Check URL parameters for direct deep-linking on client mount (safe after hydration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasProgress =
      params.get("progress") !== null ||
      params.get("mode") === "3d" ||
      window.location.hash.includes("progress");

    if (hasProgress) {
      entranceLockRef.current = true;
      setEntranceState("ENTERED");
      setWorldMounted(true);
      setShowPortfolio(false);
      setPhase("WORLD_ACTIVE");
    }
  }, []);

  // Handle single-click entrance: IDLE -> CLOUDS_COVERING
  const handleStartEntranceSequence = useCallback(() => {
    // Synchronous lock: guarantees duplicate clicks can NEVER trigger multiple sequences
    if (entranceLockRef.current) return;
    entranceLockRef.current = true;

    setEntranceState("CLOUDS_COVERING");
    setCloudTransitionActive(true);
    setWorldMounted(true); // Ensure 3D scene is mounted
  }, []);

  // Phase C: Handshake behind full cloud blanket (screen 100% covered)
  const handleCloudCoverComplete = useCallback(() => {
    // Hide landing page behind the clouds — will not reappear
    setShowPortfolio(false);
    setPhase("WORLD_ACTIVE");

    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { __setWorldProgress?: (v: number) => void }).__setWorldProgress === "function"
    ) {
      (window as unknown as { __setWorldProgress: (v: number) => void }).__setWorldProgress(0);
    }

    setEntranceState("WORLD_REVEAL");
  }, []);

  // Phase D complete: Clouds have drifted away, world exploration begins
  const handleCloudRevealComplete = useCallback(() => {
    setCloudTransitionActive(false);
    setEntranceState("ENTERED");
  }, []);

  // Listen for backward navigation from the 3D world
  useEffect(() => {
    const handleReturnToPortfolio = () => {
      setPhase("EXITING_WORLD");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      // Show portfolio with fade-in and release lock for re-entry
      setTimeout(() => {
        setShowPortfolio(true);
        entranceLockRef.current = false;
        setEntranceState("IDLE");
        setPhase("PROFESSIONAL_HOME");
      }, 600);
    };

    window.addEventListener("returnToPortfolio", handleReturnToPortfolio);
    return () =>
      window.removeEventListener("returnToPortfolio", handleReturnToPortfolio);
  }, []);

  // Listen to phase changes to sync visibility
  useEffect(() => {
    const unsub = onPhaseChange((phase) => {
      if (phase === "WORLD_ACTIVE") {
        setShowPortfolio(false);
      }
    });
    return unsub;
  }, []);

  const isEntering = entranceState !== "IDLE" && entranceState !== "ENTERED";

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#06050a]">
      <h1 className="sr-only">
        Dhruv Sukhadiya — AI Engineer Portfolio &amp; Interactive 3D Experience
      </h1>

      {/* 3D World — mounted once, pre-warmed in background, never unmounted */}
      {worldMounted && (
        <div
          className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden"
          style={{
            opacity: showPortfolio ? 0 : 1,
            transition: "opacity 0.6s ease-in-out",
            pointerEvents: showPortfolio ? "none" : "auto",
            touchAction: "none",
          }}
        >
          <Scene onReady={() => setIsWorldReady(true)} />
        </div>
      )}

      {/* Professional Portfolio — outer experience layer */}
      {showPortfolio && (
        <ProfessionalHome
          onEnterWorld={handleStartEntranceSequence}
          isEnteringWorld={isEntering}
        />
      )}

      {/* Clash of Clans-inspired Cinematic Cloud Transition */}
      <CinematicCloudTransition
        isActive={cloudTransitionActive}
        isWorldReady={isWorldReady}
        onCoverComplete={handleCloudCoverComplete}
        onRevealComplete={handleCloudRevealComplete}
      />
    </main>
  );
}
