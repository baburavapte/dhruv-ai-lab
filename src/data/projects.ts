export interface Project {
  id: string;
  title: string;
  category: "Computer Vision" | "Generative AI" | "AI Systems" | "Experiments";
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: "Active" | "Research" | "Prototype" | "Completed";
}

/**
 * AI Research Sanctum Project Registry
 * Clean schema for holding verified research initiatives and experiments.
 * Placeholders are explicitly categorized without fabricated claims or metrics.
 */
export const projects: Project[] = [
  {
    id: "proj-cv-01",
    title: "Spatial Perception & Neural Reconstruction",
    category: "Computer Vision",
    description: "Real-time 3D scene estimation and neural feature extraction from streaming visual inputs.",
    technologies: ["PyTorch", "OpenCV", "Three.js", "WebGL"],
    status: "Research",
  },
  {
    id: "proj-gen-02",
    title: "Latent Diffusion & Multimodal Synthesis",
    category: "Generative AI",
    description: "Exploration of conditioned latent representations and accelerated inference pipelines.",
    technologies: ["Transformers", "Diffusers", "ONNX Runtime", "CUDA"],
    status: "Research",
  },
  {
    id: "proj-sys-03",
    title: "Distributed Autonomous Agent Orchestration",
    category: "AI Systems",
    description: "Event-driven architecture for low-latency multi-agent consensus and tooling execution.",
    technologies: ["Node.js", "TypeScript", "gRPC", "Docker"],
    status: "Active",
  },
  {
    id: "proj-exp-04",
    title: "WebGL Neural Visualizer Sandbox",
    category: "Experiments",
    description: "Interactive real-time 3D shader environment visualizing multidimensional tensor projections.",
    technologies: ["React Three Fiber", "GLSL", "TypeScript", "Three.js"],
    status: "Active",
  },
];
