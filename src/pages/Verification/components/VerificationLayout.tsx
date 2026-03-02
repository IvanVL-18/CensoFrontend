import type { PropsWithChildren } from "react";

export default function VerificationLayout({ children }: PropsWithChildren) {
  return (

    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-full bg-[#7A1F3D]/10 blur-3xl" />
        <div className="absolute -bottom-40 right-[-120px] h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(2,6,23,0.04),transparent_55%)]" />
      </div>
      
      <div className="relative grid min-h-screen place-items-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}