import { Link } from "wouter";

export default function QuickAccess() {
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Access</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Templates Section */}
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list text-primary">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
              <h4 className="ml-2 text-lg font-medium">Plan Templates</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Access and customize Good Life Plan templates for your students.</p>
            <Link href="/templates">
              <a className="text-primary text-sm hover:underline">Browse Templates →</a>
            </Link>
          </div>
          
          {/* Case Studies Section */}
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open text-primary">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <h4 className="ml-2 text-lg font-medium">Case Studies</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Explore successful transition stories and examples of completed plans.</p>
            <Link href="/case-studies">
              <a className="text-primary text-sm hover:underline">View Case Studies →</a>
            </Link>
          </div>
          
          {/* Learning Center Section */}
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap text-primary">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
              <h4 className="ml-2 text-lg font-medium">Learning Center</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Access training modules on effective plan facilitation and goal framing.</p>
            <Link href="/learning-center">
              <a className="text-primary text-sm hover:underline">Start Learning →</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
