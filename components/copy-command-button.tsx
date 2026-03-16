"use client";

import { useEffect, useState } from "react";

type CommandOption = {
  label: string;
  command: string;
  description?: string;
};

type CopyCommandButtonProps = {
  command?: string;
  options?: CommandOption[];
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

export function CopyCommandButton({ command, options }: CopyCommandButtonProps) {
  const commandOptions = options?.length
    ? options
    : command
      ? [{ label: "npm install", command, description: "Install the viewer package locally." }]
      : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeOption = commandOptions[selectedIndex] ?? commandOptions[0];

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    setCopied(false);
  }, [selectedIndex]);

  if (!activeOption) {
    return null;
  }

  const handleClick = async () => {
    try {
      await copyText(activeOption.command);
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

          <div className="quickstart__tabs" role="group" aria-label="Quick start command options">
            {commandOptions.map((option, index) => (
              <button
                key={option.command}
                className={`quickstart__tab${index === selectedIndex ? " is-active" : ""}`}
                type="button"
                aria-pressed={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="quickstart__body">
          <p className="quickstart__hint">
            {activeOption.description ?? "Choose a command to install or launch the viewer immediately."}
          </p>

          <div className="quickstart__command">
            <span className="quickstart__prompt">$</span>
            <code>{activeOption.command}</code>
            <button className="quickstart__copy" type="button" onClick={handleClick}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {copied ? "Command copied." : ""}
      </span>
    </section>
  );
}
