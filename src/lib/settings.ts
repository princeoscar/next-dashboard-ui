// src/lib/settings.ts
import { SchoolSettings } from "@prisma/client";
import prisma from "./prisma";


export const ITEM_PER_PAGE = 10;

// --- SETTINGS FETCHERS ---

export const getSchoolSettings = async () => {
  return await prisma.schoolSettings.findUnique({
    where: { id: 1 },
  });
};

export const updateSchoolSettings = async (data: Partial<SchoolSettings>) => {
  return await prisma.schoolSettings.upsert({ // Fixed: lowercase prisma
    where: { id: 1 },
    update: data,
    create: { 
      id: 1, 
      schoolName: "Rubix Academy", // Default if creating for first time
      ...data 
    },
  });
};

// --- SECURITY MAP ---

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  // Lists & Features (Specific first)
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/lessons": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
  
  // Dashboard Overlays (General wildcards last)
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/student(.*)": ["student"],
  "/parent(.*)": ["parent"],
};