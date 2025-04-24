import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { PsychologyIcon, DashboardIcon, AccountCircleIcon, MenuBookIcon, SchoolIcon, InsightsIcon, SettingsIcon } from "./icons";
import { BarChart2, Kanban, FileDown, FileText, TrendingUp } from "lucide-react";

interface SidebarProps {
  user: User;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ user, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/myplan", label: "MyGoodLife Plan", icon: <FileText className="w-5 h-5" /> },
    { path: "/personal-progress", label: "My Progress", icon: <BarChart2 className="w-5 h-5" /> },
    { path: "/case-studies", label: "Case Studies", icon: <MenuBookIcon /> },
    { path: "/learning-center", label: "Learning Center", icon: <SchoolIcon /> },
    { path: "/plan-templates", label: "Plan Templates", icon: <FileDown className="w-5 h-5" /> }
  ];

  const facilitatorItems = [
    { path: "/students", label: "Student Profiles", icon: <AccountCircleIcon /> },
    { path: "/vision-board", label: "Vision Board", icon: <Kanban className="w-5 h-5" /> },
    { path: "/progress-visualization", label: "Progress Visualization", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const toolItems = [
    { path: "/reports", label: "Reports", icon: <InsightsIcon /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> }
  ];

  const sidebarClass = mobileMenuOpen
    ? "fixed inset-0 z-40 transform transition-transform duration-300 md:relative md:inset-auto md:translate-x-0 md:w-64 bg-white"
    : "fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-300 md:relative md:translate-x-0 md:w-64 bg-white";

  return (
    <>
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`${sidebarClass} border-r border-gray-200 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <PsychologyIcon />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-800">MyGoodLife Portal</h1>
          </div>
          
          <nav>
            <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
            
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
                  location === item.path
                    ? "text-primary bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-current">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <div className="mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Facilitator View</div>
            
            {facilitatorItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
                  location === item.path
                    ? "text-primary bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-current">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <div className="mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</div>
            
            {toolItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
                  location === item.path
                    ? "text-primary bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                {user.name.substring(0, 1)}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
