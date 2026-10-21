import React, { createContext, useContext, useState, useEffect } from "react";

const PWAContext = createContext({
  deferredPrompt: null,
  isIOS: false,
  isStandalone: false,
  canInstall: false,
  installApp: async () => {},
  showIOSInstructions: false,
  setShowIOSInstructions: () => {},
});

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Check standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    // 3. Listen for Android / Chrome / Edge install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__pwa_deferred_prompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If prompt was captured before React mounted
    if (window.__pwa_deferred_prompt) {
      setDeferredPrompt(window.__pwa_deferred_prompt);
    }

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      window.__pwa_deferred_prompt = null;
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    const prompt = deferredPrompt || window.__pwa_deferred_prompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        window.__pwa_deferred_prompt = null;
      }
      return outcome;
    } else if (isIOS) {
      setShowIOSInstructions(true);
      return "ios_instructions";
    } else {
      // Fallback: If browser already installed or not directly triggerable via beforeinstallprompt
      setShowIOSInstructions(true);
      return "manual_instructions";
    }
  };

  const canInstall = !isStandalone;

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isIOS,
        isStandalone,
        canInstall,
        installApp,
        showIOSInstructions,
        setShowIOSInstructions,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
