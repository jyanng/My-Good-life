import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Student } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon, UserIcon, BuildingIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SupportPerson = {
  id: string;
  name: string;
  role: string;
  institution?: string;
  relationship: string;
  tier: 1 | 2 | 3; // 1 = home, 2 = immediate neighborhood, 3 = larger community
};

export default function CircleOfSupport() {
  // For demo purposes we're using the first student
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/students"],
  });

  const student = students && students.length > 0 ? students[0] : null;

  // Sample support people for the demo
  const [supportPeople, setSupportPeople] = useState<SupportPerson[]>([
    { id: "1", name: "Mom", role: "Parent", relationship: "Family", tier: 1 },
    { id: "2", name: "Dad", role: "Parent", relationship: "Family", tier: 1 },
    { id: "3", name: "Ms. Lee", role: "Teacher", institution: "Pathlight School", relationship: "Professional", tier: 2 },
    { id: "4", name: "Dr. Tan", role: "Counselor", institution: "Mental Health Services", relationship: "Professional", tier: 2 },
    { id: "5", name: "Coach Ahmad", role: "Sports Coach", institution: "Community Center", relationship: "Professional", tier: 3 },
    { id: "6", name: "Aunt Sarah", role: "Extended Family", relationship: "Family", tier: 3 },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<Omit<SupportPerson, "id">>({
    name: "",
    role: "",
    institution: "",
    relationship: "Family",
    tier: 1,
  });
  const [personToEdit, setPersonToEdit] = useState<SupportPerson | null>(null);

  const handleAddPerson = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setSupportPeople([...supportPeople, { id, ...newPerson }]);
    setNewPerson({
      name: "",
      role: "",
      institution: "",
      relationship: "Family",
      tier: 1,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPerson = (person: SupportPerson) => {
    setPersonToEdit(person);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePerson = () => {
    if (!personToEdit) return;
    
    setSupportPeople(
      supportPeople.map((p) => (p.id === personToEdit.id ? personToEdit : p))
    );
    setIsEditDialogOpen(false);
    setPersonToEdit(null);
  };

  const handleDeletePerson = (id: string) => {
    setSupportPeople(supportPeople.filter((p) => p.id !== id));
  };

  if (isLoadingStudents) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Circle of Support</h1>
          <p className="text-gray-600 mt-2">
            Map out the important people who support you in your journey
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Support Person
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Your Circle of Support</DialogTitle>
              <DialogDescription>
                Add someone who supports you in your journey to independence.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  className="col-span-3"
                  placeholder="Parent, Teacher, Friend, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right">
                  Institution
                </Label>
                <Input
                  id="institution"
                  value={newPerson.institution}
                  onChange={(e) => setNewPerson({ ...newPerson, institution: e.target.value })}
                  className="col-span-3"
                  placeholder="School, Hospital, etc. (Optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="relationship" className="text-right">
                  Relationship
                </Label>
                <select
                  id="relationship"
                  value={newPerson.relationship}
                  onChange={(e) => setNewPerson({ ...newPerson, relationship: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Professional">Professional</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tier" className="text-right">
                  Circle Tier
                </Label>
                <select
                  id="tier"
                  value={newPerson.tier}
                  onChange={(e) => setNewPerson({ ...newPerson, tier: Number(e.target.value) as 1 | 2 | 3 })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1}>Home (Most Important)</option>
                  <option value={2}>Immediate Neighborhood</option>
                  <option value={3}>Larger Community</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPerson}>Add to Circle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Card */}
      {student && (
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              This is the center of your support network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{student.name}</h3>
                <p className="text-gray-600">{student.email}</p>
                {student.school && (
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <BuildingIcon className="h-4 w-4 mr-1" />
                    {student.school}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Circle of Support Visualization */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>Visual Map of Your Support Network</CardTitle>
          <CardDescription>
            People closer to the center are more involved in your daily life
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[600px] bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
            {/* Outer Circle */}
            <div className="absolute rounded-full border-2 border-indigo-100 w-[500px] h-[500px]"></div>
            
            {/* Middle Circle */}
            <div className="absolute rounded-full border-2 border-indigo-200 w-[350px] h-[350px]"></div>
            
            {/* Inner Circle */}
            <div className="absolute rounded-full border-2 border-indigo-300 w-[200px] h-[200px]"></div>
            
            {/* Center - You */}
            <div className="absolute rounded-full bg-white shadow-md w-[80px] h-[80px] flex items-center justify-center z-10">
              <div className="text-center">
                <UserIcon className="h-6 w-6 mx-auto text-indigo-600" />
                <span className="text-xs font-medium mt-1 block">You</span>
              </div>
            </div>
            
            {/* Support People */}
            {supportPeople.map((person, index) => {
              // Calculate position based on tier and index
              const radius = person.tier === 1 ? 100 : person.tier === 2 ? 175 : 250;
              const angle = (index * (360 / supportPeople.filter(p => p.tier === person.tier).length)) * (Math.PI / 180);
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              
              const backgroundColor = 
                person.relationship === "Family" ? "bg-pink-100" :
                person.relationship === "Friend" ? "bg-blue-100" :
                person.relationship === "Professional" ? "bg-emerald-100" : "bg-purple-100";
              
              const textColor =
                person.relationship === "Family" ? "text-pink-800" :
                person.relationship === "Friend" ? "text-blue-800" :
                person.relationship === "Professional" ? "text-emerald-800" : "text-purple-800";
              
              return (
                <motion.div
                  key={person.id}
                  className={cn(
                    "absolute rounded-lg p-3 shadow-md cursor-pointer transform transition-all duration-200",
                    backgroundColor,
                    "hover:scale-110"
                  )}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    width: "120px",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <h4 className={cn("font-medium text-sm", textColor)}>{person.name}</h4>
                    <p className="text-xs text-gray-600">{person.role}</p>
                    {person.institution && (
                      <p className="text-xs text-gray-500 mt-1">{person.institution}</p>
                    )}
                    <div className="flex justify-center mt-2 space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditPerson(person)}
                      >
                        <PencilIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => handleDeletePerson(person.id)}
                      >
                        <Trash2Icon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Circle Labels */}
            <div className="absolute top-6 right-8 flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-300 mr-2"></div>
                <span className="text-sm font-medium">Home</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-200 mr-2"></div>
                <span className="text-sm font-medium">Immediate Neighborhood</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-100 mr-2"></div>
                <span className="text-sm font-medium">Larger Community</span>
              </div>
            </div>
            
            {/* Relationship Legend */}
            <div className="absolute bottom-6 right-8 flex flex-col space-y-2">
              <h4 className="text-sm font-semibold mb-1">Relationships</h4>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-pink-100 rounded mr-2"></div>
                <span className="text-sm">Family</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm">Friend</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-100 rounded mr-2"></div>
                <span className="text-sm">Professional</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-100 rounded mr-2"></div>
                <span className="text-sm">Community</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support People List */}
      <Card>
        <CardHeader>
          <CardTitle>Everyone in My Support Network</CardTitle>
          <CardDescription>
            A complete list of all the people in your circle of support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium hidden md:table-cell">
                    Institution
                  </th>
                  <th className="text-left pb-2 font-medium">Relationship</th>
                  <th className="text-left pb-2 font-medium">Circle</th>
                  <th className="text-right pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supportPeople.map((person) => (
                  <tr key={person.id} className="border-b border-gray-100">
                    <td className="py-3">{person.name}</td>
                    <td className="py-3">{person.role}</td>
                    <td className="py-3 hidden md:table-cell">
                      {person.institution || "-"}
                    </td>
                    <td className="py-3">{person.relationship}</td>
                    <td className="py-3">
                      {person.tier === 1
                        ? "Home"
                        : person.tier === 2
                        ? "Neighborhood"
                        : "Community"}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPerson(person)}
                        className="h-8 px-2 mr-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePerson(person.id)}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Person Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Support Person</DialogTitle>
            <DialogDescription>
              Update details about someone in your support network.
            </DialogDescription>
          </DialogHeader>
          {personToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={personToEdit.name}
                  onChange={(e) =>
                    setPersonToEdit({ ...personToEdit, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Input
                  id="edit-role"
                  value={personToEdit.role}
                  onChange={(e) =>
                    setPersonToEdit({ ...personToEdit, role: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-institution" className="text-right">
                  Institution
                </Label>
                <Input
                  id="edit-institution"
                  value={personToEdit.institution || ""}
                  onChange={(e) =>
                    setPersonToEdit({
                      ...personToEdit,
                      institution: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-relationship" className="text-right">
                  Relationship
                </Label>
                <select
                  id="edit-relationship"
                  value={personToEdit.relationship}
                  onChange={(e) =>
                    setPersonToEdit({
                      ...personToEdit,
                      relationship: e.target.value,
                    })
                  }
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Professional">Professional</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tier" className="text-right">
                  Circle Tier
                </Label>
                <select
                  id="edit-tier"
                  value={personToEdit.tier}
                  onChange={(e) =>
                    setPersonToEdit({
                      ...personToEdit,
                      tier: Number(e.target.value) as 1 | 2 | 3,
                    })
                  }
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1}>Home (Most Important)</option>
                  <option value={2}>Immediate Neighborhood</option>
                  <option value={3}>Larger Community</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePerson}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}