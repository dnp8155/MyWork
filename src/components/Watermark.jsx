import React from "react";
import { Image } from "@/components/ui/image";

export default function Watermark({ logo }) {
  if (!logo) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
      <Image src={logo} alt="" fittingType="fit" className="h-80 w-80 opacity-[0.06]" />
    </div>
  );
}