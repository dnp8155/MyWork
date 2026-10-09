import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || "Confirm Action",
        message: options.message || options.description || "",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger", // 'danger' | 'warning' | 'info'
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (dialog?.resolve) dialog.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Glassmorphism Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => handleClose(false)}
          />

          {/* Centered Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Top Close Icon */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              {/* Icon Badge */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  dialog.variant === "danger"
                    ? "bg-rose-100 text-rose-600"
                    : dialog.variant === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {dialog.variant === "danger" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : dialog.variant === "warning" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              {/* Title & Message */}
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {dialog.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                  {dialog.message}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                {dialog.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  dialog.variant === "danger"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-200"
                    : dialog.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
