import React from "react";
import { motion, useInView } from "framer-motion";

export const LOGO_URL = "https://media.base44.com/images/public/6aa4049391d33a443027588d/3321c12ed_ChatGPTImageSep11202607_58_37PM.png";

export function Reveal({ children, delay = 0, className, y = 24 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ eyebrow, title, sub, light = false }) {
  return (
    <Reveal className="max-w-3xl mx-auto text-center mb-14">
      {eyebrow && (
        <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-3">{eyebrow}</p>
      )}
      <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base sm:text-lg leading-relaxed ${light ? "text-slate-300" : "text-slate-500"}`}>{sub}</p>}
    </Reveal>
  );
}

export function CountUp({ to, prefix = "", suffix = "", duration = 1.4 }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

export const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;