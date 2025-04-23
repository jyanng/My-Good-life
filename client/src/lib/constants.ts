// Domain definitions
export const DOMAINS = [
  {
    id: "safe",
    name: "Safe",
    color: "#EF4444", // red-500
    description: "Feeling secure in environments and relationships",
    bgClass: "bg-red-500",
    lightBgClass: "bg-red-100",
    textClass: "text-red-800"
  },
  {
    id: "healthy",
    name: "Healthy",
    color: "#10B981", // emerald-500
    description: "Maintaining physical and mental wellbeing",
    bgClass: "bg-emerald-500",
    lightBgClass: "bg-emerald-100",
    textClass: "text-emerald-800"
  },
  {
    id: "engaged",
    name: "Engaged",
    color: "#F59E0B", // amber-500
    description: "Participating in meaningful activities",
    bgClass: "bg-amber-500",
    lightBgClass: "bg-amber-100",
    textClass: "text-amber-800"
  },
  {
    id: "connected",
    name: "Connected",
    color: "#3B82F6", // blue-500
    description: "Building and maintaining relationships",
    bgClass: "bg-blue-500",
    lightBgClass: "bg-blue-100",
    textClass: "text-blue-800"
  },
  {
    id: "independent",
    name: "Independent",
    color: "#8B5CF6", // purple-500
    description: "Developing skills for autonomy",
    bgClass: "bg-purple-500",
    lightBgClass: "bg-purple-100",
    textClass: "text-purple-800"
  },
  {
    id: "included",
    name: "Included & Heard",
    color: "#EC4899", // pink-500
    description: "Being valued, respected, and self-advocating",
    bgClass: "bg-pink-500",
    lightBgClass: "bg-pink-100",
    textClass: "text-pink-800"
  }
];

// Status types for students and plans
export const STATUS_TYPES = {
  ACTIVE: "active",
  NEEDS_ATTENTION: "needs_attention",
  INACTIVE: "inactive",
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress"
};

// Alert types
export const ALERT_TYPES = {
  UNREFRAMED_GOALS: "unreframed_goals",
  INACTIVITY: "inactivity",
  MISSING_INFORMATION: "missing_information"
};

// Learning module categories
export const MODULE_CATEGORIES = {
  GOAL_SETTING: "goal_setting",
  FACILITATION_SKILLS: "facilitation_skills",
  UNDERSTANDING_NEEDS: "understanding_needs",
  DOMAIN_BASICS: "domain_basics",
  ENVISIONING: "envisioning"
};

// Format date helper
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return "Invalid date";
  
  // For timestamps within the last 24 hours
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  
  if (diff < oneDay) {
    if (diff < 1000 * 60) {
      return "Just now";
    }
    if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // For timestamps within the last week
  if (diff < oneDay * 7) {
    const days = Math.floor(diff / oneDay);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // For older timestamps
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
