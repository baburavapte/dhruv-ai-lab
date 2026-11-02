// ============================================================================
// PORTFOLIO DATA — Verified Professional Information Only
// No fabricated URLs, metrics, companies, or achievements.
// ============================================================================

export interface SocialLink {
  label: string;
  url: string;
  type: "github" | "linkedin" | "email";
}

export interface ProfileData {
  name: string;
  title: string;
  positioning: string[];
  summary: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  specialization: string;
  startDate: string;
  expectedGraduation: string;
  location: string;
}

export interface CertificationEntry {
  title: string;
  issuer: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  type: "live" | "demo" | "other";
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export const profile: ProfileData = {
  name: "Dhruv Sukhadiya",
  title: "AI Engineer",
  positioning: ["Generative AI", "Computer Vision", "Full Stack"],
  summary:
    "AI-focused Computer Science student building intelligent systems and AI-powered applications.",
};

// ---------------------------------------------------------------------------
// Social Links
// ---------------------------------------------------------------------------
export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    url: "https://github.com/baburavapte",
    type: "github",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/dhruv-sukhadiya-73a5a036/",
    type: "linkedin",
  },
  {
    label: "Email",
    url: "mailto:dhruvsukhadiya555@gmail.com",
    type: "email",
  },
];

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"],
  },
  {
    name: "AI / Generative AI",
    skills: [
      "Machine Learning",
      "Neural Networks",
      "Deep Learning",
      "Computer Vision",
      "NLP",
      "Generative AI",
      "LLMs",
      "RAG",
      "Prompt Engineering",
      "Transfer Learning",
    ],
  },
  {
    name: "AI Frameworks / Tools",
    skills: [
      "PyTorch",
      "TensorFlow",
      "Keras",
      "LangChain",
      "LangGraph",
      "LangSmith",
      "Ollama",
      "LM Studio",
      "Hugging Face",
      "ChromaDB",
      "MCP Servers",
      "Gradio",
    ],
  },
  {
    name: "Full Stack",
    skills: [
      "React.js",
      "Next.js",
      "Angular 17",
      "Node.js",
      "Express.js",
      "FastAPI",
      "Flask",
      "Tailwind CSS",
      "Bootstrap",
      "Three.js",
      "React Three Fiber",
    ],
  },
  {
    name: "Database / Cloud",
    skills: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "GeoJSON",
      "AWS",
      "Azure",
      "Netlify",
      "Hugging Face Spaces",
    ],
  },
  {
    name: "Tools / Core",
    skills: [
      "GitHub",
      "Git",
      "Docker",
      "VS Code",
      "Notion",
      "Jira",
      "Google Colab",
      "Excel",
      "PowerPoint",
      "DSA",
      "Operating Systems",
      "System Design",
      "API Integration",
    ],
  },
];

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------
export const education: EducationEntry[] = [
  {
    institution: "Parul University",
    degree: "Bachelor of Computer Science and Engineering",
    specialization: "Artificial Intelligence",
    startDate: "June 2024",
    expectedGraduation: "2027",
    location: "Vadodara, Gujarat",
  },
];

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------
export const certifications: CertificationEntry[] = [
  {
    title: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
    issuer: "Oracle",
  },
  {
    title: "AI Fundamentals",
    issuer: "Cisco Networking Academy / IBM Skills Build",
  },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const portfolioProjects: ProjectEntry[] = [
  {
    id: "roadsense-ai",
    name: "RoadSense AI",
    description:
      "AI-powered smart road intelligence system for pothole detection and road analysis.",
    technologies: [
      "YOLOv8",
      "Angular 17",
      "Node.js",
      "Express",
      "Flask",
      "MongoDB",
      "Leaflet",
      "GeoJSON",
      "MCP",
    ],
    liveUrl: "https://warm-sunshine-a1b78e.netlify.app",
    githubUrl: "https://github.com/baburavapte/Smart-Road-Intelligence-System",
    youtubeUrl: null,
    type: "live",
  },
  {
    id: "feature-roadmap-portal",
    name: "Feature Roadmap Portal",
    description:
      "Collaborative feature roadmap management portal for product planning and tracking.",
    technologies: ["React", "Node.js", "TypeScript"],
    liveUrl: null,
    githubUrl: "https://github.com/baburavapte/feature-roadmap-portal",
    youtubeUrl: "https://www.youtube.com/watch?v=KrfmOq_6jpc",
    type: "demo",
  },
  {
    id: "resume-job-matcher",
    name: "Resume Job Matcher",
    description:
      "LLM-based resume parsing and semantic matching with ATS skill-gap analysis and improvement suggestions.",
    technologies: ["LLMs", "NLP", "Python"],
    liveUrl: null,
    githubUrl: null,
    youtubeUrl: null,
    type: "other",
  },
];

// ---------------------------------------------------------------------------
// About Content
// ---------------------------------------------------------------------------
export const aboutContent = {
  summary:
    "AI-focused Computer Science (CSE — Artificial Intelligence) student with practical experience in Machine Learning, Neural Networks, Deep Learning, Computer Vision, Generative AI, LLM applications, and Full Stack development.",
  areas: [
    "ML",
    "NLP",
    "RAG",
    "Computer Vision",
    "System Design",
    "End-to-End AI Systems",
  ],
  softSkills: [
    "Problem-solving",
    "Analytical Thinking",
    "Logical Thinking",
    "Technical Communication",
    "Team Collaboration",
    "Adaptability",
    "Continuous Learning",
    "System-Level Thinking",
  ],
};
