import { MenuIcon } from "lucide-react";

interface MobileHeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileHeader({ setMobileMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit">
              <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z" />
              <path d="M16 8V5c0-1.1.9-2 2-2" />
              <path d="M12 13h4" />
              <path d="M12 18h6a2 2 0 0 1 2 2v1" />
              <path d="M12 8h8" />
              <path d="M20.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path d="M16.5 13a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path d="M20.5 21a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
              <path d="M18.5 4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
            </svg>
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-800">MyGoodLife</h1>
        </div>
        <button 
          className="p-2 rounded-md bg-gray-100"
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
