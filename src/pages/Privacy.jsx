import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>
        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">1. Information we collect</h2>
            <p>MyWork stores the business data you add to your workspace — projects, clients, financial records and related files. This page is a placeholder — the complete policy will be published here before commercial launch.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">2. How your data is used</h2>
            <p>Your workspace data is used only to provide MyWork's features to you. Each user's data is isolated and visible only to accounts you grant access to.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">3. Contact</h2>
            <p>Privacy questions? Reach out through the Help Center and we'll get back to you.</p>
          </section>
        </div>
        <Link to="/landing" className="mt-12 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to MyWork
        </Link>
      </div>
    </div>
  );
}