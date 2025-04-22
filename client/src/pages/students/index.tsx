import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students?facilitatorId=1"],
  });
  
  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    toast({
      title: "Coming Soon",
      description: "Student creation form will be available soon.",
    });
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profiles</h1>
          <p className="mt-1 text-gray-600">Manage your student transition profiles</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAddStudent}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search students by name, email, or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              Filter
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter ml-2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </Button>
            <Button variant="outline">
              Sort
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-down ml-2">
                <path d="m21 16-4 4-4-4" />
                <path d="M17 20V4" />
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Student Cards */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents && filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div 
                key={student.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5 border-b border-gray-200">
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
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.status === 'active' ? (
                        <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                          Needs Attention
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">School</p>
                      <p className="text-sm">{student.school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Graduation</p>
                      <p className="text-sm">{student.graduationDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Age</p>
                      <p className="text-sm">{student.age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Last Active</p>
                      <p className="text-sm">{formatDate(student.lastActivity)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/student/${student.id}`}>
                      <Button className="flex-1" variant="outline">View Profile</Button>
                    </Link>
                    <Link href={`/plan-builder/${student.id}`}>
                      <Button className="flex-1">Edit Plan</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 text-center bg-white rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x mx-auto text-gray-400 mb-4">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="17" x2="22" y1="8" y2="13" />
                <line x1="22" x2="17" y1="8" y2="13" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? `No students match your search criteria "${searchQuery}"`
                  : "You haven't added any students yet"}
              </p>
              <Button onClick={handleAddStudent}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add your first student
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
