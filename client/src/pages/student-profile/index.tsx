import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutMeSection from "@/components/profile/AboutMeSection";
import DomainPlanView from "@/components/plan/DomainPlanView";
import PlanModal from "@/components/plan/PlanModal";
import { FileTextIcon, PrinterIcon, EditIcon } from "lucide-react";
import { Student, Profile, DomainConfidence, GoodLifePlan, DomainPlan } from "@shared/schema";
import { formatDate } from "@/lib/constants";

interface StudentProfileProps {
  id: number;
}

export default function StudentProfile({ id }: StudentProfileProps) {
  const { toast } = useToast();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  
  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${id}`],
  });
  
  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: [`/api/profiles/${id}`],
    enabled: !!student,
  });
  
  // Fetch domain confidence
  const { data: domainConfidence, isLoading: isLoadingConfidence } = useQuery<DomainConfidence>({
    queryKey: [`/api/domain-confidence/${id}`],
    enabled: !!student,
  });
  
  // Fetch plan data
  const { data: plan, isLoading: isLoadingPlan } = useQuery<GoodLifePlan>({
    queryKey: [`/api/students/${id}/plan`],
    enabled: !!student,
  });
  
  // Fetch domain plans if plan exists
  const { data: domainPlans, isLoading: isLoadingDomainPlans } = useQuery<DomainPlan[]>({
    queryKey: [`/api/plans/${plan?.id}/domains`],
    enabled: !!plan,
  });
  
  const handleGeneratePdf = () => {
    toast({
      title: "PDF Generation Started",
      description: "The PDF report is being generated and will be available for download soon.",
    });
  };
  
  if (isLoadingStudent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist or you don't have permission to view their profile.</p>
          <Link href="/students">
            <Button>Go Back to Students</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="md:flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="h-16 w-16 rounded-full" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                  {student.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600">{student.email}</p>
            </div>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-2">
            <Button variant="outline" onClick={handleGeneratePdf}>
              <FileTextIcon className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Link href={`/plan-builder/${student.id}`}>
              <Button>
                <EditIcon className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">School</p>
            <p className="font-medium">{student.school || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Graduation Date</p>
            <p className="font-medium">{student.graduationDate || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Activity</p>
            <p className="font-medium">{formatDate(student.lastActivity)}</p>
          </div>
        </div>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="about" className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <TabsList className="w-full justify-start rounded-none p-0">
            <TabsTrigger 
              value="about" 
              className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              About Me
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Domain Plans
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Notes
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="about" className="p-6 focus:outline-none">
          {isLoadingProfile || isLoadingConfidence ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AboutMeSection 
              student={student} 
              profile={profile} 
              domainConfidence={domainConfidence}
              onViewFullPlan={() => setIsPlanModalOpen(true)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="plan" className="p-6 focus:outline-none">
          {isLoadingPlan || isLoadingDomainPlans ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : plan ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Good Life Plan</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">Plan Status:</span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {plan.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {domainPlans?.map(domainPlan => (
                  <DomainPlanView key={domainPlan.id} domainPlan={domainPlan} />
                ))}
              </div>
              
              {(!domainPlans || domainPlans.length === 0) && (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No domain plans have been created yet.</p>
                  <Link href={`/plan-builder/${student.id}`}>
                    <Button className="mt-4">Start Creating Domain Plans</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No Good Life Plan has been created for this student yet.</p>
              <Link href={`/plan-builder/${student.id}`}>
                <Button className="mt-4">Create Good Life Plan</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="progress" className="p-6 focus:outline-none">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
            <p className="text-gray-500">Detailed progress tracking will be available in a future update.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="p-6 focus:outline-none">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-4">Facilitator Notes</h3>
            <p className="text-gray-500">Notes functionality will be available in a future update.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Full Plan Modal */}
      {isPlanModalOpen && plan && (
        <PlanModal 
          student={student}
          profile={profile}
          plan={plan}
          domainPlans={domainPlans}
          onClose={() => setIsPlanModalOpen(false)}
        />
      )}
    </div>
  );
}
