import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DomainPlan } from "@shared/schema";

interface DomainProgressDetailsProps {
  domainPlans: DomainPlan[] | undefined;
  domains: { id: string; name: string; bgClass: string; }[];
  getEmoji: (progress: number) => string;
  getMessage: (progress: number) => string;
}

export default function DomainProgressDetails({ 
  domainPlans, 
  domains,
  getEmoji,
  getMessage
}: DomainProgressDetailsProps) {
  if (!domainPlans || !Array.isArray(domainPlans) || domainPlans.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Domain Plans Available</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          There are no domain plans created for this student yet. Domain plans will appear here once they are established.
        </p>
      </div>
    );
  }

  // Get domain info by ID
  const getDomainInfo = (domainId: string) => {
    return domains.find(d => d.id === domainId) || { 
      name: domainId.charAt(0).toUpperCase() + domainId.slice(1), // Capitalize the domain ID as fallback
      bgClass: "bg-gray-500" 
    };
  };

  // Calculate progress percentage for a domain plan
  const calculateProgress = (domainPlan: DomainPlan) => {
    const goals = domainPlan.goals as any[] || [];
    if (goals.length === 0) return 0;
    
    const completedGoals = goals.filter(g => g.status === "completed").length;
    const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
    
    // Count in-progress goals as half complete for a more nuanced progress view
    const progressScore = completedGoals + (inProgressGoals * 0.5);
    return Math.round((progressScore / goals.length) * 100);
  };

  return (
    <div className="space-y-8">
      {domainPlans.map(domainPlan => {
        const domain = getDomainInfo(domainPlan.domain);
        const progress = calculateProgress(domainPlan);
        const emoji = getEmoji(progress);
        const message = getMessage(progress);
        const goals = domainPlan.goals as any[] || [];
        
        // Count goals by status
        const completedGoals = goals.filter(g => g.status === "completed").length;
        const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
        const notStartedGoals = goals.filter(g => g.status === "not_started").length;
        
        return (
          <Card key={domainPlan.id} className="overflow-hidden border-t-4" style={{ borderTopColor: `var(--${domain.id})` }}>
            <CardHeader className={`${domain.bgClass} bg-opacity-10`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle className="flex items-center text-xl md:text-2xl">
                    <span className="mr-2 text-2xl">{emoji}</span>
                    {domain.name} Domain
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {domainPlan.vision || `Vision for ${domain.name} domain`}
                  </CardDescription>
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                  <div className="text-3xl font-bold">{progress}%</div>
                  <div className="text-sm text-gray-600">{message}</div>
                </div>
              </div>
              <Progress value={progress} className="h-2 mt-4" />
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="font-medium mb-3">Progress Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
                    <div className="text-sm text-blue-800">In Progress</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">{notStartedGoals}</div>
                    <div className="text-sm text-gray-800">Not Started</div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium mb-4">Goals Progress</h3>
              {goals.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No goals defined for this domain yet.</p>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal: any, index: number) => {
                    const isCompleted = goal.status === "completed";
                    const isInProgress = goal.status === "in_progress";
                    
                    let statusClasses = "p-3 rounded-lg border ";
                    let statusIcon = "⏱️";
                    let statusMessage = "";
                    
                    if (isCompleted) {
                      statusClasses += "bg-green-50 border-green-100";
                      statusIcon = "✅";
                      statusMessage = "Completed goal! 🎉";
                    } else if (isInProgress) {
                      statusClasses += "bg-blue-50 border-blue-100";
                      statusIcon = "🔄";
                      statusMessage = "Working on it!";
                    } else {
                      statusClasses += "bg-white border-gray-200";
                    }
                    
                    return (
                      <div key={index} className={statusClasses}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`${isCompleted ? 'text-green-800' : isInProgress ? 'text-blue-800' : 'text-gray-700'} font-medium`}>
                              {goal.description}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 text-xl" title={goal.status}>
                            {statusIcon}
                          </div>
                        </div>
                        {statusMessage && (
                          <p className={`text-sm mt-1 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                            {statusMessage}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg mt-6">
                <h4 className="font-medium text-gray-700 mb-1">Support Strategies</h4>
                <p className="text-gray-600 text-sm">
                  Each small step is a victory. Remember to celebrate progress and be patient with the journey.
                  Challenges are opportunities for growth in the {domain.name.toLowerCase()} domain.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}