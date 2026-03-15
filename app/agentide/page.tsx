import Link from "next/link";
import { CopyCommandButton } from "@/components/copy-command-button";
import { LuxenNetworkBackground } from "@/components/luxen-network-background";

export const metadata = {
  title: "AgentIDE"
};

const masterAgent = {
  status: "LIVE",
  time: "now",
  name: "Master Agent",
  description: "You are in control.",
  chip: "Control"
};

const leadAgents = [
  { status: "LIVE", time: "now", name: "Planning Lead", description: "Breaks work into steps.", chip: "Planning" },
  { status: "LIVE", time: "now", name: "Evidence Lead", description: "Finds the right inputs.", chip: "Evidence" },
  { status: "LIVE", time: "now", name: "Synthesis Lead", description: "Combines outputs.", chip: "Synthesis" },
  { status: "LIVE", time: "now", name: "Audit Lead", description: "Checks gaps and risks.", chip: "Audit" }
];

export default function AgentIDEPage() {
  return (
    <section className="agentide-page">
      <LuxenNetworkBackground theme="dark" />
      <div className="agentide-page__shade" aria-hidden="true" />

      <div className="agentide-page__inner">
        <Link className="agentide-page__back" href="/">
          ← Back to Luxen
        </Link>

        <header className="agentide-hero">
          <div className="agentide-hero__copy">
            <p className="agentide-hero__label">Currently Building</p>
            <h1>AGENT IDE</h1>
            <p className="agentide-hero__description">
              A control surface for seeing, steering, and organizing live agents from one place.
            </p>
          </div>

          <a className="agentide-hero__link" href="https://github.com/IshaanAyaan/AgentIDE" target="_blank" rel="noreferrer">
            View GitHub
          </a>
        </header>

        <CopyCommandButton command="npm install agent-tree-viewer" />

        <section className="agentide-diagram">
          <div className="agentide-diagram__row agentide-diagram__row--master">
            <div className="agentide-tier">
              <span>TIER 0</span>
              <strong>MASTER</strong>
            </div>

            <article className="agentide-card agentide-card--master">
              <div className="agentide-card__top">
                <span>{masterAgent.status}</span>
                <span>{masterAgent.time}</span>
              </div>
              <h2>{masterAgent.name}</h2>
              <p>{masterAgent.description}</p>
              <small>{masterAgent.chip}</small>
            </article>
          </div>

          <div className="agentide-diagram__flow" aria-hidden="true">
            <span className="agentide-diagram__stem" />
            <span className="agentide-diagram__rail" />
          </div>

          <div className="agentide-diagram__row agentide-diagram__row--lead">
            <div className="agentide-tier">
              <span>TIER 1</span>
              <strong>LEAD AGENTS</strong>
            </div>

            <div className="agentide-diagram__grid">
              {leadAgents.map((card) => (
                <article className="agentide-card" key={card.name}>
                  <div className="agentide-card__top">
                    <span>{card.status}</span>
                    <span>{card.time}</span>
                  </div>
                  <h2>{card.name}</h2>
                  <p>{card.description}</p>
                  <small>{card.chip}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <p className="agentide-page__caption">
          Install first, then use the runtime map to understand how work fans out across the system.
        </p>
      </div>
    </section>
  );
}
