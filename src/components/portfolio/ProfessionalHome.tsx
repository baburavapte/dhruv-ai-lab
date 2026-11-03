"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import InfoPanel, { type PanelId } from "./InfoPanel";
import StepBeyondButton from "./StepBeyondButton";
import {
  profile,
  socialLinks,
  skillCategories,
  education,
  certifications,
  portfolioProjects,
  aboutContent,
} from "@/data/portfolio";
import {
  portfolioTransition,
  handlePortfolioKeyDown,
  handlePortfolioKeyUp,
  checkArrowUpHold,
  setPhase,
  onPhaseChange,
  type PortfolioPhase,
} from "@/lib/portfolioState";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
      <polygon fill="#fff" points="9.545 15.568 15.818 12 9.545 8.432" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ============================================================================
// NAV BUTTON
// ============================================================================
// NAV BUTTON
// ============================================================================
function NavButton({
  label,
  onClick,
  isActive,
}: {
  label: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[44px] w-full sm:w-auto items-center justify-center px-4 py-2.5 text-center text-xs font-medium tracking-[0.16em] uppercase transition-all duration-300 sm:px-5 sm:py-3 active:scale-95"
      style={{
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: isActive ? "rgba(140, 190, 255, 0.95)" : "rgba(170, 190, 215, 0.7)",
        background: isActive
          ? "rgba(60, 100, 180, 0.12)"
          : "rgba(30, 45, 80, 0.06)",
        border: `1px solid ${isActive ? "rgba(80, 130, 210, 0.3)" : "rgba(80, 110, 160, 0.12)"}`,
        borderRadius: "10px",
      }}
      aria-pressed={isActive}
    >
      <span className="relative z-10">{label}</span>
      {/* Hover glow */}
      <span
        className="absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "rgba(60, 100, 180, 0.08)",
          border: "1px solid rgba(80, 130, 210, 0.2)",
        }}
        aria-hidden="true"
      />
    </button>
  );
}

// ============================================================================
// SOCIAL BUTTON
// ============================================================================
function SocialButton({
  link,
}: {
  link: { label: string; url: string; type: string };
}) {
  const icon =
    link.type === "github" ? (
      <GitHubIcon />
    ) : link.type === "linkedin" ? (
      <LinkedInIcon />
    ) : (
      <EmailIcon />
    );

  return (
    <a
      href={link.url}
      target={link.type === "email" ? undefined : "_blank"}
      rel={link.type === "email" ? undefined : "noopener noreferrer"}
      className="group flex min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-all duration-300 active:scale-95"
      style={{
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: "rgba(160, 185, 220, 0.75)",
        background: "rgba(25, 35, 65, 0.25)",
        border: "1px solid rgba(80, 110, 160, 0.1)",
        borderRadius: "10px",
      }}
      aria-label={`${link.label} — opens ${link.type === "email" ? "email client" : "in new tab"}`}
    >
      <span
        className="transition-colors duration-300 group-hover:text-[rgba(140,190,255,0.9)]"
        style={{ color: "rgba(130, 165, 210, 0.6)" }}
      >
        {icon}
      </span>
      <span className="transition-colors duration-300 group-hover:text-[rgba(200,215,240,0.9)]">
        {link.label}
      </span>
    </a>
  );
}

// ============================================================================
// PANEL CONTENT RENDERERS
// ============================================================================

