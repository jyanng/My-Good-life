import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (facilitators)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("facilitator"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
});

// Student schema
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  school: text("school"),
  graduationDate: text("graduation_date"),
  age: integer("age"),
  avatarUrl: text("avatar_url"),
  status: text("status").notNull().default("active"),
  facilitatorId: integer("facilitator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  email: true,
  phone: true,
  school: true,
  graduationDate: true,
  age: true,
  avatarUrl: true,
  status: true,
  facilitatorId: true,
});

// Profile schema for "About Me" data
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  likes: text("likes").array(),
  dislikes: text("dislikes").array(),
  strengths: text("strengths").array(),
  peopleAppreciate: text("people_appreciate").array(),
  importantToMe: text("important_to_me").array(),
  bestSupport: text("best_support").array(),
  importantToFamily: text("important_to_family").array(),
  bestSupportFamily: text("best_support_family").array(),
  personalityTags: text("personality_tags").array(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  studentId: true,
  likes: true,
  dislikes: true,
  strengths: true,
  peopleAppreciate: true,
  importantToMe: true,
  bestSupport: true,
  importantToFamily: true,
  bestSupportFamily: true,
  personalityTags: true,
});

// Domain confidence schema
export const domainConfidence = pgTable("domain_confidence", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  safeScore: integer("safe_score").default(0),
  healthyScore: integer("healthy_score").default(0),
  engagedScore: integer("engaged_score").default(0),
  connectedScore: integer("connected_score").default(0),
  independentScore: integer("independent_score").default(0),
  includedScore: integer("included_score").default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDomainConfidenceSchema = createInsertSchema(domainConfidence).pick({
  studentId: true,
  safeScore: true,
  healthyScore: true,
  engagedScore: true,
  connectedScore: true,
  independentScore: true,
  includedScore: true,
});

// GoodLife Plans
export const goodLifePlans = pgTable("good_life_plans", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull().default("in_progress"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGoodLifePlanSchema = createInsertSchema(goodLifePlans).pick({
  studentId: true,
  status: true,
  progress: true,
});

// Domain Plans
export const domainPlans = pgTable("domain_plans", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  domain: text("domain").notNull(),
  vision: text("vision"),
  visionAge: integer("vision_age").default(30),
  visionMedia: text("vision_media"),
  goals: jsonb("goals").default([]),
  completed: boolean("completed").default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDomainPlanSchema = createInsertSchema(domainPlans).pick({
  planId: true,
  domain: true,
  vision: true,
  visionAge: true,
  visionMedia: true,
  goals: true,
  completed: true,
});

// Case Studies
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domains: text("domains").array(),
  content: text("content").notNull(),
  goodLifeVision: text("good_life_vision"),
  mediaUrls: text("media_urls").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).pick({
  title: true,
  description: true,
  domains: true,
  content: true,
  goodLifeVision: true, 
  mediaUrls: true,
});

// Learning Modules
export const learningModules = pgTable("learning_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLearningModuleSchema = createInsertSchema(learningModules).pick({
  title: true,
  description: true,
  videoUrl: true,
  duration: true,
  category: true,
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  facilitatorId: integer("facilitator_id").notNull(),
  studentId: integer("student_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  facilitatorId: true,
  studentId: true,
  type: true,
  message: true,
  status: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type DomainConfidence = typeof domainConfidence.$inferSelect;
export type InsertDomainConfidence = z.infer<typeof insertDomainConfidenceSchema>;

export type GoodLifePlan = typeof goodLifePlans.$inferSelect;
export type InsertGoodLifePlan = z.infer<typeof insertGoodLifePlanSchema>;

export type DomainPlan = typeof domainPlans.$inferSelect;
export type InsertDomainPlan = z.infer<typeof insertDomainPlanSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

export type LearningModule = typeof learningModules.$inferSelect;
export type InsertLearningModule = z.infer<typeof insertLearningModuleSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
