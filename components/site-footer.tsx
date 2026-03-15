import Link from "next/link";
import { externalLinks, navItems } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-label">Luxen LLC</p>
        <p className="footer-copy">
          Building operator-grade control surfaces for live agent runtimes, structured replay, and
          truthful observability.
        </p>
      </div>

      <div className="footer-links">
        <div>
          <p className="footer-links__title">Navigate</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="footer-links__title">Projects</p>
          <a href={externalLinks.agentIdeRepo} target="_blank" rel="noreferrer">
            AgentIDE GitHub
          </a>
          <a href={externalLinks.interactiveTransformerRepo} target="_blank" rel="noreferrer">
            Interactive Transformer GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
