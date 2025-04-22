import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
  SaveIcon
} from "lucide-react";
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
  
  // State for form inputs
  const [currentInput, setCurrentInput] = useState<string>("");
  const [currentGoalInput, setCurrentGoalInput] = useState<string>("");
  
  // Separate state variables for each identity category text area
  const [importantToMeInput, setImportantToMeInput] = useState<string>("");
  const [bestSupportInput, setBestSupportInput] = useState<string>("");
  const [importantToFamilyInput, setImportantToFamilyInput] = useState<string>("");
  const [bestSupportFamilyInput, setBestSupportFamilyInput] = useState<string>("");
  
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
        description: "GoodLife Plan has been created successfully.",
      });
      setNewPlanCreated(true);
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create GoodLife Plan.",
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
    if (!currentInput.trim()) return;
    setStrengths(prev => ({
      ...prev,
      [category]: [...prev[category], currentInput.trim()]
    }));
    setCurrentInput("");
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
        description: "This student already has a GoodLife Plan.",
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
    if (currentStep === 3 && !plan && !newPlanCreated) {
      handleCreatePlan();
    }
    
    // Move to next step
    setCurrentStep(prev => Math.min(prev + 1, 3));
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
      description: "The GoodLife Plan has been saved successfully.",
    });
  };
  
  // Define steps
  const steps = [
    { title: "Strengths", description: "What I like and dislike, what I can and cannot do, what people like about me" },
    { title: "Identity", description: "What is important to me, how best to support me, what is important to my family" },
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
            <h1 className="text-2xl font-bold text-gray-900">{student.name}'s GoodLife Plan</h1>
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
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
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
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
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
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
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
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
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
          
          {/* Step 3: Confidence Sliders */}
          {currentStep === 2 && (
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
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <div className={`w-4 h-4 rounded-full ${domain.bgClass} mr-2`}></div>
                            {domain.name} Domain Vision
                          </CardTitle>
                          <CardDescription>Create a vision statement for the {domain.name} domain</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Label htmlFor={`vision-${domain.id}`}>Vision Statement</Label>
                            <Textarea 
                              id={`vision-${domain.id}`}
                              placeholder={`Example: I will feel ${domain.name.toLowerCase()} in my community and learning environments`}
                              value={domainVisions[domain.id]?.vision || ''}
                              onChange={(e) => handleVisionChange(domain.id, e.target.value)}
                            />
                            
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`goals-${domain.id}`}>Goals</Label>
                                <span className="text-sm text-gray-500">
                                  {domainVisions[domain.id]?.goals?.length || 0} goals
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Input 
                                  id={`goals-${domain.id}`}
                                  placeholder="Add a goal for this domain..."
                                  value={currentGoalInput}
                                  onChange={(e) => setCurrentGoalInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal(domain.id)}
                                />
                                <Button type="button" onClick={() => handleAddGoal(domain.id)}>
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {domainVisions[domain.id]?.goals?.map((goal, index) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-3 rounded ${
                                      goal.status === 'completed' 
                                        ? 'bg-green-50 border border-green-200' 
                                        : goal.status === 'in_progress' 
                                          ? 'bg-amber-50 border border-amber-200' 
                                          : 'bg-gray-50 border border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 rounded-full" 
                                        onClick={() => handleToggleGoalStatus(domain.id, index)}
                                      >
                                        {goal.status === 'completed' ? (
                                          <CheckIcon className="h-4 w-4 text-green-600" />
                                        ) : goal.status === 'in_progress' ? (
                                          <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                        )}
                                      </Button>
                                      <span className={goal.status === 'completed' ? 'line-through text-green-800' : ''}>
                                        {goal.description}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Badge variant="outline" className="mr-2">
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
                                      >
                                        <TrashIcon className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button onClick={() => handleSaveDomainVision(domain.id)}>
                            <SaveIcon className="mr-2 h-4 w-4" />
                            Save {domain.name} Domain
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