function AboutPanelContent() {
  return (
    <div className="space-y-5">
      <p
        className="text-sm leading-relaxed"
        style={{
          color: "rgba(195, 210, 235, 0.85)",
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        }}
      >
        {aboutContent.summary}
      </p>
      <div className="flex flex-wrap gap-2">
        {aboutContent.areas.map((area) => (
          <span
            key={area}
            className="rounded-full px-3 py-1 text-[11px] font-medium tracking-wider"
            style={{
              background: "rgba(50, 80, 140, 0.15)",
              border: "1px solid rgba(80, 120, 180, 0.15)",
              color: "rgba(150, 185, 230, 0.8)",
            }}
          >
            {area}
          </span>
        ))}
      </div>
      <div>
        <h3
          className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "rgba(130, 155, 195, 0.6)" }}
        >
          Strengths
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {aboutContent.softSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md px-2.5 py-1 text-[11px]"
              style={{
                background: "rgba(40, 55, 90, 0.2)",
                color: "rgba(160, 180, 210, 0.65)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsPanelContent() {
  return (
    <div className="space-y-5">
      {skillCategories.map((cat) => (
        <div key={cat.name}>
          <h3
            className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(130, 165, 210, 0.65)" }}
          >
            {cat.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {cat.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200"
                style={{
                  background: "rgba(50, 75, 130, 0.12)",
                  border: "1px solid rgba(70, 110, 170, 0.1)",
                  color: "rgba(175, 195, 225, 0.8)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPanelContent() {
  const liveProjects = portfolioProjects.filter((p) => p.type === "live");
  const demoProjects = portfolioProjects.filter((p) => p.type === "demo");
  const otherProjects = portfolioProjects.filter((p) => p.type === "other");

  return (
    <div className="space-y-6">
      {liveProjects.length > 0 && (
        <div>
          <h3
            className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(80, 200, 120, 0.7)" }}
          >
            Live Projects
          </h3>
          {liveProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
      {demoProjects.length > 0 && (
        <div>
          <h3
            className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(130, 165, 210, 0.65)" }}
          >
            Project Demos
          </h3>
          {demoProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
      {otherProjects.length > 0 && (
        <div>
          <h3
            className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(130, 155, 195, 0.5)" }}
          >
            Other Projects
          </h3>
          {otherProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
}: {
  project: (typeof portfolioProjects)[number];
}) {
  return (
    <div
      className="mb-3 rounded-xl p-3.5 sm:p-4"
      style={{
        background: "rgba(25, 35, 65, 0.3)",
        border: "1px solid rgba(80, 110, 160, 0.1)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        {project.type === "live" && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
            style={{
              background: "rgba(50, 180, 90, 0.12)",
              border: "1px solid rgba(50, 180, 90, 0.2)",
              color: "rgba(80, 210, 120, 0.9)",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#50d878" }}
            />
            Live
          </span>
        )}
        <h4
          className="text-sm font-semibold"
          style={{ color: "rgba(210, 220, 240, 0.9)" }}
        >
          {project.name}
        </h4>
      </div>
      <p
        className="mb-3 text-xs leading-relaxed"
        style={{ color: "rgba(170, 185, 210, 0.7)" }}
      >
        {project.description}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-md px-2 py-0.5 text-[10px]"
            style={{
              background: "rgba(50, 75, 130, 0.15)",
              color: "rgba(155, 180, 215, 0.7)",
            }}
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-0.5">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] sm:min-h-[34px] items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(50, 120, 200, 0.15)",
              border: "1px solid rgba(60, 130, 210, 0.25)",
              color: "rgba(140, 190, 255, 0.9)",
            }}
          >
            <span>Live Demo</span>
            <ExternalLinkIcon size={12} />
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] sm:min-h-[34px] items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(40, 55, 90, 0.2)",
              border: "1px solid rgba(70, 100, 150, 0.15)",
              color: "rgba(160, 185, 215, 0.75)",
            }}
          >
            <span>GitHub</span>
            <ExternalLinkIcon size={12} />
          </a>
        )}
        {project.youtubeUrl && (
          <a
            href={project.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] sm:min-h-[34px] items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(180, 30, 30, 0.12)",
              border: "1px solid rgba(200, 60, 60, 0.2)",
              color: "rgba(250, 140, 140, 0.85)",
            }}
          >
            <span>Watch Demo</span>
            <YouTubeIcon />
          </a>
        )}
      </div>
    </div>
  );
}

function EducationPanelContent() {
  return (
    <div className="space-y-4">
      {education.map((edu, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            background: "rgba(25, 35, 65, 0.25)",
            border: "1px solid rgba(80, 110, 160, 0.1)",
          }}
        >
          <h4
            className="mb-1 text-sm font-semibold"
            style={{ color: "rgba(210, 220, 240, 0.9)" }}
          >
            {edu.institution}
          </h4>
          <p
            className="mb-1 text-xs"
            style={{ color: "rgba(170, 190, 220, 0.75)" }}
          >
            {edu.degree}
          </p>
          <p
            className="mb-2 text-xs font-medium"
            style={{ color: "rgba(140, 180, 230, 0.7)" }}
          >
            {edu.specialization}
          </p>
          <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: "rgba(140, 160, 195, 0.6)" }}>
            <span>{edu.startDate} – Current</span>
            <span>Expected Graduation: {edu.expectedGraduation}</span>
            <span>{edu.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificationsPanelContent() {
  return (
    <div className="space-y-3">
      {certifications.map((cert, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            background: "rgba(25, 35, 65, 0.25)",
            border: "1px solid rgba(80, 110, 160, 0.1)",
          }}
        >
          <h4
            className="mb-1 text-sm font-semibold"
            style={{ color: "rgba(210, 220, 240, 0.9)" }}
          >
            {cert.title}
          </h4>
          <p
            className="text-xs"
            style={{ color: "rgba(140, 165, 200, 0.6)" }}
          >
            {cert.issuer}
          </p>
        </div>
      ))}
    </div>
  );
}

function ContactPanelContent() {
  return (
    <div className="space-y-3">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target={link.type === "email" ? undefined : "_blank"}
          rel={link.type === "email" ? undefined : "noopener noreferrer"}
          className="group flex min-h-[52px] items-center gap-3 rounded-xl p-3.5 sm:p-4 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "rgba(25, 35, 65, 0.25)",
            border: "1px solid rgba(80, 110, 160, 0.1)",
          }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 group-hover:text-[rgba(140,190,255,0.9)]"
            style={{
              background: "rgba(50, 75, 130, 0.15)",
              color: "rgba(130, 165, 210, 0.6)",
            }}
          >
            {link.type === "github" ? (
              <GitHubIcon />
            ) : link.type === "linkedin" ? (
              <LinkedInIcon />
            ) : (
              <EmailIcon />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-medium transition-colors duration-200 group-hover:text-[rgba(200,215,240,0.95)]"
              style={{ color: "rgba(195, 210, 235, 0.85)" }}
            >
              {link.label}
            </div>
            <div className="break-all text-xs" style={{ color: "rgba(130, 155, 190, 0.5)" }}>
              {link.type === "email"
                ? "dhruvsukhadiya555@gmail.com"
                : link.type === "github"
                  ? "github.com/baburavapte"
                  : "LinkedIn Profile"}
            </div>
          </div>
          <span className="ml-auto shrink-0" style={{ color: "rgba(130, 160, 200, 0.4)" }}>
            <ExternalLinkIcon />
          </span>
        </a>
      ))}
    </div>
  );
}

// ============================================================================
// LIVE PROJECT FEATURED CARD (for main page)
// ============================================================================

function FeaturedLiveProject() {
  const project = portfolioProjects.find((p) => p.type === "live");
  if (!project) return null;

  return (
    <div className="mx-auto w-full max-w-xl px-1 sm:px-0">
      <h3
        className="mb-4 text-center text-[11px] font-semibold tracking-[0.25em] uppercase"
        style={{ color: "rgba(100, 135, 180, 0.5)" }}
      >
        Live Project
      </h3>
      <div
        className="group relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-7 transition-all duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 22, 45, 0.7) 0%, rgba(12, 18, 38, 0.8) 100%)",
          border: "1px solid rgba(80, 130, 190, 0.12)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Live indicator */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase"
            style={{
              background: "rgba(50, 190, 100, 0.1)",
              border: "1px solid rgba(50, 190, 100, 0.2)",
              color: "rgba(80, 220, 130, 0.9)",
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: "#50dc82",
                boxShadow: "0 0 6px rgba(80, 220, 130, 0.5)",
                animation: "livePulse 2s ease-in-out infinite",
              }}
            />
            Live
          </span>
        </div>

        <h4
          className="mb-2 text-base font-bold tracking-wide sm:text-xl"
          style={{
            color: "rgba(220, 230, 245, 0.95)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          {project.name}
        </h4>

        <p
          className="mb-4 text-xs leading-relaxed sm:text-sm"
          style={{ color: "rgba(165, 180, 210, 0.7)" }}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(50, 80, 140, 0.15)",
                border: "1px solid rgba(70, 110, 170, 0.1)",
                color: "rgba(150, 180, 215, 0.7)",
              }}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 6 && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px]"
              style={{ color: "rgba(130, 155, 190, 0.5)" }}
            >
              +{project.technologies.length - 6} more
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45, 100, 190, 0.25) 0%, rgba(50, 110, 200, 0.18) 100%)",
                border: "1px solid rgba(60, 130, 220, 0.3)",
                color: "rgba(150, 200, 255, 0.95)",
                boxShadow: "0 2px 12px rgba(50, 100, 200, 0.1)",
              }}
            >
              <span>Live Demo</span>
              <ExternalLinkIcon />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 active:scale-95"
              style={{
                background: "rgba(35, 50, 85, 0.3)",
                border: "1px solid rgba(70, 100, 155, 0.15)",
                color: "rgba(165, 185, 215, 0.8)",
              }}
            >
              <span>GitHub</span>
              <ExternalLinkIcon />
            </a>
          )}
        </div>

        {/* Subtle corner glow */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(50, 120, 200, 0.15), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PROFESSIONAL HOME COMPONENT
// ============================================================================

export default function ProfessionalHome({
  onEnterWorld,
  isEnteringWorld = false,
}: {
  onEnterWorld: () => void;
  isEnteringWorld?: boolean;
}) {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [phase, setLocalPhase] = useState<PortfolioPhase>(
    portfolioTransition.phase
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);


  // Panel title mapping
  const panelTitles: Record<string, string> = {
    ABOUT: "About",
    SKILLS: "Technical Skills",
    PROJECTS: "Projects",
    EDUCATION: "Education",
    CERTIFICATIONS: "Certifications",
    CONTACT: "Contact",
  };

  // Ensure initial scroll position is always at top when portfolio activates/loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  // Listen for phase changes
  useEffect(() => {
    const unsub = onPhaseChange((newPhase) => {
      setLocalPhase(newPhase);
      if (newPhase === "PROFESSIONAL_HOME") {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    });
    return unsub;
  }, []);

  // Hidden easter-egg key handler + ArrowUp hold polling
  useEffect(() => {
    if (phase === "WORLD_ACTIVE" || phase === "ENTERING_WORLD") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an info panel is open — let Escape work for panel
      if (activePanel && e.key !== "Escape") return;
      if (activePanel && e.key === "Escape") return; // handled by InfoPanel

      const consumed = handlePortfolioKeyDown(e.key, Date.now());
      if (consumed) e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activePanel) return;
      const consumed = handlePortfolioKeyUp(e.key);
      if (consumed) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, activePanel]);

  // Subtle touch gesture support for hidden world entry on touch-only devices
  const touchStateRef = useRef<{
    startY: number;
    startX: number;
    startTime: number;
    holdingUp: boolean;
  }>({ startY: 0, startX: 0, startTime: 0, holdingUp: false });

  useEffect(() => {
    if (phase === "WORLD_ACTIVE" || phase === "ENTERING_WORLD") return;

    const handleTouchStart = (e: TouchEvent) => {
      if (activePanel || e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStateRef.current.startY = t.clientY;
      touchStateRef.current.startX = t.clientX;
      touchStateRef.current.startTime = Date.now();
      touchStateRef.current.holdingUp = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activePanel || e.touches.length !== 1) return;
      const t = e.touches[0];
      const deltaY = t.clientY - touchStateRef.current.startY;
      const deltaX = Math.abs(t.clientX - touchStateRef.current.startX);

      // If user is doing an upward swipe/hold while READY_TO_ENTER:
      if (portfolioTransition.phase === "READY_TO_ENTER" && deltaY < -50 && deltaX < 80) {
        if (!touchStateRef.current.holdingUp) {
          touchStateRef.current.holdingUp = true;
          handlePortfolioKeyDown("ArrowUp", Date.now());
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activePanel) return;
      const now = Date.now();
      const elapsed = now - touchStateRef.current.startTime;

      if (touchStateRef.current.holdingUp) {
        touchStateRef.current.holdingUp = false;
        handlePortfolioKeyUp("ArrowUp");
        return;
      }

      // Check if this was a deliberate downward swipe (deltaY > 55px within 600ms)
      const changedTouch = e.changedTouches[0];
      if (changedTouch) {
        const deltaY = changedTouch.clientY - touchStateRef.current.startY;
        const deltaX = Math.abs(changedTouch.clientX - touchStateRef.current.startX);

        if (deltaY > 55 && deltaX < 60 && elapsed < 600) {
          handlePortfolioKeyDown("ArrowDown", now);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [phase, activePanel]);

  // ArrowUp hold duration polling via requestAnimationFrame
  useEffect(() => {
    if (phase !== "READY_TO_ENTER") return;

    let active = true;
    const poll = () => {
      if (!active) return;
      const triggered = checkArrowUpHold(Date.now());
      if (triggered) {
        // Start the cinematic transition
        setIsTransitioning(true);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        // Wait for CSS fade then enter world
        setTimeout(() => {
          onEnterWorld();
          setPhase("WORLD_ACTIVE");
          setIsTransitioning(false);
        }, 1200);
      } else {
        rafRef.current = requestAnimationFrame(poll);
      }
    };
    rafRef.current = requestAnimationFrame(poll);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, onEnterWorld]);

  const closePanel = useCallback(() => setActivePanel(null), []);

  // Render panel content based on active panel
  const renderPanelContent = () => {
    switch (activePanel) {
      case "ABOUT":
        return <AboutPanelContent />;
      case "SKILLS":
        return <SkillsPanelContent />;
      case "PROJECTS":
        return <ProjectsPanelContent />;
      case "EDUCATION":
        return <EducationPanelContent />;
      case "CERTIFICATIONS":
        return <CertificationsPanelContent />;
      case "CONTACT":
        return <ContactPanelContent />;
      default:
        return null;
    }
  };

  // Don't render at all if world is active
  if (phase === "WORLD_ACTIVE") return null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative z-10 flex min-h-[100svh] w-full flex-col"
        style={{
          background:
            "linear-gradient(180deg, #080c1a 0%, #0a0e1e 30%, #0c1024 60%, #0e1228 100%)",
          opacity: isTransitioning || phase === "EXITING_WORLD" ? 0 : 1,
          transition: "opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: isTransitioning ? "none" : "auto",
        }}
      >
        {/* Subtle background grid */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60, 100, 180, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 100, 180, 0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />

        {/* Soft radial glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(30, 60, 120, 0.08) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div
          className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-start px-4 sm:px-8"
          style={{
            paddingTop: "calc(clamp(1.75rem, 5vh, 3.5rem) + env(safe-area-inset-top, 0px))",
            paddingBottom: "calc(clamp(6.5rem, 14vh, 9.5rem) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* HERO SECTION */}
          <div className="mb-8 text-center sm:mb-12 md:mb-14">
            {/* Name */}
            <h1
              className="mb-2 text-3xl font-bold tracking-[0.06em] text-balance break-words sm:mb-3 sm:text-4xl md:text-5xl lg:text-6xl"
              style={{
                color: "rgba(225, 235, 250, 0.95)",
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              {profile.name}
            </h1>

            {/* Title */}
            <div
              className="mb-2.5 text-xs font-semibold tracking-[0.25em] uppercase text-balance sm:mb-3 sm:text-sm sm:tracking-[0.35em] md:text-base"
              style={{
                color: "rgba(120, 165, 225, 0.8)",
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              {profile.title}
            </div>

            {/* Positioning */}
            <div
              className="mb-4 max-w-xl mx-auto px-2 text-xs tracking-[0.12em] text-balance sm:mb-5 sm:text-sm sm:tracking-[0.15em]"
              style={{ color: "rgba(145, 170, 205, 0.6)" }}
            >
              {profile.positioning.join(" • ")}
            </div>

            {/* Professional statement */}
            <p
              className="mx-auto max-w-md px-2 text-xs leading-relaxed text-balance sm:text-sm"
              style={{
                color: "rgba(175, 190, 215, 0.65)",
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              {profile.summary}
            </p>
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="mb-10 grid w-full max-w-xs grid-cols-2 gap-2 sm:mb-14 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {/* ABOUT */}
            <NavButton
              label="About"
              onClick={() => setActivePanel((prev) => (prev === "ABOUT" ? null : "ABOUT"))}
              isActive={activePanel === "ABOUT"}
            />
            {/* SKILLS */}
            <NavButton
              label="Skills"
              onClick={() => setActivePanel((prev) => (prev === "SKILLS" ? null : "SKILLS"))}
              isActive={activePanel === "SKILLS"}
            />
            {/* PROJECTS */}
            <NavButton
              label="Projects"
              onClick={() => setActivePanel((prev) => (prev === "PROJECTS" ? null : "PROJECTS"))}
              isActive={activePanel === "PROJECTS"}
            />
            {/* EDUCATION */}
            <NavButton
              label="Education"
              onClick={() => setActivePanel((prev) => (prev === "EDUCATION" ? null : "EDUCATION"))}
              isActive={activePanel === "EDUCATION"}
            />
            {/* CERTIFICATIONS */}
            <NavButton
              label="Certifications"
              onClick={() => setActivePanel((prev) => (prev === "CERTIFICATIONS" ? null : "CERTIFICATIONS"))}
              isActive={activePanel === "CERTIFICATIONS"}
            />
            {/* RESUME */}
            <a
              href="/resume/Dhruv-Sukhadiya-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium tracking-[0.16em] uppercase transition-all duration-300 sm:px-5 sm:py-3 active:scale-95"
              style={{
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                color: "rgba(170, 190, 215, 0.7)",
                background: "rgba(30, 45, 80, 0.06)",
                border: "1px solid rgba(80, 110, 160, 0.12)",
                borderRadius: "10px",
              }}
            >
              <DownloadIcon />
              <span>Resume</span>
            </a>
            {/* CONTACT */}
            <div className="col-span-2 w-full sm:col-span-1 sm:w-auto">
              <NavButton
                label="Contact"
                onClick={() => setActivePanel((prev) => (prev === "CONTACT" ? null : "CONTACT"))}
                isActive={activePanel === "CONTACT"}
              />
            </div>
          </div>

          {/* FEATURED LIVE PROJECT */}
          <div className="mb-14 w-full sm:mb-16">
            <FeaturedLiveProject />
          </div>

          {/* SOCIAL LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((link) => (
              <SocialButton key={link.label} link={link} />
            ))}
          </div>
        </div>

        {/* MAGICAL GOTHIC ENTRANCE BUTTON: STEP BEYOND REALITY */}
        {!activePanel && (
          <StepBeyondButton
            onClick={onEnterWorld}
            disabled={isEnteringWorld}
          />
        )}
      </div>

      {/* INFO PANEL OVERLAY */}
      {activePanel && (
        <InfoPanel
          panelId={activePanel}
          onClose={closePanel}
          title={panelTitles[activePanel] || ""}
        >
          {renderPanelContent()}
        </InfoPanel>
      )}
    </>
  );
}
