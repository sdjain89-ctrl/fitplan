"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

const DISMISS_KEY = "hp_install_hint_dismissed";

function isIOSDevice(): boolean {
  const ua = navigator.userAgent;
  const isIPhoneOrIPad = /iphone|ipad|ipod/i.test(ua);
  const isIPadOSDesktopUA = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIPhoneOrIPad || isIPadOSDesktopUA;
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // ignore storage errors, show the hint anyway
    }
    if (isIOSDevice() && !isStandalone()) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // best-effort only
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-[76px] z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Share size={16} />
      </span>
      <p className="flex-1 text-xs text-slate-600">
        Install FitPlan: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </p>
      <button onClick={dismiss} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100">
        <X size={16} />
      </button>
    </div>
  );
}
