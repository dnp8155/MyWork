import React, { useState, useEffect } from "react";
import { Download, Share, SquarePlus, X, Sparkles } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // 2. Check if user dismissed prompt recently
    const dismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 86400000 * 3) {
      // 3 days cooldown
      return;
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // 4. Android / Chrome / Desktop PWA prompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", String(Date.now()));
  };

  if (!showPrompt) return null;

  return (
    <div className="print:hidden fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* App Logo */}
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-1 flex-shrink-0 overflow-hidden shadow-inner">
            <img src="/icon-192.png" alt="MyWork App" className="w-full h-full object-cover rounded-lg" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Fast App Access
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Install MyWork App
            </h4>

            {isIOS ? (
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                To install on iPhone/iPad: tap <Share className="inline w-3.5 h-3.5 text-indigo-400 mx-0.5" /> then select{" "}
                <strong className="text-white">"Add to Home Screen"</strong> <SquarePlus className="inline w-3.5 h-3.5 text-indigo-400 mx-0.5" />.
              </p>
            ) : (
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Install on your mobile or desktop home screen for quick 1-tap full screen access.
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleDismiss}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Not Now
          </button>

          {!isIOS ? (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          ) : (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
            >
              Got It
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
