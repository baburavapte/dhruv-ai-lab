"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import ProfessionalHome from "@/components/portfolio/ProfessionalHome";
import {
  setPhase,
  onPhaseChange,
} from "@/lib/portfolioState";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-center bg-[#06050a] px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e0531c] opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#e0531c]" />
        </div>
        <span className="font-mono text-xs tracking-[0.3em] text-[#eae4d9] uppercase">
          Entering DHRUV AI LAB...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  // Track whether the 3D scene has ever been activated (once true, stays true — never unmount)
  const [worldMounted, setWorldMounted] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(true);

  // Check URL parameters for direct deep-linking on client mount (safe after hydration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasProgress =
      params.get("progress") !== null ||
      params.get("mode") === "3d" ||
      window.location.hash.includes("progress");

    if (hasProgress) {
      const timer = setTimeout(() => {
        setWorldMounted(true);
        setShowPortfolio(false);
        setPhase("WORLD_ACTIVE");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle transition from portfolio → world
  const handleEnterWorld = useCallback(() => {
    setWorldMounted(true);
    // Small delay for the fade animation to begin before showing the 3D scene
    setTimeout(() => {
      setShowPortfolio(false);
    }, 200);
  }, []);

  // Listen for backward navigation from the 3D world
  useEffect(() => {
    const handleReturnToPortfolio = () => {
      setPhase("EXITING_WORLD");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      // Show portfolio with fade-in
      setTimeout(() => {
        setShowPortfolio(true);
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

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#06050a]">
      <h1 className="sr-only">
        Dhruv Sukhadiya — AI Engineer Portfolio &amp; Interactive 3D Experience
      </h1>

      {/* 3D World — mounted once, never unmounted */}
      {worldMounted && (
        <div
          className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden"
          style={{
            opacity: showPortfolio ? 0 : 1,
            transition: "opacity 0.8s ease-in-out",
            pointerEvents: showPortfolio ? "none" : "auto",
          }}
        >
          <Scene />
        </div>
      )}

      {/* Professional Portfolio — outer experience layer */}
      {showPortfolio && <ProfessionalHome onEnterWorld={handleEnterWorld} />}
    </main>
  );
}

