import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/dashboard/StatsCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
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
    <div className="p-4 md:p-8 pt-16 md:pt-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" aria-label="MyGoodLife Portal">MyGoodLife Portal</h1>
          <p className="mt-2 text-gray-600 text-lg">Empowering your journey to independence</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Button variant="outline" onClick={handleGenerateReport} className="text-base py-6 px-4 rounded-xl font-medium">
            <FileTextIcon className="mr-2 h-5 w-5" />
            Download Progress Report
          </Button>
          <Link href="/students/new">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-base py-6 px-4 rounded-xl font-medium">
              <PlusIcon className="mr-2 h-5 w-5" />
              Edit My Profile
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Profile Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
      <ProfileCard student={students && students.length > 0 ? students[0] : undefined} isLoading={isLoadingStudents} />
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8 mt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="bg-white p-3 rounded-full mb-4 md:mb-0 md:mr-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-2">Welcome to Your MyGoodLife Portal</h2>
            <p className="text-indigo-700 text-lg mb-2">This is your personal dashboard where you can track progress, set goals, and plan for a fulfilling future.</p>
            <p className="text-indigo-600">Need help? Use the chat feature or explore our learning resources.</p>
          </div>
        </div>
      </div>
      
      {/* Overview Cards */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Journey at a Glance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Life Areas Covered"
          value={isLoadingStats ? "..." : stats?.activeStudents || 0}
          icon="group"
          change={5}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatsCard 
          title="Plans In Progress"
          value={isLoadingStats ? "..." : stats?.plansInProgress || 0}
          icon="edit_document"
          change={18}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
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
      
      {/* Domain Focus and Notification Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DomainProgress domainProgress={isLoadingStats ? undefined : stats?.domainProgress} />
        <QualityAlerts alerts={alerts as Alert[] || []} isLoading={isLoadingAlerts} />
      </div>
      
      {/* Quick Access Section - Resources */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Helpful Resources</h2>
      <QuickAccess />
      
      {/* Accessibility Support */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-8 mb-8">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-3">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Accessibility Support</h3>
        </div>
        <p className="text-gray-700 mb-4">We're committed to making this portal accessible to everyone. If you need assistance or have suggestions to improve accessibility, please contact us.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
              <path d="M17.7 15.6c-.5.5-1.1.9-1.7 1.1a6.66 6.66 0 0 1-8 0c-.6-.2-1.2-.6-1.7-1.1"/>
              <path d="M17 3v6"/>
              <path d="M7 21v-6"/>
              <path d="M3 12h6"/>
              <path d="M15 12h6"/>
            </svg>
            Accessibility Settings
          </Button>
          <Button variant="outline" className="text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Contact Support
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600 text-base pb-8">
        <p>© 2023 MyGoodLife Portal. Creating brighter futures together.</p>
      </footer>
    </div>
  );
}
