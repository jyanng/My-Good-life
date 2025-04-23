import React, { useState } from 'react';
import { CheckIcon, PlusIcon, X as XIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type GoalDependency = {
  id: string;
  goalId: string;
  description: string;
};

type GoalType = {
  id: string;
  description: string;
  status: string;
  needsReframing?: boolean;
  domainId: string;
  category?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  dependencies?: GoalDependency[];
  collaborators?: string[];
  templateId?: number;
  estimatedDuration?: string;
};

interface DependenciesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dependencies: GoalDependency[]) => void;
  currentGoal: GoalType;
  allGoals: GoalType[];
}

export default function DependenciesManager({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  allGoals
}: DependenciesManagerProps) {
  const [dependencies, setDependencies] = useState<GoalDependency[]>(
    currentGoal.dependencies || []
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter out the current goal and any already selected goals
  const availableGoals = allGoals.filter(
    goal => 
      goal.id !== currentGoal.id && 
      !dependencies.some(dep => dep.goalId === goal.id) &&
      (searchTerm === '' || 
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  
  // Add a dependency
  const addDependency = (goal: GoalType) => {
    const newDependency: GoalDependency = {
      id: `dep-${Date.now()}`,
      goalId: goal.id,
      description: goal.description
    };
    
    setDependencies([...dependencies, newDependency]);
  };
  
  // Remove a dependency
  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter(dep => dep.id !== id));
  };
  
  // Handle save
  const handleSave = () => {
    onSave(dependencies);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Dependencies</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-description" className="font-medium">Current Goal</Label>
            <p id="goal-description" className="text-sm border p-2 rounded bg-gray-50">
              {currentGoal.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search-goals">Search Goals</Label>
            <Input
              id="search-goals"
              placeholder="Search by description or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Current Dependencies</Label>
            {dependencies.length > 0 ? (
              <ScrollArea className="h-28 border rounded-md p-2">
                <div className="space-y-2">
                  {dependencies.map(dep => (
                    <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <p className="text-sm pr-2">{dep.description}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => removeDependency(dep.id)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-center">
                <p className="text-sm text-gray-500">No dependencies added yet</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Available Goals</Label>
            {availableGoals.length > 0 ? (
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {availableGoals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <p className="text-sm">{goal.description}</p>
                        {goal.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {goal.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-600"
                        onClick={() => addDependency(goal)}
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
                  {searchTerm ? "No matching goals found" : "No other goals available"}
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-4 text-sm text-gray-500">
            <p>Dependencies are goals that need to be completed before this goal can be started.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Dependencies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}