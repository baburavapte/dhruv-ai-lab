"use client";

import { useEffect, useRef, useCallback } from "react";

export type PanelId =
  | "ABOUT"
  | "SKILLS"
  | "PROJECTS"
  | "EDUCATION"
  | "CERTIFICATIONS"
  | "CONTACT"
  | null;

interface InfoPanelProps {
  panelId: PanelId;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function InfoPanel({ panelId, onClose, children, title }: InfoPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelId) {
        onClose();
      }
    },
    [panelId, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close when clicking outside
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!panelId) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{
        backgroundColor: "rgba(5, 8, 18, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "panelOverlayIn 0.3s ease-out forwards",
        paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "calc(0.75rem + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(0.75rem + env(safe-area-inset-right, 0px))",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={panelRef}
        className="relative flex flex-col w-full max-w-2xl max-h-[calc(100svh-1.5rem)] sm:max-h-[82vh] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 20, 40, 0.94) 0%, rgba(10, 14, 30, 0.97) 100%)",
          border: "1px solid rgba(100, 140, 200, 0.16)",
          borderRadius: "16px",
          boxShadow:
            "0 0 60px rgba(40, 80, 160, 0.08), 0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(100, 160, 220, 0.08)",
          animation: "panelSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Sticky Header with accessible touch target */}
        <div
          className="sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 py-3.5 sm:px-8 sm:py-5"
          style={{
            borderBottom: "1px solid rgba(100, 140, 200, 0.12)",
            background: "rgba(10, 14, 30, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <h2
            className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase truncate pr-3"
            style={{
              color: "rgba(160, 190, 230, 0.95)",
              fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-11 w-11 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95 hover:scale-105"
            style={{
              background: "rgba(100, 140, 200, 0.1)",
              border: "1px solid rgba(100, 140, 200, 0.18)",
              color: "rgba(180, 200, 230, 0.85)",
            }}
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-8 sm:py-6"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(100, 140, 200, 0.25) transparent",
            overscrollBehavior: "contain",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
