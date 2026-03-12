"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ruler,
  Briefcase,
  Heart,
  Coffee,
  Dumbbell,
  PartyPopper,
  Plane,
  Wallet,
  Gem,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { stepTransition } from "@/lib/animations";
import { useTelegram } from "@/providers/telegram-provider";
import { getApiBase, updateUserProfile } from "@/lib/api";

const PROFILE_STEPS = 4;

interface OnboardingProfileProps {
  formSubmitRef: React.MutableRefObject<(() => void) | null>;
  onNext: () => void;
}

const GENDER_OPTIONS: { value: string; key: "male" | "female"; icon: React.ReactNode }[] = [
  {
    value: "male",
    key: "male",
    icon: (
      <Image src="/icons/man.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
    ),
  },
  {
    value: "female",
    key: "female",
    icon: (
      <Image
        src="/icons/woman-face.png"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    ),
  },
];

const BODY_TYPE_OPTIONS: { value: string; key: "slim" | "average" | "athletic" | "plusSize"; icon: React.ReactNode }[] = [
  {
    value: "slim",
    key: "slim",
    icon: (
      <Image src="/icons/slim.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
    ),
  },
  {
    value: "average",
    key: "average",
    icon: (
      <Image src="/icons/more.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
    ),
  },
  {
    value: "athletic",
    key: "athletic",
    icon: (
      <Image
        src="/icons/athletic.png"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    ),
  },
  {
    value: "plus",
    key: "plusSize",
    // Plus size icon: Celebrity icons created by Hat Tech - Flaticon (https://www.flaticon.com/free-icons/celebrity)
    icon: (
      <svg
        className="h-6 w-6 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
  },
];

const EVENT_OPTIONS: { value: string; key: "any" | "work" | "date" | "weekend" | "sport" | "party" | "travel" | "occasionOther"; icon: React.ReactNode }[] = [
  { value: "any", key: "any", icon: <Sparkles className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "work", key: "work", icon: <Briefcase className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "date", key: "date", icon: <Heart className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "weekend", key: "weekend", icon: <Coffee className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "sport", key: "sport", icon: <Dumbbell className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "party", key: "party", icon: <PartyPopper className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "travel", key: "travel", icon: <Plane className="h-5 w-5" strokeWidth={1.75} /> },
  {
    value: "other",
    key: "occasionOther",
    icon: (
      <Image src="/icons/others.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />
    ),
  },
];

const BUDGET_OPTIONS: { value: string; key: "budgetLow" | "budgetMedium" | "budgetHigh"; icon: React.ReactNode }[] = [
  { value: "low", key: "budgetLow", icon: <Wallet className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "medium", key: "budgetMedium", icon: <Wallet className="h-5 w-5" strokeWidth={1.75} /> },
  { value: "high", key: "budgetHigh", icon: <Gem className="h-5 w-5" strokeWidth={1.75} /> },
];

/** Reusable option button: neutral border, selected = dark bg + white text, hover scale + shadow */
function OptionButton({
  children,
  isSelected,
  onClick,
  className,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border-2 bg-white py-3.5 px-4 text-sm font-medium transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
        "hover:shadow-md active:scale-[0.99]",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-md [&_img]:invert"
          : "icon-burgundy border-neutral-200 bg-white text-neutral-700 hover:border-primary/50 hover:shadow-sm",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/**
 * Step 2: Profile setup — 4-step wizard (Gender → Body Type → Occasion → Budget)
 * Premium minimal fashion aesthetic: neutral palette, single dark accent
 */
export function OnboardingProfile({
  formSubmitRef,
  onNext,
}: OnboardingProfileProps) {
  const language = useAppStore((state) => state.language);
  const setProfile = useAppStore((state) => state.setProfile);
  const { initData } = useTelegram();
  const T = getTranslations(language);
  const [subStep, setSubStep] = useState(1);
  const [gender, setGender] = useState<string>("");
  const [bodyType, setBodyType] = useState<string>("");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [defaultEvent, setDefaultEvent] = useState("any");
  const [occasionOtherText, setOccasionOtherText] = useState("");
  const [budget, setBudget] = useState("medium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progressPercent = (subStep / PROFILE_STEPS) * 100;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const h = Number(height);
    const w = Number(weight);
    if (isNaN(h) || h < 100 || h > 250) {
      newErrors.height = T.onboarding.validationHeight;
    }
    if (isNaN(w) || w < 30 || w > 300) {
      newErrors.weight = T.onboarding.validationWeight;
    }
    if (!gender) newErrors.gender = T.onboarding.validationGender;
    if (!bodyType) newErrors.bodyType = T.onboarding.validationBodyType;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (subStep === 1 && !gender) {
      setErrors({ gender: T.onboarding.validationGender });
      return;
    }
    if (subStep === 2) {
      if (!bodyType) {
        setErrors({ bodyType: T.onboarding.validationBodyType });
        return;
      }
      const h = Number(height);
      const w = Number(weight);
      if (isNaN(h) || h < 100 || h > 250) {
        setErrors((e) => ({ ...e, height: T.onboarding.validationHeight }));
        return;
      }
      if (isNaN(w) || w < 30 || w > 300) {
        setErrors((e) => ({ ...e, weight: T.onboarding.validationWeight }));
        return;
      }
      setErrors({});
    }
    if (subStep < PROFILE_STEPS) {
      setSubStep((s) => s + 1);
      setErrors({});
    } else {
      if (!validate()) return;
      const profileData = {
        height: Number(height),
        weight: Number(weight),
        gender,
        bodyType,
        defaultEvent:
          defaultEvent && defaultEvent !== "any"
            ? defaultEvent === "other"
              ? occasionOtherText.trim() || "other"
              : defaultEvent
            : undefined,
        budget: budget || "medium",
      };
      setProfile(profileData);
      if (getApiBase() && initData) {
        updateUserProfile(
          { ...profileData, stylePreferences: [] },
          initData
        ).catch(() => {});
      }
      onNext();
    }
  };

  const goBack = () => {
    if (subStep > 1) {
      setSubStep((s) => s - 1);
      setErrors({});
    }
  };

  formSubmitRef.current = goNext;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-0 flex-1 flex-col gap-6"
    >
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-500">
          <span>
            {T.onboarding.stepOf.replace("{step}", String(subStep)).replace("{total}", String(PROFILE_STEPS))}
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Card container - flex-1 so actions stay at bottom */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Gender */}
          {subStep === 1 && (
            <motion.div
              key="step1"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900">{T.onboarding.stepGender}</h3>
                <p className="text-sm text-neutral-500">{T.onboarding.stepGenderDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    isSelected={gender === opt.value}
                    onClick={() => {
                      setGender(opt.value);
                      setErrors((e) => ({ ...e, gender: "" }));
                    }}
                    className="flex-col gap-2 py-4"
                  >
                    <span className={cn("text-neutral-500", gender === opt.value && "text-white")}>
                      {opt.icon}
                    </span>
                    <span>{T.onboarding[opt.key]}</span>
                  </OptionButton>
                ))}
              </div>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </motion.div>
          )}

          {/* Step 2: Body Type + Height/Weight */}
          {subStep === 2 && (
            <motion.div
              key="step2"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900">{T.onboarding.stepBodyType}</h3>
                <p className="text-sm text-neutral-500">{T.onboarding.stepBodyTypeDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BODY_TYPE_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    isSelected={bodyType === opt.value}
                    onClick={() => {
                      setBodyType(opt.value);
                      setErrors((e) => ({ ...e, bodyType: "" }));
                    }}
                    className="flex-row gap-3"
                  >
                    {opt.icon}
                    <span>{T.onboarding[opt.key]}</span>
                  </OptionButton>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-neutral-100 pt-5">
                <Ruler className="h-5 w-5 shrink-0 text-neutral-400" strokeWidth={1.5} />
                <div className="grid flex-1 grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-xs font-medium text-neutral-600">
                      {T.profile.heightCm}
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      min={100}
                      max={250}
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        setErrors((e) => ({ ...e, height: "" }));
                      }}
                      className="rounded-lg border-neutral-200 bg-neutral-50/50 focus:border-neutral-400 focus:ring-neutral-400/20"
                      aria-invalid={!!errors.height}
                    />
                    {errors.height && (
                      <p className="text-xs text-red-600">{errors.height}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-xs font-medium text-neutral-600">
                      {T.profile.weightKg}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      min={30}
                      max={300}
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        setErrors((e) => ({ ...e, weight: "" }));
                      }}
                      className="rounded-lg border-neutral-200 bg-neutral-50/50 focus:border-neutral-400 focus:ring-neutral-400/20"
                      aria-invalid={!!errors.weight}
                    />
                    {errors.weight && (
                      <p className="text-xs text-red-600">{errors.weight}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Occasion */}
          {subStep === 3 && (
            <motion.div
              key="step3"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900">{T.onboarding.stepOccasion}</h3>
                <p className="text-sm text-neutral-500">{T.onboarding.stepOccasionDesc}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                {EVENT_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    isSelected={defaultEvent === opt.value}
                    onClick={() => setDefaultEvent(opt.value)}
                    className="flex-col gap-1 py-3 px-2"
                  >
                    {opt.icon}
                    <span className="text-xs truncate w-full text-center">{T.onboarding[opt.key]}</span>
                  </OptionButton>
                ))}
              </div>
              {defaultEvent === "other" && (
                <div className="space-y-1.5 border-t border-neutral-100 pt-4">
                  <Label htmlFor="occasion-other" className="text-xs font-medium text-neutral-600">
                    {T.onboarding.occasionOther}
                  </Label>
                  <Input
                    id="occasion-other"
                    type="text"
                    placeholder={T.onboarding.occasionOtherPlaceholder}
                    value={occasionOtherText}
                    onChange={(e) => setOccasionOtherText(e.target.value)}
                    className="rounded-lg border-neutral-200 bg-neutral-50/50 focus:border-neutral-400 focus:ring-neutral-400/20"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Budget */}
          {subStep === 4 && (
            <motion.div
              key="step4"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900">{T.onboarding.stepBudget}</h3>
                <p className="text-sm text-neutral-500">{T.onboarding.stepBudgetDesc}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    isSelected={budget === opt.value}
                    onClick={() => setBudget(opt.value)}
                    className="flex-col gap-2 py-4"
                  >
                    {opt.icon}
                    <span className="text-xs sm:text-sm">{T.onboarding[opt.key]}</span>
                  </OptionButton>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

      {/* Back only — Continue via Telegram MainButton */}
      {subStep > 1 && (
        <div className="mt-auto shrink-0 pt-4">
          <Button
            type="button"
            variant="outline"
            className="min-h-[48px] w-full rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
            onClick={goBack}
          >
            {T.onboarding.back}
          </Button>
        </div>
      )}
      </div>
    </motion.div>
  );
}
