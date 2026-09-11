import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import PasswordStrength from "@/components/auth/PasswordStrength";
import WorkspaceSetupForm from "@/components/auth/WorkspaceSetup";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const BRAND_KPIS = [
  ["Projects", "4", "text-white"],
  ["Revenue", "₹12,40,000", "text-white"],
  ["Pending Payments", "₹1,85,000", "text-white"],
  ["Expenses", "₹2,85,000", "text-rose-200"],
  ["Profit", "₹9,55,000", "text-emerald-300"],
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [existsAccount, setExistsAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | otp | setup | ready
  const [otpCode, setOtpCode] = useState("");
  const returnTo = safeReturnTo();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Please enter your name.";
    if (!email.trim()) errs.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address.";
    if (!password) errs.password = "Please enter a password.";
    else if (password.length < 8) errs.password = "Password does not meet the requirements.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExistsAccount(false);
    if (!validate()) return;
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password });
      setError("");
      setStep("otp");
    } catch (err) {
      if (/exist|already|registered/i.test(err.message || "")) {
        setExistsAccount(true);
        setError("That email is already registered. Try signing in instead.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim(), otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
        // Save the provided name on the new account (best effort)
        try {
          if (fullName.trim()) await base44.auth.updateMe({ full_name: fullName.trim() });
        } catch { /* non-fatal */ }
      }
      setStep("setup");
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim());
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  const handleSetupComplete = async (data) => {
    try {
      await base44.entities.CompanySettings.create(data);
      toast({ title: "Workspace created", description: "Your settings are ready to use." });
    } catch {
      toast({ title: "Setup skipped", description: "You can complete it anytime in Settings." });
    }
    setStep("ready");
  };

  // OTP verification step
  if (step === "otp") {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-slate-500 mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-indigo-600 font-semibold hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  // Optional onboarding: workspace setup
  if (step === "setup") {
    return (
      <AuthLayout
        title="Set up your workspace"
        subtitle="Welcome to MyWork — tell us a little about your business. You can change this anytime in Settings."
        brandTitle="Start managing your work the smarter way."
        brandSub="Bring projects, clients, finances, invoices and everything in between into one connected workspace."
        brandKpis={BRAND_KPIS}
      >
        <WorkspaceSetupForm
          defaultName={fullName.trim()}
          onComplete={handleSetupComplete}
          onSkip={() => setStep("ready")}
        />
      </AuthLayout>
    );
  }

  // Onboarding complete
  if (step === "ready") {
    return (
      <AuthLayout
        title="You're ready to go."
        subtitle="Your MyWork workspace is set up. See you inside."
        brandTitle="Start managing your work the smarter way."
        brandSub="Bring projects, clients, finances, invoices and everything in between into one connected workspace."
        brandKpis={BRAND_KPIS}
      >
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700">Account created successfully.</p>
        </div>
        <Button
          className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700"
          onClick={() => { window.location.href = returnTo; }}
        >
          Go to Dashboard
        </Button>
      </AuthLayout>
    );
  }

  // Registration form
  return (
    <AuthLayout
      title="Create your MyWork workspace"
      subtitle="Get everything your business needs to manage work in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </>
      }
      brandTitle="Start managing your work the smarter way."
      brandSub="Bring projects, clients, finances, invoices and everything in between into one connected workspace."
      brandKpis={BRAND_KPIS}
    >
      {error && (
        <div role="alert" className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          {existsAccount && (
            <Link
              to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="shrink-0 inline-flex items-center h-8 px-3 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="fullName"
              autoComplete="name"
              autoFocus
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
              aria-invalid={!!errors.fullName}
              className={`pl-10 h-12 bg-white ${errors.fullName ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
              disabled={loading}
            />
          </div>
          {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              aria-invalid={!!errors.email}
              className={`pl-10 h-12 bg-white ${errors.email ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
              disabled={loading}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              aria-invalid={!!errors.password}
              className={`pl-10 pr-11 h-12 bg-white ${errors.password ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              aria-invalid={!!errors.confirmPassword}
              className={`pl-10 pr-11 h-12 bg-white ${errors.confirmPassword ? "border-rose-300 focus-visible:ring-rose-300" : ""}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-rose-600">{errors.confirmPassword}</p>}
        </div>

        <PasswordStrength password={password} confirmPassword={confirmPassword} />

        <Button type="submit" className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating your account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-slate-600 underline hover:text-indigo-600">Terms</Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-slate-600 underline hover:text-indigo-600">Privacy Policy</Link>.
        </p>
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