import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Visit",
};

export default function AddVisitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
