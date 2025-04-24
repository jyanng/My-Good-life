import React, { useState } from 'react';
import { 
  Tag, 
  MoreHorizontal, 
  Clock, 
  Link, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flag,
  Users,
  X as XIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

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

interface GoalItemProps {
  goal: GoalType;
  onEdit?: () => void;
  isPresentationMode?: boolean;
  allGoals?: GoalType[];
}

export default function GoalItem({ goal, onEdit, isPresentationMode = false, allGoals = [] }: GoalItemProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDependenciesDialogOpen, setIsDependenciesDialogOpen] = useState(false);
  
  // Define domain color mappings
  const getDomainColor = () => {
    switch (goal.domainId) {
      case 'safe':
        return 'text-emerald-600';
      case 'healthy':
        return 'text-green-600';
      case 'engaged':
        return 'text-blue-600';
      case 'connected':
        return 'text-purple-600';
      case 'independent':
        return 'text-amber-600';
      case 'included':
        return 'text-pink-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Define category color mappings
  const getCategoryColor = () => {
    switch (goal.category) {
      case 'education':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'social':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'career':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'physical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'financial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Determine status badge color
  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            <span>Completed</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            <span>In Progress</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            <span>Not Started</span>
          </div>
        );
    }
  };
  
  // Get priority badge
  const getPriorityBadge = () => {
    switch (goal.priority) {
      case 'high':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
                  <Flag className="w-3 h-3 mr-1" />High
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>High Priority</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'medium':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                  <Flag className="w-3 h-3 mr-1" />Medium
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Medium Priority</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'low':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                  <Flag className="w-3 h-3 mr-1" />Low
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Low Priority</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  // Get category badge
  const getCategoryBadge = () => {
    if (!goal.category) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${getCategoryColor()} border`}>
              <Tag className="w-3 h-3 mr-1" />{goal.category}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Category: {goal.category}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Display dependency indicators
  const hasDependencies = goal.dependencies && goal.dependencies.length > 0;
  const hasCollaborators = goal.collaborators && goal.collaborators.length > 0;
  
  // Format due date
  const formattedDueDate = goal.dueDate 
    ? new Date(goal.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <>
      <div
        className={`p-3 rounded-md border shadow-sm bg-white ${goal.needsReframing ? 'border-l-4 border-l-amber-500' : ''}`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className={`text-sm ${getDomainColor()}`}>{goal.description}</p>
            
            <div className="shrink-0 ml-2 flex items-center gap-1">
              {goal.needsReframing && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded-full flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Reframe
                </span>
              )}
              
              {!isPresentationMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDependenciesDialogOpen(true)}>
                      {hasDependencies ? "View Dependencies" : "Add Dependencies"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onEdit}>
                      Edit Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem className={goal.status === 'completed' ? "text-gray-400" : ""}>
                      Mark {goal.status === 'completed' ? "Incomplete" : "Complete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Category and other metadata */}
          {(goal.category || goal.priority || hasDependencies || goal.dueDate) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {getCategoryBadge()}
              {getPriorityBadge()}
              
              {hasDependencies && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-gray-50">
                        <Link className="w-3 h-3 mr-1" />{goal.dependencies?.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Has {goal.dependencies?.length} dependencies</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {formattedDueDate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        <Calendar className="w-3 h-3 mr-1" />{formattedDueDate}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Due: {formattedDueDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {hasCollaborators && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                        <Users className="w-3 h-3 mr-1" />{goal.collaborators?.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{goal.collaborators?.length} collaborators</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-1">
            {getStatusBadge()}
            
            {goal.estimatedDuration && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>{goal.estimatedDuration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Goal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{goal.description}</h3>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {getStatusBadge()}
                {getCategoryBadge()}
                {getPriorityBadge()}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formattedDueDate && (
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-sm font-medium">{formattedDueDate}</p>
                  </div>
                )}
                
                {goal.estimatedDuration && (
                  <div>
                    <p className="text-sm text-gray-500">Estimated Time</p>
                    <p className="text-sm font-medium">{goal.estimatedDuration}</p>
                  </div>
                )}
              </div>
              
              {hasDependencies && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Dependencies</p>
                  <div className="space-y-2">
                    {goal.dependencies?.map(dep => (
                      <div key={dep.id} className="flex items-center p-2 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <p className="text-sm">{dep.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {hasCollaborators && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Collaborators</p>
                  <div className="flex flex-wrap gap-2">
                    {goal.collaborators?.map((collaborator, index) => (
                      <Badge key={index} variant="outline">
                        <Users className="w-3 h-3 mr-1" />{collaborator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailsDialogOpen(false);
              onEdit?.();
            }}>
              Edit Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dependencies Dialog */}
      <Dialog open={isDependenciesDialogOpen} onOpenChange={setIsDependenciesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Goal Dependencies</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Dependencies are goals that must be completed before this goal can be started.
            </p>
            
            {hasDependencies ? (
              <div className="space-y-2">
                {goal.dependencies?.map(dep => (
                  <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{dep.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-dashed rounded text-center">
                <p className="text-sm text-gray-500">No dependencies added yet</p>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Add New Dependency</p>
              <div className="space-y-2">
                {allGoals
                  .filter(g => g.id !== goal.id && (!goal.dependencies || !goal.dependencies.some(d => d.goalId === g.id)))
                  .slice(0, 3) // Limit to 3 for illustration
                  .map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex-1">
                        <p className="text-sm">{g.description}</p>
                      </div>
                      <Button variant="outline" size="sm">Add</Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDependenciesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDependenciesDialogOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}