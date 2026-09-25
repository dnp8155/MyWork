import React from "react";

const fieldClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition";

export const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <input className={fieldClass} {...props} />
  </div>
);

export const Textarea = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <textarea className={fieldClass} rows={props.rows || 3} {...props} />
  </div>
);

export const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <select className={fieldClass} {...props}>{children}</select>
  </div>
);

export { fieldClass };