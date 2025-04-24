import { Link } from "wouter";
import { Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/constants";
import { formatDate } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
}

export default function StudentTable({ students, isLoading }: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Family & Friends</h3>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Helper function to get person's plan progress
  const getStudentPlanProgress = (studentId: number) => {
    // This would normally be fetched from the API
    // For demo purposes, we'll use a mapping
    const progressMap: Record<number, number> = {
      1: 75,
      2: 45,
      3: 90,
      4: 10
    };
    return progressMap[studentId] || 0;
  };

  // Helper function to get completed domains
  const getCompletedDomains = (studentId: number) => {
    // This would normally be fetched from the API
    // For demo purposes, we'll use a mapping
    const domainsMap: Record<number, string[]> = {
      1: ["safe", "healthy", "engaged", "included"],
      2: ["safe", "healthy"],
      3: ["safe", "healthy", "engaged", "connected", "independent"],
      4: ["safe"]
    };
    return domainsMap[studentId] || [];
  };
  
  // Function to get friendly status message
  const getStatusMessage = (status: string) => {
    return status === 'active' ? 'Actively Working On Plan' : 'Waiting For Updates';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Family & Friends</h3>
            <p className="mt-1 text-gray-600">People who are part of your journey</p>
          </div>
          <div className="relative">
            <Button variant="outline" className="text-base rounded-xl py-2 px-4 hover:bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Filter People
            </Button>
          </div>
        </div>
      </div>
      
      {students.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-gray-700 text-lg font-medium mb-2">No people added yet</p>
          <p className="text-gray-600 mb-4">Start adding family members and friends to your plan</p>
          <Button className="rounded-xl bg-indigo-600 py-2 px-4 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Add Person
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 p-6">
            {students.map((student) => {
              const progress = getStudentPlanProgress(student.id);
              const completedDomains = getCompletedDomains(student.id);
              
              return (
                <div key={student.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow hover:border-indigo-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="flex-shrink-0 h-16 w-16 relative">
                        {student.avatarUrl ? (
                          <img 
                            className="h-16 w-16 rounded-xl object-cover border-2 border-indigo-100" 
                            src={student.avatarUrl} 
                            alt={`Photo of ${student.name}`} 
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-xl font-bold border-2 border-indigo-100">
                            {student.name.substring(0, 1)}
                          </div>
                        )}
                        {student.status === 'active' && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full h-5 w-5" title="Currently active"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-semibold text-gray-900">{student.name}</div>
                        <div className="text-gray-600 font-medium mb-1">{student.email}</div>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
                          <span className="text-sm text-gray-600">{getStatusMessage(student.status)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end">
                      <div className="text-sm text-gray-500 mb-2">Last update: {formatDate(student.lastActivity)}</div>
                      <div className="flex space-x-2">
                        <Link href={`/student/${student.id}`}>
                          <Button variant="outline" className="rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/plan-builder/${student.id}`}>
                          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Update Plan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">Plan Progress</div>
                      <div className="text-sm font-medium text-indigo-600">{progress}% Complete</div>
                    </div>
                    <div 
                      className="w-full bg-gray-100 rounded-full h-3 mb-4"
                      role="progressbar" 
                      aria-valuenow={progress} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                      aria-label={`Plan progress: ${progress}%`}
                    >
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" 
                        style={{ width: `${progress}%` }} 
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                      {DOMAINS.map(domain => {
                        const isCompleted = completedDomains.includes(domain.id);
                        return (
                          <div 
                            key={domain.id}
                            className={`text-center p-2 rounded-lg ${isCompleted ? domain.lightBgClass : 'bg-gray-50'} transition-colors`}
                            title={`${domain.name}: ${isCompleted ? 'Completed' : 'In progress'}`}
                          >
                            <div className={`w-5 h-5 mx-auto rounded-full ${isCompleted ? domain.bgClass : 'bg-gray-200'} mb-1 flex items-center justify-center`}>
                              {isCompleted && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <div className={`text-xs font-medium ${isCompleted ? domain.textClass : 'text-gray-500'}`}>
                              {domain.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600 mb-4 md:mb-0">
                Showing {students.length} of {students.length} people in your plan
              </div>
              <Button className="text-base rounded-xl py-2 px-4 bg-indigo-600 hover:bg-indigo-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                Add New Person
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
