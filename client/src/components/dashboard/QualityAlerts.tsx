import { Alert } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/constants";
import { useLocation } from "wouter";

interface QualityAlertsProps {
  alerts: Alert[];
  isLoading: boolean;
}

export default function QualityAlerts({ alerts, isLoading }: QualityAlertsProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleAlertAction = (alert: Alert, action: string) => {
    if (alert.type === "unreframed_goals") {
      // Navigate to the review goals page
      navigate(`/review-goals/${alert.studentId}/${alert.id}`);
    } else {
      toast({
        title: "Action Taken",
        description: `You've chosen to ${action} for this alert.`,
      });
    }
  };
  
  // Helper function to get alert icon by type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "unreframed_goals":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
          </div>
        );
      case "inactivity":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
        );
    }
  };
  
  // Helper function to get action button text by alert type
  const getActionText = (type: string) => {
    switch (type) {
      case "unreframed_goals":
        return "Update Your Dreams";
      case "inactivity":
        return "Continue Your Journey";
      case "missing_information":
        return "Complete Your Story";
      default:
        return "Take Next Step";
    }
  };

  // Helper function to get friendly alert title
  const getAlertTitle = (type: string) => {
    switch (type) {
      case "unreframed_goals":
        return "Dreams to Clarify";
      case "inactivity": 
        return "Let's Continue Your Journey";
      default:
        return "Let's Complete Your Circle of Support";
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Updates & Reminders</h3>
          <p className="mt-2 text-gray-600">Things that might need your attention</p>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Updates & Reminders</h3>
        <p className="mt-2 text-gray-600">Things that might need your attention</p>
      </div>
      <div className="divide-y divide-gray-100">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-1">All Good!</p>
            <p className="text-gray-600">You're all caught up. No updates at this time.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="p-6 hover:bg-indigo-50 transition-colors" role="alert">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {getAlertTitle(alert.type)}
                    </h4>
                    <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                  <p className="text-base text-gray-600 mb-4">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <Button 
                      className="text-base rounded-xl py-2 px-4 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleAlertAction(alert, getActionText(alert.type))}
                    >
                      {getActionText(alert.type)}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-sm rounded-xl" 
                      onClick={() => toast({
                        title: "Reminder Snoozed",
                        description: "We'll remind you about this later."
                      })}
                    >
                      Remind Me Later
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {alerts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Updated {new Date().toLocaleDateString()}
            </p>
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
              View All Updates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
