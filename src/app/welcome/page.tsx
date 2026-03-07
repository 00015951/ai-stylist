"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Sparkles,
  Shirt,
  ScanLine,
  Calendar,
  Wallet,
  Layers,
} from "lucide-react";

const HERO_IMAGE =
  "https://careerpath.pro/media/img/ru/professions/stylist/stylist.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const stagger = (delay: number) => ({
  ...fadeIn,
  transition: { ...fadeIn.transition, delay },
});

export default function WelcomePage() {
  return (
    <div
      className="min-h-dvh w-full"
      style={{ backgroundColor: "#F8F7F4" }}
    >
      {/* ——— 1) HERO SECTION ——— */}
      <section className="flex w-full flex-col items-center justify-center px-4 py-4 md:min-h-screen md:flex-row md:items-center md:justify-between md:gap-6 md:px-8 md:py-8 lg:mx-auto lg:max-w-7xl lg:px-12 lg:gap-10">
        <div className="flex max-w-xl flex-1 flex-col md:pr-2">
          <motion.h1
            className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: "#0F0F0F" }}
            {...stagger(0.1)}
          >
            AI Personal Stylist
          </motion.h1>
          <motion.p
            className="mt-4 max-w-md text-lg leading-relaxed opacity-90 md:text-xl"
            style={{ color: "#0F0F0F" }}
            {...stagger(0.2)}
          >
            Elevate your style with intelligent outfit recommendations designed
            around your body, lifestyle and budget.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4"
            {...stagger(0.3)}
          >
            <Link
              href="/onboarding"
              className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-lg px-8 text-base font-medium transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#722F37] active:scale-[0.98]"
              style={{
                backgroundColor: "#722F37",
                color: "#F8F7F4",
                boxShadow: "0 2px 12px rgba(114, 47, 55, 0.25)",
              }}
            >
              Generate My Style ✨
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 flex flex-1 items-center justify-center md:mt-0"
          {...stagger(0.35)}
        >
          <div
            className="relative h-[260px] w-full max-w-sm overflow-hidden rounded-xl md:h-[340px] md:max-w-md"
            style={{
              boxShadow: "0 8px 32px rgba(15, 15, 15, 0.06)",
            }}
          >
            <Image
              src={HERO_IMAGE}
              alt="AI Personal Stylist – fashion and style"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 28rem"
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* ——— 2) TRUST LINE ——— */}
      <section className="w-full px-4 py-2 md:py-4">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-sm font-medium tracking-wide opacity-75 md:text-base"
            style={{ color: "#0F0F0F" }}
          >
            Personalized styling powered by AI technology
          </p>
          <div
            className="mx-auto mt-3 h-px w-24"
            style={{ backgroundColor: "#722F37", opacity: 0.35 }}
          />
        </motion.div>
      </section>

      {/* ——— 3) HOW IT WORKS ——— */}
      <section className="w-full px-4 py-6 md:py-10">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="font-heading text-center text-2xl font-semibold tracking-tight md:text-3xl"
            style={{ color: "#0F0F0F" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            How it works
          </motion.h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                icon: User,
                title: "Enter Your Details",
                description:
                  "Share your preferences, body type and style goals in a few simple steps.",
              },
              {
                icon: Sparkles,
                title: "AI Analyzes Your Style",
                description:
                  "Our AI builds a personalized style profile and recommends pieces that fit you.",
              },
              {
                icon: Shirt,
                title: "Receive Curated Outfit",
                description:
                  "Get outfit ideas and a capsule wardrobe tailored to your lifestyle.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl border border-[#0F0F0F]/8 bg-white/60 p-5 transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(15,15,15,0.06)]"
                style={{ boxShadow: "0 2px 12px rgba(15, 15, 15, 0.04)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#F8F7F4" }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: "#722F37" }}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className="font-heading mt-3 text-lg font-semibold"
                  style={{ color: "#0F0F0F" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-1.5 text-sm leading-relaxed opacity-80"
                  style={{ color: "#0F0F0F" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 4) FEATURES (two-column) ——— */}
      <section className="w-full px-4 py-6 md:py-10" style={{ backgroundColor: "#F0EDE8" }}>
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="font-heading text-center text-2xl font-semibold tracking-tight md:text-3xl"
            style={{ color: "#0F0F0F" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            Built for you
          </motion.h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
            {[
              {
                icon: ScanLine,
                title: "Smart Body Analysis",
                description:
                  "Recommendations that flatter your shape and proportions for a confident fit.",
              },
              {
                icon: Calendar,
                title: "Occasion-Based Styling",
                description:
                  "Outfits for work, weekend, events and travel—all aligned with your taste.",
              },
              {
                icon: Wallet,
                title: "Budget Personalization",
                description:
                  "Set your spending range and get options that respect your budget.",
              },
              {
                icon: Layers,
                title: "Capsule Wardrobe Generator",
                description:
                  "A minimal, versatile wardrobe that mixes and matches effortlessly.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="flex gap-4 rounded-xl p-4 transition-colors duration-200"
                style={{ backgroundColor: "#F8F7F4" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgba(114, 47, 55, 0.12)" }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: "#722F37" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: "#0F0F0F" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-1 text-sm leading-relaxed opacity-80"
                    style={{ color: "#0F0F0F" }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 5) FINAL CTA ——— */}
      <section className="w-full px-4 py-8 md:py-12">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-heading text-2xl font-semibold tracking-tight md:text-3xl"
            style={{ color: "#0F0F0F" }}
          >
            Ready to redefine your style?
          </h2>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-lg px-8 text-base font-medium transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#722F37] active:scale-[0.98]"
            style={{
              backgroundColor: "#722F37",
              color: "#F8F7F4",
              boxShadow: "0 2px 16px rgba(114, 47, 55, 0.28)",
            }}
          >
            Generate My Style ✨
          </Link>
        </motion.div>
      </section>

      {/* ——— FOOTER ——— */}
      <footer className="mt-12 pb-8 pt-8 md:mt-16 md:pb-10 md:pt-10">
        <p className="mx-auto max-w-2xl px-4 text-center text-sm text-gray-500">
          © 2026 Moxinur Maxamadnazimova – AI Personal Stylist Project, University of Westminster
        </p>
      </footer>
    </div>
  );
}
