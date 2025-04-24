import { DOMAINS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface DomainProgressProps {
  domainProgress?: Record<string, number>;
}

export default function DomainProgress({ domainProgress }: DomainProgressProps) {
  // If no data yet, use placeholder values
  const progress = domainProgress || {
    safe: 85,
    healthy: 72,
    engaged: 56,
    connected: 43,
    independent: 38,
    included: 61
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Life Areas Progress</h3>
        <p className="mt-2 text-gray-600">Your journey across important life areas</p>
      </div>
      <div className="p-6">
        {/* Domain Progress Bars */}
        <div className="space-y-6">
          {DOMAINS.map(domain => (
            <div key={domain.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className={`w-5 h-5 rounded-full ${domain.bgClass} mr-3 flex items-center justify-center text-white text-xs font-bold`}
                    aria-hidden="true"
                  >
                    {domain.name.charAt(0)}
                  </div>
                  <span className="text-base font-medium">{domain.name}</span>
                </div>
                <span className="text-base font-medium text-gray-700" aria-live="polite" aria-atomic="true">
                  {progress[domain.id]}%
                </span>
              </div>
              <div 
                className="w-full bg-gray-100 rounded-full h-3"
                role="progressbar" 
                aria-valuenow={progress[domain.id]} 
                aria-valuemin={0} 
                aria-valuemax={100}
                aria-label={`${domain.name} progress: ${progress[domain.id]}%`}
              >
                <div 
                  className={`domain-progress ${domain.bgClass} group-hover:opacity-90 transition-all`} 
                  style={{ 
                    width: `${progress[domain.id]}%`, 
                    height: '12px', 
                    borderRadius: '6px', 
                    transition: 'width 0.5s ease-in-out, opacity 0.3s ease' 
                  }}
                ></div>
              </div>
              <div className="mt-1 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {getProgressDescription(domain.id, progress[domain.id])}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button variant="outline" className="text-base rounded-xl py-2 px-4 hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 20V10"/>
              <path d="m18 15-6-6-6 6"/>
              <path d="M18 5H6"/>
            </svg>
            Set Goals
          </Button>
          <Button className="text-base rounded-xl py-2 px-4 bg-indigo-600 hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M11 17a1 1 0 1 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5Z"/>
              <path d="M8 14a5 5 0 1 1 8 0"/>
              <path d="M17 18.5a9 9 0 1 0-10 0"/>
            </svg>
            View Detailed Progress
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate accessible and personalized progress descriptions
function getProgressDescription(domainId: string, progressValue: number): string {
  if (progressValue >= 80) {
    return "Amazing progress! You're doing very well in this area.";
  } else if (progressValue >= 50) {
    return "Good progress. You're building skills and moving forward.";
  } else if (progressValue >= 30) {
    return "You're making steady progress. Keep going!";
  } else {
    return "This is an area where you're just getting started. That's okay!";
  }
}
