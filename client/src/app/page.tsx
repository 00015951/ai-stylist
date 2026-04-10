"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { HomePage } from "@/components/home/home-page";

/**
 * Root page - First shows welcome; if onboarding not completed redirects to welcome.
 * After onboarding, shows the main home/dashboard.
 */
export default function Page() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding
  );

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? new URL(window.location.href).searchParams.get("token")
        : null;
    if (token) {
      router.replace(`/welcome?token=${encodeURIComponent(token)}`);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.replace("/welcome");
    }
  }, [hasCompletedOnboarding, router]);

  // Show nothing while redirecting (avoids flash)
  if (!hasCompletedOnboarding) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <HomePage />;
}
