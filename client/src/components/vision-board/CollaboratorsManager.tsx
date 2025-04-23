import React, { useState } from 'react';
import { X as XIcon, Plus as PlusIcon, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type GoalType = {
  id: string;
  description: string;
  status: string;
  needsReframing?: boolean;
  domainId: string;
  category?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  dependencies?: Array<{ id: string; goalId: string; description: string }>;
  collaborators?: string[];
  templateId?: number;
  estimatedDuration?: string;
};

// Sample list of potential collaborators (in a real app, this would come from an API)
const POTENTIAL_COLLABORATORS = [
  { id: 'c1', name: 'Ms. Grace Lim', role: 'Special Ed Teacher' },
  { id: 'c2', name: 'Mr. Raj Singh', role: 'School Counselor' },
  { id: 'c3', name: 'Dr. Mei Ling', role: 'Psychologist' },
  { id: 'c4', name: 'Mr. Ahmad Bin Ali', role: 'Speech Therapist' },
  { id: 'c5', name: 'Mrs. Chua Lin Da', role: 'Parent' },
  { id: 'c6', name: 'Mr. Jason Wong', role: 'Occupational Therapist' },
  { id: 'c7', name: 'Ms. Nur Fatima', role: 'Job Coach' },
  { id: 'c8', name: 'Dr. Teo Jun Wei', role: 'Developmental Pediatrician' }
];

interface CollaboratorsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collaborators: string[]) => void;
  currentGoal: GoalType;
}

export default function CollaboratorsManager({
  isOpen,
  onClose,
  onSave,
  currentGoal
}: CollaboratorsManagerProps) {
  const [collaborators, setCollaborators] = useState<string[]>(
    currentGoal.collaborators || []
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  
  // Filter collaborators based on search term
  const filteredCollaborators = POTENTIAL_COLLABORATORS.filter(
    collab => 
      !collaborators.includes(collab.name) &&
      (searchTerm === '' || 
        collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collab.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  
  // Add a collaborator
  const addCollaborator = (name: string) => {
    if (!collaborators.includes(name)) {
      setCollaborators([...collaborators, name]);
    }
  };
  
  // Add custom collaborator
  const addCustomCollaborator = () => {
    if (customName.trim() && !collaborators.includes(customName.trim())) {
      addCollaborator(customName.trim());
      setCustomName('');
    }
  };
  
  // Remove a collaborator
  const removeCollaborator = (name: string) => {
    setCollaborators(collaborators.filter(c => c !== name));
  };
  
  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle save
  const handleSave = () => {
    onSave(collaborators);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-description" className="font-medium">Goal</Label>
            <p id="goal-description" className="text-sm border p-2 rounded bg-gray-50">
              {currentGoal.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Current Collaborators</Label>
            {collaborators.length > 0 ? (
              <ScrollArea className="h-28 border rounded-md p-2">
                <div className="space-y-2">
                  {collaborators.map((name, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{name}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => removeCollaborator(name)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-center">
                <p className="text-sm text-gray-500">No collaborators added yet</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search-collaborators">Find Collaborators</Label>
            <Input
              id="search-collaborators"
              placeholder="Search by name or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Suggested Collaborators</Label>
            {filteredCollaborators.length > 0 ? (
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {filteredCollaborators.map(collab => (
                    <div key={collab.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{collab.name}</p>
                        <p className="text-xs text-gray-500">{collab.role}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-600"
                        onClick={() => addCollaborator(collab.name)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 border rounded-md text-center">
                <p className="text-sm text-gray-500">
                  {searchTerm ? "No matching collaborators found" : "No suggested collaborators available"}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-collaborator">Add Custom Collaborator</Label>
            <div className="flex space-x-2">
              <Input
                id="custom-collaborator"
                placeholder="Enter name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCollaborator();
                  }
                }}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={addCustomCollaborator}
                disabled={!customName.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Collaborators
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}