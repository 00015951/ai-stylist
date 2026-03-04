"use client";

import { useRouter } from "next/navigation";
import { CircleUser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import { useTelegram } from "@/providers/telegram-provider";
import { getTranslations } from "@/lib/i18n";

const BODY_TYPE_KEYS: Record<string, keyof ReturnType<typeof getTranslations>["onboarding"]> = {
  slim: "slim",
  average: "average",
  athletic: "athletic",
  plus: "plusSize",
};

/**
 * Profile page - Displays user info and allows re-onboarding
 */
export default function ProfilePage() {
  const router = useRouter();
  const { haptic } = useTelegram();
  const language = useAppStore((state) => state.language);
  const profile = useAppStore((state) => state.profile);
  const stylePreferences = useAppStore((state) => state.stylePreferences);
  const setOnboardingComplete = useAppStore(
    (state) => state.setOnboardingComplete
  );
  const T = getTranslations(language);

  const handleResetOnboarding = () => {
    haptic.impact("medium");
    setOnboardingComplete(false);
    router.replace("/onboarding");
  };

  const bodyTypeLabel = profile
    ? (T.onboarding[BODY_TYPE_KEYS[profile.bodyType] as keyof typeof T.onboarding] as string) ?? profile.bodyType
    : "";

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">{T.profile.title}</h1>
        <p className="text-muted-foreground">{T.profile.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleUser className="h-5 w-5" strokeWidth={2} />
            {T.profile.yourProfile}
          </CardTitle>
          <CardDescription>{T.profile.profileNote}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{T.profile.height}</dt>
                <dd className="font-medium">{profile.height} cm</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{T.profile.weight}</dt>
                <dd className="font-medium">{profile.weight} kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{T.profile.gender}</dt>
                <dd className="font-medium capitalize">{profile.gender}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{T.profile.bodyType}</dt>
                <dd className="font-medium">{bodyTypeLabel}</dd>
              </div>
              {profile.defaultEvent && (
                <div>
                  <dt className="text-muted-foreground">{T.profile.event}</dt>
                  <dd className="font-medium capitalize">{profile.defaultEvent}</dd>
                </div>
              )}
              {profile.budget && (
                <div>
                  <dt className="text-muted-foreground">{T.profile.budget}</dt>
                  <dd className="font-medium capitalize">{profile.budget}</dd>
                </div>
              )}
              {stylePreferences.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">{T.profile.stylePreferences}</dt>
                  <dd className="font-medium capitalize">
                    {stylePreferences.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              {T.profile.completeOnboarding}
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleResetOnboarding}
      >
        <RotateCcw className="mr-2 h-4 w-4" strokeWidth={2} />
        {T.profile.editProfile}
      </Button>
    </div>
  );
}
