import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckIcon,
  SaveIcon,
  ShieldCheckIcon,
  HeartPulseIcon,
  ActivityIcon,
  UsersIcon,
  LaptopIcon,
  MegaphoneIcon,
  SparklesIcon,
  WandIcon,
  LightbulbIcon,
  TargetIcon,
  UserIcon,
  BuildingIcon,
  Trash2Icon,
  PencilIcon,
  MoveIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DOMAINS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { 
  Student, 
  Profile, 
  DomainConfidence, 
  GoodLifePlan, 
  DomainPlan,
  InsertDomainPlan
} from "@shared/schema";

interface PlanBuilderProps {
  studentId: number;
}

type StrengthsData = {
  likes: string[];
  dislikes: string[];
  strengths: string[];
  peopleAppreciate: string[];
};

type IdentityData = {
  importantToMe: string[];
  bestSupport: string[];
  importantToFamily: string[];
  bestSupportFamily: string[];
  personalityTags: string[];
};

type DomainVisionData = {
  [key: string]: {
    vision: string;
    goals: { description: string; status: string }[];
  }
};

// Helper functions for domain-specific content
function getDomainPrompt(domainId: string) {
  const prompts = {
    safe: {
      title: "Security & Stability Focus",
      alternative: "Safety Strategies Approach"
    },
    healthy: {
      title: "Wellbeing & Balance Focus",
      alternative: "Health Maintenance Approach"
    },
    engaged: {
      title: "Participation & Activity Focus",
      alternative: "Interest & Involvement Approach"
    },
    connected: {
      title: "Relationships & Community Focus",
      alternative: "Social Connections Approach"
    },
    independent: {
      title: "Autonomy & Skills Focus",
      alternative: "Self-Sufficiency Approach"
    },
    included: {
      title: "Voice & Recognition Focus",
      alternative: "Community Participation Approach"
    }
  };
  
  return prompts[domainId as keyof typeof prompts] || { title: "General Focus", alternative: "Alternative Approach" };
}

function getDomainExample(domainId: string): string {
  const examples = {
    safe: "When I am 30 years old, I will be living in an environment where I feel secure and can manage situations that previously made me anxious. I will have people I trust to support me when needed.",
    healthy: "When I am 30 years old, I will be enjoying regular physical activities that suit my abilities and preferences. I will have established routines that support my physical and mental wellbeing.",
    engaged: "When I am 30 years old, I will be regularly participating in activities that match my interests and skills. I will be finding meaning and purpose through work or volunteering in my community.",
    connected: "When I am 30 years old, I will be maintaining meaningful relationships with friends and family. I will have a circle of people who understand my communication style and support my growth.",
    independent: "When I am 30 years old, I will be making informed choices about my daily life and future. I will have developed skills to live as independently as possible with the right balance of support.",
    included: "When I am 30 years old, I will be actively participating in my community and having my voice heard in decisions that affect my life. I will be valued for my unique contributions."
  };
  
  return examples[domainId as keyof typeof examples] || "When I am 30 years old, I will be living my good life with the right supports and opportunities to thrive.";
}

