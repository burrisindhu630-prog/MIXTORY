export type CreativeCategory =
  | 'Music'
  | 'Singing'
  | 'Dance'
  | 'Art'
  | 'Writing'
  | 'Filmmaking'
  | 'Video Editing';

export type ProjectStatus = 'Finished' | 'Unfinished' | 'Idea';

export type ProjectVisibility = 'public' | 'community' | 'unlisted';

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: CreativeCategory;
  media_type: 'audio' | 'video' | 'image' | 'link';
  media_url: string;
  skills_used: string[];
  completed_project_title?: string;
  project_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  discipline: CreativeCategory | string;
  bio: string;
  skills: string[];
  roles?: string[];
  needs_and_talents_wanted?: string[];
  seeking_description?: string;
  location?: string;
  portfolio_url?: string;
  portfolio?: PortfolioItem[];
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: CreativeCategory;
  status: ProjectStatus;
  required_skills: string[];
  creator_id: string;
  creator: UserProfile;
  likes_count: number;
  saves_count: number;
  views_count: number;
  created_at: string;
  visibility: ProjectVisibility;
  cover_image: string;
  demo_link?: string;
  audio_preview_url?: string;
  open_for_collab: boolean;
  completion_percentage?: number;
}

export interface CollaborationRequest {
  id: string;
  project_id: string;
  project_title: string;
  project_category: CreativeCategory;
  sender_id: string;
  sender: UserProfile;
  receiver_id: string;
  role_offered: string;
  message: string;
  portfolio_link?: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl?: string;
  schemaChecked: boolean;
  tableProjectsFound: boolean | null;
  tableProfilesFound: boolean | null;
  tableRequestsFound: boolean | null;
  lastError?: string | null;
}
