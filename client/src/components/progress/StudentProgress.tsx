import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Student, GoodLifePlan } from "@shared/schema";
import { DOMAINS } from "@/lib/constants";

interface StudentProgressProps {
  student: Student | undefined;
  plan: GoodLifePlan;
  domainProgress: Record<string, number>;
}

export default function StudentProgress({ 
  student, 
  plan, 
  domainProgress 
}: StudentProgressProps) {
  if (!student) return null;

  // Calculate the overall progress
  const overallProgress = Math.round(plan.progress);
  
  // Function to generate an empathetic message based on progress
  const getProgressMessage = (progress: number): string => {
    if (progress >= 90) return "Amazing journey! You're almost at your destination! 🌟";
    if (progress >= 75) return "Fantastic progress! You've come so far! 😊";
    if (progress >= 50) return "Halfway there! Keep up the great momentum! 🙂";
    if (progress >= 25) return "Great start on your journey! Every step matters! 🔄";
    return "Just beginning this adventure! Small steps lead to big changes! 🌱";
  };

  // Choose the right color for the progress bar
  const getProgressColor = (progress: number): string => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-amber-500";
    return "bg-gray-500";
  };

  return (
    <Card className="mb-6 border-t-4 border-t-primary shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{student.name}'s Good Life Journey</CardTitle>
        <CardDescription className="text-base">
          Personalized progress tracking across life domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="w-36 h-36 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-8 border-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{overallProgress}%</span>
                  <p className="text-sm text-gray-500 mt-1">Overall Progress</p>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#f3f4f6" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * overallProgress / 100)}
                  className="text-primary"
                />
              </svg>
            </div>
            <div className="mt-4">
              <p className="text-xl font-medium text-gray-800">{getProgressMessage(overallProgress)}</p>
              <p className="text-sm text-gray-500 mt-1">Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
            {DOMAINS.map(domain => {
              const progress = domainProgress[domain.id] || 0;
              return (
                <div key={domain.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <div className={`w-3 h-3 rounded-full ${domain.bgClass} mr-2`}></div>
                      {domain.name}
                    </h3>
                    <span className="text-xl">
                      {progress >= 75 ? "🌟" : 
                       progress >= 50 ? "😊" : 
                       progress >= 25 ? "🔄" : "🌱"}
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 mb-2" 
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{progress}% Complete</span>
                    <span className="text-gray-700 font-medium">
                      {progress === 100 ? "Complete!" : 
                       progress > 0 ? "In progress" : "Not started"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-indigo-50 rounded-lg mt-4 border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-2">Empathetic Support</h3>
            <p className="text-indigo-700">
              Remember that progress isn't always linear. Each small step is meaningful and contributes to your Good Life journey. 
              Celebrate your achievements, learn from challenges, and keep moving forward at your own pace.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}