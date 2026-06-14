export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          course_code: string | null;
          participant_count: number;
          semester_label: string;
          status: "active" | "archived";
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          course_code?: string | null;
          participant_count?: number;
          semester_label: string;
          status?: "active" | "archived";
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          course_code?: string | null;
          participant_count?: number;
          semester_label?: string;
          status?: "active" | "archived";
        };
        Relationships: [];
      };
      material_distributions: {
        Row: {
          class_id: string;
          created_at: string;
          distributed_at: string;
          id: string;
          material_id: string;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          distributed_at?: string;
          id?: string;
          material_id: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          distributed_at?: string;
          id?: string;
          material_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "material_distributions_class_id_fkey";
            columns: ["class_id"];
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "material_distributions_material_id_fkey";
            columns: ["material_id"];
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          description: string | null;
          id: string;
          mime_type: string;
          original_file_name: string;
          public_url: string;
          size_bytes: number;
          storage_path: string;
          title: string;
          material_type: "pdf" | "docx" | "pptx" | "xlsx" | "link" | "other";
          uploaded_at: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          mime_type: string;
          original_file_name: string;
          public_url: string;
          size_bytes: number;
          storage_path: string;
          title: string;
          material_type?: "pdf" | "docx" | "pptx" | "xlsx" | "link" | "other";
          uploaded_at?: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          mime_type?: string;
          original_file_name?: string;
          public_url?: string;
          size_bytes?: number;
          storage_path?: string;
          title?: string;
          material_type?: "pdf" | "docx" | "pptx" | "xlsx" | "link" | "other";
          uploaded_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
