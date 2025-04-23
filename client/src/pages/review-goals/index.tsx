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
        
        <h1 className="text-2xl font-bold">Review Unreframed Visions</h1>
        <p className="text-gray-600">
          Student: <span className="font-medium">{student.name}</span>
        </p>
        
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertCircleIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Attention Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            {alert.message} Please reframe these vision statements to be positive and inspiring, focusing on the student's abilities and what they will accomplish rather than their limitations.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Visions That Need Reframing</CardTitle>
            <CardDescription>
              Transform each vision statement using the "When I am 30 years old, I will be..." format, focusing on abilities and positive outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unreframedGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No unreframed vision statements found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-6 border rounded-lg p-4 bg-amber-50/50 border-amber-200">
                  <h3 className="text-lg font-medium mb-3">All Vision Statements That Need Reframing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* Safe Domain */}
                    <div className="border rounded-lg p-3 bg-blue-50/30">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="font-medium">Safe Domain</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Will not struggle with loud noises in public places"</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Will stop having meltdowns during transitions between activities"</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connected Domain */}
                    <div className="border rounded-lg p-3 bg-pink-50/30">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                        <span className="font-medium">Connected Domain</span>
                      </div>
                      <div className="p-3 bg-red-50 rounded border border-red-100">
                        <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                        <p className="text-sm">"Will avoid getting overwhelmed in group social situations"</p>
                      </div>
                    </div>
                    
                    {/* Independent Domain */}
                    <div className="border rounded-lg p-3 bg-purple-50/30">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <span className="font-medium">Independent Domain</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Won't be dependent on others for daily living tasks"</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Will not get confused when following complex instructions"</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Healthy Domain */}
                    <div className="border rounded-lg p-3 bg-green-50/30">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">Healthy Domain</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Won't have issues with picky eating habits"</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                          <p className="text-sm">"Will stop feeling anxious about medical appointments"</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engaged Domain */}
                    <div className="border rounded-lg p-3 bg-yellow-50/30">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="font-medium">Engaged Domain</span>
                      </div>
                      <div className="p-3 bg-red-50 rounded border border-red-100">
                        <Badge variant="outline" className="mb-1 bg-red-50 text-red-700 border-red-200">Current</Badge>
                        <p className="text-sm">"Will not get bored or disinterested in activities quickly"</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    <span className="font-medium">Why These Need Reframing:</span> These vision statements use negative language and focus on limitations. 
                    They need to be reframed using the "When I am 30 years old, I will be..." format to focus on abilities and positive outcomes.
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-medium mb-2">Reframe Individual Vision Statements</h3>
                {unreframedGoals.map((goal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className={`w-3 h-3 rounded-full ${getDomainColorClass(goal.domain)} mr-2`}></div>
                      <span className="font-medium">{getDomainName(goal.domain)} Domain</span>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-sm text-gray-500">Current Vision (Needs Reframing)</Label>
                      <p className="p-3 bg-gray-50 rounded border mt-1">{goal.current}</p>
                    </div>
                    
                    <div className="mb-2">
                      <Label className="text-sm text-gray-500">Reframed Vision (Positive Focus)</Label>
                      {isEditing[index] ? (
                        <Textarea 
                          value={goal.reframed}
                          onChange={(e) => handleReframeGoal(index, e.target.value)}
                          placeholder="When I am 30 years old, I will be... (rewrite the vision focusing on abilities, strengths, and positive outcomes)"
                          className="mt-1"
                          rows={4}
                        />
                      ) : (
                        <div className="p-3 bg-blue-50 rounded border mt-1 min-h-[80px]">
                          {goal.reframed || (
                            <span className="text-gray-400 italic">No reframed vision provided yet</span>
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
                          {goal.reframed ? "Edit" : "Add Reframed Vision"}
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
        <h2 className="text-xl font-semibold mb-4">Principles for Envisioning</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg">Core Principles:</h3>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                  <li>Focus on <span className="font-medium text-blue-700">abilities and strengths</span>, rather than limitations</li>
                  <li>Use <span className="font-medium text-blue-700">positive and aspirational language</span> that inspires growth</li>
                  <li>Create visions that are <span className="font-medium text-blue-700">specific and meaningful</span> to the student</li>
                  <li>Maintain a <span className="font-medium text-blue-700">long-term perspective</span> that looks toward adult life</li>
                  <li>Reflect the student's <span className="font-medium text-blue-700">personal interests and values</span></li>
                  <li>Consider <span className="font-medium text-blue-700">cultural context and family perspectives</span></li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-lg">Examples:</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Social Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Wei will not struggle with social anxiety in group settings</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be confidently participating in social gatherings at my workplace and in my community. I will have developed three effective coping strategies that help me navigate group settings with ease, and I will regularly engage in activities at Admiral Hill RC with my peers.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Independent Living Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Rizwan won't need help with daily living tasks</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be living independently in my own HDB flat. I will be preparing my own meals, managing my daily schedule, and confidently using public transportation to travel around Singapore. I will have mastered five essential daily living skills that allow me to maintain my home with minimal support from others.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Educational Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Mei Ling will not fail her mathematics classes</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be applying the numerical reasoning skills I learned to manage my personal finances and excel in my career. I will have completed my polytechnic diploma in business by using personalized learning strategies and accommodations. I will be confident in my ability to solve practical math problems in everyday situations.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Employment Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Kian won't be dependent on others for financial support</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be working in a technology company using my special interest in computers to contribute valuable skills to my team. I will be earning a steady income that covers my living expenses and allows me to save for future goals. I will have developed the financial literacy skills to manage my CPF account and personal budget effectively.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Healthy Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Won't have issues with picky eating habits</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be enjoying a diverse and nutritious diet that supports my health and well-being. I will have developed skills in meal planning and food preparation that allow me to incorporate new foods gradually. I will be comfortable trying new dishes at hawker centers and restaurants with friends and colleagues.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Engaged Domain</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">Original Vision</Badge>
                      <p>Will not get bored or disinterested in activities quickly</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded border mt-2">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Reframed Vision</Badge>
                      <p>When I am 30 years old, I will be actively participating in two community groups aligned with my interests and strengths. I will have developed strategies to maintain focus and engagement in activities by identifying what motivates me. I will be sharing my special interests with others at Admiral Hill RC through teaching or leading activity groups.</p>
                    </div>
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