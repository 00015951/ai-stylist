"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BottomNav } from "./bottom-nav";

interface MobileLayoutProps {
  children: React.ReactNode;
}

/**
 * Mobile-first layout wrapper
 * Animated soft gradient background (pink → blush → nude), bottom nav, safe area.
 * Welcome route gets full-bleed layout (no nav, no max-width).
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const isWelcome = pathname?.startsWith("/welcome") ?? false;

  if (isWelcome) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Burgundy gradient background */}
      <motion.div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-stone-50 via-rose-50/70 to-[#f5ebec]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 animate-gradient opacity-50"
          style={{
            background:
              "linear-gradient(135deg, #faf5f6 0%, #f5ebec 33%, #efe0e2 66%, #e8d4d7 100%)",
            backgroundSize: "400% 400%",
          }}
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </motion.div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-28 pt-safe-top">
        <div className="mx-auto max-w-lg px-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
