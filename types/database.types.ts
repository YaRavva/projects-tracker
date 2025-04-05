export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
          deadline: string | null
          progress: number
          repository_url: string | null
          demo_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
          deadline?: string | null
          progress?: number
          repository_url?: string | null
          demo_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
          deadline?: string | null
          progress?: number
          repository_url?: string | null
          demo_url?: string | null
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      project_stages: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          deadline: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_meta: {
        Row: {
          id: string
          project_id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      project_links: {
        Row: {
          id: string
          project_id: string
          title: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          url?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 