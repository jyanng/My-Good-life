import {
  users, User, InsertUser,
  students, Student, InsertStudent,
  profiles, Profile, InsertProfile,
  domainConfidence, DomainConfidence, InsertDomainConfidence,
  goodLifePlans, GoodLifePlan, InsertGoodLifePlan,
  domainPlans, DomainPlan, InsertDomainPlan,
  caseStudies, CaseStudy, InsertCaseStudy,
  learningModules, LearningModule, InsertLearningModule,
  alerts, Alert, InsertAlert
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudents(facilitatorId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  updateStudentActivity(id: number): Promise<void>;
  
  // Profile methods
  getProfile(studentId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(studentId: number, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Domain Confidence methods
  getDomainConfidence(studentId: number): Promise<DomainConfidence | undefined>;
  createDomainConfidence(confidence: InsertDomainConfidence): Promise<DomainConfidence>;
  updateDomainConfidence(studentId: number, confidence: Partial<InsertDomainConfidence>): Promise<DomainConfidence | undefined>;
  
  // GoodLife Plan methods
  getPlans(facilitatorId: number): Promise<GoodLifePlan[]>;
  getPlan(id: number): Promise<GoodLifePlan | undefined>;
  getStudentPlan(studentId: number): Promise<GoodLifePlan | undefined>;
  createPlan(plan: InsertGoodLifePlan): Promise<GoodLifePlan>;
  updatePlan(id: number, plan: Partial<InsertGoodLifePlan>): Promise<GoodLifePlan | undefined>;
  
  // Domain Plan methods
  getDomainPlans(planId: number): Promise<DomainPlan[]>;
  getDomainPlan(id: number): Promise<DomainPlan | undefined>;
  createDomainPlan(domainPlan: InsertDomainPlan): Promise<DomainPlan>;
  updateDomainPlan(id: number, domainPlan: Partial<InsertDomainPlan>): Promise<DomainPlan | undefined>;
  
  // Case Study methods
  getCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  
  // Learning Module methods
  getLearningModules(): Promise<LearningModule[]>;
  getLearningModule(id: number): Promise<LearningModule | undefined>;
  createLearningModule(module: InsertLearningModule): Promise<LearningModule>;
  
  // Alert methods
  getAlerts(facilitatorId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: number, status: string): Promise<Alert | undefined>;
  
  // Dashboard Stats
  getDashboardStats(facilitatorId: number): Promise<{
    activeStudents: number;
    plansInProgress: number;
    completedPlans: number;
    domainProgress: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private profiles: Map<number, Profile>;
  private domainConfidences: Map<number, DomainConfidence>;
  private goodLifePlans: Map<number, GoodLifePlan>;
  private domainPlans: Map<number, DomainPlan>;
  private caseStudies: Map<number, CaseStudy>;
  private learningModules: Map<number, LearningModule>;
  private alerts: Map<number, Alert>;
  
  private currentUserId: number;
  private currentStudentId: number;
  private currentProfileId: number;
  private currentDomainConfidenceId: number;
  private currentPlanId: number;
  private currentDomainPlanId: number;
  private currentCaseStudyId: number;
  private currentLearningModuleId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.profiles = new Map();
    this.domainConfidences = new Map();
    this.goodLifePlans = new Map();
    this.domainPlans = new Map();
    this.caseStudies = new Map();
    this.learningModules = new Map();
    this.alerts = new Map();
    
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentProfileId = 1;
    this.currentDomainConfidenceId = 1;
    this.currentPlanId = 1;
    this.currentDomainPlanId = 1;
    this.currentCaseStudyId = 1;
    this.currentLearningModuleId = 1;
    this.currentAlertId = 1;
    
    // Add demo user
    this.createUser({
      username: "sarah",
      password: "password123",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "facilitator",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
    });
    
    // Add demo students
    const student1 = this.createStudent({
      name: "Wei Jie Tan",
      email: "weijie.tan@example.edu.sg",
      phone: "+65 9123 4567",
      school: "Pathlight School",
      graduationDate: "November 2024",
      age: 18,
      avatarUrl: "https://images.unsplash.com/photo-1545696968-1a5245650b36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "active",
      facilitatorId: 1
    });
    
    const student2 = this.createStudent({
      name: "Li Ying Lim",
      email: "liying.lim@example.edu.sg",
      phone: "+65 9234 5678",
      school: "Eden School",
      graduationDate: "November 2024",
      age: 17,
      avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "active",
      facilitatorId: 1
    });
    
    const student3 = this.createStudent({
      name: "Rizwan bin Abdullah",
      email: "rizwan.abdullah@example.edu.sg",
      phone: "+65 9345 6789",
      school: "APSN Delta Senior School",
      graduationDate: "November 2024",
      age: 19,
      avatarUrl: "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "active",
      facilitatorId: 1
    });
    
    const student4 = this.createStudent({
      name: "Aishwarya Rai",
      email: "aishwarya.rai@example.edu.sg",
      phone: "+65 9456 7890",
      school: "Rainbow Centre",
      graduationDate: "June 2024",
      age: 18,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      status: "needs_attention",
      facilitatorId: 1
    });
    
    // Add demo profiles
    this.createProfile({
      studentId: 1,
      likes: ["Digital art and animation", "Mobile games, especially Mobile Legends", "Coding and technology", "Watching nature documentaries", "Playing piano at CC"],
      dislikes: ["Crowded MRT during peak hours", "Last-minute changes to timetable", "Strong food smells in hawker centres", "Being interrupted during gaming sessions", "Strangers standing too close"],
      strengths: ["Memorizing facts about technology", "Solving math problems quickly", "Creating digital illustrations", "Focusing on coding projects for hours", "Explaining complex topics to others"],
      peopleAppreciate: ["Direct communication style", "Loyalty to close friends", "Creative problem solving", "Passion for learning new technologies", "Willingness to help with computer issues"],
      importantToMe: ["Having quiet time after school", "Clear instructions for assignments", "Using my artistic talents", "Learning about AI and robotics"],
      bestSupport: ["Give step-by-step instructions", "Allow extra time for processing", "Provide visual schedules", "Respect need for personal space in group work"],
      importantToFamily: ["Regular updates on school progress", "Seeing me become more independent", "Academic achievements"],
      bestSupportFamily: ["Sharing my accomplishments", "Including them in education planning", "Providing resources in both English and Mandarin"],
      personalityTags: ["Creative", "Analytical", "Detail-focused", "Tech-savvy", "Digital art", "Music", "Science", "Coding", "Gaming", "Organized", "Structured", "Visual learner"]
    });
    
    // Add domain confidence
    this.createDomainConfidence({
      studentId: 1,
      safeScore: 8,
      healthyScore: 7,
      engagedScore: 6,
      connectedScore: 5,
      independentScore: 4,
      includedScore: 7
    });
    
    this.createDomainConfidence({
      studentId: 2,
      safeScore: 7,
      healthyScore: 6,
      engagedScore: 5,
      connectedScore: 4,
      independentScore: 3,
      includedScore: 5
    });
    
    this.createDomainConfidence({
      studentId: 3,
      safeScore: 9,
      healthyScore: 8,
      engagedScore: 8,
      connectedScore: 7,
      independentScore: 7,
      includedScore: 6
    });
    
    this.createDomainConfidence({
      studentId: 4,
      safeScore: 6,
      healthyScore: 5,
      engagedScore: 4,
      connectedScore: 3,
      independentScore: 4,
      includedScore: 5
    });
    
    // Create plans for students
    const plan1 = this.createPlan({
      studentId: 1,
      status: "in_progress",
      progress: 75
    });
    
    const plan2 = this.createPlan({
      studentId: 2,
      status: "in_progress",
      progress: 45
    });
    
    const plan3 = this.createPlan({
      studentId: 3,
      status: "in_progress",
      progress: 90
    });
    
    const plan4 = this.createPlan({
      studentId: 4,
      status: "in_progress",
      progress: 10
    });
    
    // Create domain plans for student 1
    this.createDomainPlan({
      planId: 1,
      domain: "safe",
      vision: "I will feel safe in my community and learning environments",
      goals: [
        { description: "Learn to identify and manage anxiety triggers", status: "completed" },
        { description: "Develop a personal safety plan for school and work", status: "in_progress" }
      ],
      completed: true
    });
    
    this.createDomainPlan({
      planId: 1,
      domain: "healthy",
      vision: "I will maintain physical and mental wellbeing through healthy habits",
      goals: [
        { description: "Establish a consistent sleep schedule", status: "completed" },
        { description: "Learn to prepare simple, nutritious meals", status: "in_progress" }
      ],
      completed: true
    });
    
    this.createDomainPlan({
      planId: 1,
      domain: "engaged",
      vision: "I will participate in meaningful activities that I enjoy",
      goals: [
        { description: "Join a digital art club or online community", status: "completed" },
        { description: "Volunteer with animals at local shelter once per month", status: "in_progress" }
      ],
      completed: true
    });
    
    this.createDomainPlan({
      planId: 1,
      domain: "connected",
      vision: "I will build and maintain positive relationships",
      goals: [
        { description: "Practice social skills in small group settings", status: "in_progress" },
        { description: "Connect with peers who share my interests", status: "not_started" }
      ],
      completed: false
    });
    
    this.createDomainPlan({
      planId: 1,
      domain: "independent",
      vision: "I will develop skills to live independently",
      goals: [
        { description: "Learn to use public transportation", status: "in_progress" },
        { description: "Practice budgeting and managing money", status: "not_started" }
      ],
      completed: false
    });
    
    this.createDomainPlan({
      planId: 1,
      domain: "included",
      vision: "I will advocate for myself and be included in decisions about my life",
      goals: [
        { description: "Practice expressing my needs clearly", status: "completed" },
        { description: "Learn about my rights and accommodations", status: "in_progress" }
      ],
      completed: true
    });
    
    // Add some case studies
    this.createCaseStudy({
      title: "From Anxiety to Confidence",
      description: "How Terence overcame social anxiety to secure a part-time job at NTUC FairPrice",
      domains: ["safe", "connected", "independent"],
      content: "Terence, a 19-year-old with autism from Woodlands, struggled with severe anxiety in social situations. Through his GoodLife Plan, he worked with his facilitator to develop strategies that helped him feel safe in unfamiliar environments. Starting with small steps—like ordering food at a quiet kopitiam—Terence gradually built confidence. After six months of practicing social skills and learning stress-management techniques at the Social Service Centre, he successfully interviewed for and secured a part-time position at NTUC FairPrice, an environment that matched his interests in organization and inventory management.",
      mediaUrls: []
    });
    
    this.createCaseStudy({
      title: "Building Independence Through Technology",
      description: "Mei Ling's journey to living semi-independently in an HDB flat using assistive technology",
      domains: ["independent", "safe", "healthy"],
      content: "Mei Ling, who has an intellectual disability, dreamed of living in her own HDB flat with minimal support. Her GoodLife Plan focused on building practical skills and leveraging technology to support her independence. She learned to use smart home devices to manage routines, video calling to stay connected with her family in Tampines, and reminder apps for medication and appointments. After a year of preparation with SG Enable's support, Mei Ling moved into a supported living apartment where she handles most daily tasks independently while maintaining regular check-ins with her support network and visiting the nearby community center for activities.",
      mediaUrls: []
    });
    
    this.createCaseStudy({
      title: "Finding a Voice Through Digital Art",
      description: "How creative expression helped Irfan communicate his needs and goals",
      domains: ["engaged", "included", "connected"],
      content: "Irfan, who is non-verbal and on the autism spectrum, struggled to communicate his preferences and goals. His facilitator at Rainbow Centre noticed his interest in colors and digital tools, and incorporated tablet-based art into his GoodLife planning process. Through digital illustration apps, Irfan began expressing his interests, preferences, and even concerns about his future education path. This creative approach led to Irfan joining MINDS' inclusive digital art program at Enabling Village, where he developed friendships and found meaningful engagement. His digital artwork now serves as a communication tool in planning meetings, ensuring his voice is central to decisions about his future vocational training.",
      mediaUrls: []
    });
    
    // Add learning modules
    this.createLearningModule({
      title: "Effective Goal Framing",
      description: "Learn how to frame goals positively to promote growth and progress",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: 8,
      category: "goal_setting"
    });
    
    this.createLearningModule({
      title: "Understanding Co-Ownership",
      description: "Strategies for balancing support with empowerment",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: 10,
      category: "facilitation_skills"
    });
    
    this.createLearningModule({
      title: "Sensory Considerations in Planning",
      description: "How to account for sensory needs when developing transition plans",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: 7,
      category: "understanding_needs"
    });
    
    // Add alerts
    this.createAlert({
      facilitatorId: 1,
      studentId: 3,
      type: "unreframed_goals",
      message: "Rizwan bin Abdullah has 3 goals that need to be reframed in a positive way.",
      status: "open"
    });
    
    this.createAlert({
      facilitatorId: 1,
      studentId: 4,
      type: "inactivity",
      message: "Aishwarya Rai hasn't engaged with their plan in 5 days.",
      status: "open"
    });
    
    this.createAlert({
      facilitatorId: 1,
      studentId: 2,
      type: "missing_information",
      message: "Li Ying Lim's Connected domain is missing support system details.",
      status: "open"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Student methods
  async getStudents(facilitatorId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      student => student.facilitatorId === facilitatorId
    );
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const now = new Date();
    const student: Student = { 
      ...insertStudent, 
      id, 
      createdAt: now,
      lastActivity: now 
    };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent: Student = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  async updateStudentActivity(id: number): Promise<void> {
    const student = this.students.get(id);
    if (student) {
      student.lastActivity = new Date();
      this.students.set(id, student);
    }
  }
  
  // Profile methods
  async getProfile(studentId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      profile => profile.studentId === studentId
    );
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = { ...insertProfile, id };
    this.profiles.set(id, profile);
    return profile;
  }
  
  async updateProfile(studentId: number, updateData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profile = Array.from(this.profiles.values()).find(
      profile => profile.studentId === studentId
    );
    
    if (!profile) return undefined;
    
    const updatedProfile: Profile = { ...profile, ...updateData };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Domain Confidence methods
  async getDomainConfidence(studentId: number): Promise<DomainConfidence | undefined> {
    return Array.from(this.domainConfidences.values()).find(
      confidence => confidence.studentId === studentId
    );
  }
  
  async createDomainConfidence(insertConfidence: InsertDomainConfidence): Promise<DomainConfidence> {
    const id = this.currentDomainConfidenceId++;
    const now = new Date();
    const confidence: DomainConfidence = { ...insertConfidence, id, updatedAt: now };
    this.domainConfidences.set(id, confidence);
    return confidence;
  }
  
  async updateDomainConfidence(studentId: number, updateData: Partial<InsertDomainConfidence>): Promise<DomainConfidence | undefined> {
    const confidence = Array.from(this.domainConfidences.values()).find(
      confidence => confidence.studentId === studentId
    );
    
    if (!confidence) return undefined;
    
    const updatedConfidence: DomainConfidence = { 
      ...confidence, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.domainConfidences.set(confidence.id, updatedConfidence);
    return updatedConfidence;
  }
  
  // GoodLife Plan methods
  async getPlans(facilitatorId: number): Promise<GoodLifePlan[]> {
    const studentIds = (await this.getStudents(facilitatorId)).map(student => student.id);
    return Array.from(this.goodLifePlans.values()).filter(
      plan => studentIds.includes(plan.studentId)
    );
  }
  
  async getPlan(id: number): Promise<GoodLifePlan | undefined> {
    return this.goodLifePlans.get(id);
  }
  
  async getStudentPlan(studentId: number): Promise<GoodLifePlan | undefined> {
    return Array.from(this.goodLifePlans.values()).find(
      plan => plan.studentId === studentId
    );
  }
  
  async createPlan(insertPlan: InsertGoodLifePlan): Promise<GoodLifePlan> {
    const id = this.currentPlanId++;
    const now = new Date();
    const plan: GoodLifePlan = { 
      ...insertPlan, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.goodLifePlans.set(id, plan);
    return plan;
  }
  
  async updatePlan(id: number, updateData: Partial<InsertGoodLifePlan>): Promise<GoodLifePlan | undefined> {
    const plan = this.goodLifePlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: GoodLifePlan = { 
      ...plan, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.goodLifePlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Domain Plan methods
  async getDomainPlans(planId: number): Promise<DomainPlan[]> {
    return Array.from(this.domainPlans.values()).filter(
      domainPlan => domainPlan.planId === planId
    );
  }
  
  async getDomainPlan(id: number): Promise<DomainPlan | undefined> {
    return this.domainPlans.get(id);
  }
  
  async createDomainPlan(insertDomainPlan: InsertDomainPlan): Promise<DomainPlan> {
    const id = this.currentDomainPlanId++;
    const now = new Date();
    const domainPlan: DomainPlan = { 
      ...insertDomainPlan, 
      id,
      updatedAt: now
    };
    this.domainPlans.set(id, domainPlan);
    return domainPlan;
  }
  
  async updateDomainPlan(id: number, updateData: Partial<InsertDomainPlan>): Promise<DomainPlan | undefined> {
    const domainPlan = this.domainPlans.get(id);
    if (!domainPlan) return undefined;
    
    const updatedDomainPlan: DomainPlan = { 
      ...domainPlan, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.domainPlans.set(id, updatedDomainPlan);
    return updatedDomainPlan;
  }
  
  // Case Study methods
  async getCaseStudies(): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values());
  }
  
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudies.get(id);
  }
  
  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.currentCaseStudyId++;
    const now = new Date();
    const caseStudy: CaseStudy = { 
      ...insertCaseStudy, 
      id,
      createdAt: now
    };
    this.caseStudies.set(id, caseStudy);
    return caseStudy;
  }
  
  // Learning Module methods
  async getLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values());
  }
  
  async getLearningModule(id: number): Promise<LearningModule | undefined> {
    return this.learningModules.get(id);
  }
  
  async createLearningModule(insertModule: InsertLearningModule): Promise<LearningModule> {
    const id = this.currentLearningModuleId++;
    const now = new Date();
    const learningModule: LearningModule = { 
      ...insertModule, 
      id,
      createdAt: now
    };
    this.learningModules.set(id, learningModule);
    return learningModule;
  }
  
  // Alert methods
  async getAlerts(facilitatorId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      alert => alert.facilitatorId === facilitatorId
    );
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const now = new Date();
    const alert: Alert = { 
      ...insertAlert, 
      id,
      createdAt: now
    };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async updateAlertStatus(id: number, status: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    alert.status = status;
    this.alerts.set(id, alert);
    return alert;
  }
  
  // Dashboard Stats
  async getDashboardStats(facilitatorId: number): Promise<{
    activeStudents: number;
    plansInProgress: number;
    completedPlans: number;
    domainProgress: Record<string, number>;
  }> {
    const students = await this.getStudents(facilitatorId);
    const activeStudents = students.filter(s => s.status === "active").length;
    
    const studentIds = students.map(s => s.id);
    const plans = Array.from(this.goodLifePlans.values()).filter(
      plan => studentIds.includes(plan.studentId)
    );
    
    const plansInProgress = plans.filter(p => p.status === "in_progress").length;
    const completedPlans = plans.filter(p => p.status === "completed").length;
    
    // Calculate domain progress
    const domainPlans = Array.from(this.domainPlans.values()).filter(
      dp => plans.some(p => p.id === dp.planId)
    );
    
    const domains = ["safe", "healthy", "engaged", "connected", "independent", "included"];
    const domainCounts = domains.reduce((acc, domain) => {
      acc[domain] = { total: 0, completed: 0 };
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);
    
    domainPlans.forEach(dp => {
      const domain = dp.domain;
      domainCounts[domain].total++;
      if (dp.completed) {
        domainCounts[domain].completed++;
      }
    });
    
    const domainProgress = domains.reduce((acc, domain) => {
      const { total, completed } = domainCounts[domain];
      acc[domain] = total > 0 ? Math.round((completed / total) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      activeStudents,
      plansInProgress,
      completedPlans,
      domainProgress
    };
  }
}

export const storage = new MemStorage();
