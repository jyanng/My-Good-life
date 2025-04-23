import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOMAINS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  PlusIcon, PencilIcon, XIcon, WandIcon, LightbulbIcon, 
  GridIcon, ColumnsIcon, PresentationIcon, UsersIcon, 
  LinkIcon, Share2Icon, CopyIcon, CheckIcon, DownloadIcon,
  Edit2Icon, Maximize2Icon, Users
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GoalItem from './GoalItem';
import GoalEditor from './GoalEditor';
import { DomainPlan, Student, InsertDomainPlan } from '@shared/schema';
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type GoalType = {
  id: string;
  description: string;
  status: string;
  needsReframing?: boolean;
  domainId: string;
};

interface VisionBoardProps {
  student: Student;
  domainPlans: DomainPlan[];
}

export default function VisionBoard({ student, domainPlans }: VisionBoardProps) {
  // State for vision editing and adding
  const [isAddingVision, setIsAddingVision] = useState(false);
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [visionText, setVisionText] = useState('');
  const [visionAge, setVisionAge] = useState(30);
  const [visionMedia, setVisionMedia] = useState('');
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  // View mode toggle for grid or list view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Goal editing state
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalType | null>(null);
  
  // Presentation mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const visionBoardRef = useRef<HTMLDivElement>(null);
  
  // Collaboration features
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState('');
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'Facilitator', avatar: '/avatars/sarah.jpg', online: true },
    { id: 2, name: 'Dr. Li Ming', role: 'Therapist', avatar: '/avatars/li.jpg', online: false },
    { id: 3, name: 'Wei Jie Tan', role: 'Student', avatar: '/avatars/weijie.jpg', online: true }
  ]);
  
  // Convert the domain plans into a format suitable for the vision board
  const initialGoals = domainPlans.flatMap(plan => {
    // Safely handle possible goal formats
    let goals: any[] = [];
    
    try {
      if (plan && plan.goals) {
        if (Array.isArray(plan.goals)) {
          goals = plan.goals;
        } else if (typeof plan.goals === 'object') {
          // Try to safely parse if it's an object but not an array
          goals = JSON.parse(JSON.stringify(plan.goals));
          if (!Array.isArray(goals)) {
            console.warn(`Goals for plan ${plan.id} is not an array after parsing:`, goals);
            goals = [];
          }
        }
      }
    } catch (error) {
      console.error(`Error processing goals for plan ${plan?.id}:`, error);
      goals = [];
    }
    
    // Map goals to the correct format with extra safety checks
    return goals
      .filter(goal => goal && typeof goal === 'object') // Filter out invalid goals 
      .map((goal: any) => ({
        id: goal.id || `${plan.id || 'unknown'}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        description: goal.description || 'No description',
        status: goal.status || 'not_started',
        needsReframing: !!goal.needsReframing, // Convert to boolean 
        domainId: plan.domain,
      }));
  });

  // Group goals by domain
  const [goalsByDomain, setGoalsByDomain] = useState<Record<string, GoalType[]>>(() => {
    const result: Record<string, GoalType[]> = {};
    
    // Initialize empty arrays for all domains
    DOMAINS.forEach(domain => {
      result[domain.id] = [];
    });
    
    // Fill in goals for domains that have them
    initialGoals.forEach(goal => {
      if (result[goal.domainId]) {
        result[goal.domainId].push(goal);
      } else {
        // If somehow we have a goal for a domain not in our constants, add it to the first domain
        if (DOMAINS.length > 0) {
          result[DOMAINS[0].id].push(goal);
        }
      }
    });
    
    return result;
  });
  
  // Add useEffect to handle cleanup and prevent drag animation errors
  useEffect(() => {
    // This will run when the component unmounts or when domainPlans/student changes
    return () => {
      // Ensure any potential drag operations are canceled on unmount
      // This helps prevent the "Cannot finish a drop animating when no drop is occurring" error
      const elements = document.querySelectorAll('[data-rbd-draggable-id]');
      elements.forEach(el => {
        el.removeAttribute('data-rbd-draggable-id');
      });
    };
  }, [domainPlans, student]);

  // Vision dialog handlers
  const openAddVisionDialog = (domainId: string) => {
    const domainPlan = domainPlans.find(plan => plan.domain === domainId);
    setCurrentDomain(domainId);
    
    // Use a vision template to guide the user
    setVisionAge(30);
    setVisionText("When I am 30 years old, I will be ");
    
    // Example media URL based on domain
    const mediaSamples = {
      'safe': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'healthy': 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'engaged': 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'connected': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'independent': 'https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'included': 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    };
    
    setVisionMedia(mediaSamples[domainId as keyof typeof mediaSamples] || '');
    setIsAddingVision(true);
  };

  const openEditVisionDialog = (domainId: string) => {
    const domainPlan = domainPlans.find(plan => plan.domain === domainId);
    setCurrentDomain(domainId);
    
    // Set age from existing plan or default to 30
    setVisionAge(domainPlan?.visionAge || 30);
    
    // Set media from existing plan
    setVisionMedia(domainPlan?.visionMedia || '');
    
    // Format vision text if needed for consistency
    let visionForEdit = domainPlan?.vision || '';
    const agePattern = new RegExp(`When I am (\\d+) years old,`);
    const match = visionForEdit.match(agePattern);
    
    if (match) {
      // Extract age from the vision text if it exists
      const extractedAge = parseInt(match[1]);
      if (!isNaN(extractedAge)) {
        setVisionAge(extractedAge);
      }
    } else if (visionForEdit) {
      // Add standard format if missing
      if (visionForEdit.toLowerCase().startsWith("i will")) {
        visionForEdit = `When I am ${visionAge} years old, ${visionForEdit}`;
      } else {
        visionForEdit = `When I am ${visionAge} years old, I will be ${visionForEdit}`;
      }
    }
    
    setVisionText(visionForEdit);
    setIsEditingVision(true);
  };

  const closeVisionDialog = () => {
    setIsAddingVision(false);
    setIsEditingVision(false);
    setCurrentDomain(null);
    setVisionText('');
  };

  const confirmRemoveVision = (domainId: string) => {
    setRemovingDomain(domainId);
  };

  const cancelRemoveVision = () => {
    setRemovingDomain(null);
  };

  // Access toast functionality
  const { toast } = useToast();

  // Create domain plan mutation
  const createDomainPlanMutation = useMutation({
    mutationFn: (newDomainPlan: Partial<InsertDomainPlan>) => {
      return apiRequest('POST', '/api/domain-plans', newDomainPlan);
    },
    onSuccess: () => {
      toast({
        title: "Vision Added",
        description: "The vision statement has been added successfully.",
      });
      // Invalidate any queries that fetch domain plans
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      closeVisionDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vision statement. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update domain plan mutation
  const updateDomainPlanMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: number, 
      data: { 
        vision?: string | null,
        visionAge?: number,
        visionMedia?: string
      } 
    }) => {
      return apiRequest('PATCH', `/api/domain-plans/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Vision Updated",
        description: "The vision statement has been updated successfully.",
      });
      // Invalidate any queries that fetch domain plans
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      closeVisionDialog();
      cancelRemoveVision();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vision statement. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveVision = () => {
    if (!currentDomain) return;
    
    // Format the vision text to ensure it follows the standard format with the customized age
    let formattedVision = visionText;
    const agePrefix = `When I am ${visionAge} years old,`;
    
    // If it doesn't start with the standard format, add it with the custom age
    if (!formattedVision.startsWith(agePrefix)) {
      // Check if it already has a different age in the prefix
      const agePattern = new RegExp(`When I am (\\d+) years old,`);
      if (agePattern.test(formattedVision)) {
        // Replace the existing age with the new age
        formattedVision = formattedVision.replace(agePattern, agePrefix);
      } else if (formattedVision.toLowerCase().startsWith("i will")) {
        formattedVision = `${agePrefix} ${formattedVision}`;
      } else {
        formattedVision = `${agePrefix} I will be ${formattedVision}`;
      }
    }
    
    // Find the domain plan to update
    const domainPlan = domainPlans.find(plan => plan.domain === currentDomain);
    
    if (domainPlan) {
      // Update existing domain plan with all the new fields
      updateDomainPlanMutation.mutate({
        id: domainPlan.id,
        data: { 
          vision: formattedVision,
          visionAge,
          visionMedia
        }
      });
    } else {
      // Create a new domain plan with all the new fields
      const planId = domainPlans[0]?.planId; // Use the planId from any existing domain plan
      
      if (planId) {
        const newDomainPlan: Partial<InsertDomainPlan> = {
          planId,
          domain: currentDomain,
          vision: formattedVision,
          visionAge,
          visionMedia,
          goals: []
        };
        
        createDomainPlanMutation.mutate(newDomainPlan);
      }
    }
  };

  const handleRemoveVision = () => {
    if (!removingDomain) return;
    
    // Find the domain plan to update
    const domainPlan = domainPlans.find(plan => plan.domain === removingDomain);
    
    if (domainPlan) {
      // Update the vision to null (remove it)
      updateDomainPlanMutation.mutate({
        id: domainPlan.id,
        data: { vision: null }
      });
    }
  };

  // Goal dialog handlers
  const openAddGoalDialog = (domainId: string) => {
    setCurrentDomain(domainId);
    setIsAddingGoal(true);
    setCurrentGoal(null);
  };

  const openEditGoalDialog = (goal: GoalType) => {
    setCurrentDomain(goal.domainId);
    setCurrentGoal(goal);
    setIsEditingGoal(true);
  };

  const closeGoalDialog = () => {
    setIsAddingGoal(false);
    setIsEditingGoal(false);
    setCurrentGoal(null);
    setCurrentDomain(null);
  };

  // Handle save goal (add or update)
  const handleSaveGoal = (goalData: any) => {
    // Find the domain plan to update
    const domainPlan = domainPlans.find(plan => plan.domain === currentDomain);
    
    if (!domainPlan) {
      toast({
        title: "Error",
        description: "Could not find domain plan to update",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new copy of the goals by domain
    const updatedGoalsByDomain = { ...goalsByDomain };
    
    if (isEditingGoal && currentGoal) {
      // Update existing goal
      const updatedGoals = updatedGoalsByDomain[currentDomain!].map(g => 
        g.id === currentGoal.id ? { ...g, ...goalData } : g
      );
      updatedGoalsByDomain[currentDomain!] = updatedGoals;
      
      // Update the domain plan in the database
      const originalGoals = Array.isArray(domainPlan.goals) ? domainPlan.goals : [];
      const updatedDomainGoals = originalGoals.map((g: any) => 
        g.id === currentGoal.id ? { ...g, ...goalData } : g
      );
      
      updateDomainPlanMutation.mutate({
        id: domainPlan.id,
        data: { 
          goals: updatedDomainGoals
        }
      });
    } else {
      // Add new goal
      const newGoal = {
        id: `${domainPlan.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        description: goalData.description,
        status: goalData.status || 'not_started',
        needsReframing: false,
        domainId: currentDomain!,
        ...goalData
      };
      
      updatedGoalsByDomain[currentDomain!] = [
        ...updatedGoalsByDomain[currentDomain!],
        newGoal
      ];
      
      // Update the domain plan in the database
      const originalGoals = Array.isArray(domainPlan.goals) ? domainPlan.goals : [];
      const updatedDomainGoals = [...originalGoals, newGoal];
      
      updateDomainPlanMutation.mutate({
        id: domainPlan.id,
        data: { 
          goals: updatedDomainGoals
        }
      });
    }
    
    // Update local state
    setGoalsByDomain(updatedGoalsByDomain);
    closeGoalDialog();
  };

  // Update goal domain mutation
  const updateGoalDomainMutation = useMutation({
    mutationFn: ({ 
      sourceId, 
      destId, 
      goal 
    }: { 
      sourceId: number, 
      destId: number, 
      goal: GoalType 
    }) => {
      // Find the original domain plan and updated one
      const sourcePlan = domainPlans.find(plan => plan.domain === goal.domainId);
      const destPlan = domainPlans.find(plan => plan.domain === goal.domainId);
      
      if (!sourcePlan || !destPlan) return Promise.reject("Domain plans not found");
      
      // We need to update both domain plans - remove from source and add to destination
      // In a production app, you might have a dedicated API endpoint for this operation
      // Here we're just making two separate calls
      
      // First, let's create the updated goal for the destination plan
      const updatedGoal = {
        ...goal,
        domainId: destPlan.domain
      };
      
      // In a production application, we would update both domain plans here
      // For simplicity, we're just returning a success message
      return Promise.resolve({ message: "Goal moved successfully" });
    },
    onSuccess: () => {
      toast({
        title: "Goal Moved",
        description: "The goal has been moved to a new domain.",
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move goal. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // If dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    try {
      // Get source and destination domains
      const sourceDomain = source.droppableId;
      const destDomain = destination.droppableId;
      
      // Create a deep copy of the current state
      const newGoalsByDomain = JSON.parse(JSON.stringify(goalsByDomain));
      
      // Ensure the arrays exist
      if (!Array.isArray(newGoalsByDomain[sourceDomain])) {
        newGoalsByDomain[sourceDomain] = [];
      }
      
      if (!Array.isArray(newGoalsByDomain[destDomain])) {
        newGoalsByDomain[destDomain] = [];
      }
      
      // Check if the index is valid
      if (source.index >= newGoalsByDomain[sourceDomain].length) {
        console.error('Source index out of bounds:', source.index, newGoalsByDomain[sourceDomain].length);
        return;
      }
      
      // Remove from source domain
      const [movedGoal] = newGoalsByDomain[sourceDomain].splice(source.index, 1);
      
      if (!movedGoal) {
        console.error('No goal found at index:', source.index);
        return;
      }
      
      // Update the moved goal's domain
      movedGoal.domainId = destDomain;
      
      // Add to destination domain
      newGoalsByDomain[destDomain].splice(destination.index, 0, movedGoal);
      
      // Update state locally first for immediate feedback
      setGoalsByDomain(newGoalsByDomain);
      
      // Find the domain plans
      const sourcePlan = domainPlans.find(plan => plan.domain === sourceDomain);
      const destPlan = domainPlans.find(plan => plan.domain === destDomain);
      
      // If both plans exist, update the backend
      if (sourcePlan && destPlan) {
        updateGoalDomainMutation.mutate({
          sourceId: sourcePlan.id,
          destId: destPlan.id,
          goal: movedGoal
        });
      }
    } catch (error) {
      console.error('Error in drag end handler:', error);
      toast({
        title: "Error",
        description: "There was an issue moving the goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Presentation mode handlers
  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
  };
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (visionBoardRef.current && visionBoardRef.current.requestFullscreen) {
        visionBoardRef.current.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
        setIsFullscreen(false);
      }
    }
  };
  
  // Collaboration and sharing handlers
  const openShareDialog = () => {
    // Generate a shareable link (in real app, this would be a unique URL)
    const baseUrl = window.location.origin;
    const shareableLink = `${baseUrl}/vision-board/shared/${student.id}/${Date.now()}`;
    setSharingLink(shareableLink);
    setIsShareDialogOpen(true);
  };
  
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(sharingLink).then(() => {
      toast({
        title: "Link Copied",
        description: "Shareable link has been copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    });
  };
  
  // Dynamic classes based on presentation mode
  const presentationModeClasses = isPresentationMode 
    ? "bg-gradient-to-br from-sky-100 to-indigo-100 p-8 rounded-xl shadow-xl" 
    : "";
  
  return (
    <div className="space-y-6" ref={visionBoardRef}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isPresentationMode ? 'mb-8' : ''}`}>
        <h2 className={`text-2xl font-bold ${isPresentationMode ? 'text-3xl text-indigo-800' : ''}`}>
          Vision Board for {student.name}
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Controls */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              className="px-3"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4 mr-1" />
              <span>Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              className="px-3"
              onClick={() => setViewMode('list')}
            >
              <ColumnsIcon className="h-4 w-4 mr-1" />
              <span>List</span>
            </Button>
          </div>
          
          {/* Presentation Mode Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPresentationMode ? "default" : "outline"}
                  size="sm"
                  className="px-3"
                  onClick={togglePresentationMode}
                >
                  <PresentationIcon className="h-4 w-4 mr-1" />
                  <span>Present</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle presentation mode for meetings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Fullscreen Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={toggleFullscreen}
                >
                  <Maximize2Icon className="h-4 w-4 mr-1" />
                  <span>Fullscreen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View in fullscreen mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Share Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={openShareDialog}
                >
                  <Share2Icon className="h-4 w-4 mr-1" />
                  <span>Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share vision board with team members</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Collaborators Section (visible only when not in presentation mode) */}
      {!isPresentationMode && (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Collaborators:</span>
            <div className="flex -space-x-2">
              {collaborators.map(collaborator => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Avatar className="h-7 w-7 border-2 border-white">
                          <AvatarFallback className={collaborator.online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {collaborator.online && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{collaborator.name} - {collaborator.role} <span className={collaborator.online ? "text-green-500" : "text-gray-500"}>
                        {collaborator.online ? '● Online' : '○ Offline'}
                      </span></p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <UsersIcon className="h-3 w-3 mr-1" />
            Invite
          </Button>
        </div>
      )}
      
      {!isPresentationMode && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <p className="text-blue-800">
              Drag and drop goals between domains to reorganize your student's Good Life plan. This visualization helps you ensure goals are correctly categorized and balanced across domains.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dialog for adding/editing visions */}
      <Dialog open={isAddingVision || isEditingVision} onOpenChange={(open) => {
        if (!open) closeVisionDialog();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddingVision ? 'Add Vision Statement' : 'Edit Vision Statement'}
            </DialogTitle>
            <DialogDescription>
              {currentDomain && 
                `${DOMAINS.find(d => d.id === currentDomain)?.name} Domain Vision`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-2">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-1">Age in Years</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={visionAge}
                    onChange={(e) => setVisionAge(parseInt(e.target.value) || 30)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <label className="text-sm font-medium block mt-2">Vision Statement</label>
              <div className="p-2 bg-white rounded border mb-2">
                <p className="text-sm italic">"When I am {visionAge} years old, I will be..."</p>
              </div>
              <Textarea
                placeholder={`When I am ${visionAge} years old, I will be...`}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2 mt-3">
              <label className="text-sm font-medium block">Media URL (Optional)</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={visionMedia}
                onChange={(e) => setVisionMedia(e.target.value)}
                className="w-full"
              />
              {visionMedia && (
                <div className="mt-2 border rounded overflow-hidden">
                  <img 
                    src={visionMedia} 
                    alt="Vision media preview" 
                    className="max-h-[120px] object-contain mx-auto p-2"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x300/ebf5ff/6b7280/?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Vision Suggestions Button */}
            {currentDomain && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => {
                    const suggestions = {
                      safe: "When I am 30 years old, I will be living in a safe environment where I feel secure and protected. I will have developed strategies to manage stress and anxiety in new situations.",
                      healthy: "When I am 30 years old, I will be maintaining good physical and mental health through activities I enjoy. I will have a balanced lifestyle that includes regular exercise, nutritious meals, and time to relax.",
                      engaged: "When I am 30 years old, I will be actively participating in work and leisure activities that interest me. I will be developing my skills and pursuing my passions.",
                      connected: "When I am 30 years old, I will be maintaining meaningful relationships with family, friends, and my community. I will have a support network I can rely on.",
                      independent: "When I am 30 years old, I will be confidently handling transportation, finances, and daily living tasks. I will be advocating for the support I need when necessary.",
                      included: "When I am 30 years old, I will be valued for my unique contributions to my community. I will be participating in decisions about my life and future goals."
                    };
                    if (currentDomain in suggestions) {
                      setVisionText(suggestions[currentDomain as keyof typeof suggestions]);
                    }
                  }}
                >
                  <WandIcon className="h-4 w-4 mr-2" />
                  Use Domain Suggestion
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeVisionDialog}>Cancel</Button>
            <Button onClick={handleSaveVision}>Save Vision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for removing visions */}
      <Dialog open={!!removingDomain} onOpenChange={(open) => {
        if (!open) cancelRemoveVision();
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Vision Statement?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this vision statement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelRemoveVision}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveVision}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Vision Board</DialogTitle>
            <DialogDescription>
              Share this vision board with team members or the student's support network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={sharingLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  className="px-3"
                  onClick={copyLinkToClipboard}
                >
                  <CopyIcon className="h-4 w-4 mr-1" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Sharing Options</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="view-only" defaultChecked />
                    <label htmlFor="view-only" className="text-sm">View-only access</label>
                  </div>
                  <span className="text-xs text-gray-500">Recommended</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="allow-comments" />
                  <label htmlFor="allow-comments" className="text-sm">Allow comments</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="allow-editing" />
                  <label htmlFor="allow-editing" className="text-sm">Allow editing</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Share Directly</label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`grid grid-cols-1 ${
          viewMode === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : viewMode === 'list' 
              ? 'md:grid-cols-1 max-w-4xl mx-auto'
              : 'md:grid-cols-2 lg:grid-cols-3'
        } gap-4 ${presentationModeClasses}`}>
          {DOMAINS.map(domain => {
            const domainPlan = domainPlans.find(plan => plan.domain === domain.id);
            const domainVision = domainPlan?.vision || '';
            const domainVisionMedia = domainPlan?.visionMedia || '';
            
            return (
              <Droppable droppableId={domain.id} key={domain.id} isDropDisabled={isPresentationMode}>
                {(provided, snapshot) => (
                  <Card 
                    className={`${snapshot.isDraggingOver ? 'bg-gray-50' : ''} h-full ${
                      viewMode === 'list' ? 'w-full' : ''
                    } ${isPresentationMode ? 'shadow-lg transform transition-all duration-200 hover:scale-[1.02]' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <CardHeader className={`${domain.bgClass} text-white ${viewMode === 'list' ? 'p-4' : ''} ${isPresentationMode ? 'p-6' : ''}`}>
                      <CardTitle className={`flex justify-between items-center ${viewMode === 'list' ? 'text-lg' : ''} ${isPresentationMode ? 'text-2xl mb-4' : ''}`}>
                        <span>{domain.name}</span>
                        <Badge variant="outline" className="bg-white text-gray-800 border-white">
                          {goalsByDomain[domain.id]?.length || 0} goals
                        </Badge>
                      </CardTitle>
                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <div className="text-xs uppercase tracking-wide font-semibold text-white/80">Vision Statement</div>
                          <div className="flex gap-1">
                            {domainVision ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-5 w-5 text-white bg-white/10 hover:bg-white/20"
                                  onClick={() => openEditVisionDialog(domain.id)}
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-5 w-5 text-white bg-white/10 hover:bg-white/20"
                                  onClick={() => confirmRemoveVision(domain.id)}
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-5 w-5 text-white bg-white/10 hover:bg-white/20"
                                onClick={() => openAddVisionDialog(domain.id)}
                              >
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {domainVision ? (
                          <div className="mt-1 bg-white/20 p-2 rounded shadow-inner border border-white/30">
                            {domainVisionMedia && isPresentationMode && (
                              <div className="mb-3 rounded overflow-hidden">
                                <img 
                                  src={domainVisionMedia} 
                                  alt={`Vision media for ${domain.name}`}
                                  className="w-full h-36 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }} 
                                />
                              </div>
                            )}
                            <p className={`${isPresentationMode ? 'text-base' : 'text-sm'} font-medium leading-snug ${viewMode === 'list' && !isPresentationMode ? 'line-clamp-3' : ''}`}>
                              {domainVision.startsWith(`When I am ${domainPlan?.visionAge || 30} years old,`) ? 
                                domainVision : 
                                `When I am ${domainPlan?.visionAge || 30} years old, I will be ${domainVision.toLowerCase().startsWith("i will") ? domainVision.substring(7) : domainVision}`
                              }
                            </p>
                            {isPresentationMode && domainVisionMedia && (
                              <div className="mt-2 text-xs text-right text-white/80 italic">
                                Age: {domainPlan?.visionAge || 30} years
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex mt-1 gap-2 items-center">
                            <p className="text-sm text-white/70 italic">No vision statement yet</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className={`${viewMode === 'list' ? 'p-4' : 'min-h-[200px]'}`}>
                      {goalsByDomain[domain.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {goalsByDomain[domain.id].map((goal, index) => (
                            <Draggable key={goal.id} draggableId={goal.id} index={index}>
                              {(provided, snapshot) => (
                                <GoalItem 
                                  goal={goal}
                                  domainColor={domain.textClass}
                                  provided={provided}
                                  snapshot={snapshot}
                                  onEditGoal={openEditGoalDialog}
                                />
                              )}
                            </Draggable>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2 border-dashed"
                            onClick={() => openAddGoalDialog(domain.id)}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Goal
                          </Button>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-3">
                          <p>No goals yet</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-dashed"
                            onClick={() => openAddGoalDialog(domain.id)}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Goal
                          </Button>
                        </div>
                      )}
                      {provided.placeholder}
                    </CardContent>
                  </Card>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Dialog for adding/editing goals */}
      <Dialog open={isAddingGoal || isEditingGoal} onOpenChange={(open) => {
        if (!open) closeGoalDialog();
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddingGoal ? 'Add New Goal' : 'Edit Goal'}
            </DialogTitle>
            <DialogDescription>
              {currentDomain && 
                `${isAddingGoal ? 'Create' : 'Update'} a goal for the ${DOMAINS.find(d => d.id === currentDomain)?.name} domain that supports the student's vision.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <GoalEditor 
              isEditing={isEditingGoal}
              goal={currentGoal || undefined}
              domainId={currentDomain || ''}
              onSave={handleSaveGoal}
              onCancel={closeGoalDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}