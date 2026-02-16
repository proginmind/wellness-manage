import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Visit",
};

export default function EditVisitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
