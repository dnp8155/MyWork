import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/reset-password' });
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll help you get back into your account."
      footer={
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 text-sm text-emerald-700 p-4 text-center">
          If an account exists with that email, you'll receive a password reset link shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className={`pl-10 h-12 bg-white ${errors.email ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
          </div>
          <Button type="submit" className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}