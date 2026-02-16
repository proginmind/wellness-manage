import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive Event Category",
};

export default function ArchiveEventCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
