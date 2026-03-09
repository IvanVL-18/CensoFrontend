import type { ReactNode } from "react";

type ResetPasswordLayoutProps = {
  children: ReactNode;
};

export default function ResetPasswordLayout({
  children,
}: ResetPasswordLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}