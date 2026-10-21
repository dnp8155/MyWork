import React, { useState, useEffect } from "react";
import { Download, Share, SquarePlus, X, Sparkles, Smartphone } from "lucide-react";
import { usePWA } from "@/lib/PWAContext";

export default function PWAInstallPrompt() {
  const { isIOS, isStandalone, deferredPrompt, installApp, showIOSInstructions, setShowIOSInstructions } = usePWA();
  const [showAutoBanner, setShowAutoBanner] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    // Cooldown check for floating auto banner (3 days)
    const dismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 86400000 * 3) {
      return;
    }

    // Auto show if prompt is ready or if it's iOS Safari
    if (deferredPrompt || isIOS) {
      const timer = setTimeout(() => {
        setShowAutoBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone, deferredPrompt, isIOS]);

  const handleDismiss = () => {
    setShowAutoBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa_prompt_dismissed", String(Date.now()));
  };

  const handleInstallClick = async () => {
    await installApp();
    setShowAutoBanner(false);
  };

  // 1. Manual / iOS Instructions Modal (when clicked from sidebar or iOS prompt)
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 text-white border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 relative shadow-2xl">
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Install App</h3>
              <p className="text-xs text-slate-400">Fast 1-tap mobile experience</p>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3 text-xs text-slate-300 mt-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <p className="font-medium text-slate-200">Follow these 2 simple steps:</p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button <Share className="inline w-3.5 h-3.5 text-indigo-400 mx-0.5" /> at the bottom of Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <span>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> <SquarePlus className="inline w-3.5 h-3.5 text-indigo-400 mx-0.5" />.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-slate-300 mt-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p>
                In your mobile browser (Chrome/Edge/Brave), open the browser menu (<strong className="text-white">⋮</strong>) and tap <strong className="text-indigo-400">"Install App"</strong> or <strong className="text-indigo-400">"Add to Home screen"</strong>.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Auto popup banner
  if (!showAutoBanner || isStandalone) return null;

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
                Install on your mobile home screen for quick 1-tap full screen access and offline view.
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
