import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Student } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon, UserIcon, BuildingIcon, Trash2Icon, PencilIcon, MoveIcon, SaveIcon } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SupportPerson = {
  id: string;
  name: string;
  role: string;
  institution?: string;
  relationship: string;
  tier: 1 | 2 | 3; // 1 = home, 2 = immediate neighborhood, 3 = larger community
  customPosition?: { x: number; y: number }; // For drag-and-drop positioning
};

export default function CircleOfSupport() {
  // For demo purposes we're using a hardcoded student
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/students"],
  });

  // Define a fallback student
  const fallbackStudent = {
    id: 1,
    name: "Wei Jie Tan",
    email: "weijie.tan@example.com",
    avatarUrl: null,
    school: "Pathlight School"
  };

  const student = fallbackStudent;

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hasPositionChanges, setHasPositionChanges] = useState(false);
  const visualizationRef = useRef<HTMLDivElement>(null);

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

  // Drag handling functions for repositioning people
  const handleDragStart = (id: string) => {
    setIsDragging(true);
    setDragId(id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragId(null);
  };

  const handleDrag = (id: string, x: number, y: number) => {
    if (!visualizationRef.current) return;
    
    // Get center coordinates of the visualization
    const rect = visualizationRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Set the custom position relative to the center
    setSupportPeople(
      supportPeople.map((p) =>
        p.id === id ? { ...p, customPosition: { x: x - centerX, y: y - centerY } } : p
      )
    );
    setHasPositionChanges(true);
  };
  
  // Reset all custom positions
  const handleResetPositions = () => {
    setSupportPeople(
      supportPeople.map((p) => ({ ...p, customPosition: undefined }))
    );
    setHasPositionChanges(false);
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
            {/* Larger Community Circle */}
            <div className="absolute rounded-full border-2 border-indigo-100 w-[500px] h-[500px]"></div>
            
            {/* Immediate Neighborhood Circle */}
            <div className="absolute rounded-full border-2 border-indigo-200 w-[350px] h-[350px]"></div>
            
            {/* Home Circle */}
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
              // Get people in the same tier to calculate angle spacing
              const peopleInSameTier = supportPeople.filter(p => p.tier === person.tier);
              const indexInTier = peopleInSameTier.findIndex(p => p.id === person.id);
              
              // Calculate position based on tier and index within that tier
              const radius = person.tier === 1 ? 100 : person.tier === 2 ? 175 : 250;
              const angleStep = 360 / peopleInSameTier.length;
              const offsetAngle = person.tier === 1 ? 0 : person.tier === 2 ? angleStep/2 : 0; // offset middle tier
              const angle = ((indexInTier * angleStep) + offsetAngle) * (Math.PI / 180);
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
              
              // Select icon based on relationship
              const PersonIcon = 
                person.relationship === "Family" ? 
                  () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                  </svg> :
                person.relationship === "Friend" ? 
                  () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg> :
                person.relationship === "Professional" ? 
                  () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
                  </svg> :
                  () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>;

              return (
                <motion.div
                  key={person.id}
                  className={cn(
                    "absolute rounded-full p-2 shadow-md cursor-pointer transform transition-all duration-200 border-2",
                    backgroundColor,
                    "hover:scale-110 hover:shadow-lg z-20"
                  )}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    borderColor: textColor.replace('text-', 'border-').replace('-800', '-400'),
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleEditPerson(person)}
                >
                  {/* Person Icon and Info */}
                  <div className="flex flex-col items-center justify-center">
                    <div className={cn("p-2 rounded-full", textColor)}>
                      <PersonIcon />
                    </div>
                    <div className="text-center mt-2 w-24">
                      <h4 className={cn("font-medium text-sm", textColor)}>{person.name}</h4>
                      <p className="text-xs text-gray-600 truncate">{person.role}</p>
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