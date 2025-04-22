import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { User } from "@shared/schema";

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar user={user} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Mobile Header */}
      <MobileHeader setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 pt-0 md:pt-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
