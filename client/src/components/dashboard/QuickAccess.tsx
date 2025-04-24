import { Link } from "wouter";

export default function QuickAccess() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Helpful Resources</h3>
        <p className="mt-2 text-gray-600">Tools and information to support your journey</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Ideas Section */}
          <div className="border border-indigo-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-b from-white to-indigo-50">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Plan Ideas</h4>
            <p className="text-base text-gray-600 mb-4">Find ready-to-use plan templates that you can customize for your unique goals and needs.</p>
            <Link href="/templates" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors group">
              <span>Browse Plan Ideas</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Success Stories Section */}
          <div className="border border-purple-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-b from-white to-purple-50">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M18.18 10a3 3 0 0 1-5.18 0" />
                <path d="M10 9.32a3 3 0 0 1-4.08 4.5" />
                <path d="M14 14a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                <path d="M7.79 16.29c-2.74-2.74-2.74-7.21 0-9.94s7.21-2.74 9.94 0 2.74 7.16 0 9.89z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Success Stories</h4>
            <p className="text-base text-gray-600 mb-4">Read inspiring stories from others who have created meaningful and fulfilling life plans.</p>
            <Link href="/case-studies" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors group">
              <span>Read Stories</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Learning Resources Section */}
          <div className="border border-emerald-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-b from-white to-emerald-50">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M12 3a3 3 0 0 0-3 3v15a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
                <path d="M9 3a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
                <path d="M15 3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3 3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                <line x1="9" x2="9" y1="11" y2="21" />
                <line x1="15" x2="15" y1="11" y2="21" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Helpful Videos</h4>
            <p className="text-base text-gray-600 mb-4">Watch easy-to-understand videos that explain how to set goals and create effective plans.</p>
            <Link href="/learning-center" className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-800 transition-colors group">
              <span>Watch Videos</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Additional Resources Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
              <path d="M12 22v-5" />
              <path d="M9 8V2" />
              <path d="M15 8V2" />
              <path d="M18 8v4" />
              <path d="M6 8v4" />
              <path d="M12 12v5" />
              <path d="M9 17h6" />
              <path d="M6 12a6 6 0 0 0 12 0" />
            </svg>
            Community Support
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
              <h5 className="font-medium text-indigo-800 mb-2">Support Groups</h5>
              <p className="text-gray-600 mb-2">Connect with others who share similar experiences.</p>
              <Link href="#" className="text-indigo-600 text-sm hover:underline">Find a group →</Link>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
              <h5 className="font-medium text-purple-800 mb-2">Local Resources</h5>
              <p className="text-gray-600 mb-2">Discover services and programs available in your area.</p>
              <Link href="#" className="text-purple-600 text-sm hover:underline">Find local help →</Link>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
              <h5 className="font-medium text-emerald-800 mb-2">Personal Coach</h5>
              <p className="text-gray-600 mb-2">Work one-on-one with someone who can guide you.</p>
              <Link href="#" className="text-emerald-600 text-sm hover:underline">Connect with a coach →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
