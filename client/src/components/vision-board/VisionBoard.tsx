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
  FullscreenDialog,
  FullscreenDialogContent,
  FullscreenDialogDescription,
  FullscreenDialogFooter,
  FullscreenDialogHeader,
  FullscreenDialogTitle,
} from "@/components/ui/fullscreen-dialog";
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
  const [goalsByDomain, setGoalsByDomain] = useState<Record<string, GoalType[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalType | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [isAddingVision, setIsAddingVision] = useState(false);
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [visionText, setVisionText] = useState('');
  const [visionMedia, setVisionMedia] = useState('');
  const [visionAge, setVisionAge] = useState(30);
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Shareable link
  const sharingLink = window.location.href;
  
  // Generate a display name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Collect goals from domain plans
  useEffect(() => {
    const collectedGoals: Record<string, GoalType[]> = {};
    
    domainPlans.forEach(plan => {
      if (plan.goals) {
        try {
          const goalsArray = typeof plan.goals === 'string' 
            ? JSON.parse(plan.goals) 
            : plan.goals;
            
          if (Array.isArray(goalsArray)) {
            collectedGoals[plan.domain] = goalsArray;
          } else {
            console.error(`Goals for domain ${plan.domain} is not an array:`, goalsArray);
            collectedGoals[plan.domain] = [];
          }
        } catch (error) {
          console.error(`Error parsing goals for domain ${plan.domain}:`, error);
          collectedGoals[plan.domain] = [];
        }
      } else {
        collectedGoals[plan.domain] = [];
      }
    });
    
    setGoalsByDomain(collectedGoals);
  }, [domainPlans]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenActive = document.fullscreenElement !== null ||
        // @ts-ignore - vendor prefixed properties
        document.webkitFullscreenElement !== null ||
        // @ts-ignore - vendor prefixed properties
        document.mozFullScreenElement !== null ||
        // @ts-ignore - vendor prefixed properties
        document.msFullscreenElement !== null;
      
      setIsFullscreen(isFullscreenActive);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Handle ESC key in presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPresentationMode && !isAddingGoal && !isEditingGoal && !isAddingVision && !isEditingVision) {
        e.preventDefault();
        setIsPresentationMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, isAddingGoal, isEditingGoal, isAddingVision, isEditingVision]);

  // Domain plan mutation
  const updateDomainPlanMutation = useMutation({
    mutationFn: async ({ 
      id, 
      vision = undefined, 
      goals = undefined 
    }: { 
      id: number, 
      vision?: string, 
      goals?: GoalType[] 
    }) => {
      const updateData: Partial<InsertDomainPlan> = {};
      if (vision !== undefined) {
        updateData.vision = vision;
      }
      if (goals !== undefined) {
        updateData.goals = JSON.stringify(goals);
      }
      
      return apiRequest(`/api/domain-plans/${id}`, {
        method: 'PATCH',
        body: updateData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
    },
  });

  // Goal dialog handlers
  const openAddGoalDialog = (domainId: string) => {
    // Don't allow adding goals when in presentation mode
    if (isPresentationMode) return;
    
    // Don't allow adding a goal if any dialogs are open
    if (isAddingVision || isEditingVision || isAddingGoal || isEditingGoal) return;
    
    setCurrentDomain(domainId);
    setCurrentGoal(null);
    setIsAddingGoal(true);
  };

  const openEditGoalDialog = (goal: GoalType) => {
    // Don't allow editing goals when in presentation mode
    if (isPresentationMode) return;
    
    // Don't allow editing a goal if any dialogs are open
    if (isAddingVision || isEditingVision || isAddingGoal || isEditingGoal) return;
    
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

  const handleSaveGoal = (goal: GoalType) => {
    const domainId = goal.domainId;
    const domainPlan = domainPlans.find(plan => plan.domain === domainId);
    
    if (!domainPlan) {
      toast({
        title: "Error",
        description: "Domain plan not found.",
        variant: "destructive",
      });
      return;
    }
    
    let updatedGoals = [...(goalsByDomain[domainId] || [])];
    
    if (isEditingGoal && currentGoal) {
      // Update existing goal
      updatedGoals = updatedGoals.map(g => g.id === goal.id ? goal : g);
    } else {
      // Add new goal
      updatedGoals.push(goal);
    }
    
    // Update the goalsByDomain state
    setGoalsByDomain(prev => ({
      ...prev,
      [domainId]: updatedGoals
    }));
    
    // Save to database
    updateDomainPlanMutation.mutate({
      id: domainPlan.id,
      goals: updatedGoals
    });
    
    closeGoalDialog();
    
    toast({
      title: isEditingGoal ? "Goal Updated" : "Goal Added",
      description: isEditingGoal 
        ? "The goal has been successfully updated." 
        : "A new goal has been added to the vision board.",
    });
  };

  // Vision dialog handlers
  const openAddVisionDialog = (domainId: string) => {
    // Don't allow adding visions when in presentation mode
    if (isPresentationMode) return;
    
    // Don't allow if any dialogs are open
    if (isAddingVision || isEditingVision || isAddingGoal || isEditingGoal) return;
    
    setCurrentDomain(domainId);
    setVisionText('');
    setVisionMedia('');
    setVisionAge(30);
    setIsAddingVision(true);
  };

  const openEditVisionDialog = (domainId: string, vision: string, media?: string, age?: number) => {
    // Don't allow editing visions when in presentation mode
    if (isPresentationMode) return;
    
    // Don't allow if any dialogs are open
    if (isAddingVision || isEditingVision || isAddingGoal || isEditingGoal) return;
    
    setCurrentDomain(domainId);
    
    // Parse vision data
    let visionText = vision;
    let visionAge = age || 30;
    let visionMedia = media || '';
    
    setVisionText(visionText);
    setVisionAge(visionAge);
    setVisionMedia(visionMedia);
    setIsEditingVision(true);
  };

  const closeVisionDialog = () => {
    setIsAddingVision(false);
    setIsEditingVision(false);
    setCurrentDomain(null);
    setVisionText('');
    setVisionMedia('');
  };

  const handleSaveVision = () => {
    if (!currentDomain) return;
    
    const domainPlan = domainPlans.find(plan => plan.domain === currentDomain);
    if (!domainPlan) {
      toast({
        title: "Error",
        description: "Domain plan not found",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare the vision string with age and media embedded as JSON if needed
    const visionData = {
      text: visionText,
      age: visionAge,
      media: visionMedia || undefined
    };
    
    // Update the domain plan
    updateDomainPlanMutation.mutate({
      id: domainPlan.id,
      vision: JSON.stringify(visionData)
    });
    
    closeVisionDialog();
    
    toast({
      title: isEditingVision ? "Vision Updated" : "Vision Added",
      description: isEditingVision
        ? "The vision statement has been successfully updated."
        : "A new vision statement has been added to the vision board.",
    });
  };

  // Handle removal of vision
  const confirmRemoveVision = (domainId: string) => {
    // Don't allow removing visions when in presentation mode
    if (isPresentationMode) return;
    
    setRemovingDomain(domainId);
  };

  const cancelRemoveVision = () => {
    setRemovingDomain(null);
  };

  const handleRemoveVision = () => {
    if (!removingDomain) return;
    
    const domainPlan = domainPlans.find(plan => plan.domain === removingDomain);
    if (!domainPlan) {
      toast({
        title: "Error",
        description: "Domain plan not found",
        variant: "destructive",
      });
      return;
    }
    
    // Clear the vision
    updateDomainPlanMutation.mutate({
      id: domainPlan.id,
      vision: ''
    });
    
    setRemovingDomain(null);
    
    toast({
      title: "Vision Removed",
      description: "The vision statement has been removed from the vision board.",
    });
  };

  // Handle drag-and-drop reordering
  const onDragEnd = (result: DropResult) => {
    // Skip if we're in presentation mode
    if (isPresentationMode) return;
    
    // Skip if no destination or same position
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    // Get domain from droppable ID
    const domainId = result.source.droppableId.replace('goals-', '');
    const domainPlan = domainPlans.find(plan => plan.domain === domainId);
    
    if (!domainPlan || !goalsByDomain[domainId]) return;
    
    // Reorder the goals
    const goals = [...goalsByDomain[domainId]];
    const [removed] = goals.splice(result.source.index, 1);
    goals.splice(result.destination.index, 0, removed);
    
    // Update state
    setGoalsByDomain(prev => ({
      ...prev,
      [domainId]: goals
    }));
    
    // Save to database
    updateDomainPlanMutation.mutate({
      id: domainPlan.id,
      goals: goals
    });
  };

  // Parse a vision string to extract embedded data
  const parseVision = (visionStr: string) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(visionStr);
      return {
        text: parsed.text || visionStr,
        age: parsed.age || 30,
        media: parsed.media || ''
      };
    } catch (e) {
      // If not valid JSON, return as plain text
      return {
        text: visionStr,
        age: 30,
        media: ''
      };
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    // Don't toggle fullscreen if any dialog is open
    if (isAddingVision || isEditingVision || isAddingGoal || isEditingGoal || isShareDialogOpen) {
      return;
    }
    
    if (!boardRef.current) return;
    
    if (!isFullscreen) {
      // Enter fullscreen mode
      if (boardRef.current.requestFullscreen) {
        boardRef.current.requestFullscreen();
      // @ts-ignore - vendor prefixed methods
      } else if (boardRef.current.webkitRequestFullscreen) {
        // @ts-ignore - vendor prefixed methods
        boardRef.current.webkitRequestFullscreen();
      // @ts-ignore - vendor prefixed methods
      } else if (boardRef.current.mozRequestFullScreen) {
        // @ts-ignore - vendor prefixed methods
        boardRef.current.mozRequestFullScreen();
      // @ts-ignore - vendor prefixed methods
      } else if (boardRef.current.msRequestFullscreen) {
        // @ts-ignore - vendor prefixed methods
        boardRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      // @ts-ignore - vendor prefixed methods
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore - vendor prefixed methods
        document.webkitExitFullscreen();
      // @ts-ignore - vendor prefixed methods
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore - vendor prefixed methods
        document.mozCancelFullScreen();
      // @ts-ignore - vendor prefixed methods
      } else if (document.msExitFullscreen) {
        // @ts-ignore - vendor prefixed methods
        document.msExitFullscreen();
      }
    }
  };

  // Toggle presentation mode
  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
  };

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(sharingLink).then(() => {
      toast({
        title: "Link Copied",
        description: "The link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy the link to your clipboard.",
        variant: "destructive",
      });
    });
  };

  // Dynamic classes for presentation mode
  const presentationModeClasses = isPresentationMode
    ? 'fixed inset-0 z-50 bg-background overflow-auto'
    : '';

  return (
    <div 
      ref={boardRef} 
      className={`vision-board relative ${presentationModeClasses}`}
    >
      {/* Controls toolbar */}
      <div className={`
        flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b
        ${isPresentationMode ? 'px-4 pt-4' : ''}
      `}>
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => setViewMode('grid')}
                  disabled={viewMode === 'grid' || isPresentationMode}
                >
                  <GridIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => setViewMode('list')}
                  disabled={viewMode === 'list' || isPresentationMode}
                >
                  <ColumnsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-8 gap-1 ${isPresentationMode ? 'bg-primary/10' : ''}`}
                  onClick={togglePresentationMode}
                >
                  <PresentationIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isPresentationMode ? 'Exit Presentation' : 'Present'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPresentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={toggleFullscreen}
                >
                  <Maximize2Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Vision Board</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {isPresentationMode && (
          <div className="flex items-center">
            <div className="text-sm font-medium mr-2">Presentation Mode</div>
            <Badge variant="outline">Student: {student.name}</Badge>
          </div>
        )}
        
        {/* Collaborators (sample) */}
        {!isPresentationMode && (
          <div className="flex -space-x-2 overflow-hidden items-center">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback>{getInitials("Sarah Johnson")}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" className="h-8 px-2 ml-1">
              <UsersIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Collaborators</span>
            </Button>
          </div>
        )}
      </div>
      
      {updateDomainPlanMutation.isPending && (
        <Alert className="mb-4">
          <AlertDescription className="flex items-center">
            <div className="animate-spin mr-2">⏳</div>
            Saving changes...
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dialog for adding/editing visions */}
      <Dialog open={isAddingVision || isEditingVision} onOpenChange={(open) => {
        if (!open) closeVisionDialog();
      }}>
        <DialogContent 
          className="max-w-md max-h-[90vh] overflow-y-auto"
          fullscreen={isFullscreen}
        >
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
        <DialogContent 
          className="max-w-sm"
          fullscreen={isFullscreen}
        >
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
        <DialogContent 
          className="max-w-md max-h-[90vh] overflow-y-auto"
          fullscreen={isFullscreen}
        >
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
                    <span>View-only access</span>
                  </div>
                  <Switch id="view-only" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Allow comments</span>
                  </div>
                  <Switch id="allow-comments" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsShareDialogOpen(false);
              toast({
                title: "Sharing Settings Saved",
                description: "Your sharing settings have been updated.",
              });
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Vision board grid */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`
          ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}
          ${presentationModeClasses ? 'p-4' : ''}
        `}>
          {domainPlans.map((plan) => {
            const domainInfo = DOMAINS.find(d => d.id === plan.domain);
            const hasVision = !!plan.vision;
            const isParsedVision = hasVision && plan.vision.startsWith('{');
            
            // Parse vision data if available
            const visionData = hasVision ? parseVision(plan.vision) : { text: '', age: 30, media: '' };
            
            return (
              <Card key={plan.domain} className={`
                overflow-hidden 
                ${viewMode === 'grid' ? 'h-full flex flex-col' : ''}
                ${isPresentationMode ? 'shadow-lg' : ''}
                ${domainInfo?.borderClass ? domainInfo.borderClass : ''}
              `}>
                <CardHeader className={`
                  border-b 
                  ${viewMode === 'grid' ? 'pb-3' : 'pb-3'} 
                  ${isPresentationMode ? 'bg-opacity-50' : ''}
                  ${domainInfo?.lightBgClass ? domainInfo.lightBgClass : 'bg-gray-50'}
                `}>
                  <div className="flex justify-between items-start">
                    <Badge 
                      variant={viewMode === 'list' && isPresentationMode ? "outline" : "secondary"}
                      className={`
                        ${viewMode === 'list' && isPresentationMode ? 'text-xs px-2 py-0 h-5' : ''}
                        ${domainInfo?.badgeClass || ''}
                      `}
                    >
                      {domainInfo?.name || plan.domain}
                    </Badge>
                    
                    {!isPresentationMode && (
                      <div className="flex space-x-1">
                        {hasVision ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => openEditVisionDialog(
                                plan.domain, 
                                visionData.text,
                                visionData.media,
                                visionData.age
                              )}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => confirmRemoveVision(plan.domain)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => openAddVisionDialog(plan.domain)}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add Vision
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {hasVision && (
                    <div className={`
                      mt-2 pt-2 ${visionData.media ? 'pb-0' : 'pb-1'}
                      ${isPresentationMode ? 'bg-white/80 rounded p-3 shadow-sm' : ''}
                    `}>
                      <CardTitle className={`
                        ${viewMode === 'list' ? 'text-base' : 'text-sm'}
                        ${isPresentationMode ? 'text-lg font-bold mb-2' : ''}
                      `}>
                        <span className="text-sm font-normal text-gray-500 block">
                          {`When I am ${visionData.age} years old, I will be...`}
                        </span>
                        <div className="mt-1">
                          {visionData.text}
                        </div>
                      </CardTitle>
                      
                      {visionData.media && (
                        <div className={`
                          mt-2 overflow-hidden rounded border 
                          ${viewMode === 'grid' ? 'max-h-[180px]' : 'max-h-[150px]'}
                          ${isPresentationMode ? 'max-h-[250px] border-0 shadow-sm' : ''}
                        `}>
                          {visionData.media.includes('youtube.com') || visionData.media.includes('youtu.be') ? (
                            <iframe 
                              src={visionData.media}
                              title="Vision video"
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <img 
                              src={visionData.media} 
                              alt="Vision illustration" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/600x400/ebf5ff/6b7280/?text=Invalid+Image+URL";
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className={`
                  ${viewMode === 'grid' ? 'flex-1' : ''}
                  ${viewMode === 'list' ? 'pt-3' : 'pt-3'}
                  ${isPresentationMode && !hasVision ? 'pt-0' : ''}
                `}>
                  {!hasVision && isPresentationMode && (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg my-2">
                      <LightbulbIcon className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-center text-gray-500">
                        No vision has been defined for this domain yet.
                      </p>
                    </div>
                  )}
                  
                  {!hasVision && !isPresentationMode && (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                      <Button 
                        variant="outline"
                        onClick={() => openAddVisionDialog(plan.domain)}
                        className="mb-2"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Vision Statement
                      </Button>
                      <p className="text-center text-sm text-gray-500">
                        Define what success looks like for this domain
                      </p>
                    </div>
                  )}
                  
                  {(viewMode === 'grid' || isPresentationMode) && (
                    <h3 className={`
                      font-semibold 
                      ${hasVision ? 'mt-2 mb-3' : 'my-3'} 
                      ${isPresentationMode ? 'text-lg' : 'text-sm'}
                    `}>
                      Goals
                    </h3>
                  )}
                  
                  <Droppable droppableId={`goals-${plan.domain}`}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 ${goalsByDomain[plan.domain]?.length ? 'pb-1' : ''}`}
                      >
                        {goalsByDomain[plan.domain]?.map((goal, index) => {
                          // Ensure the goal has an ID before trying to use it as a draggableId
                          if (!goal.id) {
                            console.error('Goal is missing ID:', goal);
                            return null;
                          }
                          
                          return (
                            <Draggable
                              key={goal.id}
                              draggableId={String(goal.id)} // Ensure draggableId is a string
                              index={index}
                              isDragDisabled={isPresentationMode}
                            >
                              {(providedDrag, snapshotDrag) => (
                                <GoalItem 
                                  goal={goal} 
                                  domainColor={DOMAINS.find(d => d.id === plan.domain)?.textClass || "text-gray-700"}
                                  provided={providedDrag}
                                  snapshot={snapshotDrag}
                                  onEdit={() => openEditGoalDialog(goal)}
                                  isPresentationMode={isPresentationMode}
                                  allGoals={Object.values(goalsByDomain).flat()}
                                />
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        
                        {!isPresentationMode && (
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start mt-1 text-muted-foreground"
                            onClick={() => openAddGoalDialog(plan.domain)}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Goal
                          </Button>
                        )}
                        
                        {(!goalsByDomain[plan.domain]?.length && isPresentationMode) && (
                          <div className="text-center p-4 text-gray-500 italic text-sm">
                            No goals have been added to this domain yet.
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
      
      {/* Dialog for adding/editing goals */}
      <Dialog open={isAddingGoal || isEditingGoal} onOpenChange={(open) => {
        if (!open) closeGoalDialog();
      }}>
        <DialogContent 
          className="max-w-md max-h-[90vh] overflow-y-auto"
          fullscreen={isFullscreen}
        >
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
              allGoals={Object.values(goalsByDomain).flat()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}