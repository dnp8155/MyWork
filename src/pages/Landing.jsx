import React, { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import ProblemSolution from "@/components/landing/ProblemSolution";
import Features from "@/components/landing/Features";
import ProjectShowcase from "@/components/landing/ProjectShowcase";
import PaymentModes from "@/components/landing/PaymentModes";
import FinanceSection from "@/components/landing/FinanceSection";
import DocWorkflow from "@/components/landing/DocWorkflow";
import AssetsSection from "@/components/landing/AssetsSection";
import TeamSection from "@/components/landing/TeamSection";
import ReportsSection from "@/components/landing/ReportsSection";
import HowItWorks from "@/components/landing/HowItWorks";
import UseCases from "@/components/landing/UseCases";
import CtaSection from "@/components/landing/CtaSection";

export default function Landing() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  return (
    <div className="bg-white text-slate-900 font-body antialiased">
      <LandingNav />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <ProjectShowcase />
        <PaymentModes />
        <FinanceSection />
        <DocWorkflow />
        <AssetsSection />
        <TeamSection />
        <ReportsSection />
        <HowItWorks />
        <UseCases />
        <CtaSection />
      </main>
    </div>
  );
}