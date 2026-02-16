import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Member",
};

export default function EditMemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
