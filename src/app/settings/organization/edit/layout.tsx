import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Organization",
};

export default function EditOrganizationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
