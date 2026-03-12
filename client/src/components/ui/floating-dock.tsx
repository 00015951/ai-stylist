"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

export interface FloatingDockProps {
  items: DockItem[];
  className?: string;
  mobileClassName?: string;
  onItemClick?: () => void;
}

export function FloatingDock({
  items,
  className,
  mobileClassName,
  onItemClick,
}: FloatingDockProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 pb-safe-bottom",
        mobileClassName
      )}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-xl",
          "ring-1 ring-black/5",
          className
        )}
      >
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isActive && "bg-primary/10"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.span
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-stone-600"
                )}
              >
                {item.icon}
              </motion.span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-primary" : "text-stone-500"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
