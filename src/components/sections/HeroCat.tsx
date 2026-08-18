"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRive, Fit, Alignment, Layout, Rive } from "@rive-app/react-canvas";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const RIVE_FILE = "/assets/19518-36707-cat-and-dog-toggle.riv";
const FALLBACK_IMAGE = "/images/hero-cat.jpg";

interface RiveInput {
  name: string;
  value: number | boolean;
}

interface RiveWithInputs extends Rive {
  inputs: RiveInput[];
}

interface HeroCatProps {
  className?: string;
  heroRef: React.RefObject<HTMLDivElement | null>;
}

export function HeroCat({ className, heroRef }: HeroCatProps) {
  const reduced = useReducedMotion();
  const [error, setError] = useState(false);
  const [inputsReady, setInputsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseXInputRef = useRef<RiveInput | null>(null);
  const mouseYInputRef = useRef<RiveInput | null>(null);

  const { rive, setCanvasRef, RiveComponent } = useRive({
    src: RIVE_FILE,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onRiveReady: (riveInstance: Rive) => {
      const riveWithInputs = riveInstance as RiveWithInputs;
      const inputs = riveWithInputs.inputs || [];
      
      const mouseX = inputs.find((i: RiveInput) => 
        /mouse.*x|pointer.*x|eye.*x|cursor.*x/i.test(i.name)
      );
      const mouseY = inputs.find((i: RiveInput) => 
        /mouse.*y|pointer.*y|eye.*y|cursor.*y/i.test(i.name)
      );

      if (mouseX) mouseXInputRef.current = mouseX;
      if (mouseY) mouseYInputRef.current = mouseY;

      console.log("[HeroCat] Rive loaded. Inputs:", inputs.map((i: RiveInput) => i.name));
      setInputsReady(true);
    },
    onLoadError: () => {
      setError(true);
    },
  });

  useEffect(() => {
    if (rive && reduced) {
      rive.pause();
    } else if (rive) {
      rive.play();
    }
  }, [rive, reduced]);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = containerRef.current?.querySelector("canvas");
    if (!hero || !canvas || !mouseXInputRef.current || !mouseYInputRef.current) return;

    function onMouseMove(e: MouseEvent) {
      const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      mouseXInputRef.current!.value = x;
      mouseYInputRef.current!.value = y;
    }

    hero.addEventListener("mousemove", onMouseMove);
    return () => hero.removeEventListener("mousemove", onMouseMove);
  }, [heroRef, inputsReady]);

  if (error) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full ${className}`}
        style={{ background: "transparent" }}
        aria-hidden="true"
      >
        <Image
          src={FALLBACK_IMAGE}
          alt="گربه در کلینیک دامپزشکی باران"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <RiveComponent
        ref={setCanvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      />
    </div>
  );
}