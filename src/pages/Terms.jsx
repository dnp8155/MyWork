import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>
        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">1. Acceptance of terms</h2>
            <p>By creating an account or using MyWork, you agree to be bound by these Terms of Service. This page is a placeholder — the complete terms will be published here before commercial launch.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">2. Your account</h2>
            <p>You are responsible for maintaining the confidentiality of your MyWork account credentials and for all activity that occurs under your account.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">3. Contact</h2>
            <p>Questions about these terms? Reach out through the Help Center and we'll get back to you.</p>
          </section>
        </div>
        <Link to="/landing" className="mt-12 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to MyWork
        </Link>
      </div>
    </div>
  );
}