export default function PlanBuilder({ studentId }: PlanBuilderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [newPlanCreated, setNewPlanCreated] = useState(false);
  
  // State for form data
  const [strengths, setStrengths] = useState<StrengthsData>({
    likes: [],
    dislikes: [],
    strengths: [],
    peopleAppreciate: []
  });
  
  const [identity, setIdentity] = useState<IdentityData>({
    importantToMe: [],
    bestSupport: [],
    importantToFamily: [],
    bestSupportFamily: [],
    personalityTags: []
  });
  
  const [domainVisions, setDomainVisions] = useState<DomainVisionData>({});
  const [domainConfidenceValues, setDomainConfidenceValues] = useState<Record<string, number>>({});
  
  // Circle of Support state
  const [supportPeople, setSupportPeople] = useState<{
    id: string;
    name: string;
    role: string;
    institution?: string;
    relationship: string;
    tier: 1 | 2 | 3; // 1 = home, 2 = immediate neighborhood, 3 = larger community
    customPosition?: { x: number; y: number }; // For drag-and-drop positioning
  }[]>([
    { id: "1", name: "Mom", role: "Parent", relationship: "Family", tier: 1 },
    { id: "2", name: "Dad", role: "Parent", relationship: "Family", tier: 1 },
    { id: "3", name: "Ms. Lee", role: "Teacher", institution: "RC Yishun Park", relationship: "Professional", tier: 2 },
  ]);
  
  // Support person dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    role: "",
    institution: "",
    relationship: "Family" as "Family" | "Friend" | "Professional" | "Community",
    tier: 1 as 1 | 2 | 3,
  });
  const [personToEdit, setPersonToEdit] = useState<(typeof supportPeople)[0] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hasPositionChanges, setHasPositionChanges] = useState(false);
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  // State for form inputs
  const [currentGoalInput, setCurrentGoalInput] = useState<string>("");
  
  // Separate state variables for each identity category text area
  const [importantToMeInput, setImportantToMeInput] = useState<string>("");
  const [bestSupportInput, setBestSupportInput] = useState<string>("");
  const [importantToFamilyInput, setImportantToFamilyInput] = useState<string>("");
  const [bestSupportFamilyInput, setBestSupportFamilyInput] = useState<string>("");
  
  // Separate state variables for each strength category input
  const [likesInput, setLikesInput] = useState<string>("");
  const [dislikesInput, setDislikesInput] = useState<string>("");
  const [strengthsInput, setStrengthsInput] = useState<string>("");
  const [peopleAppreciateInput, setPeopleAppreciateInput] = useState<string>("");
  
  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${studentId}`],
  });
  
  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: [`/api/profiles/${studentId}`],
    enabled: !!student,
    onSuccess: (data) => {
      if (data) {
        setStrengths({
          likes: data.likes || [],
          dislikes: data.dislikes || [],
          strengths: data.strengths || [],
          peopleAppreciate: data.peopleAppreciate || []
        });
        
        setIdentity({
          importantToMe: data.importantToMe || [],
          bestSupport: data.bestSupport || [],
          importantToFamily: data.importantToFamily || [],
          bestSupportFamily: data.bestSupportFamily || [],
          personalityTags: data.personalityTags || []
        });
      }
    }
  });
  
  // Fetch domain confidence
  const { data: domainConfidence, isLoading: isLoadingConfidence } = useQuery<DomainConfidence>({
    queryKey: [`/api/domain-confidence/${studentId}`],
    enabled: !!student,
    onSuccess: (data) => {
      if (data) {
        setDomainConfidenceValues({
          safe: data.safeScore || 0,
          healthy: data.healthyScore || 0,
          engaged: data.engagedScore || 0,
          connected: data.connectedScore || 0,
          independent: data.independentScore || 0,
          included: data.includedScore || 0
        });
      }
    }
  });
  
  // Fetch plan data
  const { data: plan, isLoading: isLoadingPlan } = useQuery<GoodLifePlan>({
    queryKey: [`/api/students/${studentId}/plan`],
    enabled: !!student,
  });
  
  // Fetch domain plans if plan exists
  const { 
    data: domainPlans, 
    isLoading: isLoadingDomainPlans,
    refetch: refetchDomainPlans
  } = useQuery<DomainPlan[]>({
    queryKey: [`/api/plans/${plan?.id}/domains`],
    enabled: !!plan,
    onSuccess: (data) => {
      if (data) {
        const visions: DomainVisionData = {};
        data.forEach(domainPlan => {
          visions[domainPlan.domain] = {
            vision: domainPlan.vision || '',
            goals: domainPlan.goals as { description: string; status: string }[] || []
          };
        });
        setDomainVisions(visions);
      }
    }
  });
  
  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plans', {
        studentId,
        status: 'in_progress',
        progress: 0
      });
      return response.json();
    },
    onSuccess: (data: GoodLifePlan) => {
      toast({
        title: "Plan Created",
        description: "MyGoodLife Plan has been created successfully.",
      });
      setNewPlanCreated(true);
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create MyGoodLife Plan.",
        variant: "destructive"
      });
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        const response = await apiRequest('POST', '/api/profiles', {
          studentId,
          ...strengths,
          ...identity
        });
        return response.json();
      } else {
        const response = await apiRequest('PATCH', `/api/profiles/${studentId}`, {
          ...strengths,
          ...identity
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Student profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update student profile.",
        variant: "destructive"
      });
    }
  });
  
  // Update domain confidence mutation
  const updateDomainConfidenceMutation = useMutation({
    mutationFn: async () => {
      if (!domainConfidence) {
        const response = await apiRequest('POST', '/api/domain-confidence', {
          studentId,
          safeScore: domainConfidenceValues.safe || 0,
          healthyScore: domainConfidenceValues.healthy || 0,
          engagedScore: domainConfidenceValues.engaged || 0,
          connectedScore: domainConfidenceValues.connected || 0,
          independentScore: domainConfidenceValues.independent || 0,
          includedScore: domainConfidenceValues.included || 0
        });
        return response.json();
      } else {
        const response = await apiRequest('PATCH', `/api/domain-confidence/${studentId}`, {
          safeScore: domainConfidenceValues.safe || 0,
          healthyScore: domainConfidenceValues.healthy || 0,
          engagedScore: domainConfidenceValues.engaged || 0,
          connectedScore: domainConfidenceValues.connected || 0,
          independentScore: domainConfidenceValues.independent || 0,
          includedScore: domainConfidenceValues.included || 0
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Confidence Updated",
        description: "Domain confidence levels have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update domain confidence levels.",
        variant: "destructive"
      });
    }
  });
  
  // Create domain plan mutation
  const createDomainPlanMutation = useMutation({
    mutationFn: async (domainPlan: InsertDomainPlan) => {
      const response = await apiRequest('POST', '/api/domain-plans', domainPlan);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain Plan Created",
        description: "Domain plan has been created successfully.",
      });
      refetchDomainPlans();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create domain plan.",
        variant: "destructive"
      });
    }
  });
  
  // Update domain plan mutation
  const updateDomainPlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertDomainPlan> }) => {
      const response = await apiRequest('PATCH', `/api/domain-plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain Plan Updated",
        description: "Domain plan has been updated successfully.",
      });
      refetchDomainPlans();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update domain plan.",
        variant: "destructive"
      });
    }
  });
  
  // Update plan progress mutation
  const updatePlanProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!plan) return null;
      const response = await apiRequest('PATCH', `/api/plans/${plan.id}`, {
        progress
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Plan progress has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update plan progress.",
        variant: "destructive"
      });
    }
  });
  
  // Handle save for each step
  const handleSaveStrengths = () => {
    updateProfileMutation.mutate();
  };
  
  const handleSaveIdentity = () => {
    updateProfileMutation.mutate();
  };
  
  const handleSaveConfidence = () => {
    updateDomainConfidenceMutation.mutate();
  };
  
  // Circle of Support handlers
  const handleAddPerson = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setSupportPeople([...supportPeople, { id, ...newPerson }]);
    setNewPerson({
      name: "",
      role: "",
      institution: "",
      relationship: "Family" as "Family" | "Friend" | "Professional" | "Community",
      tier: 1 as 1 | 2 | 3,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPerson = (person: typeof supportPeople[0]) => {
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
  
  const handleSaveDomainVision = (domainId: string) => {
    if (!plan) {
      createPlanMutation.mutate();
      return;
    }
    
    const existingDomainPlan = domainPlans?.find(dp => dp.domain === domainId);
    const visionData = domainVisions[domainId];
    
    if (existingDomainPlan) {
      updateDomainPlanMutation.mutate({
        id: existingDomainPlan.id,
        data: {
          vision: visionData.vision,
          goals: visionData.goals
        }
      });
    } else {
      createDomainPlanMutation.mutate({
        planId: plan.id,
        domain: domainId,
        vision: visionData?.vision || '',
        goals: visionData?.goals || [],
        completed: false
      });
    }
    
    // Calculate overall progress
    if (domainPlans) {
      const totalDomains = 6; // Total number of domains
      const completedDomains = domainPlans.filter(dp => dp.completed).length;
      const progress = Math.round((completedDomains / totalDomains) * 100);
      updatePlanProgressMutation.mutate(progress);
    }
  };
  
  // Handlers for form inputs
  const handleAddItem = (category: keyof StrengthsData) => {
    let inputValue = "";
    
    // Get the correct input value based on category
    if (category === "likes") {
      inputValue = likesInput;
    } else if (category === "dislikes") {
      inputValue = dislikesInput;
    } else if (category === "strengths") {
      inputValue = strengthsInput;
    } else if (category === "peopleAppreciate") {
      inputValue = peopleAppreciateInput;
    }
    
    if (!inputValue.trim()) return;
    
    setStrengths(prev => ({
      ...prev,
      [category]: [...prev[category], inputValue.trim()]
    }));
    
    // Clear the corresponding input field
    if (category === "likes") {
      setLikesInput("");
    } else if (category === "dislikes") {
      setDislikesInput("");
    } else if (category === "strengths") {
      setStrengthsInput("");
    } else if (category === "peopleAppreciate") {
      setPeopleAppreciateInput("");
    }
  };
  
  const handleRemoveItem = (category: keyof StrengthsData, index: number) => {
    setStrengths(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };
  
  const handleAddIdentityItem = (category: keyof IdentityData) => {
    let inputValue = "";
    
    // Get the correct input value based on category
    if (category === "importantToMe") {
      inputValue = importantToMeInput;
    } else if (category === "bestSupport") {
      inputValue = bestSupportInput;
    } else if (category === "importantToFamily") {
      inputValue = importantToFamilyInput;
    } else if (category === "bestSupportFamily") {
      inputValue = bestSupportFamilyInput;
    }
    
    if (!inputValue.trim()) return;
    
    setIdentity(prev => ({
      ...prev,
      [category]: [...prev[category], inputValue.trim()]
    }));
    
    // Clear the corresponding input field
    if (category === "importantToMe") {
      setImportantToMeInput("");
    } else if (category === "bestSupport") {
      setBestSupportInput("");
    } else if (category === "importantToFamily") {
      setImportantToFamilyInput("");
    } else if (category === "bestSupportFamily") {
      setBestSupportFamilyInput("");
    }
  };
  
  const handleRemoveIdentityItem = (category: keyof IdentityData, index: number) => {
    setIdentity(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };
  
  const handleAddTag = (tag: string) => {
    if (!identity.personalityTags.includes(tag)) {
      setIdentity(prev => ({
        ...prev,
        personalityTags: [...prev.personalityTags, tag]
      }));
    } else {
      setIdentity(prev => ({
        ...prev,
        personalityTags: prev.personalityTags.filter(t => t !== tag)
      }));
    }
  };
  
  const handleConfidenceChange = (domain: string, value: number[]) => {
    setDomainConfidenceValues(prev => ({
      ...prev,
      [domain]: value[0]
    }));
  };
  
  const handleVisionChange = (domain: string, vision: string) => {
    setDomainVisions(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain] || {},
        vision
      }
    }));
  };
  
  const handleAddGoal = (domain: string) => {
    if (!currentGoalInput.trim()) return;
    
    setDomainVisions(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain] || { vision: '' },
        goals: [
          ...(prev[domain]?.goals || []),
          { description: currentGoalInput.trim(), status: 'not_started' }
        ]
      }
    }));
    
    setCurrentGoalInput("");
  };
  
  const handleRemoveGoal = (domain: string, index: number) => {
    setDomainVisions(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        goals: prev[domain]?.goals.filter((_, i) => i !== index) || []
      }
    }));
  };
  
  const handleToggleGoalStatus = (domain: string, index: number) => {
    setDomainVisions(prev => {
      const goals = [...(prev[domain]?.goals || [])];
      const goal = goals[index];
      
      if (goal) {
        if (goal.status === 'not_started') {
          goal.status = 'in_progress';
        } else if (goal.status === 'in_progress') {
          goal.status = 'completed';
        } else {
          goal.status = 'not_started';
        }
        
        return {
          ...prev,
          [domain]: {
            ...prev[domain],
            goals
          }
        };
      }
      
      return prev;
    });
  };
  
  const handleCreatePlan = () => {
    if (!plan) {
      createPlanMutation.mutate();
    } else {
      toast({
        title: "Plan Exists",
        description: "This student already has a MyGoodLife Plan.",
      });
    }
  };
  
  const handleNext = () => {
    // Save current step data
    if (currentStep === 0) {
      handleSaveStrengths();
    } else if (currentStep === 1) {
      handleSaveIdentity();
    } else if (currentStep === 2) {
      handleSaveConfidence();
    }
    
    // Check if we're at the last step and need to create a plan
    if (currentStep === 4 && !plan && !newPlanCreated) {
      handleCreatePlan();
    }
    
    // Move to next step
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleFinish = () => {
    // Save all data one last time
    handleSaveStrengths();
    handleSaveIdentity();
    handleSaveConfidence();
    
    // Navigate to the student profile
    navigate(`/student/${studentId}`);
    
    toast({
      title: "Plan Building Completed",
      description: "The MyGoodLife Plan has been saved successfully.",
    });
  };
  
  // Define steps
  const steps = [
    { title: "Strengths", description: "What I like and dislike, what I can and cannot do, what people like about me" },
    { title: "Identity", description: "What is important to me, how best to support me, what is important to my family" },
    { title: "Circle of Support", description: "Map out the important people who support you in your journey" },
    { title: "My Life Profile", description: "How do you feel you are doing with respect to each domain of your life right now?" },
    { title: "Domain Visions", description: "Create visions and goals for each life domain" }
  ];
  
  // Suggested tags for personality
  const suggestedTags = [
    "Creative", "Logical", "Detail-oriented", "Technology", "Art", "Music", 
    "Animals", "Computers", "Gaming", "Routine", "Structure", "Visual learner",
    "Thoughtful", "Quiet", "Energetic", "Focused", "Funny", "Kind", "Helpful",
    "Curious", "Athletic", "Nature", "Science", "Math", "Reading", "Writing"
  ];
  
  if (isLoadingStudent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist or you don't have permission to view their profile.</p>
          <Link href="/students">
            <Button>Go Back to Students</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}'s MyGoodLife Plan</h1>
            <p className="text-gray-600">Build a personalized transition plan based on the 6 life domains</p>
          </div>
          <Link href={`/student/${studentId}`}>
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <button 
              key={index}
              className={`flex flex-col items-center text-sm ${currentStep === index ? 'text-primary font-medium' : 'text-gray-500'}`}
              onClick={() => setCurrentStep(index)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                currentStep === index 
                  ? 'bg-primary text-white' 
                  : currentStep > index 
                    ? 'bg-primary bg-opacity-20 text-primary' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className="hidden md:block">{step.title}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
          <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
        </div>
        
        <div className="p-6">
          {/* Step 1: Strengths */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>What I like</CardTitle>
                  <CardDescription>List things that {student.name} enjoys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add something they like..."
                        value={likesInput}
                        onChange={(e) => setLikesInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem("likes")}
                      />
                      <Button type="button" onClick={() => handleAddItem("likes")}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {strengths.likes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItem("likes", index)}
                          >
                            <TrashIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What I dislike</CardTitle>
                  <CardDescription>List things that {student.name} does not enjoy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add something they dislike..."
                        value={dislikesInput}
                        onChange={(e) => setDislikesInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem("dislikes")}
                      />
                      <Button type="button" onClick={() => handleAddItem("dislikes")}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {strengths.dislikes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItem("dislikes", index)}
                          >
                            <TrashIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What I can do well</CardTitle>
                  <CardDescription>List {student.name}'s strengths and abilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add a strength..."
                        value={strengthsInput}
                        onChange={(e) => setStrengthsInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem("strengths")}
                      />
                      <Button type="button" onClick={() => handleAddItem("strengths")}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {strengths.strengths.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItem("strengths", index)}
                          >
                            <TrashIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What people like about me</CardTitle>
                  <CardDescription>List qualities that others appreciate about {student.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add an appreciated quality..."
                        value={peopleAppreciateInput}
                        onChange={(e) => setPeopleAppreciateInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem("peopleAppreciate")}
                      />
                      <Button type="button" onClick={() => handleAddItem("peopleAppreciate")}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {strengths.peopleAppreciate.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItem("peopleAppreciate", index)}
                          >
                            <TrashIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Step 2: Identity */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What is important to me</CardTitle>
                    <CardDescription>List things that are important to {student.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Add what's important..."
                        value={importantToMeInput}
                        onChange={(e) => setImportantToMeInput(e.target.value)}
                      />
                      <Button type="button" onClick={() => handleAddIdentityItem("importantToMe")}>
                        Add to List
                      </Button>
                      
                      <div className="space-y-2 mt-4">
                        {identity.importantToMe.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveIdentityItem("importantToMe", index)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>How best to support me</CardTitle>
                    <CardDescription>List ways to effectively support {student.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Add support strategies..."
                        value={bestSupportInput}
                        onChange={(e) => setBestSupportInput(e.target.value)}
                      />
                      <Button type="button" onClick={() => handleAddIdentityItem("bestSupport")}>
                        Add to List
                      </Button>
                      
                      <div className="space-y-2 mt-4">
                        {identity.bestSupport.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveIdentityItem("bestSupport", index)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>What is important to my family</CardTitle>
                    <CardDescription>List priorities for {student.name}'s family</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Add family priorities..."
                        value={importantToFamilyInput}
                        onChange={(e) => setImportantToFamilyInput(e.target.value)}
                      />
                      <Button type="button" onClick={() => handleAddIdentityItem("importantToFamily")}>
                        Add to List
                      </Button>
                      
                      <div className="space-y-2 mt-4">
                        {identity.importantToFamily.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveIdentityItem("importantToFamily", index)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>How best to support my family</CardTitle>
                    <CardDescription>List ways to support {student.name}'s family</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Add family support strategies..."
                        value={bestSupportFamilyInput}
                        onChange={(e) => setBestSupportFamilyInput(e.target.value)}
                      />
                      <Button type="button" onClick={() => handleAddIdentityItem("bestSupportFamily")}>
                        Add to List
                      </Button>
                      
                      <div className="space-y-2 mt-4">
                        {identity.bestSupportFamily.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveIdentityItem("bestSupportFamily", index)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Personality & Interests</CardTitle>
                  <CardDescription>Select tags that describe {student.name}'s personality and interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={identity.personalityTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {identity.personalityTags.map((tag) => (
                        <Badge key={tag} className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Step 3: Circle of Support */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
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

              {/* Circle of Support Visualization */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Visual Map of Your Support Network</CardTitle>
                      <CardDescription>
                        People closer to the center are more involved in your daily life
                      </CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
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
                              onChange={(e) => setNewPerson({ ...newPerson, relationship: e.target.value as "Family" | "Friend" | "Professional" | "Community" })}
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
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex justify-end gap-2 p-4 bg-gray-50 border-b">
                    {hasPositionChanges && (
                      <Button variant="outline" onClick={handleResetPositions}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                        Reset Positions
                      </Button>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <MoveIcon className="w-4 h-4 mr-2" />
                            Drag to Reposition
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click and drag any person to reposition them in your support network</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div 
                    ref={visualizationRef}
                    className="relative h-[600px] bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
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
                    {supportPeople.map((person) => {
                      // Get people in the same tier to calculate angle spacing
                      const peopleInSameTier = supportPeople.filter(p => p.tier === person.tier);
                      const indexInTier = peopleInSameTier.findIndex(p => p.id === person.id);
                      
                      // Calculate position based on tier and index within that tier, or use custom position if available
                      let x, y;
                      
                      if (person.customPosition) {
                        // Use custom position if available (from drag-and-drop)
                        x = person.customPosition.x;
                        y = person.customPosition.y;
                      } else {
                        // Calculate position based on tier and index within that tier
                        const radius = person.tier === 1 ? 100 : person.tier === 2 ? 175 : 250;
                        const angleStep = 360 / peopleInSameTier.length;
                        const offsetAngle = person.tier === 1 ? 0 : person.tier === 2 ? angleStep/2 : 0; // offset middle tier
                        const angle = ((indexInTier * angleStep) + offsetAngle) * (Math.PI / 180);
                        x = radius * Math.cos(angle);
                        y = radius * Math.sin(angle);
                      }
                      
                      const backgroundColor = 
                        person.relationship === "Family" ? "bg-pink-100" :
                        person.relationship === "Friend" ? "bg-blue-100" :
                        person.relationship === "Professional" ? "bg-emerald-100" : "bg-purple-100";
                      
                      const textColor =
                        person.relationship === "Family" ? "text-pink-800" :
                        person.relationship === "Friend" ? "text-blue-800" :
                        person.relationship === "Professional" ? "text-emerald-800" : "text-purple-800";

                      return (
                        <motion.div
                          key={person.id}
                          className={`absolute w-[100px] rounded-lg shadow-sm p-2 ${backgroundColor} flex flex-col items-center text-center cursor-move`}
                          style={{
                            x: x,
                            y: y,
                            transformOrigin: "center center",
                            zIndex: isDragging && dragId === person.id ? 20 : 5
                          }}
                          drag
                          dragMomentum={false}
                          onDragStart={() => handleDragStart(person.id)}
                          onDragEnd={handleDragEnd}
                          onDrag={(_, info) => {
                            if (!visualizationRef.current) return;
                            const rect = visualizationRef.current.getBoundingClientRect();
                            handleDrag(
                              person.id,
                              info.point.x - rect.left,
                              info.point.y - rect.top
                            );
                          }}
                        >
                          <div className="flex justify-between w-full mb-1">
                            <button 
                              onClick={() => handleEditPerson(person)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <PencilIcon className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleDeletePerson(person.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2Icon className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="font-medium text-sm truncate w-full">
                            {person.name}
                          </div>
                          <div className={`text-xs ${textColor} font-medium`}>
                            {person.role}
                          </div>
                          {person.institution && (
                            <div className="text-xs text-gray-500 truncate w-full">
                              {person.institution}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Edit Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Support Person</DialogTitle>
                    <DialogDescription>
                      Update the details of this person in your support network.
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
                          onChange={(e) => setPersonToEdit({ ...personToEdit, name: e.target.value })}
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
                          onChange={(e) => setPersonToEdit({ ...personToEdit, role: e.target.value })}
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
                          onChange={(e) => setPersonToEdit({ ...personToEdit, institution: e.target.value })}
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
                          onChange={(e) => setPersonToEdit({ ...personToEdit, relationship: e.target.value as "Family" | "Friend" | "Professional" | "Community" })}
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
                          onChange={(e) => setPersonToEdit({ ...personToEdit, tier: Number(e.target.value) as 1 | 2 | 3 })}
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
                    <Button onClick={handleUpdatePerson}>Update</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Step 4: Confidence Sliders */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {DOMAINS.map((domain) => (
                <div key={domain.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${domain.bgClass} mr-2`}></div>
                      <Label className="text-lg font-medium">{domain.name}</Label>
                    </div>
                    <span className="text-sm font-medium">
                      {domainConfidenceValues[domain.id] || 0}/10
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      defaultValue={[domainConfidenceValues[domain.id] || 0]}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleConfidenceChange(domain.id, value)}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Needs Work</span>
                      <span>Doing Great</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{domain.description}</p>
                </div>
              ))}
              
              <div className="pt-4">
                <Button onClick={handleSaveConfidence}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Life Profile
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Domain Visions & Goals */}
          {currentStep === 3 && (
            <div>
              {!plan && !newPlanCreated ? (
                <div className="text-center py-8">
                  <p className="text-lg font-medium mb-4">Create a Good Life Plan to start defining domain visions and goals</p>
                  <Button onClick={handleCreatePlan}>
                    Create Good Life Plan
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue={DOMAINS[0].id} className="space-y-4">
                  <TabsList className="w-full flex-wrap">
                    {DOMAINS.map((domain) => (
                      <TabsTrigger key={domain.id} value={domain.id} className="flex-1">
                        <div className={`w-3 h-3 rounded-full ${domain.bgClass} mr-2 inline-block`}></div>
                        {domain.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {DOMAINS.map((domain) => (
                    <TabsContent key={domain.id} value={domain.id} className="space-y-4 pt-4">
                      <Card>
                        <CardHeader className={`border-b ${domain.lightBgClass}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center">
                                <div className={`w-5 h-5 rounded-full ${domain.bgClass} mr-2 flex items-center justify-center text-white text-xs font-bold`}>
                                  {domain.name.charAt(0)}
                                </div>
                                <span className={`bg-gradient-to-r from-${domain.id === 'safe' ? 'red' : domain.id === 'healthy' ? 'emerald' : domain.id === 'engaged' ? 'amber' : domain.id === 'connected' ? 'blue' : domain.id === 'independent' ? 'purple' : 'pink'}-600 to-${domain.id === 'safe' ? 'red' : domain.id === 'healthy' ? 'emerald' : domain.id === 'engaged' ? 'amber' : domain.id === 'connected' ? 'blue' : domain.id === 'independent' ? 'purple' : 'pink'}-400 bg-clip-text text-transparent`}>
                                  {domain.name} Domain Vision
                                </span>
                              </CardTitle>
                              <CardDescription>Imagine your ideal future in the {domain.name} domain</CardDescription>
                            </div>
                            
                            <div className={`p-2 rounded-full ${domain.lightBgClass}`}>
                              {domain.id === 'safe' && <ShieldCheckIcon className="h-5 w-5 text-red-600" />}
                              {domain.id === 'healthy' && <HeartPulseIcon className="h-5 w-5 text-emerald-600" />}
                              {domain.id === 'engaged' && <ActivityIcon className="h-5 w-5 text-amber-600" />}
                              {domain.id === 'connected' && <UsersIcon className="h-5 w-5 text-blue-600" />}
                              {domain.id === 'independent' && <LaptopIcon className="h-5 w-5 text-purple-600" />}
                              {domain.id === 'included' && <MegaphoneIcon className="h-5 w-5 text-pink-600" />}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            {/* Vision Building Guide */}
                            <div className={`p-4 rounded-lg border ${domain.lightBgClass} mb-4`}>
                              <h3 className={`text-lg font-medium mb-2 ${domain.textClass}`}>Envisioning Guide</h3>
                              <p className="text-sm mb-3">When creating your vision, think about:</p>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>What does being {domain.name.toLowerCase()} look like for you at age 30?</li>
                                <li>What positive experiences would you like to have?</li>
                                <li>How would your life be improved in this domain?</li>
                                <li>What strengths can you build upon?</li>
                              </ul>
                              
                              <div className="mt-3 p-3 bg-white rounded border">
                                <p className="text-sm font-medium">Positive Vision Format</p>
                                <p className="text-sm italic mt-1">"When I am 30 years old, I will be..."</p>
                              </div>
                            </div>
                            
                            {/* Vision Builder */}
                            <div>
                              <Label htmlFor={`vision-${domain.id}`} className="text-lg font-medium">
                                My {domain.name} Vision
                              </Label>
                              
                              {/* Vision Statement Builder */}
                              <div className="mt-2 mb-4">
                                <Textarea 
                                  id={`vision-${domain.id}`}
                                  placeholder={`When I am 30 years old, I will be...`}
                                  value={domainVisions[domain.id]?.vision || ''}
                                  onChange={(e) => handleVisionChange(domain.id, e.target.value)}
                                  className="min-h-[100px] text-lg"
                                />
                              </div>
                              
                              {/* Vision Prompts */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <Button 
                                  variant="outline" 
                                  className="justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    if (domain.id === 'safe') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be confident navigating different environments and managing my feelings of security. I will have strategies to help me feel calm and safe when facing new situations.");
                                    } else if (domain.id === 'healthy') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be maintaining good physical and mental health through activities I enjoy. I will have a balanced lifestyle that includes regular exercise, nutritious meals, and time to relax.");
                                    } else if (domain.id === 'engaged') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be actively participating in meaningful activities that match my interests and abilities. I will be pursuing hobbies and work that I find fulfilling.");
                                    } else if (domain.id === 'connected') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be building and maintaining positive relationships with friends, family, and others in my community. I will have a support network of people who understand and appreciate me.");
                                    } else if (domain.id === 'independent') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be making my own choices and managing daily tasks with the right amount of support. I will have skills that help me live as independently as possible.");
                                    } else if (domain.id === 'included') {
                                      handleVisionChange(domain.id, "When I am 30 years old, I will be expressing my thoughts and needs effectively. I will be included in decisions that affect me and actively participating in my community.");
                                    }
                                  }}
                                >
                                  <SparklesIcon className={`h-5 w-5 mr-2 ${domain.textClass}`} />
                                  <div>
                                    <p className="font-medium">{getDomainPrompt(domain.id).title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Click to use this suggestion</p>
                                  </div>
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="justify-start text-left h-auto py-2 px-3"
                                  onClick={() => {
                                    const alternativePrompts = {
                                      safe: "When I am 30 years old, I will be confident in identifying and addressing potential safety concerns in my home and community. I will have supportive people I can trust and rely on.",
                                      healthy: "When I am 30 years old, I will be taking care of my health with regular checkups and activities that make me feel good. I will be managing stress in positive ways.",
                                      engaged: "When I am 30 years old, I will be contributing my skills and talents to activities I care about. I will be exploring new interests and continuing to learn.",
                                      connected: "When I am 30 years old, I will be maintaining meaningful connections with others through effective communication. I will be participating in social activities that I enjoy.",
                                      independent: "When I am 30 years old, I will be confidently handling transportation, finances, and daily living tasks. I will be advocating for the support I need when necessary.",
                                      included: "When I am 30 years old, I will be valued for my unique contributions to my community. I will be participating in decisions about my life and future goals."
                                    };
                                    handleVisionChange(domain.id, alternativePrompts[domain.id]);
                                  }}
                                >
                                  <WandIcon className={`h-5 w-5 mr-2 ${domain.textClass}`} />
                                  <div>
                                    <p className="font-medium">{getDomainPrompt(domain.id).alternative}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Click to use this suggestion</p>
                                  </div>
                                </Button>
                              </div>
                              
                              {/* Domain-Specific Vision Example */}
                              <div className="mb-6 p-4 bg-white rounded-lg border border-dashed">
                                <div className="flex items-start">
                                  <LightbulbIcon className={`h-5 w-5 mr-2 mt-0.5 ${domain.textClass}`} />
                                  <div>
                                    <p className="text-sm font-medium mb-1">Vision Example</p>
                                    <p className="text-sm italic">{getDomainExample(domain.id)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Goals Section - Enhanced with guidelines */}
                            <div className="space-y-6 mt-8 pt-6 border-t">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor={`goals-${domain.id}`} className="text-lg font-medium">Goals</Label>
                                  <p className="text-sm text-gray-600 mt-1">Specific steps to achieve your vision</p>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                  {domainVisions[domain.id]?.goals?.length || 0} goals
                                </Badge>
                              </div>
                              
                              {/* Goal Creation Tips */}
                              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p className="font-medium mb-2">Tips for creating effective goals:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Make goals specific and achievable</li>
                                  <li>Focus on positive actions</li>
                                  <li>Break down larger goals into smaller steps</li>
                                  <li>Who should I involve to help me succeed?</li>
                                  <li>What could get in the way of achieving this goal?</li>
                                  <li>When should I start working on this goal?</li>
                                </ul>
                              </div>
                              
                              {/* Goal Input with better UI */}
                              <div className="flex items-center gap-2">
                                <Input 
                                  id={`goals-${domain.id}`}
                                  placeholder="Add a specific goal for this domain..."
                                  value={currentGoalInput}
                                  onChange={(e) => setCurrentGoalInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal(domain.id)}
                                  className="flex-1"
                                />
                                <Button 
                                  type="button" 
                                  onClick={() => handleAddGoal(domain.id)}
                                  className={domain.bgClass}
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" /> Add Goal
                                </Button>
                              </div>
                              
                              {/* Goals List with enhanced UI */}
                              <div className="space-y-3">
                                {domainVisions[domain.id]?.goals?.length === 0 ? (
                                  <div className="text-center py-6 border border-dashed rounded-lg">
                                    <TargetIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No goals added yet</p>
                                    <p className="text-sm text-gray-400">Add specific steps to achieve your vision</p>
                                  </div>
                                ) : (
                                  domainVisions[domain.id]?.goals?.map((goal, index) => (
                                    <div 
                                      key={index} 
                                      className={`flex items-center justify-between p-4 rounded-lg ${
                                        goal.status === 'completed' 
                                          ? 'bg-green-50 border border-green-200' 
                                          : goal.status === 'in_progress' 
                                            ? 'bg-amber-50 border border-amber-200' 
                                            : 'bg-gray-50 border border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className={`h-7 w-7 p-0 rounded-full ${
                                            goal.status === 'completed' 
                                              ? 'bg-green-100'
                                              : goal.status === 'in_progress'
                                                ? 'bg-amber-100'
                                                : 'bg-gray-200'
                                          }`}
                                          onClick={() => handleToggleGoalStatus(domain.id, index)}
                                        >
                                          {goal.status === 'completed' ? (
                                            <CheckIcon className="h-4 w-4 text-green-600" />
                                          ) : goal.status === 'in_progress' ? (
                                            <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                                          ) : (
                                            <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                                          )}
                                        </Button>
                                        <span className={goal.status === 'completed' ? 'line-through text-green-800' : 'font-medium'}>
                                          {goal.description}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`
                                          ${goal.status === 'completed' 
                                            ? 'border-green-200 bg-green-50 text-green-800' 
                                            : goal.status === 'in_progress' 
                                              ? 'border-amber-200 bg-amber-50 text-amber-800' 
                                              : 'border-gray-200 bg-gray-50 text-gray-800'
                                          }`}
                                        >
                                          {goal.status === 'completed' 
                                            ? 'Completed' 
                                            : goal.status === 'in_progress' 
                                              ? 'In Progress' 
                                              : 'Not Started'
                                          }
                                        </Badge>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleRemoveGoal(domain.id, index)}
                                          className="text-gray-500 hover:text-red-500"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-end border-t p-4">
                          <Button 
                            onClick={() => handleSaveDomainVision(domain.id)}
                            className={domain.bgClass}
                          >
                            <SaveIcon className="mr-2 h-4 w-4" />
                            Save {domain.name} Domain Vision
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              <CheckIcon className="mr-2 h-4 w-4" />
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
