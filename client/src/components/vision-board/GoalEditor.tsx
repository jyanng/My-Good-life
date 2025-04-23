import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GOAL_CATEGORIES, GOAL_PRIORITIES, GOAL_TEMPLATES } from "@/lib/constants";

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
  dueDate?: string | Date;
  priority?: 'low' | 'medium' | 'high';
  dependencies?: GoalDependency[];
  collaborators?: string[];
  templateId?: number;
  estimatedDuration?: string;
};

interface GoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: GoalType) => void;
  goal?: GoalType; // If provided, we're editing an existing goal
  domainId: string;
  allGoals?: GoalType[];
}

export default function GoalEditor({
  isOpen,
  onClose,
  onSave,
  goal,
  domainId,
  allGoals = []
}: GoalEditorProps) {
  const isEditMode = !!goal;
  const defaultGoal: GoalType = {
    id: goal?.id || `goal-${Date.now()}`,
    description: '',
    status: 'not_started',
    domainId,
    dependencies: [],
    collaborators: [],
  };

  const [formData, setFormData] = useState<GoalType>(isEditMode ? { ...goal } : defaultGoal);
  const [isUsingTemplate, setIsUsingTemplate] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.dueDate ? new Date(formData.dueDate) : undefined
  );
  
  // Filter templates by domain
  const domainTemplates = GOAL_TEMPLATES.filter(template => template.domain === domainId);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const id = parseInt(templateId);
    const template = GOAL_TEMPLATES.find(t => t.id === id);
    
    if (template) {
      setFormData({
        ...formData,
        description: template.description,
        category: template.category,
        templateId: template.id,
        estimatedDuration: template.estimatedDuration
      });
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle date selection
  useEffect(() => {
    if (selectedDate) {
      setFormData({
        ...formData,
        dueDate: selectedDate
      });
    }
  }, [selectedDate]);
  
  // Handle save
  const handleSave = () => {
    onSave({
      ...formData,
      dueDate: selectedDate ? selectedDate.toISOString() : undefined
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEditMode && (
            <div className="flex items-center mb-4">
              <Label htmlFor="use-template" className="flex-1">
                Use a template?
              </Label>
              <input
                id="use-template"
                type="checkbox"
                className="ml-2"
                checked={isUsingTemplate}
                onChange={(e) => setIsUsingTemplate(e.target.checked)}
              />
            </div>
          )}
          
          {!isEditMode && isUsingTemplate && (
            <div className="space-y-2">
              <Label htmlFor="template">Select Template</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {domainTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Goal Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the goal description"
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GOAL_PRIORITIES.HIGH}>High</SelectItem>
                <SelectItem value={GOAL_PRIORITIES.MEDIUM}>Medium</SelectItem>
                <SelectItem value={GOAL_PRIORITIES.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Estimated Duration</Label>
            <Input
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration || ''}
              onChange={handleChange}
              placeholder="e.g. 2 weeks, 3 months, ongoing"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.description.trim()}>
            Save Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}