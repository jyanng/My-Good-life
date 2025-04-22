import React from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

type GoalType = {
  id: string;
  description: string;
  status: string;
  needsReframing?: boolean;
  domainId: string;
};

interface GoalItemProps {
  goal: GoalType;
  domainColor: string;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export default function GoalItem({ goal, domainColor, provided, snapshot }: GoalItemProps) {
  // Determine status badge color
  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Not Started
          </span>
        );
    }
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`p-3 rounded-md border ${
        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
      } bg-white ${goal.needsReframing ? 'border-l-4 border-l-amber-500' : ''}`}
      style={{
        ...provided.draggableProps.style,
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <p className={`text-sm ${domainColor}`}>{goal.description}</p>
          
          {goal.needsReframing && (
            <div className="shrink-0 ml-2">
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded-full">
                Needs Reframing
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {getStatusBadge()}
          
          <div className="ml-2 text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <line x1="5" y1="9" x2="19" y2="9" />
              <line x1="5" y1="15" x2="19" y2="15" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}