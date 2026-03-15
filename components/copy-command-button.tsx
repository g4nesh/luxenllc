"use client";

import { useEffect, useState } from "react";

type CopyCommandButtonProps = {
  command: string;
};

async function copyText(command: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(command);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = command;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyCommandButton({ command }: CopyCommandButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleClick = async () => {
    try {
      await copyText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="quickstart">
      <div className="quickstart__heading">
        <span className="quickstart__accent" aria-hidden="true">
          ›
        </span>
        <h2>Quick Start</h2>
      </div>

      <div className="quickstart__terminal">
        <div className="quickstart__bar">
          <div className="quickstart__lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="quickstart__tabs" aria-hidden="true">
            <span className="is-active">npm</span>
          </div>
        </div>

        <div className="quickstart__body">
          <p className="quickstart__hint">Install and start exploring the agent tree immediately.</p>

          <div className="quickstart__command">
            <span className="quickstart__prompt">$</span>
            <code>{command}</code>
            <button className="quickstart__copy" type="button" onClick={handleClick}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {copied ? "Install command copied." : ""}
      </span>
    </section>
  );
}
