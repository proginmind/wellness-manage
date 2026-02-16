import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive Event Type",
};

export default function ArchiveEventTypeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
