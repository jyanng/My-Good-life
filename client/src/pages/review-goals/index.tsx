import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DOMAINS } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Student, Alert as AlertType, DomainPlan } from "@shared/schema";

// Icons
import { 
  CheckCircle2Icon, 
  AlertCircleIcon, 
  ArrowLeftIcon,
  PencilIcon,
  SaveIcon,
  RotateCcwIcon
} from "lucide-react";

interface ReviewGoalsProps {
  studentId: number;
  alertId: number;
}

export default function ReviewGoals({ studentId, alertId }: ReviewGoalsProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [unreframedGoals, setUnreframedGoals] = useState<{domain: string, goalId: string, current: string, reframed: string}[]>([]);
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: [`/api/students/${studentId}`],
    enabled: !!studentId
  });

  // Fetch alert data
  const { data: alert, isLoading: isLoadingAlert } = useQuery({
    queryKey: [`/api/alerts/${alertId}`],
    enabled: !!alertId
  });

  // Fetch student's plan
  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: [`/api/students/${studentId}/plan`],
    enabled: !!studentId,
  });

  // Fetch domain plans for this student's plan
  const { data: domainPlans, isLoading: isLoadingDomainPlans } = useQuery({
    queryKey: [`/api/plans/${plan?.id}/domains`],
    enabled: !!plan?.id,
    onSuccess: (data) => {
      // Extract all unreframed goals from domain plans
      const goals: {domain: string, goalId: string, current: string, reframed: string}[] = [];
      
      if (data && Array.isArray(data)) {
        data.forEach(domainPlan => {
          const goalsArray = domainPlan.goals as any[] || [];
          goalsArray.forEach(goal => {
            if (goal.needsReframing) {
              goals.push({
                domain: domainPlan.domain,
                goalId: goal.id,
                current: goal.description,
                reframed: goal.reframedDescription || ""
              });
            }
          });
        });
      }
      
      setUnreframedGoals(goals);
    }
  });

  // Update domain plan mutation
  const updateDomainPlanMutation = useMutation({
    mutationFn: async (variables: { domainPlanId: number, goals: any }) => {
      return apiRequest(
        "PATCH",
        `/api/domain-plans/${variables.domainPlanId}`, 
        { goals: variables.goals }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${plan?.id}/domains`] });
      toast({
        title: "Success",
        description: "Goal has been successfully reframed.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save the reframed goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update goal:", error);
    },
  });

  // Update alert status mutation
  const updateAlertMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(
        "PATCH",
        `/api/alerts/${alertId}/status`,
        { status: "resolved" }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/alerts?facilitatorId=1`] });
      toast({
        title: "Success",
        description: "All goals have been reframed and the alert has been resolved.",
        variant: "default",
      });
      navigate("/"); // Navigate back to dashboard
    },
  });

  const handleReframeGoal = (index: number, reframedText: string) => {
    const updatedGoals = [...unreframedGoals];
    updatedGoals[index].reframed = reframedText;
    setUnreframedGoals(updatedGoals);
  };

  const handleSaveReframedGoal = async (index: number) => {
    const goal = unreframedGoals[index];
    if (!goal.reframed.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reframed goal description.",
        variant: "destructive",
      });
      return;
    }

    // Find the domain plan for this goal
    const domainPlan = domainPlans?.find(dp => dp.domain === goal.domain);
    if (!domainPlan) return;

    // Get current goals and update the specific goal
    const currentGoals = domainPlan.goals as any[] || [];
    const updatedGoals = currentGoals.map(g => {
      if (g.id === goal.goalId) {
        return {
          ...g,
          reframedDescription: goal.reframed,
          needsReframing: false,
          isReframed: true
        };
      }
      return g;
    });

    // Save updated goals
    await updateDomainPlanMutation.mutateAsync({
      domainPlanId: domainPlan.id,
      goals: updatedGoals
    });

    // Toggle edit mode off
    setIsEditing(prev => ({...prev, [index]: false}));
  };

  const handleCompleteReview = async () => {
    // Check if all goals have been reframed
    const allReframed = unreframedGoals.every(goal => goal.reframed.trim() !== "");
    if (!allReframed) {
      toast({
        title: "Warning",
        description: "Please reframe all goals before completing the review.",
        variant: "destructive",
      });
      return;
    }

    // Mark alert as resolved
    await updateAlertMutation.mutateAsync();
  };

  const toggleEditing = (index: number) => {
    setIsEditing(prev => ({...prev, [index]: !prev[index]}));
  };

  if (isLoadingStudent || isLoadingAlert || isLoadingPlan || isLoadingDomainPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student || !alert) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not find the student or alert information. Please go back and try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Get domain name from domain ID
  const getDomainName = (domainId: string) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    return domain ? domain.name : domainId;
  };

  // Get domain color class
  const getDomainColorClass = (domainId: string) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    return domain ? domain.bgClass : "bg-gray-500";
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          onClick={() => navigate("/")} 
          variant="outline"
          className="mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold">Review Unreframed Goals</h1>
        <p className="text-gray-600">
          Student: <span className="font-medium">{student.name}</span>
        </p>
        
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertCircleIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Attention Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            {alert.message} Please reframe these goals to be positive, focusing on what the student will accomplish rather than limitations.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Goals That Need Reframing</CardTitle>
            <CardDescription>
              Transform each goal to focus on abilities and positive outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unreframedGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No unreframed goals found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {unreframedGoals.map((goal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className={`w-3 h-3 rounded-full ${getDomainColorClass(goal.domain)} mr-2`}></div>
                      <span className="font-medium">{getDomainName(goal.domain)} Domain</span>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-sm text-gray-500">Current Goal (Needs Reframing)</Label>
                      <p className="p-3 bg-gray-50 rounded border mt-1">{goal.current}</p>
                    </div>
                    
                    <div className="mb-2">
                      <Label className="text-sm text-gray-500">Reframed Goal (Positive Focus)</Label>
                      {isEditing[index] ? (
                        <Textarea 
                          value={goal.reframed}
                          onChange={(e) => handleReframeGoal(index, e.target.value)}
                          placeholder="Rewrite the goal to focus on abilities and achievements rather than limitations..."
                          className="mt-1"
                          rows={4}
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded border mt-1 min-h-[80px]">
                          {goal.reframed || (
                            <span className="text-gray-400 italic">No reframed goal provided yet</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      {isEditing[index] ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleEditing(index)}
                          >
                            <RotateCcwIcon className="mr-1 h-4 w-4" /> Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSaveReframedGoal(index)}
                            disabled={updateDomainPlanMutation.isPending}
                          >
                            <SaveIcon className="mr-1 h-4 w-4" /> Save
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleEditing(index)}
                        >
                          <PencilIcon className="mr-1 h-4 w-4" /> 
                          {goal.reframed ? "Edit" : "Add Reframed Goal"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteReview}
              disabled={updateAlertMutation.isPending || unreframedGoals.some(g => !g.reframed.trim())}
            >
              <CheckCircle2Icon className="mr-2 h-4 w-4" /> Complete Review
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reframing Guidelines</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Do:</h3>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Focus on abilities, not limitations</li>
                  <li>Use positive language that emphasizes growth</li>
                  <li>Be specific about desired outcomes</li>
                  <li>Make goals measurable when possible</li>
                  <li>Consider the student's strengths and interests</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Example:</h3>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-gray-50 rounded border">
                    <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original</Badge>
                    <p>Wei will not struggle with social anxiety in group settings</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded border">
                    <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed</Badge>
                    <p>Wei will develop three coping strategies to manage social situations and participate confidently in small group activities</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}