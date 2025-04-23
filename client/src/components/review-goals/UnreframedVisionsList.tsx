import { AlertCircleIcon, PencilIcon, SaveIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { DOMAINS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UnreframedVisionsListProps {
  goals: Array<{
    domain: string;
    current: string;
    goalId?: string;
    reframed?: string;
  }>;
  onSaveReframedVision?: (
    domain: string, 
    goalId: string | undefined, 
    current: string, 
    reframed: string
  ) => Promise<void>;
  readOnly?: boolean;
}

export default function UnreframedVisionsList({ 
  goals, 
  onSaveReframedVision,
  readOnly = false 
}: UnreframedVisionsListProps) {
  console.log("UnreframedVisionsList received goals:", goals);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [reframedText, setReframedText] = useState<string>("");
  
  // Group goals by domain with their full data
  const groupedGoals: Record<string, Array<{
    goalId?: string;
    current: string;
    reframed?: string;
  }>> = {};
  
  goals.forEach(goal => {
    if (!groupedGoals[goal.domain]) {
      groupedGoals[goal.domain] = [];
    }
    groupedGoals[goal.domain].push({
      goalId: goal.goalId,
      current: goal.current,
      reframed: goal.reframed
    });
  });
  
  const handleEditStart = (current: string, reframed?: string) => {
    setEditingGoal(current);
    setReframedText(reframed || "");
  };
  
  const handleSave = async (domain: string, goalId: string | undefined, current: string) => {
    if (onSaveReframedVision && reframedText.trim()) {
      await onSaveReframedVision(domain, goalId, current, reframedText);
      setEditingGoal(null);
    }
  };
  
  const handleCancel = () => {
    setEditingGoal(null);
    setReframedText("");
  };

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
    const sampleGoals = {
      "safe": [
        { current: "I will avoid dangerous situations without help" }
      ],
      "independent": [
        { current: "Rizwan won't need help with daily living tasks" },
        { current: "I will not have to rely on my parents for transportation" }
      ]
    };
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Unreframed Vision Statements</h2>
          </div>
          {!readOnly && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Example Data
            </Badge>
          )}
        </div>
        <p className="mb-4 text-gray-700">These vision statements need to be reframed to focus on abilities and positive outcomes rather than limitations:</p>
        
        <div className="space-y-6">
          {Object.keys(sampleGoals).map((domain) => (
            <div 
              key={domain} 
              className={`bg-white border rounded-lg shadow-sm overflow-hidden`}
            >
              <div className={`font-medium p-3 ${getTextColorClass(domain)} bg-gray-50 border-b`}>
                {getDomainName(domain)} Domain
              </div>
              <div className="p-4 space-y-4">
                {sampleGoals[domain as keyof typeof sampleGoals].map((goal, index) => (
                  <div key={index} className="space-y-3">
                    <div className="p-3 bg-red-50 rounded border border-red-100 flex items-start">
                      <div className="mr-2 mt-1">
                        <AlertCircleIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Negative Focus</Badge>
                        <p className="text-gray-800">"{goal.current}"</p>
                      </div>
                    </div>
                    
                    {!readOnly && (
                      <div>
                        {editingGoal === goal.current ? (
                          <div className="space-y-3">
                            <Textarea 
                              value={reframedText}
                              onChange={(e) => setReframedText(e.target.value)}
                              placeholder="When I am 30 years old, I will be... (rewrite the vision focusing on abilities, strengths, and positive outcomes)"
                              className="mt-1"
                              rows={4}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleCancel}
                              >
                                <RotateCcwIcon className="mr-1 h-4 w-4" /> Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleSave(domain, undefined, goal.current)}
                                disabled={!reframedText.trim()}
                              >
                                <SaveIcon className="mr-1 h-4 w-4" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditStart(goal.current)}
                            className="w-full justify-center"
                          >
                            <PencilIcon className="mr-1 h-4 w-4" /> Reframe This Vision
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      
      <div className="space-y-6">
        {Object.keys(groupedGoals).map((domain) => (
          <div 
            key={domain} 
            className={`bg-white border rounded-lg shadow-sm overflow-hidden`}
          >
            <div className={`font-medium p-3 ${getTextColorClass(domain)} bg-gray-50 border-b`}>
              {getDomainName(domain)} Domain
            </div>
            <div className="p-4 space-y-4">
              {groupedGoals[domain].map((goal, index) => (
                <div key={index} className="space-y-3">
                  <div className="p-3 bg-red-50 rounded border border-red-100 flex items-start">
                    <div className="mr-2 mt-1">
                      <AlertCircleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Negative Focus</Badge>
                      <p className="text-gray-800">"{goal.current}"</p>
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div>
                      {editingGoal === goal.current ? (
                        <div className="space-y-3">
                          <Textarea 
                            value={reframedText}
                            onChange={(e) => setReframedText(e.target.value)}
                            placeholder="When I am 30 years old, I will be... (rewrite the vision focusing on abilities, strengths, and positive outcomes)"
                            className="mt-1"
                            rows={4}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleCancel}
                            >
                              <RotateCcwIcon className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSave(domain, goal.goalId, goal.current)}
                              disabled={!reframedText.trim()}
                            >
                              <SaveIcon className="mr-1 h-4 w-4" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {goal.reframed ? (
                            <div className="p-3 bg-green-50 rounded border border-green-100">
                              <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Positive Focus</Badge>
                              <p className="text-gray-800">{goal.reframed}</p>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditStart(goal.current, goal.reframed)}
                              className="w-full justify-center"
                            >
                              <PencilIcon className="mr-1 h-4 w-4" /> Reframe This Vision
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}