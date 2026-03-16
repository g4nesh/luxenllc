export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FeatureCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  iconKey: "observe" | "route" | "replay" | "extend";
};

export type ProjectCard = {
  slug: string;
  title: string;
  summary: string;
  repoUrl: string;
  demoUrl?: string;
  status: string;
  category: string;
  visualKey: "transformer";
};

export type ContactFieldConfig = {
  id: "name" | "email" | "role" | "workflow" | "details";
  label: string;
  type: "text" | "email" | "textarea";
  required: boolean;
  placeholder: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "AgentTree", href: "/agentide" },
  { label: "Labs", href: "/labs" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" }
];

export const heroContent = {
  eyebrow: "LUXEN",
  title: "The control plane for live agents.",
  body:
    "We’re building AgentTree, a local-first workspace for controlling, monitoring, and replaying live AI runtimes. Think VS Code for operators running real agents across Codex, OpenClaw, and the next generation of autonomous systems.",
  primaryCta: {
    label: "Request early access",
    href: "/contact"
  },
  secondaryCta: {
    label: "Explore AgentTree",
    href: "/agentide"
  },
  hint: "Press and hold to inspect the mark."
};

export const homeFeatures: FeatureCard[] = [
  {
    id: "observe",
    eyebrow: "Runtime visibility",
    title: "Observe live agent systems without guessing.",
    body:
      "Track runtime health, workspace bindings, model context, and last-known activity in one operator surface built for real execution targets.",
    iconKey: "observe"
  },
  {
    id: "route",
    eyebrow: "Routed control",
    title: "Route commands to the exact runtime that should receive them.",
    body:
      "Move between Codex sessions, OpenClaw targets, and future adapters without collapsing everything into one generic chat surface.",
    iconKey: "route"
  },
  {
    id: "replay",
    eyebrow: "Structured history",
    title: "Replay events, inspect payloads, and reopen work with context intact.",
    body:
      "AgentTree keeps event history, telemetry slices, and redacted replay flows close enough to act on instead of hiding them behind logs.",
    iconKey: "replay"
  },
  {
    id: "extend",
    eyebrow: "Trusted extension flow",
    title: "Extend agent workflows without surrendering operator control.",
    body:
      "Assignment stays exact-target, trust is explicit, and runtime capability limits are surfaced instead of being glossed over.",
    iconKey: "extend"
  }
];

export const workflowSteps = ["Discover", "Attach", "Route", "Inspect", "Replay"];

export const productFeatureGroups = [
  {
    title: "Runtime discovery and truthful inventory",
    body:
      "Supervisor-owned scans keep runtime inventory grounded in what adapters actually expose. No fake agents, no guessed state, no vague control plane theater."
  },
  {
    title: "Routed chat across live runtimes",
    body:
      "Send work to the exact runtime, instance, or agent node that should receive it, while preserving activity state and operator context."
  },
  {
    title: "Telemetry and health visibility",
    body:
      "See runtime health, warning states, provider and model metadata, tool activity, unread state, and degraded adapters without flattening nuance away."
  },
  {
    title: "History, replay, and redacted export",
    body:
      "Move through event history, inspect payloads, reopen previous workflows, and export redacted JSON for audit and debugging without rebuilding context from scratch."
  },
  {
    title: "Extension trust and exact-target assignment",
    body:
      "Review metadata before install, apply extensions to the exact target they belong to, and keep trust boundaries visible to the operator."
  },
  {
    title: "Local-first privacy and retention controls",
    body:
      "Persist locally, redact before storage, and keep retention choices in the operator’s hands instead of shipping runtime data into a remote backend by default."
  }
];

export const runtimeSupport = [
  {
    label: "Codex",
    body:
      "Local session discovery, resumable attach, direct chat, rollout extraction, provider/model normalization, and partial telemetry labeling when process visibility is incomplete."
  },
  {
    label: "OpenClaw",
    body:
      "Workspace binding consent, runtime/session inventory, repo-bound agent reuse, direct routed chat, skill/plugin catalog ingestion, and richer gateway activity parsing."
  }
];

export const companyBlocks = [
  {
    title: "Why agent infrastructure is the problem worth solving",
    body:
      "Autonomous systems do not become usable by adding another chat window. They become usable when operators can see what exists, target the right runtime, and understand what actually happened."
  },
  {
    title: "Why truthful runtime visibility matters",
    body:
      "A control surface that invents hidden structure is worse than no control surface at all. Luxen is focused on interfaces that stay loyal to runtime truth, partial telemetry included."
  },
  {
    title: "Why local-first control surfaces matter",
    body:
      "Serious agent work often starts on a machine, inside a repo, with local context and local risk. We design for that reality instead of forcing a cloud-shaped product story onto it."
  },
  {
    title: "Why replay, telemetry, and extensions belong together",
    body:
      "Control, inspection, and extension assignment are parts of one operator loop. Splitting them apart makes agent systems harder to trust and slower to debug."
  }
];

export const principles = [
  "Local-first by default.",
  "Truthful runtime modeling over invented structure.",
  "Explicit observability over guessed telemetry.",
  "Privacy before persistence.",
  "Operator control over autonomous systems."
];

export const projects: ProjectCard[] = [
  {
    slug: "interactive-transformer",
    title: "Interactive Transformer",
    summary:
      "An educational in-browser walkthrough of autoregressive text generation, pairing a live 3D scene with token-by-token generation playback so the mechanics stay visible.",
    repoUrl: "https://github.com/g4nesh/interactive-transformer",
    status: "In browser experiment",
    category: "Education / Systems intuition",
    visualKey: "transformer"
  }
];

export const contactFields: ContactFieldConfig[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Who should we keep in the loop?"
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "operator@company.com"
  },
  {
    id: "role",
    label: "Role / Company",
    type: "text",
    required: true,
    placeholder: "Founder, engineer, infra lead, research team..."
  },
  {
    id: "workflow",
    label: "Primary workflow",
    type: "text",
    required: true,
    placeholder: "What agent workflow are you trying to control or monitor?"
  },
  {
    id: "details",
    label: "What do you need visibility into?",
    type: "textarea",
    required: true,
    placeholder: "Tell us what runtime state, telemetry, replay, or orchestration problem matters most."
  }
];

export const externalLinks = {
  agentIdeRepo: "https://github.com/LuxenAI/agent-tree",
  interactiveTransformerRepo: "https://github.com/g4nesh/interactive-transformer"
};
