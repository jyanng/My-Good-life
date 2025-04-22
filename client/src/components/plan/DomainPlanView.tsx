import { useState } from "react";
import { DomainPlan } from "@shared/schema";
import { DOMAINS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CircleIcon 
} from "lucide-react";

interface DomainPlanViewProps {
  domainPlan: DomainPlan;
}

export default function DomainPlanView({ domainPlan }: DomainPlanViewProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Find domain info
  const domainInfo = DOMAINS.find(d => d.id === domainPlan.domain) || DOMAINS[0];
  
  // Format goals
  type Goal = { description: string; status: string };
  const goals = (domainPlan.goals as Goal[]) || [];
  
  // Calculate progress
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const progressPercentage = goals.length > 0 
    ? Math.round((completedGoals / goals.length) * 100) 
    : 0;

  return (
    <div className={`border rounded-lg overflow-hidden ${domainPlan.completed ? 'border-green-200' : 'border-gray-200'}`}>
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer ${domainPlan.completed ? 'bg-green-50' : 'bg-white'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full ${domainInfo.bgClass} flex items-center justify-center text-white mr-3`}>
            {domainPlan.completed && <CheckCircleIcon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{domainInfo.name} Domain</h3>
            {goals.length > 0 && (
              <p className="text-sm text-gray-500">
                {completedGoals} of {goals.length} goals completed
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {goals.length > 0 && (
            <div className="mr-4 hidden sm:block">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${domainInfo.bgClass} h-2 rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">{progressPercentage}%</p>
            </div>
          )}
          <Button variant="ghost" size="sm" className="p-1">
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-t border-gray-200">
          {domainPlan.vision ? (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Vision</h4>
              <p className="text-gray-800">{domainPlan.vision}</p>
            </div>
          ) : (
            <div className="mb-4 text-gray-500 italic">No vision statement has been added yet.</div>
          )}
          
          {goals.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Goals</h4>
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded flex items-center justify-between ${
                      goal.status === 'completed' 
                        ? 'bg-green-50 border border-green-200' 
                        : goal.status === 'in_progress' 
                          ? 'bg-amber-50 border border-amber-200' 
                          : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {goal.status === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                      ) : goal.status === 'in_progress' ? (
                        <ClockIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                      ) : (
                        <CircleIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      )}
                      <span className={`${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {goal.description}
                      </span>
                    </div>
                    <Badge variant={
                      goal.status === 'completed' 
                        ? 'secondary' 
                        : goal.status === 'in_progress' 
                          ? 'default' 
                          : 'outline'
                    }>
                      {goal.status === 'completed' 
                        ? 'Completed' 
                        : goal.status === 'in_progress' 
                          ? 'In Progress' 
                          : 'Not Started'
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">No goals have been added yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
