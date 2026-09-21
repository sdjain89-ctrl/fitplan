import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitPlan — Personal Nutrition & Training Tracker",
  description:
    "Track food and activity, plan meals and workouts, and hit daily calorie & macro targets built around building muscle and losing fat.",
  applicationName: "FitPlan",
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitPlan",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <InstallPrompt />
      </body>
    </html>
  );
}
