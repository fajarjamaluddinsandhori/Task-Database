export const classStatusList = ["active", "archived"] as const;
export const materialTypeList = [
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "link",
  "other",
] as const;
export const materialStorageBucket = "materials";

export type ClassStatus = (typeof classStatusList)[number];
export type MaterialType = (typeof materialTypeList)[number];

export interface Classroom {
  id: string;
  name: string;
  courseCode: string | null;
  semesterLabel: string;
  participantCount: number;
  status: ClassStatus;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string | null;
  originalFileName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  materialType: MaterialType;
  uploadedAt: string;
}

export interface MaterialDistribution {
  id: string;
  classId: string;
  materialId: string;
  distributedAt: string;
  className: string;
  courseCode: string | null;
  semesterLabel: string;
  materialTitle: string;
  originalFileName: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  helperText: string;
}

export interface DashboardSummary {
  classCount: number;
  materialCount: number;
  distributionCount: number;
  latestDistributions: MaterialDistribution[];
}

export interface SetupStatus {
  isConfigured: boolean;
  mode: "supabase" | "local";
  missingKeys: string[];
  message: string;
}

export interface ActionState {
  status: "idle" | "success" | "error" | "setup";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
