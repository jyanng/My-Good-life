import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/constants";
import { Student } from "@shared/schema";

export default function FacilitatorDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: students, isLoading } = useQuery<Student[], Error>({
    queryKey: ["/api/facilitator/students"],
    enabled: !!user && user.role === "facilitator",
  });

  const filteredStudents = students?.filter((student) => {
    // Only include those matching the search term
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status for tabs
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && student.status === "active") ||
      (activeTab === "attention" && student.status === "needs_attention");
    
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading student profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facilitator Dashboard</h1>
          <p className="text-gray-600">Manage student profiles and transition plans</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link href="/facilitator/reports">
            <Button variant="outline" className="rounded-xl hover:bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15V6" />
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M12 12H3" />
                <path d="M16 6H3" />
                <path d="M12 18H3" />
              </svg>
              Reports
            </Button>
          </Link>
          <Link href="/facilitator/settings">
            <Button variant="outline" className="rounded-xl hover:bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Settings
            </Button>
          </Link>
          <Link href="/facilitator/add-student">
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="attention">Needs Attention</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-[300px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input 
              placeholder="Search students..." 
              className="pl-10 rounded-xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredStudents?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Students Found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No students match the search term "${searchTerm}". Try a different search.` 
              : "You don't have any students in this category yet."}
          </p>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Add Your First Student
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents?.map((student) => (
            <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-100">
              <CardContent className="p-0">
                <div className={`h-2 w-full ${student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {student.avatarUrl ? (
                          <img 
                            className="h-16 w-16 rounded-xl object-cover border-2 border-indigo-100" 
                            src={student.avatarUrl} 
                            alt={`${student.name}`} 
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-xl font-bold border-2 border-indigo-100">
                            {student.name.substring(0, 1)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-gray-600 text-sm">{student.email}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
                          <span className="text-xs text-gray-500">
                            {student.status === 'active' ? 'Active' : 'Needs Attention'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Last Activity:</span> {formatDate(student.lastActivity)}
                    </div>
                    {/* planCompletionDate is currently not in the schema, so we'll hide this for now */}
                    {/* {student.planCompletionDate && (
                      <div>
                        <span className="font-medium">Completion:</span> {formatDate(student.planCompletionDate)}
                      </div>
                    )} */}
                  </div>
                    
                  {/* Tags are not in the schema yet, so we'll add some fixed placeholder tags for demo */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                      Year {Math.floor(Math.random() * 4) + 9}
                    </span>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                      Plan in Progress
                    </span>
                  </div>
                    
                  <div className="flex space-x-2 mt-4">
                    <Link href={`/facilitator/student/${student.id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-lg hover:bg-indigo-50 text-sm">View Profile</Button>
                    </Link>
                    <Link href={`/facilitator/student/${student.id}/edit`} className="flex-1">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm">Edit Plan</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}