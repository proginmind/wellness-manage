import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Category Details",
};

export default function EventCategoryDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
