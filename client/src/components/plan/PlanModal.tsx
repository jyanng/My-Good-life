import { useState } from "react";
import { X as CloseIcon } from "lucide-react";
import { Student, Profile, GoodLifePlan, DomainPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutMeSection from "@/components/profile/AboutMeSection";
import DomainPlanView from "@/components/plan/DomainPlanView";
import { formatDate } from "@/lib/constants";

interface PlanModalProps {
  student: Student;
  profile?: Profile;
  plan: GoodLifePlan;
  domainPlans?: DomainPlan[];
  onClose: () => void;
}

export default function PlanModal({ 
  student, 
  profile, 
  plan, 
  domainPlans,
  onClose 
}: PlanModalProps) {
  const [activeTab, setActiveTab] = useState("about");
  
  // Calculate overall plan progress
  const progress = plan.progress;
  
  // Format domain plans by domain
  const domainPlanMap = domainPlans?.reduce((acc, plan) => {
    acc[plan.domain] = plan;
    return acc;
  }, {} as Record<string, DomainPlan>) || {};

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{student.name}'s GoodLife Plan</h2>
            <button 
              className="text-gray-400 hover:text-gray-500" 
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button 
                  className={`border-b-2 font-medium py-4 px-1 ${
                    activeTab === "about" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("about")}
                >
                  About Me
                </button>
                <button 
                  className={`border-b-2 font-medium py-4 px-1 ${
                    activeTab === "plan" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("plan")}
                >
                  Domain Plans
                </button>
                <button 
                  className={`border-b-2 font-medium py-4 px-1 ${
                    activeTab === "progress" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("progress")}
                >
                  Progress
                </button>
                <button 
                  className={`border-b-2 font-medium py-4 px-1 ${
                    activeTab === "notes" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("notes")}
                >
                  Notes
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div>
              {/* About Me Tab */}
              {activeTab === "about" && profile && (
                <AboutMeSection 
                  student={student} 
                  profile={profile} 
                  onViewFullPlan={() => setActiveTab("plan")}
                />
              )}
              
              {/* Domain Plans Tab */}
              {activeTab === "plan" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium">Plan Overview</h3>
                      <p className="text-sm text-gray-500">Overall progress: {progress}%</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {plan.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {domainPlans?.map(domainPlan => (
                      <DomainPlanView key={domainPlan.id} domainPlan={domainPlan} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
                  <p className="text-gray-500">Detailed progress tracking will be available in a future update.</p>
                </div>
              )}
              
              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-4">Facilitator Notes</h3>
                  <p className="text-gray-500">Notes functionality will be available in a future update.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Last updated: <span className="font-medium">{formatDate(plan.updatedAt)}</span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => window.print()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer mr-1">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                Print
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
