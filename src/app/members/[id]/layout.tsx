import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Details",
};

export default function MemberDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
