import Link from "next/link";
import { LuxenMarkHero } from "@/components/luxen-mark-hero";
import { LuxenNetworkBackground } from "@/components/luxen-network-background";

export default function HomePage() {
  return (
    <section className="home-page">
      <LuxenNetworkBackground />

      <div className="home-page__inner">
        <div className="home-page__stage">
          <LuxenMarkHero interactive className="luxen-hero--home" />
        </div>

        <div className="home-page__content">
          <p className="home-page__subtitle">Applied AI Lab</p>
          <h1>LUXEN</h1>
          <p className="home-page__statement">We are working on Agentic Automation.</p>
          <p className="home-page__support">
            While the industry races toward generalization, we focus on creating intelligent context layers that make
            agents reliable, fast, and truly autonomous.
          </p>

          <Link className="home-page__cta" href="/agentide">
            <span className="home-page__cta-dot" aria-hidden="true" />
            <span>Currently Building:</span>
            <strong>AgentIDE</strong>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <footer className="home-page__footer">© 2026 All Rights Reserved.</footer>
    </section>
  );
}
