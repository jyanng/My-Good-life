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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOMAINS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { Student, GoodLifePlan, DomainPlan } from "@shared/schema";
import { ArrowLeftIcon, HomeIcon, FileTextIcon, CalendarIcon } from "lucide-react";
import StudentProgress from "@/components/progress/StudentProgress";
import ProgressChart from "@/components/progress/ProgressChart";
import DomainProgressDetails from "@/components/progress/DomainProgressDetails";
import ProgressTimeline from "@/components/progress/ProgressTimeline";

export default function ProgressVisualization() {
  const [, navigate] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [viewType, setViewType] = useState<string>("overview");

  // Fetch all students - hard-coded facilitator ID 1 for demo
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students?facilitatorId=1"]
  });

  // Fetch the selected student's plan
  const { data: plan, isLoading: isLoadingPlan } = useQuery<GoodLifePlan>({
    queryKey: ["/api/students/" + (selectedStudent || 0) + "/plan"],
    enabled: !!selectedStudent
  });

  // Fetch domain plans for the selected student's plan
  const { data: domainPlans, isLoading: isLoadingDomainPlans } = useQuery<DomainPlan[]>({
    queryKey: ["/api/plans/" + (plan?.id || 0) + "/domains"],
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
              <StudentProgress 
                student={students?.find((s: Student) => s.id === selectedStudent)} 
                plan={plan as GoodLifePlan} 
                domainProgress={getDomainProgress()}
              />
              <ProgressChart 
                domainProgress={getDomainProgress()} 
                domains={DOMAINS}
              />
            </TabsContent>
            
            <TabsContent value="domains" className="space-y-6">
              <DomainProgressDetails
                domainPlans={domainPlans as DomainPlan[]} 
                domains={DOMAINS}
                getEmoji={getDomainEmoji}
                getMessage={getProgressMessage}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-6">
              <ProgressTimeline 
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

