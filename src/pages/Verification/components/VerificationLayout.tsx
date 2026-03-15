import type { PropsWithChildren } from "react";

export default function VerificationLayout({ children }: PropsWithChildren) {
  return (

    <div className="">
      <div className="relative grid min-h-screen place-items-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}