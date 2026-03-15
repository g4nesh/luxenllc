"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

const BASE_SPEED = 0.3;
const CONNECTION_DISTANCE = 120;

type LuxenNetworkBackgroundProps = {
  theme?: "light" | "dark";
};

export function LuxenNetworkBackground({ theme = "light" }: LuxenNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrame = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    const reduced = Boolean(prefersReducedMotion);
    const dotColor = theme === "dark" ? "rgba(221, 230, 255, 0.38)" : "rgba(0, 0, 0, 0.4)";
    const lineColor = theme === "dark" ? "rgba(146, 173, 230, 0.14)" : "rgba(0, 0, 0, 0.08)";
    const speed = theme === "dark" ? BASE_SPEED * 0.85 : BASE_SPEED;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 768 ? 30 : 60;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (reduced ? 0 : speed),
        vy: (Math.random() - 0.5) * (reduced ? 0 : speed),
        size: Math.random() * 1.5 + 0.5
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = dotColor;
        context.fill();

        for (let inner = index + 1; inner < particles.length; inner += 1) {
          const peer = particles[inner];
          const dx = particle.x - peer.x;
          const dy = particle.y - peer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            context.beginPath();
            context.strokeStyle = lineColor;
            context.lineWidth = 0.5;
            context.moveTo(particle.x, particle.y);
            context.lineTo(peer.x, peer.y);
            context.stroke();
          }
        }
      }
    };

    const tick = () => {
      draw();
      animationFrame = window.requestAnimationFrame(tick);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      tick();
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [prefersReducedMotion, theme]);

  return (
    <div className={`luxen-network luxen-network--${theme}`} aria-hidden="true">
      <canvas ref={canvasRef} className="luxen-network__canvas" />
      <div className="luxen-network__glow luxen-network__glow--top" />
      <div className="luxen-network__glow luxen-network__glow--bottom" />
    </div>
  );
}
