import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Student, GoodLifePlan, DomainPlan, DomainConfidence } from "@shared/schema";
import { DOMAINS } from "@/lib/constants";
import { StarIcon, BadgeCheckIcon, AwardIcon, TrendingUpIcon, ClockIcon, TargetIcon } from "lucide-react";

export default function PersonalProgress() {
  const [activeTab, setActiveTab] = useState("progress");
  const studentId = 1; // Wei Jie Tan's ID
  
  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${studentId}`],
  });
  
  // Fetch domain confidence
  const { data: domainConfidence, isLoading: isLoadingConfidence } = useQuery<DomainConfidence>({
    queryKey: [`/api/domain-confidence/${studentId}`],
    enabled: !!student,
  });
  
  // Fetch plan data
  const { data: plan, isLoading: isLoadingPlan } = useQuery<GoodLifePlan>({
    queryKey: [`/api/students/${studentId}/plan`],
    enabled: !!student,
  });
  
  // Fetch domain plans if plan exists
  const { data: domainPlans, isLoading: isLoadingDomainPlans } = useQuery<DomainPlan[]>({
    queryKey: [`/api/plans/${plan?.id}/domains`],
    enabled: !!plan,
  });
  
  const isLoading = isLoadingStudent || isLoadingConfidence || isLoadingPlan || isLoadingDomainPlans;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!student || !domainConfidence || !plan || !domainPlans) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Progress Data Not Available</CardTitle>
            <CardDescription>
              We couldn't retrieve your progress data. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!domainPlans.length) return 0;
    
    let totalGoals = 0;
    let completedGoals = 0;
    
    domainPlans.forEach(domain => {
      const goals = domain.goals ? (Array.isArray(domain.goals) ? domain.goals : []) : [];
      totalGoals += goals.length;
      completedGoals += goals.filter((goal: any) => goal.completed).length;
    });
    
    if (totalGoals === 0) return 0;
    return Math.round((completedGoals / totalGoals) * 100);
  };
  
  // Calculate domain-specific progress
  const calculateDomainProgress = (domainId: string) => {
    const domainPlan = domainPlans.find(dp => dp.domain === domainId);
    if (!domainPlan || !domainPlan.goals) return 0;
    
    const goals = Array.isArray(domainPlan.goals) ? domainPlan.goals : [];
    if (goals.length === 0) return 0;
    
    const completedGoals = goals.filter((goal: any) => goal.completed).length;
    return Math.round((completedGoals / goals.length) * 100);
  };
  
  // Get confidence score for a domain
  const getConfidenceScore = (domainId: string): number => {
    const key = `${domainId}Score` as keyof DomainConfidence;
    return (domainConfidence[key] as number) || 0;
  };
  
  // Get domain icon
  const getDomainIcon = (domainId: string) => {
    switch (domainId) {
      case 'safe':
        return <StarIcon className="h-5 w-5 text-red-600" />;
      case 'healthy':
        return <BadgeCheckIcon className="h-5 w-5 text-green-600" />;
      case 'engaged':
        return <TargetIcon className="h-5 w-5 text-amber-600" />;
      case 'connected':
        return <AwardIcon className="h-5 w-5 text-blue-600" />;
      case 'independent':
        return <TrendingUpIcon className="h-5 w-5 text-purple-600" />;
      case 'included':
        return <ClockIcon className="h-5 w-5 text-pink-600" />;
      default:
        return <StarIcon className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const overallProgress = calculateOverallProgress();
  
  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
            <p className="text-gray-600 mt-1">Track your journey and celebrate your achievements</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm mt-4 md:mt-0 flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold">{overallProgress}%</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-indigo-100">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {overallProgress}%
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="progress" className="text-sm md:text-base">
              Domain Progress
            </TabsTrigger>
            <TabsTrigger value="confidence" className="text-sm md:text-base">
              Confidence Growth
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-sm md:text-base">
              Progress Trends
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Domain Progress</CardTitle>
                <CardDescription>
                  See how close you are to achieving your goals in each life domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {DOMAINS.map(domain => {
                    const progress = calculateDomainProgress(domain.id);
                    const domainPlan = domainPlans.find(dp => dp.domain === domain.id);
                    const goals = domainPlan?.goals ? 
                      (Array.isArray(domainPlan.goals) ? domainPlan.goals : []) : [];
                    const completedGoals = goals.filter((goal: any) => goal.completed).length;
                    
                    return (
                      <div key={domain.id} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{getDomainIcon(domain.id)}</span>
                            <span className="capitalize font-medium">{domain.name}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {completedGoals} / {goals.length} goals completed
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={progress} className="h-3" />
                          <span className="absolute right-0 top-1 text-xs font-medium text-gray-700">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DOMAINS.map(domain => {
                const domainPlan = domainPlans.find(dp => dp.domain === domain.id);
                const goals = domainPlan?.goals ? 
                  (Array.isArray(domainPlan.goals) ? domainPlan.goals : []) : [];
                  
                return (
                  <Card key={domain.id} className={`border ${domain.borderClass}`}>
                    <CardHeader className={domain.lightBgClass}>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`capitalize text-lg ${domain.textClass}`}>
                          {domain.name}
                        </CardTitle>
                        {getDomainIcon(domain.id)}
                      </div>
                      <CardDescription>
                        {domainPlan?.vision ? 
                          domainPlan.vision.startsWith('{') ? 
                            (() => {
                              try {
                                const visionData = JSON.parse(domainPlan.vision);
                                return `When I am ${visionData.age || 30} years old, I will ${visionData.text}`;
                              } catch (e) {
                                return domainPlan.vision;
                              }
                            })() 
                            : domainPlan.vision
                          : `No vision set for ${domain.name} domain`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {goals.length > 0 ? (
                          goals.map((goal: any, idx: number) => (
                            <div key={idx} className="flex items-start">
                              <div className={`mt-0.5 mr-2 flex-shrink-0 h-4 w-4 rounded-full ${goal.completed ? 'bg-green-500' : 'border border-gray-300'}`}>
                                {goal.completed && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {goal.description}
                                </p>
                                {goal.timeline && (
                                  <p className="text-xs text-gray-500">
                                    Timeline: {goal.timeline}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No goals set for this domain</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="confidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Confidence Levels</CardTitle>
                <CardDescription>
                  Track how your confidence has grown in each life domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {DOMAINS.map(domain => {
                    const confidenceScore = getConfidenceScore(domain.id);
                    
                    return (
                      <div key={domain.id} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{getDomainIcon(domain.id)}</span>
                            <span className="capitalize font-medium">{domain.name}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                              <div 
                                key={star} 
                                className={`w-5 h-5 flex items-center justify-center ${star <= confidenceScore ? 'text-amber-500' : 'text-gray-200'}`}
                              >
                                <StarIcon className="h-4 w-4 fill-current" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={confidenceScore * 10} className="h-3" />
                          <span className="absolute right-0 top-1 text-xs font-medium text-gray-700">
                            {confidenceScore} / 10
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Confidence Insights</CardTitle>
                <CardDescription>
                  Areas of strength and opportunities for growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium mb-2 flex items-center">
                      <BadgeCheckIcon className="h-5 w-5 mr-2" />
                      Areas of Strength
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {DOMAINS.filter(domain => getConfidenceScore(domain.id) >= 7).map(domain => (
                        <li key={domain.id} className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="capitalize">{domain.name}</span>
                          <span className="ml-auto font-medium">{getConfidenceScore(domain.id)}/10</span>
                        </li>
                      ))}
                      {DOMAINS.filter(domain => getConfidenceScore(domain.id) >= 7).length === 0 && (
                        <li className="text-gray-500 italic">Keep working on building your confidence!</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <h3 className="text-amber-800 font-medium mb-2 flex items-center">
                      <TrendingUpIcon className="h-5 w-5 mr-2" />
                      Growth Opportunities
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {DOMAINS.filter(domain => getConfidenceScore(domain.id) < 7).map(domain => (
                        <li key={domain.id} className="flex items-center">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                          <span className="capitalize">{domain.name}</span>
                          <span className="ml-auto font-medium">{getConfidenceScore(domain.id)}/10</span>
                        </li>
                      ))}
                      {DOMAINS.filter(domain => getConfidenceScore(domain.id) < 7).length === 0 && (
                        <li className="text-gray-500 italic">Amazing! You're confident in all domains!</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress Summary</CardTitle>
                <CardDescription>
                  Your journey from start to current
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                          Overall Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary">
                          {overallProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex h-4 mb-4 overflow-hidden bg-gray-100 rounded">
                      <div 
                        style={{ width: `${overallProgress}%` }} 
                        className="flex flex-col justify-center text-center text-white whitespace-nowrap bg-primary"
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 bg-indigo-50 text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">
                        {DOMAINS.length}
                      </div>
                      <div className="text-sm text-gray-600">Life Domains</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-emerald-50 text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">
                        {domainPlans.reduce((acc, domain) => {
                          const goals = domain.goals ? (Array.isArray(domain.goals) ? domain.goals : []) : [];
                          return acc + goals.length;
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Goals</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-amber-50 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {domainPlans.reduce((acc, domain) => {
                          const goals = domain.goals ? (Array.isArray(domain.goals) ? domain.goals : []) : [];
                          return acc + goals.filter((goal: any) => goal.completed).length;
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Completed Goals</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-purple-50 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {Math.round(DOMAINS.reduce((acc, domain) => {
                          return acc + getConfidenceScore(domain.id);
                        }, 0) / DOMAINS.length)}
                      </div>
                      <div className="text-sm text-gray-600">Avg. Confidence</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-cyan-50 text-center">
                      <div className="text-3xl font-bold text-cyan-600 mb-1">
                        {Math.max(...DOMAINS.map(domain => getConfidenceScore(domain.id)))}
                      </div>
                      <div className="text-sm text-gray-600">Highest Confidence</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-pink-50 text-center">
                      <div className="text-3xl font-bold text-pink-600 mb-1">
                        {DOMAINS.reduce((highest, domain) => {
                          const progress = calculateDomainProgress(domain.id);
                          return progress > highest ? progress : highest;
                        }, 0)}%
                      </div>
                      <div className="text-sm text-gray-600">Best Domain Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}