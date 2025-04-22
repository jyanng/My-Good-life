import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOMAINS } from "@/lib/constants";
import { Student, GoodLifePlan, DomainPlan } from "@shared/schema";
import { ArrowLeftIcon, HomeIcon, FileTextIcon, CalendarIcon } from "lucide-react";

export default function ProgressVisualization() {
  const [, navigate] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [viewType, setViewType] = useState<string>("overview");

  // Fetch all students
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/students", { facilitatorId: 1 }]
  });

  // Fetch the selected student's plan
  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ["/api/students", selectedStudent, "plan"],
    enabled: !!selectedStudent
  });

  // Fetch domain plans for the selected student's plan
  const { data: domainPlans, isLoading: isLoadingDomainPlans } = useQuery({
    queryKey: ["/api/plans", plan?.id, "domains"],
    enabled: !!plan?.id
  });

  const isLoading = isLoadingStudents || (selectedStudent && (isLoadingPlan || isLoadingDomainPlans));

  // Calculate domain progress percentages
  const getDomainProgress = () => {
    if (!domainPlans || !Array.isArray(domainPlans)) return {};

    return DOMAINS.reduce((acc, domain) => {
      const domainPlan = domainPlans.find(dp => dp.domain === domain.id);
      
      if (!domainPlan) {
        acc[domain.id] = 0;
        return acc;
      }
      
      const goals = domainPlan.goals as any[] || [];
      const completedGoals = goals.filter(g => g.status === "completed").length;
      const progressPercentage = goals.length > 0 
        ? Math.round((completedGoals / goals.length) * 100) 
        : 0;
      
      acc[domain.id] = progressPercentage;
      return acc;
    }, {} as Record<string, number>);
  };

  const getDomainEmoji = (percentage: number) => {
    if (percentage >= 90) return "🌟";
    if (percentage >= 75) return "😊";
    if (percentage >= 50) return "🙂";
    if (percentage >= 25) return "🔄";
    return "🌱";
  };
  
  const getProgressMessage = (percentage: number) => {
    if (percentage >= 90) return "Amazing progress! Almost there!";
    if (percentage >= 75) return "Great work! You're doing so well!";
    if (percentage >= 50) return "Halfway there! Keep going!";
    if (percentage >= 25) return "Good start! Making progress!";
    return "Just beginning! Small steps matter!";
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudent(Number(value));
  };

  if (isLoadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Progress Visualization</h1>
          <p className="text-gray-600 mt-1">
            Personalized visualization of student progress across domains
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Student Selection</CardTitle>
          <CardDescription>
            Choose a student to view their progress visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="student-select">Select Student</Label>
              <Select onValueChange={handleStudentChange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students && students.map((student: Student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="view-type">Visualization Type</Label>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overall Progress</SelectItem>
                  <SelectItem value="domains">Domain Details</SelectItem>
                  <SelectItem value="timeline">Progress Timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedStudent && plan ? (
        <div className="space-y-6">
          <Tabs value={viewType} onValueChange={setViewType}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center">
                <HomeIcon className="mr-2 h-4 w-4" />
                Overall Progress
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Domain Details
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Progress Timeline
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <OverallProgressView 
                student={students?.find((s: Student) => s.id === selectedStudent)} 
                plan={plan as GoodLifePlan} 
                domainProgress={getDomainProgress()}
              />
            </TabsContent>
            
            <TabsContent value="domains" className="space-y-6">
              <DomainProgressView
                domainPlans={domainPlans as DomainPlan[]} 
                domains={DOMAINS}
                getEmoji={getDomainEmoji}
                getMessage={getProgressMessage}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-6">
              <TimelineProgressView 
                student={students?.find((s: Student) => s.id === selectedStudent)}
                domainPlans={domainPlans as DomainPlan[]} 
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : selectedStudent ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          ) : (
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>
                Could not load progress data for this student. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Student</h3>
            <p className="text-gray-500">
              Choose a student from the dropdown above to visualize their progress across different domains.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Overall Progress View Component
function OverallProgressView({ student, plan, domainProgress }: { 
  student: Student | undefined; 
  plan: GoodLifePlan; 
  domainProgress: Record<string, number>;
}) {
  // Overall plan progress
  const overallProgress = Math.round(plan.progress);

  // Progress greeting message
  const getProgressGreeting = (progress: number) => {
    if (progress >= 90) return "Amazing work, almost there!";
    if (progress >= 75) return "Strong progress, keep it up!";
    if (progress >= 50) return "Halfway there, steady progress!";
    if (progress >= 25) return "Good start, keep building!";
    return "Just beginning, every step counts!";
  };

  if (!student) return null;

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{student.name}'s Progress</CardTitle>
          <CardDescription>Overview of progress across all domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-8 border-primary/20 mb-3 mx-auto">
                  <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
                </div>
                <div className="text-xl font-medium mt-2">{getProgressGreeting(overallProgress)}</div>
                <p className="text-gray-500 mt-1">Overall Plan Progress</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {DOMAINS.map(domain => {
                const progress = domainProgress[domain.id] || 0;
                return (
                  <div key={domain.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${domain.bgClass} mr-2`}></div>
                        <h3 className="font-medium">{domain.name}</h3>
                      </div>
                      <div className="text-2xl">{getEmoji(progress)}</div>
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{progress}% Complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Domain Progress Comparison</CardTitle>
          <CardDescription>Visual comparison of progress across domains</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {DOMAINS.map(domain => {
              const progress = domainProgress[domain.id] || 0;
              return (
                <div key={domain.id} className="text-center p-4">
                  <div className="mb-2">
                    <div className={`w-full h-40 ${domain.bgClass} bg-opacity-10 rounded-lg flex flex-col items-center justify-center`}>
                      <span className="text-4xl mb-2">{getEmoji(progress)}</span>
                      <span className="text-2xl font-bold">{progress}%</span>
                    </div>
                  </div>
                  <h3 className="font-medium">{domain.name}</h3>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Domain Progress Details Component
function DomainProgressView({ domainPlans, domains, getEmoji, getMessage }: { 
  domainPlans: DomainPlan[] | undefined; 
  domains: { id: string; name: string; bgClass: string; }[];
  getEmoji: (progress: number) => string;
  getMessage: (progress: number) => string;
}) {
  if (!domainPlans || !Array.isArray(domainPlans)) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No domain plans available for this student.</p>
      </div>
    );
  }

  // Get domain info by ID
  const getDomainInfo = (domainId: string) => {
    return domains.find(d => d.id === domainId) || { name: domainId, bgClass: "bg-gray-500" };
  };

  // Calculate progress percentage for a domain plan
  const calculateProgress = (domainPlan: DomainPlan) => {
    const goals = domainPlan.goals as any[] || [];
    const completedGoals = goals.filter(g => g.status === "completed").length;
    return goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {domainPlans.map(domainPlan => {
        const domain = getDomainInfo(domainPlan.domain);
        const progress = calculateProgress(domainPlan);
        const emoji = getEmoji(progress);
        const message = getMessage(progress);
        const goals = domainPlan.goals as any[] || [];
        
        return (
          <Card key={domainPlan.id} className="overflow-hidden border-t-4" style={{ borderTopColor: `var(--${domain.id})` }}>
            <CardHeader className={`${domain.bgClass} bg-opacity-10`}>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 text-2xl">{emoji}</span>
                    {domain.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {domainPlan.vision}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{progress}%</div>
                  <div className="text-sm text-gray-600">{message}</div>
                </div>
              </div>
              <Progress value={progress} className="h-2 mt-3" />
            </CardHeader>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Goals Progress</h3>
              {goals.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No goals defined for this domain yet.</p>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal: any, index: number) => {
                    const isCompleted = goal.status === "completed";
                    const statusIcon = isCompleted ? 
                      "✅" : goal.status === "in_progress" ? "🔄" : "⏱️";
                    
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`${isCompleted ? 'text-green-800' : 'text-gray-700'}`}>
                              {goal.description}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 text-xl" title={goal.status}>
                            {statusIcon}
                          </div>
                        </div>
                        {isCompleted && (
                          <p className="text-green-600 text-sm mt-1">Completed goal! 🎉</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Timeline Progress View Component
function TimelineProgressView({ student, domainPlans }: { 
  student: Student | undefined; 
  domainPlans: DomainPlan[] | undefined;
}) {
  if (!student || !domainPlans || !Array.isArray(domainPlans)) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No timeline data available for this student.</p>
      </div>
    );
  }

  // Create mock timeline events (in a real app, these would come from the backend)
  const timelineEvents = [
    { date: new Date(2025, 3, 20), title: "Plan Initiated", description: "Good Life Plan was started", type: "milestone" },
    { date: new Date(2025, 3, 22), title: "Goals Defined", description: "Initial goals were set across domains", type: "planning" },
  ];

  // Add domain-specific milestone events
  domainPlans.forEach(domainPlan => {
    const goals = domainPlan.goals as any[] || [];
    const completedGoals = goals.filter(g => g.status === "completed");
    
    if (completedGoals.length > 0) {
      const latestDate = new Date(2025, 3, 21); // Mock date (would be from real completion data)
      
      timelineEvents.push({
        date: latestDate,
        title: `Goal Completed in ${domainPlan.domain}`,
        description: `"${completedGoals[0].description}" was completed`,
        type: "achievement"
      });
    }
  });

  // Sort timeline events by date (most recent first)
  const sortedEvents = timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}'s Progress Timeline</CardTitle>
        <CardDescription>Tracking achievements and milestones over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {sortedEvents.map((event, i) => (
              <div key={i} className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    event.type === "achievement" ? "bg-green-100 text-green-600" :
                    event.type === "milestone" ? "bg-blue-100 text-blue-600" : 
                    "bg-amber-100 text-amber-600"
                  }`}>
                    {event.type === "achievement" ? "🎯" : 
                     event.type === "milestone" ? "🏆" : "📝"}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="text-sm text-gray-500 mb-1">
                    {event.date.toLocaleDateString("en-SG", { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              </div>
            ))}
            
            {/* Start indicator */}
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-primary-foreground border-2 border-primary flex items-center justify-center">
                  🚀
                </div>
              </div>
              <div className="flex-grow pt-3">
                <h3 className="font-medium">Good Life Plan Journey Started</h3>
                <p className="text-gray-700">Beginning of the personalized learning journey</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get emoji based on progress
function getEmoji(percentage: number) {
  if (percentage >= 90) return "🌟";
  if (percentage >= 75) return "😊";
  if (percentage >= 50) return "🙂";
  if (percentage >= 25) return "🔄";
  return "🌱";
}