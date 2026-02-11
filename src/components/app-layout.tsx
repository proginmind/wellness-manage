import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">{children}</main>
      </div>
    </div>
  );
}
