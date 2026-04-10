"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleUser, RotateCcw, User } from "lucide-react";
import Image from "next/image";
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
import { getUserProfile } from "@/lib/api";
import { useStyles, getStyleName } from "@/hooks/use-styles";

const BODY_TYPE_KEYS: Record<string, keyof ReturnType<typeof getTranslations>["onboarding"]> = {
  slim: "slim",
  average: "average",
  athletic: "athletic",
  plus: "plusSize",
};

/**
 * Profile page - Displays user info and allows re-onboarding
 */
type TelegramUser = {
  telegram: {
    fullName: string;
    username?: string;
    phone?: string;
    photoUrl?: string;
    firstName?: string;
    lastName?: string;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { haptic, initData } = useTelegram();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const language = useAppStore((state) => state.language);
  const profile = useAppStore((state) => state.profile);
  const stylePreferences = useAppStore((state) => state.stylePreferences);
  const setOnboardingComplete = useAppStore(
    (state) => state.setOnboardingComplete
  );
  const setProfile = useAppStore((state) => state.setProfile);
  const setStylePreferences = useAppStore((state) => state.setStylePreferences);
  const { styles: apiStyles } = useStyles();
  const T = getTranslations(language);

  useEffect(() => {
    if (!initData) return;
    getUserProfile(initData).then((data) => {
      if (!data) return;
      setTelegramUser(data);
      if (process.env.NEXT_PUBLIC_API_URL && data.onboarding) {
        const o = data.onboarding;
        setProfile({
          height: o.height ?? 170,
          weight: o.weight ?? 70,
          gender: o.gender ?? "other",
          bodyType: o.bodyType ?? "average",
          defaultEvent: o.defaultEvent ?? undefined,
          budget: o.budget ?? "medium",
        });
        if (Array.isArray(o.stylePreferences)) setStylePreferences(o.stylePreferences);
        setOnboardingComplete(true);
      }
    });
  }, [initData, setProfile, setStylePreferences, setOnboardingComplete]);

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

      {telegramUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" strokeWidth={2} />
              Telegram
            </CardTitle>
            <CardDescription>Telegram hisobingiz maʼlumotlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {telegramUser.telegram.photoUrl ? (
                <Image
                  src={telegramUser.telegram.photoUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" strokeWidth={2} />
                </div>
              )}
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-muted-foreground">Ism</dt>
                  <dd className="font-medium">{telegramUser.telegram.fullName || "—"}</dd>
                </div>
                {telegramUser.telegram.username && (
                  <div>
                    <dt className="text-muted-foreground">Username</dt>
                    <dd className="font-medium">@{telegramUser.telegram.username}</dd>
                  </div>
                )}
                {telegramUser.telegram.phone && (
                  <div>
                    <dt className="text-muted-foreground">Telefon</dt>
                    <dd className="font-medium">+{telegramUser.telegram.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </CardContent>
        </Card>
      )}

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
                    {apiStyles.length > 0
                      ? stylePreferences.map((k) => getStyleName(apiStyles, k, language)).join(", ")
                      : stylePreferences.join(", ")}
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
