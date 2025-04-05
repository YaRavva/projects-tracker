export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export type ProjectMemberRole = 'leader' | 'member';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  created_at: string;
  user?: Profile;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  class: string | null;
  role: 'student' | 'admin' | 'guest';
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  members: (ProjectMember & { user: Profile })[];
  stages: ProjectStage[];
  links: ProjectLink[];
  progress: number; // Процент выполнения от 0 до 100
} 