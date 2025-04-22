import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Student, DomainPlan } from "@shared/schema";
import { DOMAINS } from "@/lib/constants";

interface ProgressTimelineProps {
  student: Student | undefined;
  domainPlans: DomainPlan[] | undefined;
}

export default function ProgressTimeline({ 
  student, 
  domainPlans 
}: ProgressTimelineProps) {
  if (!student || !domainPlans || !Array.isArray(domainPlans)) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No timeline data available for this student.</p>
      </div>
    );
  }

  // Create timeline events
  interface TimelineEvent {
    date: Date;
    title: string;
    description: string;
    type: 'milestone' | 'achievement' | 'planning';
    domain?: string;
  }

  // Generate a timeline from the domain plans
  const generateTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Add plan creation event
    events.push({
      date: new Date(new Date().setDate(new Date().getDate() - 30)), // Simulate a date 30 days ago
      title: "Good Life Plan Started",
      description: "Beginning of the personalized learning journey",
      type: "milestone"
    });
    
    // Add domain vision setting events
    domainPlans.forEach(domainPlan => {
      if (domainPlan.vision) {
        const domainInfo = DOMAINS.find(d => d.id === domainPlan.domain);
        events.push({
          date: new Date(new Date().setDate(new Date().getDate() - 25)), // Simulate a date 25 days ago
          title: `${domainInfo?.name || domainPlan.domain} Vision Set`,
          description: `Created vision: "${domainPlan.vision}"`,
          type: "planning",
          domain: domainPlan.domain
        });
      }
    });
    
    // Add goal achievement events
    domainPlans.forEach(domainPlan => {
      const domainInfo = DOMAINS.find(d => d.id === domainPlan.domain);
      const goals = domainPlan.goals as any[] || [];
      
      goals.filter(g => g.status === "completed").forEach((goal, index) => {
        // Stagger the completion dates to create a more realistic timeline
        const daysAgo = Math.max(2, 20 - (index * 3));
        events.push({
          date: new Date(new Date().setDate(new Date().getDate() - daysAgo)),
          title: `Goal Completed in ${domainInfo?.name || domainPlan.domain}`,
          description: `"${goal.description}"`,
          type: "achievement",
          domain: domainPlan.domain
        });
      });
    });
    
    // Sort events by date (most recent first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = generateTimeline();
  
  // Group events by month for better organization
  interface TimelineGroup {
    month: string;
    events: TimelineEvent[];
  }
  
  const groupEventsByMonth = (events: TimelineEvent[]): TimelineGroup[] => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    events.forEach(event => {
      const monthKey = event.date.toLocaleDateString('en-SG', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(event);
    });
    
    return Object.keys(groups).map(month => ({
      month,
      events: groups[month]
    }));
  };
  
  const timelineGroups = groupEventsByMonth(timelineEvents);
  
  // Get color class based on event type
  const getEventColor = (type: string, domain?: string): string => {
    if (type === 'achievement') return 'bg-green-100 text-green-800 border-green-200';
    if (type === 'milestone') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'planning') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Get emoji based on event type
  const getEventEmoji = (type: string): string => {
    if (type === 'achievement') return '🏆';
    if (type === 'milestone') return '🚩';
    if (type === 'planning') return '📝';
    return '📌';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}'s Progress Journey</CardTitle>
        <CardDescription>
          Timeline of achievements, milestones, and progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 mb-6 bg-indigo-50 rounded-lg border border-indigo-100">
          <h3 className="font-medium text-indigo-800 mb-2">Journey Reflection</h3>
          <p className="text-indigo-700">
            This timeline shows your unique journey toward your Good Life goals. Each milestone represents 
            progress and growth, capturing your personal development over time.
          </p>
        </div>
        
        <div className="relative">
          {timelineGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8">
              <h3 className="font-bold text-lg text-gray-700 mb-4">{group.month}</h3>
              
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {group.events.map((event, i) => {
                    const colorClass = getEventColor(event.type, event.domain);
                    const emoji = getEventEmoji(event.type);
                    
                    // Find the domain info if this event is associated with a domain
                    const domainInfo = event.domain ? 
                      DOMAINS.find(d => d.id === event.domain) : undefined;
                    
                    return (
                      <div key={i} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                            {emoji}
                          </div>
                        </div>
                        <div className="flex-grow bg-white p-4 rounded-lg border shadow-sm">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800">{event.title}</h3>
                            {domainInfo && (
                              <Badge variant="outline" className={domainInfo.bgClass + " bg-opacity-10"}>
                                {domainInfo.name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {event.date.toLocaleDateString("en-SG", { 
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <p className="text-gray-700">{event.description}</p>
                          
                          {event.type === 'achievement' && (
                            <div className="mt-2 text-green-600 text-sm flex items-center">
                              <span className="mr-1">🎉</span> Achievement unlocked!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {groupIndex < timelineGroups.length - 1 && (
                <Separator className="my-8" />
              )}
            </div>
          ))}
          
          {/* Journey start indicator */}
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 rounded-full bg-primary-foreground border-2 border-primary flex items-center justify-center">
                🚀
              </div>
            </div>
            <div className="flex-grow bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-medium text-gray-800">Good Life Plan Journey Started</h3>
              <div className="text-sm text-gray-500 mb-2">
                {new Date(new Date().setDate(new Date().getDate() - 30)).toLocaleDateString("en-SG", { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <p className="text-gray-700">Beginning of the personalized learning journey</p>
              <div className="mt-2 text-primary text-sm flex items-center">
                <span className="mr-1">💫</span> The start of something amazing!
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}