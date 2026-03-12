"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OnboardingWelcomeProps {
  onNext: () => void;
}

/**
 * Step 1: Welcome screen
 * Introduces the app and encourages user to begin
 */
export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon - visual anchor for the welcome */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" aria-hidden />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Virtual AI Stylist
          </h1>
          <p className="text-muted-foreground max-w-sm">
            Get personalized outfit recommendations for any occasion. Your AI
            fashion assistant is ready to help you look your best!
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">What you&apos;ll set up</CardTitle>
          <CardDescription>
            A quick 2-minute setup to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 text-sm">
            <span className="text-primary font-medium">1.</span>
            <span>Your body profile (height, weight, body type)</span>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-primary font-medium">2.</span>
            <span>Your style preferences</span>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full max-w-sm min-h-[48px]"
        onClick={onNext}
        aria-label="Start styling setup"
      >
        Start Styling
      </Button>
    </div>
  );
}
