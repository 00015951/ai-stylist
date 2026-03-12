"use client";

import { useEffect, useRef, useState } from "react";

const CURSOR_SIZE = 12;
const MAGNETIC_RADIUS = 48;
const MAGNETIC_STRENGTH = 0.12;
const LERP_SPEED = 0.18;
const BREATH_CYCLE_MS = 3000;

const INTERACTIVE_SELECTORS = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[data-cursor-interactive]",
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const magnetic = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const rafRef = useRef<number>();

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none)").matches;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add("custom-cursor-active");
    const breathStart = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
      target.current.x = -100;
      target.current.y = -100;
      pos.current = { x: -100, y: -100 };
    };

    const getMagneticOffset = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { x: 0, y: 0 };

      const interactive = el.closest(INTERACTIVE_SELECTORS.join(", "));
      if (!interactive) return { x: 0, y: 0 };

      const rect = interactive.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - x;
      const dy = cy - y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = Math.max(0, 1 - dist / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
      return { x: dx * pull, y: dy * pull };
    };

    const animate = () => {
      const t = target.current;
      const p = pos.current;
      magnetic.current = getMagneticOffset(t.x, t.y);

      pos.current.x = lerp(p.x, t.x + magnetic.current.x, LERP_SPEED);
      pos.current.y = lerp(p.y, t.y + magnetic.current.y, LERP_SPEED);

      const breath =
        Math.sin(((performance.now() - breathStart) / BREATH_CYCLE_MS) * Math.PI * 2) *
        0.03;
      scaleRef.current = 1 + breath;

      if (dot) {
        dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${scaleRef.current})`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  return (
    <div
      ref={dotRef}
      className="custom-cursor-dot"
      aria-hidden
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        left: 0,
        top: 0,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
