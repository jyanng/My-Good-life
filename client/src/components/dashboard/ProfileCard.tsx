import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/constants";
import { Student } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ProfileCardProps {
  student?: Student;
  isLoading?: boolean;
}

export default function ProfileCard({ student, isLoading }: ProfileCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Your personal information and plan progress</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Your personal information and plan progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No Profile Found</h3>
            <p className="text-gray-600 mb-4">Let's set up your profile to get started!</p>
            <Button>Create My Profile</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress for this example (in a real app, this would come from the backend)
  const progress = 65;

  return (
    <Card className="w-full mb-8 overflow-hidden border-indigo-100">
      <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      <CardContent className="pt-0 relative">
        <div className="flex flex-col md:flex-row">
          <div className="relative -top-12 md:-top-16 flex flex-col items-center md:items-start mb-4 md:mb-0 md:mr-8">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-white p-1 shadow-md">
              {student.avatarUrl ? (
                <img 
                  src={student.avatarUrl} 
                  alt={`Photo of ${student.name}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                  {student.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left md:pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{student.name}</h2>
            <p className="text-gray-600 mb-4">{student.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                <div className="font-medium">{formatDate(student.lastActivity)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Plan Status</div>
                <div className="font-medium">
                  <span className={`inline-block w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
                  {student.status === 'active' ? 'In Progress' : 'Needs Update'}
                </div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Plan Completion</div>
                <div className="font-medium">{progress}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-700">Overall Plan Progress</div>
            <div className="text-sm font-medium text-indigo-600">{progress}% Complete</div>
          </div>
          <div 
            className="w-full bg-gray-100 rounded-full h-3 mb-6"
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
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <p className="text-gray-600">
              Continue working on your MyGoodLife Plan to track progress across all life areas.
            </p>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Link href={`/vision-board`}>
                <Button variant="outline" className="w-full md:w-auto rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                  Vision Board
                </Button>
              </Link>
              <Link href={`/plan-builder`}>
                <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Update My Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}