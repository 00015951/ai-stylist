"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { useAppStore } from "@/store/use-app-store";

/**
 * Onboarding page - Multi-step form for new users
 * Steps: 1) Welcome, 2) Profile, 3) Style Preferences
 */
export default function OnboardingPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding
  );

  // Redirect to home if already onboarded
  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.replace("/");
    }
  }, [hasCompletedOnboarding, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50 pt-safe-top">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-6">
        <OnboardingFlow onComplete={() => router.replace("/")} />
      </div>
    </div>
  );
}
