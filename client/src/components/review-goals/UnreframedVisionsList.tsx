import { AlertCircleIcon } from "lucide-react";
import { DOMAINS } from "@/lib/constants";

interface UnreframedVisionsListProps {
  goals: Array<{
    domain: string;
    current: string;
  }>;
}

export default function UnreframedVisionsList({ goals }: UnreframedVisionsListProps) {
  console.log("UnreframedVisionsList received goals:", goals);
  
  // Group goals by domain
  const groupedGoals: Record<string, string[]> = {};
  
  goals.forEach(goal => {
    if (!groupedGoals[goal.domain]) {
      groupedGoals[goal.domain] = [];
    }
    groupedGoals[goal.domain].push(goal.current);
  });
  
  console.log("Grouped goals:", groupedGoals);

  // Get domain name from domain ID
  const getDomainName = (domainId: string) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    return domain ? domain.name : domainId;
  };

  // Get domain color class
  const getBorderColorClass = (domainId: string) => {
    switch(domainId) {
      case 'safe': return 'border-blue-500';
      case 'connected': return 'border-pink-500';
      case 'independent': return 'border-purple-500';
      case 'healthy': return 'border-green-500';
      case 'engaged': return 'border-yellow-500';
      case 'included': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  // Get domain text color class
  const getTextColorClass = (domainId: string) => {
    switch(domainId) {
      case 'safe': return 'text-blue-700';
      case 'connected': return 'text-pink-700';
      case 'independent': return 'text-purple-700';
      case 'healthy': return 'text-green-700';
      case 'engaged': return 'text-yellow-700';
      case 'included': return 'text-orange-700';
      default: return 'text-gray-700';
    }
  };

  // If we have no goals, return sample data for demo purposes
  if (goals.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold">Unreframed Vision Statements</h2>
        </div>
        <p className="mb-4 text-gray-700">These vision statements need to be reframed to focus on abilities and positive outcomes rather than limitations:</p>
        
        <div className="space-y-3">
          <div className="bg-white border-l-4 border-blue-500 p-3 pl-4 rounded shadow-sm">
            <p className="font-medium text-blue-700 mb-1">Safe Domain</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className="text-gray-800">"I will avoid dangerous situations without help"</li>
            </ul>
          </div>
          
          <div className="bg-white border-l-4 border-purple-500 p-3 pl-4 rounded shadow-sm">
            <p className="font-medium text-purple-700 mb-1">Independent Domain</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className="text-gray-800">"Rizwan won't need help with daily living tasks"</li>
              <li className="text-gray-800">"I will not have to rely on my parents for transportation"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  // Display actual data
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
        <h2 className="text-xl font-semibold">Unreframed Vision Statements</h2>
      </div>
      <p className="mb-4 text-gray-700">These vision statements need to be reframed to focus on abilities and positive outcomes rather than limitations:</p>
      
      <div className="space-y-3">
        {Object.keys(groupedGoals).map((domain) => (
          <div 
            key={domain} 
            className={`bg-white border-l-4 ${getBorderColorClass(domain)} p-3 pl-4 rounded shadow-sm`}
          >
            <p className={`font-medium ${getTextColorClass(domain)} mb-1`}>{getDomainName(domain)} Domain</p>
            <ul className="list-disc pl-5 space-y-1">
              {groupedGoals[domain].map((goal, index) => (
                <li key={index} className="text-gray-800">"{goal}"</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}