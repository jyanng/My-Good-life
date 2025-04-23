import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/dashboard/StatsCard";
import StudentTable from "@/components/dashboard/StudentTable";
import DomainProgress from "@/components/dashboard/DomainProgress";
import QualityAlerts from "@/components/dashboard/QualityAlerts";
import QuickAccess from "@/components/dashboard/QuickAccess";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileTextIcon } from "lucide-react";
import { Student, Alert } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch students - for demo purposes we're using facilitator ID 1
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/students?facilitatorId=1"],
  });

  // Fetch alerts
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["/api/alerts?facilitatorId=1"],
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats?facilitatorId=1"],
  });

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your report has been generated and is ready for download.",
    });
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilitator Dashboard</h1>
          <p className="mt-1 text-gray-600">Monitor and support your students' transition journey</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Link href="/students/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard 
          title="Active Students"
          value={isLoadingStats ? "..." : stats?.activeStudents || 0}
          icon="group"
          change={5}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard 
          title="Plans In Progress"
          value={isLoadingStats ? "..." : stats?.plansInProgress || 0}
          icon="edit_document"
          change={18}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatsCard 
          title="Completed Plans"
          value={isLoadingStats ? "..." : stats?.completedPlans || 0}
          icon="task_alt"
          change={-3}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>
      
      {/* Student Progress Section */}
      <StudentTable students={students as Student[] || []} isLoading={isLoadingStudents} />
      
      {/* Domain Focus and Quality Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DomainProgress domainProgress={isLoadingStats ? undefined : stats?.domainProgress} />
        <QualityAlerts alerts={alerts as Alert[] || []} isLoading={isLoadingAlerts} />
      </div>
      
      {/* Quick Access Section */}
      <QuickAccess />
      
      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm pb-8">
        <p>© 2023 MyGoodLife Transition Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
