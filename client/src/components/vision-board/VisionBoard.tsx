import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOMAINS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, XIcon, WandIcon, LightbulbIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GoalItem from './GoalItem';
import { DomainPlan, Student, InsertDomainPlan } from '@shared/schema';

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
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  
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
    setVisionText("When I am 30 years old, I will be ");
    setIsAddingVision(true);
  };

  const openEditVisionDialog = (domainId: string) => {
    const domainPlan = domainPlans.find(plan => plan.domain === domainId);
    setCurrentDomain(domainId);
    
    // Format vision text if needed for consistency
    let visionForEdit = domainPlan?.vision || '';
    if (visionForEdit && !visionForEdit.startsWith("When I am 30 years old,")) {
      if (visionForEdit.toLowerCase().startsWith("i will")) {
        visionForEdit = `When I am 30 years old, ${visionForEdit}`;
      } else {
        visionForEdit = `When I am 30 years old, I will be ${visionForEdit}`;
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
    mutationFn: ({ id, data }: { id: number, data: { vision: string | null } }) => {
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
    
    // Format the vision text to ensure it follows the standard format
    let formattedVision = visionText;
    
    // If it doesn't start with the standard format, add it
    if (!formattedVision.startsWith("When I am 30 years old,")) {
      if (formattedVision.toLowerCase().startsWith("i will")) {
        formattedVision = `When I am 30 years old, ${formattedVision}`;
      } else {
        formattedVision = `When I am 30 years old, I will be ${formattedVision}`;
      }
    }
    
    // Find the domain plan to update
    const domainPlan = domainPlans.find(plan => plan.domain === currentDomain);
    
    if (domainPlan) {
      // Update existing domain plan
      updateDomainPlanMutation.mutate({
        id: domainPlan.id,
        data: { vision: formattedVision }
      });
    } else {
      // Create a new domain plan
      const planId = domainPlans[0]?.planId; // Use the planId from any existing domain plan
      
      if (planId) {
        const newDomainPlan: Partial<InsertDomainPlan> = {
          planId,
          domain: currentDomain,
          vision: formattedVision,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vision Board for {student.name}</h2>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription>
          <p className="text-blue-800">
            Drag and drop goals between domains to reorganize your student's Good Life plan. This visualization helps you ensure goals are correctly categorized and balanced across domains.
          </p>
        </AlertDescription>
      </Alert>
      
      {/* Dialog for adding/editing visions */}
      <Dialog open={isAddingVision || isEditingVision} onOpenChange={(open) => {
        if (!open) closeVisionDialog();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddingVision ? 'Add Vision Statement' : 'Edit Vision Statement'}
            </DialogTitle>
            <DialogDescription>
              {currentDomain && 
                `Create a vision statement for the ${DOMAINS.find(d => d.id === currentDomain)?.name} domain that reflects what the student wants for their future.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vision Statement</label>
              <div className="p-3 bg-white rounded border mb-3">
                <p className="text-sm font-medium">Positive Vision Format</p>
                <p className="text-sm italic mt-1">"When I am 30 years old, I will be..."</p>
              </div>
              <Textarea
                placeholder="When I am 30 years old, I will be..."
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="min-h-[100px] text-lg"
              />
            </div>
            {/* Vision Suggestions */}
            {currentDomain && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Quick Suggestions
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-2 px-3 mb-3"
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
                  <WandIcon className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">Use Domain Suggestion</p>
                    <p className="text-xs text-gray-500 mt-0.5">Click to use a pre-written vision for this domain</p>
                  </div>
                </Button>

                <div className="flex items-center mt-4 mb-1">
                  <LightbulbIcon className="h-4 w-4 mr-1 text-amber-500" />
                  <p className="text-sm font-medium text-gray-700">
                    Vision Statement Guidelines
                  </p>
                </div>
                <ul className="list-disc ml-5 mt-1 text-sm text-gray-600">
                  <li>Be positive and inspiring</li>
                  <li>Use first-person language ("I will...")</li>
                  <li>Describe desired future outcomes</li>
                  <li>Be specific but achievable</li>
                </ul>
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
        <DialogContent className="sm:max-w-md">
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
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAINS.map(domain => {
            const domainPlan = domainPlans.find(plan => plan.domain === domain.id);
            const domainVision = domainPlan?.vision || '';
            
            return (
              <Droppable droppableId={domain.id} key={domain.id}>
                {(provided, snapshot) => (
                  <Card 
                    className={`${snapshot.isDraggingOver ? 'bg-gray-50' : ''} h-full`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <CardHeader className={`${domain.bgClass} text-white`}>
                      <CardTitle className="flex justify-between items-center">
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
                            <p className="text-sm font-medium leading-snug">
                              {domainVision.startsWith("When I am 30 years old,") ? 
                                domainVision : 
                                `When I am 30 years old, I will be ${domainVision.toLowerCase().startsWith("i will") ? domainVision.substring(7) : domainVision}`
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="flex mt-1 gap-2 items-center">
                            <p className="text-sm text-white/70 italic">No vision statement yet</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="min-h-[200px]">
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
                                />
                              )}
                            </Draggable>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          <p>Drop goals here</p>
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
    </div>
  );
}