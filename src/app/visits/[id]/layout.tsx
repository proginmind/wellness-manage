import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit Details",
};

export default function VisitDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
