import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive Visit",
};

export default function ArchiveVisitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
