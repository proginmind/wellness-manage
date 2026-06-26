import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Staff Member",
};

export default function NewTeamMemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
