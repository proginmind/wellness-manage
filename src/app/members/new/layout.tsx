import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Member",
};

export default function AddMemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
