// Domain definitions
export const DOMAINS = [
  {
    id: "safe",
    name: "Safe",
    color: "#EF4444", // red-500
    description: "Feeling secure in environments and relationships",
    bgClass: "bg-red-500",
    lightBgClass: "bg-red-50",
    textClass: "text-red-800",
    borderClass: "border-red-200",
    badgeClass: "bg-red-100 text-red-800 hover:bg-red-200"
  },
  {
    id: "healthy",
    name: "Healthy",
    color: "#10B981", // emerald-500
    description: "Maintaining physical and mental wellbeing",
    bgClass: "bg-emerald-500",
    lightBgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
  },
  {
    id: "engaged",
    name: "Engaged",
    color: "#F59E0B", // amber-500
    description: "Participating in meaningful activities",
    bgClass: "bg-amber-500",
    lightBgClass: "bg-amber-50",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-100 text-amber-800 hover:bg-amber-200"
  },
  {
    id: "connected",
    name: "Connected",
    color: "#3B82F6", // blue-500
    description: "Building and maintaining relationships",
    bgClass: "bg-blue-500",
    lightBgClass: "bg-blue-50",
    textClass: "text-blue-800",
    borderClass: "border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  },
  {
    id: "independent",
    name: "Independent",
    color: "#8B5CF6", // purple-500
    description: "Developing skills for autonomy",
    bgClass: "bg-purple-500",
    lightBgClass: "bg-purple-50",
    textClass: "text-purple-800",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-100 text-purple-800 hover:bg-purple-200"
  },
  {
    id: "included",
    name: "Included & Heard",
    color: "#EC4899", // pink-500
    description: "Being valued, respected, and self-advocating",
    bgClass: "bg-pink-500",
    lightBgClass: "bg-pink-50",
    textClass: "text-pink-800",
    borderClass: "border-pink-200",
    badgeClass: "bg-pink-100 text-pink-800 hover:bg-pink-200"
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

// Goal categories
export const GOAL_CATEGORIES = [
  {
    id: "education",
    name: "Education",
    description: "Goals related to learning and academic achievement",
    color: "#0EA5E9", // sky-500
    icon: "GraduationCap"
  },
  {
    id: "social",
    name: "Social",
    description: "Goals for building relationships and social skills",
    color: "#8B5CF6", // violet-500
    icon: "Users"
  },
  {
    id: "career",
    name: "Career",
    description: "Goals for employment and professional development",
    color: "#10B981", // emerald-500
    icon: "Briefcase"
  },
  {
    id: "physical",
    name: "Physical",
    description: "Goals for health, wellness, and physical activities",
    color: "#EF4444", // red-500
    icon: "Heart"
  },
  {
    id: "financial",
    name: "Financial",
    description: "Goals for money management and financial skills",
    color: "#F59E0B", // amber-500
    icon: "DollarSign"
  },
  {
    id: "mental",
    name: "Mental",
    description: "Goals for emotional well-being and mental health",
    color: "#3B82F6", // blue-500
    icon: "Brain"
  },
  {
    id: "self_care",
    name: "Self-Care",
    description: "Goals for developing independence in daily living",
    color: "#EC4899", // pink-500
    icon: "Home"
  },
  {
    id: "communication",
    name: "Communication",
    description: "Goals for verbal and non-verbal communication skills",
    color: "#14B8A6", // teal-500
    icon: "MessageCircle"
  }
];

// Goal priority levels
export const GOAL_PRIORITIES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
};

// Goal templates for common goal types
export const GOAL_TEMPLATES = [
  // Safe domain templates
  {
    id: 1,
    title: "Develop coping strategies",
    description: "Learn and practice strategies to manage stress and anxiety",
    category: "mental",
    domain: "safe",
    difficulty: "medium",
    estimatedDuration: "4-6 weeks"
  },
  {
    id: 2,
    title: "Identify safe spaces",
    description: "Create a list of safe spaces at school, work, or in the community",
    category: "self_care",
    domain: "safe",
    difficulty: "low",
    estimatedDuration: "1-2 weeks"
  },
  
  // Healthy domain templates
  {
    id: 3,
    title: "Plan balanced meals",
    description: "Create weekly meal plans that include all food groups",
    category: "physical",
    domain: "healthy",
    difficulty: "medium",
    estimatedDuration: "Ongoing"
  },
  {
    id: 4,
    title: "Exercise routine",
    description: "Establish a regular exercise routine with preferred activities",
    category: "physical",
    domain: "healthy",
    difficulty: "medium",
    estimatedDuration: "8-12 weeks"
  },
  
  // Engaged domain templates
  {
    id: 5,
    title: "Join a club or activity",
    description: "Participate in a school club or community activity related to interests",
    category: "social",
    domain: "engaged",
    difficulty: "medium",
    estimatedDuration: "Ongoing"
  },
  {
    id: 6,
    title: "Complete a project",
    description: "Initiate and complete a personal project related to a special interest",
    category: "education",
    domain: "engaged",
    difficulty: "high",
    estimatedDuration: "2-3 months"
  },
  
  // Connected domain templates
  {
    id: 7,
    title: "Weekly social activity",
    description: "Participate in a social activity with peers once per week",
    category: "social",
    domain: "connected",
    difficulty: "medium",
    estimatedDuration: "Ongoing"
  },
  {
    id: 8,
    title: "Conversation practice",
    description: "Practice starting and maintaining conversations with peers",
    category: "communication",
    domain: "connected",
    difficulty: "medium",
    estimatedDuration: "Ongoing"
  },
  
  // Independent domain templates
  {
    id: 9,
    title: "Public transportation",
    description: "Learn to navigate public transportation independently",
    category: "self_care",
    domain: "independent",
    difficulty: "high",
    estimatedDuration: "2-3 months"
  },
  {
    id: 10,
    title: "Manage personal schedule",
    description: "Create and follow a personal schedule for daily activities",
    category: "self_care",
    domain: "independent",
    difficulty: "medium",
    estimatedDuration: "4-6 weeks"
  },
  
  // Included & Heard domain templates
  {
    id: 11,
    title: "Self-advocacy practice",
    description: "Practice expressing needs and preferences in appropriate ways",
    category: "communication",
    domain: "included",
    difficulty: "high",
    estimatedDuration: "Ongoing"
  },
  {
    id: 12,
    title: "Participate in planning meetings",
    description: "Actively participate in educational or transition planning meetings",
    category: "communication",
    domain: "included",
    difficulty: "medium",
    estimatedDuration: "As needed"
  }
];

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
