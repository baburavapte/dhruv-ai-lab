"use client";

import React, { useState } from "react";

interface StepBeyondButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * StepBeyondButton — Fantasy gothic entrance button styled with the subtle dark maroon
 * and antique gold palette complementing the volcanic fortress and AI sanctum:
 *
 * MAIN MAROON: #3B1018
 * SECONDARY MAROON: #581923
 * DEEP SHADOW: #180609
 * DARK CRIMSON GLOW: #8B2635
 * ANTIQUE GOLD: #A87545
 * WARM IVORY TEXT: #F5E6D0
 * LAVA ORANGE ACCENT: #FF6A24
 */
export default function StepBeyondButton({
  onClick,
  disabled = false,
}: StepBeyondButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isPressed) return;
    setIsPressed(true);
    e.currentTarget.disabled = true;
    onClick();
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-auto select-none"
      style={{
        bottom: "calc(clamp(1.25rem, 3.2vh, 2.25rem) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPressed}
        aria-label="Step Beyond Reality — Enter the 3D Universe"
        className="group relative flex items-center justify-center px-6 sm:px-9 py-3 sm:py-3.5 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          background:
            "linear-gradient(135deg, rgba(88, 25, 35, 0.95) 0%, rgba(59, 16, 24, 0.98) 50%, rgba(24, 6, 9, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(168, 117, 69, 0.55)",
          borderRadius: "12px",
          boxShadow: isPressed
            ? "0 0 50px rgba(255, 106, 36, 0.55), 0 0 30px rgba(139, 38, 53, 0.8), inset 0 0 15px rgba(245, 230, 208, 0.3)"
            : "0 0 24px rgba(139, 38, 53, 0.42), 0 0 45px rgba(255, 106, 36, 0.16), inset 0 1px 0 rgba(245, 230, 208, 0.28), 0 8px 32px rgba(24, 6, 9, 0.88)",
          animation: "maroonMagicalBreathing 3.6s ease-in-out infinite",
        }}
      >
        {/* Outer decorative antique-gold corner brackets */}
        <span
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none transition-colors duration-300"
          style={{ borderColor: "rgba(168, 117, 69, 0.9)" }}
          aria-hidden="true"
        />
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 pointer-events-none transition-colors duration-300"
          style={{ borderColor: "rgba(168, 117, 69, 0.9)" }}
          aria-hidden="true"
        />
        <span
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 pointer-events-none transition-colors duration-300"
          style={{ borderColor: "rgba(168, 117, 69, 0.9)" }}
          aria-hidden="true"
        />
        <span
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none transition-colors duration-300"
          style={{ borderColor: "rgba(168, 117, 69, 0.9)" }}
          aria-hidden="true"
        />

        {/* Hover luminous ambient back-glow in dark crimson & lava orange */}
        <span
          className="absolute inset-0 rounded-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(139, 38, 53, 0.35) 0%, rgba(255, 106, 36, 0.15) 50%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Antique gold & lava shimmer line across top */}
        <span
          className="absolute top-0 left-1/4 right-1/4 h-[1px] opacity-85 group-hover:left-1 group-hover:right-1 transition-all duration-500 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245, 230, 208, 0.95), rgba(255, 106, 36, 0.7), transparent)",
          }}
          aria-hidden="true"
        />

        {/* Button Content Container */}
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
          {/* Left magical diamond rune */}
          <span
            className="text-[10px] sm:text-xs transition-transform duration-300 group-hover:rotate-45"
            style={{
              color: "#A87545",
              textShadow: "0 0 10px rgba(255, 106, 36, 0.8)",
            }}
            aria-hidden="true"
          >
            ✦
          </span>

          {/* EXACT BUTTON TEXT: STEP BEYOND REALITY in Warm Ivory typography */}
          <span
            className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.22em] text-center"
            style={{
              fontFamily:
                "var(--font-cinzel-decorative), var(--font-cinzel), Cinzel, Georgia, serif",
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F5E6D0 40%, #E6C8A0 75%, #A87545 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 8px rgba(139, 38, 53, 0.6))",
            }}
          >
            STEP BEYOND REALITY
          </span>

          {/* Right magical diamond rune */}
          <span
            className="text-[10px] sm:text-xs transition-transform duration-300 group-hover:-rotate-45"
            style={{
              color: "#A87545",
              textShadow: "0 0 10px rgba(255, 106, 36, 0.8)",
            }}
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </button>

      {/* Embedded CSS for glowing animations with Maroon & Lava accents */}
      <style jsx>{`
        @keyframes maroonMagicalBreathing {
          0%,
          100% {
            box-shadow: 0 0 22px rgba(139, 38, 53, 0.4),
              0 0 38px rgba(255, 106, 36, 0.14),
              inset 0 1px 0 rgba(245, 230, 208, 0.25),
              0 8px 30px rgba(24, 6, 9, 0.85);
            border-color: rgba(168, 117, 69, 0.5);
          }
          50% {
            box-shadow: 0 0 34px rgba(139, 38, 53, 0.7),
              0 0 52px rgba(255, 106, 36, 0.28),
              inset 0 1px 0 rgba(245, 230, 208, 0.45),
              0 10px 36px rgba(24, 6, 9, 0.95);
            border-color: rgba(168, 117, 69, 0.85);
          }
        }
      `}</style>
    </div>
  );
}
