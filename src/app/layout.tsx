import type { Metadata, Viewport } from "next";
import { Archivo_Black, Cantata_One, Inter, Limelight, Playfair_Display_SC } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/providers/telegram-provider";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { CustomCursor } from "@/components/ui/custom-cursor";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
});

const cantataOne = Cantata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cantata",
});

const limelight = Limelight({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-limelight",
});

const playfairDisplaySC = Playfair_Display_SC({
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Virtual AI Stylist",
  description: "Your personal AI fashion assistant - Get outfit recommendations for any occasion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#722F37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Cantata+One&family=Limelight&family=Playfair+Display+SC:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${archivoBlack.variable} ${cantataOne.variable} ${inter.variable} ${limelight.variable} ${playfairDisplaySC.variable} font-sans`}
      >
        <CustomCursor />
        <TelegramProvider>
          <MobileLayout>{children}</MobileLayout>
        </TelegramProvider>
      </body>
    </html>
  );
}
