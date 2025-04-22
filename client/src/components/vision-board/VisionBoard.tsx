import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOMAINS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import GoalItem from './GoalItem';
import { DomainPlan, Student } from '@shared/schema';

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
  // Convert the domain plans into a format suitable for the vision board
  const initialGoals = domainPlans.flatMap(plan => {
    const goals = Array.isArray(plan.goals) ? plan.goals : [];
    return goals.map((goal: any) => ({
      id: goal.id || `${plan.id}-${Math.random().toString(36).substring(2, 9)}`,
      description: goal.description,
      status: goal.status || 'not_started',
      needsReframing: goal.needsReframing || false,
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
    
    // Get source and destination domains
    const sourceDomain = source.droppableId;
    const destDomain = destination.droppableId;
    
    // Create a copy of the current state
    const newGoalsByDomain = { ...goalsByDomain };
    
    // Remove from source domain
    const [movedGoal] = newGoalsByDomain[sourceDomain].splice(source.index, 1);
    
    // Update the moved goal's domain
    movedGoal.domainId = destDomain;
    
    // Add to destination domain
    newGoalsByDomain[destDomain].splice(destination.index, 0, movedGoal);
    
    // Update state
    setGoalsByDomain(newGoalsByDomain);
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
                      {domainVision && (
                        <p className="text-sm italic mt-1">"{domainVision}"</p>
                      )}
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