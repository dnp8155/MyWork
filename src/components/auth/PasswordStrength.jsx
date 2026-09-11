import React from "react";
import { Check, X } from "lucide-react";

export default function PasswordStrength({ password, confirmPassword }) {
  if (!password) return null;
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Upper & lowercase", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Passwords match", ok: confirmPassword.length > 0 && password === confirmPassword },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const barTone = passed <= 1 ? "bg-rose-400" : passed === 2 ? "bg-amber-400" : passed === 3 ? "bg-indigo-500" : "bg-emerald-500";
  return (
    <div className="pt-1" aria-live="polite">
      <div className="flex gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < passed ? barTone : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
            {c.ok ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}