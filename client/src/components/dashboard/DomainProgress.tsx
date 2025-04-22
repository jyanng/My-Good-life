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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Domain Focus</h3>
        <p className="mt-1 text-sm text-gray-500">Distribution of progress across life domains</p>
      </div>
      <div className="p-6">
        {/* Domain Progress Bars */}
        <div className="space-y-4">
          {DOMAINS.map(domain => (
            <div key={domain.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${domain.bgClass} mr-2`}></div>
                  <span className="text-sm font-medium">{domain.name}</span>
                </div>
                <span className="text-sm text-gray-500">{progress[domain.id]}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`domain-progress ${domain.bgClass}`} 
                  style={{ width: `${progress[domain.id]}%`, height: '8px', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View Detailed Report
          </Button>
        </div>
      </div>
    </div>
  );
}
