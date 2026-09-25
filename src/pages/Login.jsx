import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const destination = returnTo === "/" ? "/dashboard" : returnTo;

  // Skip the login page for users with an active session
  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) window.location.replace(destination);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address.";
    if (!password) errs.password = "Please enter your password.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await supabase.auth.signInWithPassword({ email: email.trim(), password: password });
      window.location.href = destination;
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + destination } });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your MyWork workspace."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (destination !== "/dashboard" ? "?returnTo=" + encodeURIComponent(destination) : "")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-indigo-600 font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              className={`pl-10 pr-11 h-12 bg-white ${errors.password ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 select-none cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          Remember me
        </label>

        <Button type="submit" className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-slate-400">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium border-slate-300 hover:bg-slate-50"
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
    </AuthLayout>
  );
}