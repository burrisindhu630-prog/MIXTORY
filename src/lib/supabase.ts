import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfigStatus, Project, CollaborationRequest, UserProfile, PortfolioItem } from '../types';
import { INITIAL_PROJECTS, INITIAL_COLLAB_REQUESTS, DEMO_USERS, INITIAL_PORTFOLIO_ITEMS } from '../data/mockData';

// Safely read environment variables without leaking credentials in code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-or-publishable-key'
);

// Initialize client if environment variables are supplied
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage key constants for sandbox persistence
const STORAGE_PROJECTS_KEY = 'mixtory_projects_v2';
const STORAGE_COLLABS_KEY = 'mixtory_collabs_v1';
const STORAGE_USER_KEY = 'mixtory_current_user_v1';
const STORAGE_SAVED_KEY = 'mixtory_saved_project_ids_v1';
const STORAGE_LIKED_KEY = 'mixtory_liked_project_ids_v1';
const STORAGE_PORTFOLIO_KEY = 'mixtory_portfolios_v1';

// Schema & Connection Inspector
export async function inspectDatabaseSchema(): Promise<SupabaseConfigStatus> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      isConfigured: false,
      supabaseUrl: supabaseUrl ? `${supabaseUrl.slice(0, 16)}...` : undefined,
      schemaChecked: true,
      tableProjectsFound: false,
      tableProfilesFound: false,
      tableRequestsFound: false,
      lastError: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.'
    };
  }

  let tableProjectsFound = false;
  let tableProfilesFound = false;
  let tableRequestsFound = false;
  let lastError: string | null = null;

  try {
    // Test 'projects' table presence
    const projTest = await supabase.from('projects').select('id').limit(1);
    if (!projTest.error) {
      tableProjectsFound = true;
    } else {
      if (projTest.error.code === 'PGRST204' || projTest.error.message.includes('does not exist')) {
        tableProjectsFound = false;
      } else {
        lastError = projTest.error.message;
      }
    }
  } catch (err: any) {
    lastError = err?.message || 'Error checking projects table';
  }

  try {
    // Test 'profiles' table presence
    const profTest = await supabase.from('profiles').select('id').limit(1);
    if (!profTest.error) {
      tableProfilesFound = true;
    } else if (profTest.error.code === 'PGRST204' || profTest.error.message.includes('does not exist')) {
      tableProfilesFound = false;
    }
  } catch {
    // Safe ignore
  }

  return {
    isConfigured: true,
    supabaseUrl: `${supabaseUrl.slice(0, 24)}...`,
    schemaChecked: true,
    tableProjectsFound,
    tableProfilesFound,
    tableRequestsFound: null,
    lastError
  };
}

