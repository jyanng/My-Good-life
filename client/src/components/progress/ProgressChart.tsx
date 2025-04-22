import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

interface ProgressChartProps {
  domainProgress: Record<string, number>;
  domains: { id: string; name: string; bgClass: string; }[];
}

export default function ProgressChart({ domainProgress, domains }: ProgressChartProps) {
  // Prepare data for charts
  const chartData = domains.map(domain => ({
    name: domain.name,
    value: domainProgress[domain.id] || 0,
    fill: getColorFromClass(domain.bgClass)
  }));
  
  // Helper function to extract hex color from Tailwind class
  function getColorFromClass(bgClass: string): string {
    switch (bgClass) {
      case 'bg-red-500': return '#ef4444';
      case 'bg-green-500': return '#10b981';
      case 'bg-blue-500': return '#3b82f6';
      case 'bg-yellow-500': return '#f59e0b';
      case 'bg-purple-500': return '#8b5cf6';
      case 'bg-pink-500': return '#ec4899';
      default: return '#6b7280';
    }
  }

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
          <p className="text-sm text-gray-500">
            {getProgressDescription(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Get description based on progress value
  function getProgressDescription(value: number): string {
    if (value >= 90) return "Excellent progress!";
    if (value >= 75) return "Strong progress!";
    if (value >= 50) return "Good progress!";
    if (value >= 25) return "Getting started!";
    return "Just beginning!";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Progress</CardTitle>
          <CardDescription>
            Bar chart visualization of progress in each domain
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[0, 100]}
                label={{ 
                  value: 'Progress (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                name="Progress"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Skill Balance</CardTitle>
          <CardDescription>
            Radar chart showing balance across all domains
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} data={chartData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Progress"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Understanding Your Visualization</CardTitle>
          <CardDescription>
            How to interpret your progress charts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-lg">
                <h3 className="font-medium text-lg mb-2">Bar Chart</h3>
                <p className="text-gray-600">
                  The bar chart shows your progress percentage in each domain. Taller bars indicate areas where you've made more progress.
                  This visualization helps you identify your strongest development areas and where you might want to focus next.
                </p>
              </div>
              
              <div className="p-4 bg-white border rounded-lg">
                <h3 className="font-medium text-lg mb-2">Radar Chart</h3>
                <p className="text-gray-600">
                  The radar chart displays how balanced your progress is across all domains. A more evenly filled shape indicates balanced development,
                  while points extending further out show domains of particular strength.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-800 mb-2">Personalized Insights</h3>
              <p className="text-indigo-700">
                These visualizations are designed to show your unique journey and celebrate progress in all areas. Remember that each person's
                path is different - focus on your personal growth rather than comparing with others.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}