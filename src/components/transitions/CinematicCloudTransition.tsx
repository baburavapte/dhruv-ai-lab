"use client";

import React, { useEffect, useRef } from "react";

interface CloudTransitionProps {
  isActive: boolean;
  isWorldReady?: boolean;
  onCoverComplete: () => void;
  onRevealComplete: () => void;
}

interface CloudPuff {
  startX: number;
  startY: number;
  coverX: number;
  coverY: number;
  revealX: number;
  revealY: number;

  baseScale: number;
  rotation: number;
  rotSpeed: number;
  spriteIndex: number;
  layer: number; // 0 = back, 1 = mid, 2 = front
  opacity: number;
}

// Module-level cache so procedural cloud sprites are generated once and instantly available
let cachedCloudSprites: HTMLCanvasElement[] | null = null;

function getCloudSprites(): HTMLCanvasElement[] {
  if (typeof document === "undefined") return [];
  if (cachedCloudSprites && cachedCloudSprites.length > 0) {
    return cachedCloudSprites;
  }

  const sprites: HTMLCanvasElement[] = [];

  for (let s = 0; s < 4; s++) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const cx = size / 2;
    const cy = size / 2;

    // Organic multi-lobed cumulus cloud billow shapes inspired by Clash of Clans
    const lobes =
      s === 0
        ? [
            { x: 0, y: 0, r: 175 },
            { x: -80, y: 35, r: 135 },
            { x: 85, y: 30, r: 140 },
            { x: -40, y: -65, r: 125 },
            { x: 55, y: -60, r: 120 },
            { x: 0, y: -80, r: 105 },
          ]
        : s === 1
        ? [
            { x: 0, y: 15, r: 185 },
            { x: -100, y: -25, r: 145 },
            { x: 85, y: -35, r: 150 },
            { x: -50, y: 70, r: 130 },
            { x: 70, y: 60, r: 135 },
          ]
        : s === 2
        ? [
            { x: 0, y: 0, r: 195 },
            { x: -70, y: -60, r: 140 },
            { x: 80, y: -55, r: 145 },
            { x: -90, y: 50, r: 130 },
            { x: 75, y: 55, r: 125 },
          ]
        : [
            { x: 0, y: 0, r: 205 },
            { x: -60, y: 30, r: 145 },
            { x: 65, y: -25, r: 150 },
            { x: 30, y: 65, r: 125 },
            { x: -30, y: -70, r: 120 },
          ];

    lobes.forEach((lobe) => {
      const lx = cx + lobe.x;
      const ly = cy + lobe.y;
      const grad = ctx.createRadialGradient(
        lx - lobe.r * 0.18,
        ly - lobe.r * 0.25,
        lobe.r * 0.04,
        lx,
        ly,
        lobe.r
      );

      // Cumulus shading: sunlit ivory crest, dense warm-white body, soft mist feather
      grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.35, "rgba(253, 251, 247, 0.98)");
      grad.addColorStop(0.68, "rgba(240, 244, 250, 0.92)");
      grad.addColorStop(0.88, "rgba(215, 225, 238, 0.55)");
      grad.addColorStop(1.0, "rgba(200, 215, 232, 0.0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    });

    sprites.push(canvas);
  }

  cachedCloudSprites = sprites;
  return sprites;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CinematicCloudTransition({
  isActive,
  isWorldReady = false,
  onCoverComplete,
  onRevealComplete,
}: CloudTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<CloudPuff[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Authoritative phase tracker:
  // "COVERING" -> "HOLDING_FOR_READY" -> "REVEALING" -> "FINISHED"
  const phaseRef = useRef<"COVERING" | "HOLDING_FOR_READY" | "REVEALING" | "FINISHED">("COVERING");
  const holdStartTimeRef = useRef<number>(0);
  const revealStartTimeRef = useRef<number>(0);
  const hasTriggeredCoverRef = useRef(false);
  const hasTriggeredRevealRef = useRef(false);

  // Keep latest callbacks in refs to eliminate effect re-triggering
  const onCoverCompleteRef = useRef(onCoverComplete);
  onCoverCompleteRef.current = onCoverComplete;
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;
  const isWorldReadyRef = useRef(isWorldReady);
  isWorldReadyRef.current = isWorldReady;

  // Eagerly pre-generate procedural cloud sprites on client load
  useEffect(() => {
    getCloudSprites();
  }, []);

  // Main animation lifecycle
  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI scaling
    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Build 38 layered billowy cloud puffs approaching from all sides
    const puffs: CloudPuff[] = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const dir = i % 5; // 0=Left, 1=Right, 2=Top, 3=Bottom, 4=Corners
      const layer = i % 3; // 0=back, 1=mid, 2=front

      let startX = 0;
      let startY = 0;
      let coverX = 0;
      let coverY = 0;
      let revealX = 0;
      let revealY = 0;

      // Distribute cover coordinates across viewport with dense overlap
      const normX = (i % 6) / 5;
      const normY = Math.floor(i / 6) / 5;
      coverX = w * (0.05 + normX * 0.9) + (Math.random() - 0.5) * (w * 0.16);
      coverY = h * (0.05 + normY * 0.9) + (Math.random() - 0.5) * (h * 0.16);

      if (dir === 0) {
        // Enters from Left -> Exits to Left
        startX = -w * (0.4 + Math.random() * 0.4);
        startY = coverY + (Math.random() - 0.5) * 120;
        revealX = -w * (0.55 + Math.random() * 0.5);
        revealY = startY;
      } else if (dir === 1) {
        // Enters from Right -> Exits to Right
        startX = w * (1.4 + Math.random() * 0.4);
        startY = coverY + (Math.random() - 0.5) * 120;
        revealX = w * (1.55 + Math.random() * 0.5);
        revealY = startY;
      } else if (dir === 2) {
        // Enters from Top -> Exits to Top
        startX = coverX + (Math.random() - 0.5) * 120;
        startY = -h * (0.4 + Math.random() * 0.4);
        revealX = startX;
        revealY = -h * (0.55 + Math.random() * 0.5);
      } else if (dir === 3) {
        // Enters from Bottom -> Exits to Bottom
        startX = coverX + (Math.random() - 0.5) * 120;
        startY = h * (1.4 + Math.random() * 0.4);
        revealX = startX;
        revealY = h * (1.55 + Math.random() * 0.5);
      } else {
        // Diagonals (Corners)
        const isLeft = coverX < w / 2;
        const isTop = coverY < h / 2;
        startX = isLeft ? -w * 0.45 : w * 1.45;
        startY = isTop ? -h * 0.45 : h * 1.45;
        revealX = isLeft ? -w * 0.65 : w * 1.65;
        revealY = isTop ? -h * 0.65 : h * 1.65;
      }

      const diag = Math.sqrt(w * w + h * h);
      const scaleMultiplier = layer === 0 ? 1.65 : layer === 1 ? 1.38 : 1.22;
      const baseScale = (diag / 520) * scaleMultiplier * (0.95 + Math.random() * 0.35);

      puffs.push({
        startX,
        startY,
        coverX,
        coverY,
        revealX,
        revealY,
        baseScale,
        rotation: (Math.random() - 0.5) * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        spriteIndex: i % 4,
        layer,
        opacity: layer === 0 ? 0.98 : layer === 1 ? 0.95 : 0.92,
      });
    }

    cloudsRef.current = puffs;
    activePuffs = puffs;
    startTimeRef.current = performance.now();
    phaseRef.current = "COVERING";
    hasTriggeredCoverRef.current = false;
    hasTriggeredRevealRef.current = false;

    // Timings:
    // COVER duration: 1350ms (swirling in from screen edges)
    // MIN HOLD duration: 250ms (brief pause so the coverage feels monumental)
    // REVEAL duration: 1450ms (parting smoothly outward)
    const T_COVER_DURATION = 1350;
    const MIN_HOLD_DURATION = 250;
    const MAX_HOLD_SAFETY_TIMEOUT = 5000;
    const T_REVEAL_DURATION = 1450;

    const render = (now: number) => {
      const currentW = window.innerWidth;
      const currentH = window.innerHeight;

      ctx.clearRect(0, 0, currentW, currentH);

      // Phase 1: COVERING
      if (phaseRef.current === "COVERING") {
        const elapsed = now - startTimeRef.current;
        const rawProgress = elapsed / T_COVER_DURATION;
        const coverT = Math.min(1.0, rawProgress);
        const easedCoverT = easeOutCubic(coverT);

        // Subtle dark crimson & lava activation flare from bottom-center
        if (elapsed < 500) {
          const flareT = elapsed / 500;
          const flareAlpha = Math.sin(flareT * Math.PI) * 0.45;
          const flareGrad = ctx.createRadialGradient(
            currentW / 2,
            currentH * 0.9,
            8,
            currentW / 2,
            currentH * 0.75,
            currentW * 0.8
          );
          flareGrad.addColorStop(0.0, `rgba(255, 106, 36, ${flareAlpha * 0.8})`);
          flareGrad.addColorStop(0.35, `rgba(139, 38, 53, ${flareAlpha * 0.6})`);
          flareGrad.addColorStop(1.0, "rgba(24, 6, 9, 0.0)");
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, 0, currentW, currentH);
        }

        // Soft atmospheric mist veil blends in ONLY when clouds have converged (rawProgress > 0.7)
        // Eliminates any abrupt white flash while guaranteeing 100% full coverage
        if (rawProgress > 0.7) {
          const veilProgress = (rawProgress - 0.7) / 0.3;
          const veilAlpha = Math.min(1.0, Math.pow(veilProgress, 1.8));
          ctx.fillStyle = `rgba(242, 246, 252, ${veilAlpha})`;
          ctx.fillRect(0, 0, currentW, currentH);
        }

        // Draw cloud puffs converging inward
        drawPuffs(ctx, easedCoverT, "COVER", elapsed);

        // When cover completes: trigger handshake & transition to HOLDING_FOR_READY
        if (rawProgress >= 1.0) {
          phaseRef.current = "HOLDING_FOR_READY";
          holdStartTimeRef.current = now;

          if (!hasTriggeredCoverRef.current) {
            hasTriggeredCoverRef.current = true;
            onCoverCompleteRef.current();
          }
        }
      }

      // Phase 2: HOLDING_FOR_READY (Full 100% cloud cover)
      else if (phaseRef.current === "HOLDING_FOR_READY") {
        const holdElapsed = now - holdStartTimeRef.current;

        // Ensure 100% opaque cover handshake
        ctx.fillStyle = "rgba(242, 246, 252, 1.0)";
        ctx.fillRect(0, 0, currentW, currentH);

        // Clouds swirl gently in place
        drawPuffs(ctx, 1.0, "HOLD", now - startTimeRef.current);

        // Check if 3D scene is ready:
        const worldIsReady =
          isWorldReadyRef.current ||
          Boolean((window as unknown as { __threeWorldReady?: boolean }).__threeWorldReady);

        const minHoldPassed = holdElapsed >= MIN_HOLD_DURATION;
        const safetyTimeoutPassed = holdElapsed >= MAX_HOLD_SAFETY_TIMEOUT;

        // Proceed to reveal once ready and minimum hold has elapsed (or on safety timeout)
        if ((worldIsReady && minHoldPassed) || safetyTimeoutPassed) {
          phaseRef.current = "REVEALING";
          revealStartTimeRef.current = now;
        }
      }

      // Phase 3: REVEALING (Clouds part smoothly outward)
      else if (phaseRef.current === "REVEALING") {
        const revealElapsed = now - revealStartTimeRef.current;
        const revealT = Math.min(1.0, revealElapsed / T_REVEAL_DURATION);
        const easedRevealT = easeInOutCubic(revealT);

        // Soft veil fades out with the parting clouds
        const veilAlpha = Math.max(0, 1.0 - easedRevealT * 1.35);
        if (veilAlpha > 0) {
          ctx.fillStyle = `rgba(242, 246, 252, ${veilAlpha})`;
          ctx.fillRect(0, 0, currentW, currentH);
        }

        // Draw clouds drifting outward
        drawPuffs(ctx, easedRevealT, "REVEAL", now - startTimeRef.current);

        if (revealT >= 1.0) {
          phaseRef.current = "FINISHED";
          if (!hasTriggeredRevealRef.current) {
            hasTriggeredRevealRef.current = true;
            onRevealCompleteRef.current();
          }
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none select-none"
      style={{
        width: "100vw",
        height: "100vh",
        display: isActive ? "block" : "none",
      }}
      aria-hidden="true"
    />
  );
}

function drawPuffs(
  ctx: CanvasRenderingContext2D,
  t: number,
  mode: "COVER" | "HOLD" | "REVEAL",
  elapsed: number
) {
  const sprites = getCloudSprites();
  if (sprites.length === 0) return;

  // Draw layers in order: Back (0) -> Mid (1) -> Front (2)
  const puffs = cloudsRefLocal();
  const sortedPuffs = [...puffs].sort((a, b) => a.layer - b.layer);

  sortedPuffs.forEach((puff) => {
    let curX = puff.coverX;
    let curY = puff.coverY;
    let curOpacity = puff.opacity;

    if (mode === "COVER") {
      curX = puff.startX + (puff.coverX - puff.startX) * t;
      curY = puff.startY + (puff.coverY - puff.startY) * t;
      curOpacity = Math.min(1.0, t * 1.35) * puff.opacity;
    } else if (mode === "HOLD") {
      curX = puff.coverX + Math.sin(elapsed * 0.0015 + puff.rotation) * 8;
      curY = puff.coverY + Math.cos(elapsed * 0.0012 + puff.rotation) * 6;
      curOpacity = puff.opacity;
    } else if (mode === "REVEAL") {
      curX = puff.coverX + (puff.revealX - puff.coverX) * t;
      curY = puff.coverY + (puff.revealY - puff.coverY) * t;
      curOpacity = Math.max(0, (1 - t * 1.18) * puff.opacity);
    }

    const sprite = sprites[puff.spriteIndex] || sprites[0];
    if (!sprite || curOpacity <= 0.005) return;

    ctx.save();
    ctx.globalAlpha = curOpacity;
    ctx.translate(curX, curY);
    ctx.rotate(puff.rotation + (elapsed * 0.0008) * puff.rotSpeed);
    ctx.scale(puff.baseScale, puff.baseScale);

    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  });
}

// Module-level reference to current puffs for pure draw helper
let activePuffs: CloudPuff[] = [];
function cloudsRefLocal(): CloudPuff[] {
  return activePuffs;
}
