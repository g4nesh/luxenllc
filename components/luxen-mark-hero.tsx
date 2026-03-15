"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type LuxenMarkHeroProps = {
  interactive?: boolean;
  reducedMotion?: boolean;
  onInteractionChange?: (isActive: boolean) => void;
  className?: string;
};

const DynamicStage = dynamic(
  () => import("@/components/luxen-mark-stage").then((mod) => mod.LuxenMarkStage),
  {
    ssr: false,
    loading: () => <PosterFallback />
  }
);

function PosterFallback() {
  return (
    <div className="luxen-hero__poster">
      <div className="luxen-hero__poster-glow" aria-hidden="true" />
      <Image
        className="luxen-hero__poster-image"
        src="/branding/luxen-mark.svg"
        alt="Luxen monogram"
        width={520}
        height={680}
        priority
      />
    </div>
  );
}

function detectWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
}

export function LuxenMarkHero({
  interactive = true,
  reducedMotion,
  onInteractionChange,
  className
}: LuxenMarkHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const effectiveReducedMotion = reducedMotion ?? prefersReducedMotion ?? false;
  const [webglReady, setWebglReady] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglReady(detectWebGL());
  }, []);

  return (
    <div className={`luxen-hero${className ? ` ${className}` : ""}`}>
      {webglReady ? (
        <DynamicStage
          interactive={interactive}
          reducedMotion={effectiveReducedMotion}
          onInteractionChange={onInteractionChange}
        />
      ) : (
        <PosterFallback />
      )}
    </div>
  );
}
