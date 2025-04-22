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
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Student Progress</h3>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Helper function to get student plan progress
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

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Student Progress</h3>
          <div className="relative">
            <Button variant="outline" size="sm">
              All Students
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Progress</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domains Completed</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const progress = getStudentPlanProgress(student.id);
              const completedDomains = getCompletedDomains(student.id);
              
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.avatarUrl ? (
                          <img className="h-10 w-10 rounded-full" src={student.avatarUrl} alt={student.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {student.name.substring(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }} 
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{progress}% complete</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {DOMAINS.map(domain => {
                        const isCompleted = completedDomains.includes(domain.id);
                        return (
                          <span 
                            key={domain.id}
                            className={`w-3 h-3 rounded-full ${isCompleted ? domain.bgClass : 'bg-gray-200'}`}
                            title={domain.name}
                          ></span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.status === 'active' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Needs Attention
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/student/${student.id}`}>
                      <a className="text-primary hover:text-indigo-900 mr-3">View</a>
                    </Link>
                    <Link href={`/plan-builder/${student.id}`}>
                      <a className="text-gray-600 hover:text-gray-900">Edit</a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {students.length} of {students.length} students
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
