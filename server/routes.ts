import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertStudentSchema,
  insertProfileSchema,
  insertDomainConfidenceSchema,
  insertGoodLifePlanSchema,
  insertDomainPlanSchema,
  insertCaseStudySchema,
  insertLearningModuleSchema,
  insertAlertSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  
  // Auth
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });
  
  // Students
  app.get("/api/students", async (req, res) => {
    const facilitatorId = Number(req.query.facilitatorId);
    if (isNaN(facilitatorId)) {
      return res.status(400).json({ message: "Invalid facilitator ID" });
    }
    
    const students = await storage.getStudents(facilitatorId);
    res.json(students);
  });
  
  app.get("/api/students/:id", async (req, res) => {
    const id = Number(req.params.id);
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  });
  
  app.post("/api/students", async (req, res) => {
    try {
      const validated = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validated);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });
  
  app.patch("/api/students/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      const updateData = insertStudentSchema.partial().parse(req.body);
      const updated = await storage.updateStudent(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });
  
  app.post("/api/students/:id/activity", async (req, res) => {
    const id = Number(req.params.id);
    await storage.updateStudentActivity(id);
    res.status(204).end();
  });
  
  // Student Profiles
  app.get("/api/profiles/:studentId", async (req, res) => {
    const studentId = Number(req.params.studentId);
    const profile = await storage.getProfile(studentId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });
  
  app.post("/api/profiles", async (req, res) => {
    try {
      const validated = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validated);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });
  
  app.patch("/api/profiles/:studentId", async (req, res) => {
    const studentId = Number(req.params.studentId);
    try {
      const updateData = insertProfileSchema.partial().parse(req.body);
      const updated = await storage.updateProfile(studentId, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });
  
  // Domain Confidence
  app.get("/api/domain-confidence/:studentId", async (req, res) => {
    const studentId = Number(req.params.studentId);
    const confidence = await storage.getDomainConfidence(studentId);
    if (!confidence) {
      return res.status(404).json({ message: "Domain confidence data not found" });
    }
    res.json(confidence);
  });
  
  app.post("/api/domain-confidence", async (req, res) => {
    try {
      const validated = insertDomainConfidenceSchema.parse(req.body);
      const confidence = await storage.createDomainConfidence(validated);
      res.status(201).json(confidence);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain confidence data" });
    }
  });
  
  app.patch("/api/domain-confidence/:studentId", async (req, res) => {
    const studentId = Number(req.params.studentId);
    try {
      const updateData = insertDomainConfidenceSchema.partial().parse(req.body);
      const updated = await storage.updateDomainConfidence(studentId, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Domain confidence data not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain confidence data" });
    }
  });
  
  // GoodLife Plans
  app.get("/api/plans", async (req, res) => {
    const facilitatorId = Number(req.query.facilitatorId);
    if (isNaN(facilitatorId)) {
      return res.status(400).json({ message: "Invalid facilitator ID" });
    }
    
    const plans = await storage.getPlans(facilitatorId);
    res.json(plans);
  });
  
  app.get("/api/plans/:id", async (req, res) => {
    const id = Number(req.params.id);
    const plan = await storage.getPlan(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  });
  
  app.get("/api/students/:studentId/plan", async (req, res) => {
    const studentId = Number(req.params.studentId);
    const plan = await storage.getStudentPlan(studentId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  });
  
  app.post("/api/plans", async (req, res) => {
    try {
      const validated = insertGoodLifePlanSchema.parse(req.body);
      const plan = await storage.createPlan(validated);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });
  
  app.patch("/api/plans/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      const updateData = insertGoodLifePlanSchema.partial().parse(req.body);
      const updated = await storage.updatePlan(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });
  
  // Domain Plans
  app.get("/api/plans/:planId/domains", async (req, res) => {
    const planId = Number(req.params.planId);
    const domainPlans = await storage.getDomainPlans(planId);
    res.json(domainPlans);
  });
  
  app.get("/api/domain-plans/:id", async (req, res) => {
    const id = Number(req.params.id);
    const domainPlan = await storage.getDomainPlan(id);
    if (!domainPlan) {
      return res.status(404).json({ message: "Domain plan not found" });
    }
    res.json(domainPlan);
  });
  
  app.post("/api/domain-plans", async (req, res) => {
    try {
      const validated = insertDomainPlanSchema.parse(req.body);
      const domainPlan = await storage.createDomainPlan(validated);
      res.status(201).json(domainPlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain plan data" });
    }
  });
  
  app.patch("/api/domain-plans/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      const updateData = insertDomainPlanSchema.partial().parse(req.body);
      const updated = await storage.updateDomainPlan(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Domain plan not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain plan data" });
    }
  });
  
  // Case Studies
  app.get("/api/case-studies", async (req, res) => {
    const caseStudies = await storage.getCaseStudies();
    res.json(caseStudies);
  });
  
  app.get("/api/case-studies/:id", async (req, res) => {
    const id = Number(req.params.id);
    const caseStudy = await storage.getCaseStudy(id);
    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }
    res.json(caseStudy);
  });
  
  app.post("/api/case-studies", async (req, res) => {
    try {
      const validated = insertCaseStudySchema.parse(req.body);
      const caseStudy = await storage.createCaseStudy(validated);
      res.status(201).json(caseStudy);
    } catch (error) {
      res.status(400).json({ message: "Invalid case study data" });
    }
  });
  
  // Learning Modules
  app.get("/api/learning-modules", async (req, res) => {
    const modules = await storage.getLearningModules();
    res.json(modules);
  });
  
  app.get("/api/learning-modules/:id", async (req, res) => {
    const id = Number(req.params.id);
    const module = await storage.getLearningModule(id);
    if (!module) {
      return res.status(404).json({ message: "Learning module not found" });
    }
    res.json(module);
  });
  
  app.post("/api/learning-modules", async (req, res) => {
    try {
      const validated = insertLearningModuleSchema.parse(req.body);
      const module = await storage.createLearningModule(validated);
      res.status(201).json(module);
    } catch (error) {
      res.status(400).json({ message: "Invalid learning module data" });
    }
  });
  
  // Alerts
  app.get("/api/alerts", async (req, res) => {
    const facilitatorId = Number(req.query.facilitatorId);
    if (isNaN(facilitatorId)) {
      return res.status(400).json({ message: "Invalid facilitator ID" });
    }
    
    const alerts = await storage.getAlerts(facilitatorId);
    res.json(alerts);
  });
  
  app.get("/api/alerts/:id", async (req, res) => {
    const id = Number(req.params.id);
    const alert = await storage.getAlert(id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.json(alert);
  });
  
  app.post("/api/alerts", async (req, res) => {
    try {
      const validated = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validated);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });
  
  app.patch("/api/alerts/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const updated = await storage.updateAlertStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid status data" });
    }
  });
  
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    const facilitatorId = Number(req.query.facilitatorId);
    if (isNaN(facilitatorId)) {
      return res.status(400).json({ message: "Invalid facilitator ID" });
    }
    
    const stats = await storage.getDashboardStats(facilitatorId);
    res.json(stats);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
