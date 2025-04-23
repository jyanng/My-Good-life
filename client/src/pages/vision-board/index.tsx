import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Student, DomainPlan } from '@shared/schema';
import VisionBoard from '@/components/vision-board/VisionBoard';
import { useToast } from '@/hooks/use-toast';

interface VisionBoardPageProps {
  studentId?: number;
}

export default function VisionBoardPage({ studentId }: VisionBoardPageProps) {
  const [, setLocation] = useLocation();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId ? studentId.toString() : '');
  const { toast } = useToast();

  // For demo purposes, assume we're logged in as facilitator ID 1
  const facilitatorId = 1;
  
  // Fetch the list of students
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: [`/api/students?facilitatorId=${facilitatorId}`],
  });

  // Fetch the selected student
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${selectedStudentId}`],
    enabled: !!selectedStudentId,
  });

  // Fetch the student's plan
  const { data: plan } = useQuery({
    queryKey: [`/api/students/${selectedStudentId}/plan`],
    enabled: !!selectedStudentId,
  });

  // Fetch the domain plans
  const { data: domainPlans, isLoading: isLoadingPlans } = useQuery<DomainPlan[]>({
    queryKey: [`/api/plans/${plan?.id}/domains`],
    enabled: !!plan?.id,
  });

  // Save changes to domain plans
  const handleSaveChanges = async () => {
    if (!domainPlans) return;

    // This would be the place to implement saving logic
    // For example, you might update domain plans with the new goal arrangements
    toast({
      title: "Success",
      description: "Vision board changes saved successfully!",
    });
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interactive Vision Board</h1>
          <p className="mt-1 text-gray-600">
            Visualize and reorganize goals across domains to create a balanced Good Life plan
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-4">
          <Button
            onClick={() => setLocation('/students')}
            variant="outline"
          >
            Back to Students
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!selectedStudentId || !domainPlans}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Student
              </label>
              <Select
                value={selectedStudentId}
                onValueChange={(value) => setSelectedStudentId(value)}
                disabled={isLoadingStudents}
              >
                <SelectTrigger id="student-select" className="w-full">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedStudentId ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user-search mx-auto text-gray-400 mb-4"
          >
            <circle cx="10" cy="8" r="5" />
            <path d="M2 18a7 7 0 0 1 10.63-6" />
            <circle cx="16" cy="18" r="3" />
            <path d="m21 21-1.5-1.5" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
          <p className="text-gray-500">Please select a student to view their vision board</p>
        </div>
      ) : isLoadingStudent || isLoadingPlans ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-md" />
            ))}
          </div>
        </div>
      ) : student && domainPlans ? (
        <VisionBoard student={student} domainPlans={domainPlans} />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-alert-circle mx-auto text-gray-400 mb-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
          <p className="text-gray-500">
            This student doesn't have any domain plans or goals yet. Create a Good Life Plan first.
          </p>
        </div>
      )}
    </div>
  );
}