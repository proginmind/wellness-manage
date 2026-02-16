import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Team Member",
};

export default function EditTeamMemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
