import { ReactNode } from "react";
import { Nav } from "./nav";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-neutral-900/95 flex flex-row">
      {showNav && <Nav />}
      <div className="flex-1 flex flex-col ml-20">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
} 