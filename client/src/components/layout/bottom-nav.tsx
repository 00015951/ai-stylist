"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Shirt,
  CircleUser,
  Wand2,
} from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useTelegram } from "@/providers/telegram-provider";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";

/**
 * Floating dock - Mac OS style pill navigation
 */
export function BottomNav() {
  const pathname = usePathname();
  const { haptic } = useTelegram();
  const language = useAppStore((state) => state.language);
  const isStoryModalOpen = useAppStore((state) => state.isStoryModalOpen);
  const T = getTranslations(language);

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/welcome") || isStoryModalOpen) {
    return null;
  }

  const items = [
    {
      title: T.nav.home,
      icon: <Home className="h-5 w-5" strokeWidth={2} />,
      href: "/",
    },
    {
      title: (T.nav as Record<string, string>).stylist ?? "Stylist",
      icon: <Wand2 className="h-5 w-5" strokeWidth={2} />,
      href: "/stylist",
    },
    {
      title: T.nav.wardrobe,
      icon: <Shirt className="h-5 w-5" strokeWidth={2} />,
      href: "/wardrobe",
    },
    {
      title: T.nav.profile,
      icon: <CircleUser className="h-5 w-5" strokeWidth={2} />,
      href: "/profile",
    },
  ];

  return (
    <FloatingDock
      items={items}
      mobileClassName="bottom-4"
      onItemClick={() => haptic.selection()}
    />
  );
}
