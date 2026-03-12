import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Personal Stylist | Virtual AI Stylist",
  description:
    "Elevate your style with intelligent outfit recommendations designed around your body, lifestyle and budget.",
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
