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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flag text-amber-500">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </svg>
        );
      case "inactivity":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-red-500">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info text-blue-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        );
    }
  };
  
  // Helper function to get action button text by alert type
  const getActionText = (type: string) => {
    switch (type) {
      case "unreframed_goals":
        return "Review Now";
      case "inactivity":
        return "Contact Student";
      case "missing_information":
        return "Update Plan";
      default:
        return "Take Action";
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quality Alerts</h3>
          <p className="mt-1 text-sm text-gray-500">Issues that need your attention</p>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quality Alerts</h3>
        <p className="mt-1 text-sm text-gray-500">Issues that need your attention</p>
      </div>
      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No alerts at this time.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="p-5 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.type === "unreframed_goals" ? "Unreframed Goals" : 
                       alert.type === "inactivity" ? "Inactivity Alert" : 
                       "Missing Support System"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(alert.createdAt)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      className="text-xs rounded-full px-3"
                      onClick={() => handleAlertAction(alert, getActionText(alert.type))}
                    >
                      {getActionText(alert.type)}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-5 border-t border-gray-200">
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </div>
    </div>
  );
}
