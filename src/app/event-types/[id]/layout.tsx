import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Type Details",
};

export default function EventTypeDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
