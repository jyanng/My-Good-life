import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import StudentProfile from "@/pages/student-profile";
import PlanBuilder from "@/pages/plan-builder";
import CaseStudies from "@/pages/case-studies";
import LearningCenter from "@/pages/learning-center";
import ReviewGoals from "@/pages/review-goals";
import ProgressVisualization from "@/pages/progress-visualization";
import VisionBoard from "@/pages/vision-board";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

function Router() {
  // For demo purposes, assume we're logged in as facilitator with ID 1
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate login
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/1");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // In a real app, would redirect to login
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">Authentication Error</div>
          <p className="mt-2 text-gray-600">Unable to authenticate user. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/student/:id">
          {params => <StudentProfile id={Number(params.id)} />}
        </Route>
        <Route path="/plan-builder/:studentId">
          {params => <PlanBuilder studentId={Number(params.studentId)} />}
        </Route>
        <Route path="/review-goals/:studentId/:alertId">
          {params => <ReviewGoals studentId={Number(params.studentId)} alertId={Number(params.alertId)} />}
        </Route>
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/learning-center" component={LearningCenter} />
        <Route path="/progress-visualization" component={ProgressVisualization} />
        <Route path="/vision-board" component={VisionBoard} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="goodlife-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
