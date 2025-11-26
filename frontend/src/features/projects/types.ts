// src/features/projects/types.ts

export interface ProjectCreatePayload {
    title: string;
    description: string;
  }
  
  export interface ProjectResponse {
    id: number;
    title: string;
    description: string;
    owner_id: number;
    created_at: string; // ISO string venant du backend
  }
  