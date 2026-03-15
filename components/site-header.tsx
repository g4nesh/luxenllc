"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/">
        <Image src="/branding/luxen-mark.svg" alt="Luxen" width={24} height={32} />
        <div>
          <span className="brand-lockup__name">Luxen</span>
          <span className="brand-lockup__meta">Agent systems lab</span>
        </div>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              className={`site-nav__link${active ? " is-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link className="header-cta" href="/contact">
        Request access
      </Link>
    </header>
  );
}
