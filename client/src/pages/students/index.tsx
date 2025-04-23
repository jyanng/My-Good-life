import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Student, InsertStudent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";

export default function Students() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Add useEffect to debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', isAddModalOpen);
  }, [isAddModalOpen]);
  
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students?facilitatorId=1"],
  });
  
  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form schema for adding a student
  const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }).optional().nullable(),
    phone: z.string().optional().nullable(),
    school: z.string().optional().nullable(),
    graduationDate: z.string().optional().nullable(),
    age: z.coerce.number().int().positive().optional().nullable(),
    status: z.string().default("active"),
    facilitatorId: z.number().default(1)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      school: "",
      graduationDate: "",
      age: null,
      status: "active",
      facilitatorId: 1
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      return apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students?facilitatorId=1"] });
      toast({
        title: "Success",
        description: "Student was added successfully.",
      });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createStudentMutation.mutate(values as InsertStudent);
  };

  const handleAddStudent = () => {
    console.log("Add Student button clicked, current state:", isAddModalOpen);
    setIsAddModalOpen(true);
    console.log("After setting state:", true);
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
      
      {/* Add Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter information to create a new student profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Wei Jie Tan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. weijie.tan@example.edu.sg" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +65 9123 4567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 18" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber || null);
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. RC Admiral Hill" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Date</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. November 2024" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="needs_attention">Needs Attention</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudentMutation.isPending}>
                  {createStudentMutation.isPending ? "Saving..." : "Save Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
