import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import CaseStudies from "@/pages/case-studies";
import LearningCenter from "@/pages/learning-center";
import ProgressVisualization from "@/pages/progress-visualization";
import VisionBoard from "@/pages/vision-board";
import PlanTemplates from "@/pages/plan-templates";
import AuthPage from "@/pages/auth";
import FacilitatorDashboard from "@/pages/facilitator";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router() {
  const { user, isLoading } = useAuth();
  
  // For demo purposes, temporarily use a simulated user
  // This will allow the app to work without the authentication backend fully set up
  const simulatedUser = {
    id: 1,
    username: "sarah",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "facilitator",
    createdAt: new Date(),
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
          <p className="mt-3 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes (accessible to all)
  const publicRoutes = (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/learning-center" component={LearningCenter} />
      <Route path="/plan-templates" component={PlanTemplates} />
      {/* Redirect to auth by default */}
      <Route path="/">
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome to MyGoodLife</h1>
            <p className="mb-6">Please log in to access the transition planning tools.</p>
            <Link href="/auth">
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );

  // For demo purposes, use the simulated user to show UI
  const effectiveUser = user || simulatedUser;

  // Routes that require authentication
  const authenticatedRoutes = (
    <AppLayout user={effectiveUser}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/progress-visualization" component={ProgressVisualization} />
        <Route path="/vision-board/:studentId">
          {params => <VisionBoard studentId={Number(params.studentId)} />}
        </Route>
        <Route path="/vision-board" component={VisionBoard} />
        
        {/* Facilitator protected routes */}
        <Route path="/facilitator" component={FacilitatorDashboard} />
        <Route path="/facilitator/student/:id">
          {params => <FacilitatorStudentProfile id={Number(params.id)} />}
        </Route>
        <Route path="/facilitator/student/:id/edit">
          {params => <FacilitatorPlanEditor studentId={Number(params.id)} />}
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );

  // For demo, always use authenticated routes until backend is fully setup
  // return user ? authenticatedRoutes : publicRoutes;
  return authenticatedRoutes;
}

// Placeholder components until we create them
const FacilitatorStudentProfile = ({ id }: { id: number }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Student Profile #{id}</h1>
    <p>This is a protected view only accessible to facilitators</p>
  </div>
);

const FacilitatorPlanEditor = ({ studentId }: { studentId: number }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Plan Editor for Student #{studentId}</h1>
    <p>This is a protected editor only accessible to facilitators</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="goodlife-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