// Data persistence helpers: seamlessly bridges Supabase or local sandbox
export const DataService = {
  // Load Projects
  async getProjects(): Promise<{ data: Project[]; source: 'supabase' | 'sandbox' }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return { data: data as Project[], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to sandbox seed', err);
      }
    }

    // Local storage fallback for instant demo readiness
    try {
      const stored = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed, source: 'sandbox' };
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error', e);
    }

    // Seed default projects
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    } catch {}

    return { data: INITIAL_PROJECTS, source: 'sandbox' };
  },

  // Save/Create a Project
  async createProject(project: Project): Promise<{ success: boolean; data: Project }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([project])
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as Project };
        }
      } catch (err) {
        console.warn('Supabase create failed, syncing locally', err);
      }
    }

    // Local persistence
    const currentList = (await this.getProjects()).data;
    const updated = [project, ...currentList.filter(p => p.id !== project.id)];
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updated));
    return { success: true, data: project };
  },

  // Update a Project
  async updateProject(id: string, updates: Partial<Project>): Promise<{ success: boolean }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id);

        if (!error) return { success: true };
      } catch (err) {
        console.warn('Supabase update failed', err);
      }
    }

    const currentList = (await this.getProjects()).data;
    const updated = currentList.map(p => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updated));
    return { success: true };
  },

  // Delete a Project
  async deleteProject(id: string): Promise<{ success: boolean }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Supabase delete failed', err);
      }
    }

    const currentList = (await this.getProjects()).data;
    const updated = currentList.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(updated));
    return { success: true };
  },

  // Load Collaboration Requests
  async getCollaborationRequests(): Promise<CollaborationRequest[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('collaborations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as CollaborationRequest[];
        }
      } catch (err) {
        console.warn('Supabase requests fetch failed', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_COLLABS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    try {
      localStorage.setItem(STORAGE_COLLABS_KEY, JSON.stringify(INITIAL_COLLAB_REQUESTS));
    } catch {}

    return INITIAL_COLLAB_REQUESTS;
  },

  // Create Collaboration Request
  async sendCollaborationRequest(req: CollaborationRequest): Promise<{ success: boolean; data: CollaborationRequest }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('collaborations')
          .insert([req])
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as CollaborationRequest };
        }
      } catch (err) {
        console.warn('Supabase request send failed', err);
      }
    }

    const current = await this.getCollaborationRequests();
    const updated = [req, ...current];
    localStorage.setItem(STORAGE_COLLABS_KEY, JSON.stringify(updated));
    return { success: true, data: req };
  },

  // Update Request Status (accepted / declined / withdrawn)
  async updateCollabStatus(
    id: string,
    status: 'accepted' | 'declined' | 'withdrawn'
  ): Promise<{ success: boolean; error?: string }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('collaborations')
          .update({ status })
          .eq('id', id);

        if (!error) {
          const current = await this.getCollaborationRequests();
          const updated = current.map(r => (r.id === id ? { ...r, status } : r));
          localStorage.setItem(STORAGE_COLLABS_KEY, JSON.stringify(updated));
          return { success: true };
        }
        console.warn('Supabase update status note:', error.message);
      } catch (err: any) {
        console.warn('Supabase update status exception:', err);
      }
    }

    const current = await this.getCollaborationRequests();
    const updated = current.map(r => (r.id === id ? { ...r, status } : r));
    localStorage.setItem(STORAGE_COLLABS_KEY, JSON.stringify(updated));
    return { success: true };
  },

  // Load Creators / Profiles
  async getProfiles(): Promise<{ data: UserProfile[]; source: 'supabase' | 'sandbox' }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return { data: data as UserProfile[], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase profiles fetch failed, using seed data', err);
      }
    }

    try {
      const stored = localStorage.getItem('mixtory_profiles_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed, source: 'sandbox' };
        }
      }
    } catch {}

    try {
      localStorage.setItem('mixtory_profiles_v1', JSON.stringify(DEMO_USERS));
    } catch {}

    return { data: DEMO_USERS, source: 'sandbox' };
  },

  // Update a Creator Profile
  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', id);

        if (!error) return true;
      } catch (err) {
        console.warn('Supabase profile update failed', err);
      }
    }

    try {
      const stored = localStorage.getItem('mixtory_profiles_v1');
      const list: UserProfile[] = stored ? JSON.parse(stored) : DEMO_USERS;
      const updated = list.map(u => (u.id === id ? { ...u, ...updates } : u));
      localStorage.setItem('mixtory_profiles_v1', JSON.stringify(updated));
    } catch {}
    return true;
  },

  // Update Project Likes in Backend
  async updateProjectLikes(id: string, likes_count: number): Promise<void> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('projects').update({ likes_count }).eq('id', id);
      } catch (err) {
        console.warn('Failed to update likes in Supabase', err);
      }
    }
  },

  // Likes & Saves State
  getLikedProjectIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_LIKED_KEY);
      return stored ? JSON.parse(stored) : ['proj_01', 'proj_04'];
    } catch {
      return ['proj_01', 'proj_04'];
    }
  },

  saveLikedProjectIds(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_LIKED_KEY, JSON.stringify(ids));
    } catch {}
  },

  getSavedProjectIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : ['proj_02', 'proj_03'];
    } catch {
      return ['proj_02', 'proj_03'];
    }
  },

  saveSavedProjectIds(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(ids));
    } catch {}
  },

  // User Profile
  getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default logged in creator is Maya Thorne
    return DEMO_USERS[0];
  },

  setCurrentUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } catch {}
  },

  // Talent Portfolio Operations
  async getPortfolioItems(creatorId?: string): Promise<PortfolioItem[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        let query = supabase
          .from('portfolio_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (creatorId) {
          query = query.eq('creator_id', creatorId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as PortfolioItem[];
        }
      } catch (err) {
        console.warn('Supabase portfolio fetch failed, falling back to local store', err);
      }
    }

    // LocalStorage fallback
    try {
      const stored = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
      if (stored) {
        const parsed: PortfolioItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return creatorId ? parsed.filter(item => item.creator_id === creatorId) : parsed;
        }
      }
    } catch {}

    // Seed default portfolio items
    try {
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(INITIAL_PORTFOLIO_ITEMS));
    } catch {}

    return creatorId
      ? INITIAL_PORTFOLIO_ITEMS.filter(item => item.creator_id === creatorId)
      : INITIAL_PORTFOLIO_ITEMS;
  },

  async addPortfolioItem(item: PortfolioItem): Promise<{ success: boolean; data: PortfolioItem; error?: string }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .insert([item])
          .select()
          .single();

        if (!error && data) {
          // Sync locally as well
          const current = await this.getPortfolioItems();
          const updated = [data as PortfolioItem, ...current.filter(p => p.id !== item.id)];
          localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
          return { success: true, data: data as PortfolioItem };
        }
      } catch (err) {
        console.warn('Supabase portfolio insert failed, falling back to local', err);
      }
    }

    // Local persistence
    const current = await this.getPortfolioItems();
    const updated = [item, ...current.filter(p => p.id !== item.id)];
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    return { success: true, data: item };
  },

  async updatePortfolioItem(
    id: string,
    updates: Partial<PortfolioItem>
  ): Promise<{ success: boolean; data?: PortfolioItem; error?: string }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const current = await this.getPortfolioItems();
          const updated = current.map(p => (p.id === id ? (data as PortfolioItem) : p));
          localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
          return { success: true, data: data as PortfolioItem };
        }
      } catch (err) {
        console.warn('Supabase portfolio update failed, applying locally', err);
      }
    }

    const current = await this.getPortfolioItems();
    let updatedItem: PortfolioItem | undefined;
    const updated = current.map(p => {
      if (p.id === id) {
        updatedItem = { ...p, ...updates };
        return updatedItem;
      }
      return p;
    });
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    return { success: true, data: updatedItem };
  },

  async deletePortfolioItem(id: string): Promise<{ success: boolean; error?: string }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('portfolio_items')
          .delete()
          .eq('id', id);

        if (!error) {
          const current = await this.getPortfolioItems();
          const updated = current.filter(p => p.id !== id);
          localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase portfolio delete failed, deleting locally', err);
      }
    }

    const current = await this.getPortfolioItems();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    return { success: true };
  },

  // Storage Upload: inspects configured Supabase storage, or falls back to local data URL
  async uploadPortfolioMedia(file: File): Promise<{ url: string | null; error?: string }> {
    if (file.size > 12 * 1024 * 1024) {
      return { url: null, error: 'File size exceeds 12MB limit. Please upload a smaller media asset.' };
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `portfolio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        // Attempt upload to 'portfolio' bucket or 'avatars'
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('portfolio').getPublicUrl(fileName);
          if (data?.publicUrl) {
            return { url: data.publicUrl };
          }
        } else {
          console.info('Supabase storage bucket note:', uploadError.message);
        }
      } catch (storageErr: any) {
        console.warn('Supabase storage check:', storageErr?.message);
      }
    }

    // Direct browser preview fallback for image/audio files
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Failed to read media file.' });
      };
      reader.readAsDataURL(file);
    });
  }
};
