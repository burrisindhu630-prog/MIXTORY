import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Project,
  CreativeCategory,
  ProjectStatus,
  CollaborationRequest,
  UserProfile,
  SupabaseConfigStatus,
  PortfolioItem
} from '../types';
import { DataService, inspectDatabaseSchema } from '../lib/supabase';
import { DEMO_USERS } from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  projects: Project[];
  loading: boolean;
  error: string | null;
  dataSource: 'supabase' | 'sandbox';
  supabaseStatus: SupabaseConfigStatus;
  likedProjectIds: Set<string>;
  savedProjectIds: Set<string>;
  collabRequests: CollaborationRequest[];
  portfolioItems: PortfolioItem[];
  viewingCreator: UserProfile | null;
  setViewingCreator: (creator: UserProfile | null) => void;
  openCreatorProfile: (creator: UserProfile) => void;
  
  // Navigation & Filters
  selectedCategory: CreativeCategory | 'All';
  setSelectedCategory: (cat: CreativeCategory | 'All') => void;
  selectedStatus: ProjectStatus | 'All';
  setSelectedStatus: (status: ProjectStatus | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: 'feed' | 'collaborations' | 'saved' | 'my-projects' | 'collaborators';
  setActiveView: (view: 'feed' | 'collaborations' | 'saved' | 'my-projects' | 'collaborators') => void;
  creators: UserProfile[];
  selectedSkillFilter: string | null;
  setSelectedSkillFilter: (skill: string | null) => void;

  // Actions
  toggleLike: (projectId: string) => void;
  toggleSave: (projectId: string) => void;
  createProject: (projectData: Partial<Project>) => Promise<boolean>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  sendCollabRequest: (projectId: string, roleOffered: string, message: string, portfolioLink?: string) => Promise<boolean>;
  respondToCollabRequest: (requestId: string, status: 'accepted' | 'declined' | 'withdrawn') => Promise<boolean>;
  withdrawCollabRequest: (requestId: string) => Promise<boolean>;
  switchUser: (user: UserProfile) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  recheckSupabase: () => Promise<void>;

  // Talent Portfolio Actions
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'created_at' | 'creator_id'>) => Promise<boolean>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<boolean>;
  deletePortfolioItem: (id: string) => Promise<boolean>;
  uploadPortfolioFile: (file: File) => Promise<{ url: string | null; error?: string }>;
  getCreatorPortfolio: (creatorId: string) => PortfolioItem[];

  // Modal / Sheet Controllers
  activeModal: 'create-project' | 'project-detail' | 'collab-request' | 'collab-inbox' | 'profile' | 'auth' | 'supabase-inspector' | null;
  setActiveModal: (modal: 'create-project' | 'project-detail' | 'collab-request' | 'collab-inbox' | 'profile' | 'auth' | 'supabase-inspector' | null) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DataService.getCurrentUser());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'sandbox'>('sandbox');
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus>({
    isConfigured: false,
    schemaChecked: false,
    tableProjectsFound: null,
    tableProfilesFound: null,
    tableRequestsFound: null
  });

  const [likedProjectIds, setLikedProjectIds] = useState<Set<string>>(new Set(DataService.getLikedProjectIds()));
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set(DataService.getSavedProjectIds()));
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [viewingCreator, setViewingCreator] = useState<UserProfile | null>(null);
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null);

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'feed' | 'collaborations' | 'saved' | 'my-projects' | 'collaborators'>('feed');

  // Modal controllers
  const [activeModal, setActiveModal] = useState<'create-project' | 'project-detail' | 'collab-request' | 'collab-inbox' | 'profile' | 'auth' | 'supabase-inspector' | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  const openCreatorProfile = (creator: UserProfile) => {
    setViewingCreator(creator);
    setActiveModal('profile');
  };

  // Initial Data Load & Schema Inspection
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        // Inspect Supabase status
        const status = await inspectDatabaseSchema();
        setSupabaseStatus(status);

        // Fetch projects
        const { data, source } = await DataService.getProjects();
        setProjects(data);
        setDataSource(source);

        // Fetch creators / profiles
        const profilesRes = await DataService.getProfiles();
        setCreators(profilesRes.data);

        // Fetch collaboration requests
        const requests = await DataService.getCollaborationRequests();
        setCollabRequests(requests);

        // Fetch portfolio items
        const portfolio = await DataService.getPortfolioItems();
        setPortfolioItems(portfolio);
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize MIXTORY projects.');
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const recheckSupabase = async () => {
    showToast('Inspecting Supabase backend connection...', 'info');
    const status = await inspectDatabaseSchema();
    setSupabaseStatus(status);
    const { data, source } = await DataService.getProjects();
    setProjects(data);
    setDataSource(source);
    const profs = await DataService.getProfiles();
    setCreators(profs.data);
    const portfolio = await DataService.getPortfolioItems();
    setPortfolioItems(portfolio);
    showToast(status.isConfigured ? 'Supabase re-probed successfully!' : 'Running in Sandbox mode (credentials not found).', 'info');
  };

  // Likes handling
  const toggleLike = (projectId: string) => {
    setLikedProjectIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(projectId);
      if (isLiked) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      DataService.saveLikedProjectIds(Array.from(next));

      // Update project count & persist to Supabase
      setProjects(curr =>
        curr.map(p => {
          if (p.id === projectId) {
            const nextCount = Math.max(0, p.likes_count + (isLiked ? -1 : 1));
            DataService.updateProjectLikes(projectId, nextCount);
            return { ...p, likes_count: nextCount };
          }
          return p;
        })
      );

      // Keep selected project in sync
      if (selectedProject?.id === projectId) {
        setSelectedProject(curr =>
          curr
            ? {
                ...curr,
                likes_count: Math.max(0, curr.likes_count + (isLiked ? -1 : 1))
              }
            : null
        );
      }

      showToast(isLiked ? 'Removed from your likes' : 'Applauded project!', 'success');
      return next;
    });
  };

  // Saves handling
  const toggleSave = (projectId: string) => {
    setSavedProjectIds(prev => {
      const next = new Set(prev);
      const isSaved = next.has(projectId);
      if (isSaved) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      DataService.saveSavedProjectIds(Array.from(next));

      setProjects(curr =>
        curr.map(p =>
          p.id === projectId
            ? { ...p, saves_count: Math.max(0, p.saves_count + (isSaved ? -1 : 1)) }
            : p
        )
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(curr =>
          curr
            ? {
                ...curr,
                saves_count: Math.max(0, curr.saves_count + (isSaved ? -1 : 1))
              }
            : null
        );
      }

      showToast(isSaved ? 'Project removed from saved collection' : 'Saved project to your library', 'success');
      return next;
    });
  };

  // Create Project
  const createProject = async (projectData: Partial<Project>): Promise<boolean> => {
    if (!currentUser) {
      setActiveModal('auth');
      showToast('Please sign in to publish a project.', 'info');
      return false;
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: projectData.title || 'Untitled Project',
      description: projectData.description || '',
      category: projectData.category || 'Art',
      status: projectData.status || 'Idea',
      required_skills: projectData.required_skills || [],
      creator_id: currentUser.id,
      creator: currentUser,
      likes_count: 0,
      saves_count: 0,
      views_count: 1,
      created_at: new Date().toISOString().split('T')[0],
      visibility: projectData.visibility || 'public',
      cover_image: projectData.cover_image || '/src/assets/images/mixtory_all_talents_hero_1793239768355.jpg',
      demo_link: projectData.demo_link || '',
      open_for_collab: projectData.open_for_collab ?? true,
      completion_percentage: projectData.completion_percentage ?? (projectData.status === 'Finished' ? 100 : projectData.status === 'Unfinished' ? 50 : 20)
    };

    const res = await DataService.createProject(newProject);
    if (res.success) {
      setProjects(prev => [res.data, ...prev]);
      showToast(`"${newProject.title}" published to MIXTORY!`, 'success');
      setActiveModal(null);
      return true;
    }
    showToast('Failed to publish project', 'error');
    return false;
  };

  // Update Project
  const updateProject = async (id: string, updates: Partial<Project>): Promise<boolean> => {
    const res = await DataService.updateProject(id, updates);
    if (res.success) {
      setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
      if (selectedProject?.id === id) {
        setSelectedProject(prev => (prev ? { ...prev, ...updates } : null));
      }
      showToast('Project updated successfully', 'success');
      return true;
    }
    showToast('Failed to update project', 'error');
    return false;
  };

  // Delete Project
  const deleteProject = async (id: string): Promise<boolean> => {
    const res = await DataService.deleteProject(id);
    if (res.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setActiveModal(null);
      }
      showToast('Project removed', 'info');
      return true;
    }
    return false;
  };

  // Send Collaboration Request
  const sendCollabRequest = async (
    projectId: string,
    roleOffered: string,
    message: string,
    portfolioLink?: string
  ): Promise<boolean> => {
    if (!currentUser) {
      setActiveModal('auth');
      showToast('Sign in or choose a demo creator to send collaboration requests.', 'info');
      return false;
    }

    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return false;

    if (targetProject.creator_id === currentUser.id) {
      showToast('You are the creator of this project!', 'info');
      return false;
    }

    const newRequest: CollaborationRequest = {
      id: `collab_${Date.now()}`,
      project_id: projectId,
      project_title: targetProject.title,
      project_category: targetProject.category,
      sender_id: currentUser.id,
      sender: currentUser,
      receiver_id: targetProject.creator_id,
      role_offered: roleOffered,
      message,
      portfolio_link: portfolioLink,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const res = await DataService.sendCollaborationRequest(newRequest);
    if (res.success) {
      setCollabRequests(prev => [res.data, ...prev]);
      showToast(`Collaboration pitch sent to ${targetProject.creator.name}!`, 'success');
      setActiveModal(null);
      return true;
    }
    showToast('Unable to send request', 'error');
    return false;
  };

  // Respond to or update incoming/outgoing Collaboration Request
  const respondToCollabRequest = async (
    requestId: string,
    status: 'accepted' | 'declined' | 'withdrawn'
  ): Promise<boolean> => {
    try {
      const res = await DataService.updateCollabStatus(requestId, status);
      if (res.success) {
        setCollabRequests(prev =>
          prev.map(r => (r.id === requestId ? { ...r, status } : r))
        );
        if (status === 'accepted') {
          showToast('Collaboration accepted! Contact shared.', 'success');
        } else if (status === 'declined') {
          showToast('Collaboration request declined.', 'info');
        } else if (status === 'withdrawn') {
          showToast('Collaboration pitch withdrawn.', 'info');
        }
        return true;
      } else {
        showToast(res.error || 'Failed to update request status', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating collaboration request', 'error');
      return false;
    }
  };

  // Withdraw an outgoing collaboration request
  const withdrawCollabRequest = async (requestId: string): Promise<boolean> => {
    return respondToCollabRequest(requestId, 'withdrawn');
  };

  // Switch demo user
  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    DataService.setCurrentUser(user);
    showToast(`Switched active creator profile to ${user.name} (${user.discipline})`, 'info');
  };

  const loginUser = (email: string, name?: string) => {
    const existing = DEMO_USERS.find(u => u.username.toLowerCase() === email.split('@')[0].toLowerCase());
    const userToSet: UserProfile = existing || {
      id: `user_${Date.now()}`,
      name: name || email.split('@')[0],
      username: email.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      discipline: 'Filmmaking',
      bio: 'Creative collaborator on MIXTORY.',
      skills: ['Storyboarding', 'Production', 'Direction'],
      location: 'Remote',
      created_at: new Date().toISOString()
    };
    setCurrentUser(userToSet);
    DataService.setCurrentUser(userToSet);
    showToast(`Welcome back, ${userToSet.name}!`, 'success');
    setActiveModal(null);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('Signed out of MIXTORY.', 'info');
  };

  // Update user profile (roles, needs, bio, skills)
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    DataService.setCurrentUser(updated);
    await DataService.updateProfile(currentUser.id, updates);
    setCreators(prev => prev.map(c => (c.id === currentUser.id ? { ...c, ...updates } : c)));
    showToast('Your profile and collaboration needs updated!', 'success');
    return true;
  };

  // Talent Portfolio Operations
  const getCreatorPortfolio = (creatorId: string): PortfolioItem[] => {
    return portfolioItems.filter(item => item.creator_id === creatorId);
  };

  const addPortfolioItem = async (
    itemData: Omit<PortfolioItem, 'id' | 'created_at' | 'creator_id'>
  ): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to add portfolio items', 'error');
      return false;
    }

    const newItem: PortfolioItem = {
      ...itemData,
      id: `pf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      creator_id: currentUser.id,
      created_at: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await DataService.addPortfolioItem(newItem);
      if (res.success) {
        setPortfolioItems(prev => [res.data, ...prev.filter(p => p.id !== res.data.id)]);
        showToast(`Added "${newItem.title}" to your talent portfolio!`, 'success');
        return true;
      } else {
        showToast(res.error || 'Failed to add portfolio item', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving portfolio item', 'error');
      return false;
    }
  };

  const updatePortfolioItem = async (
    id: string,
    updates: Partial<PortfolioItem>
  ): Promise<boolean> => {
    try {
      const res = await DataService.updatePortfolioItem(id, updates);
      if (res.success && res.data) {
        setPortfolioItems(prev => prev.map(p => (p.id === id ? res.data! : p)));
        showToast('Portfolio item updated successfully!', 'success');
        return true;
      } else {
        showToast(res.error || 'Failed to update portfolio item', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating portfolio item', 'error');
      return false;
    }
  };

  const deletePortfolioItem = async (id: string): Promise<boolean> => {
    try {
      const res = await DataService.deletePortfolioItem(id);
      if (res.success) {
        setPortfolioItems(prev => prev.filter(p => p.id !== id));
        showToast('Portfolio item removed from profile.', 'info');
        return true;
      } else {
        showToast(res.error || 'Failed to remove portfolio item', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || 'Error removing portfolio item', 'error');
      return false;
    }
  };

  const uploadPortfolioFile = async (file: File): Promise<{ url: string | null; error?: string }> => {
    return DataService.uploadPortfolioMedia(file);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      projects,
      loading,
      error,
      dataSource,
      supabaseStatus,
      likedProjectIds,
      savedProjectIds,
      collabRequests,
      portfolioItems,
      viewingCreator,
      setViewingCreator,
      openCreatorProfile,
      creators,
      selectedSkillFilter,
      setSelectedSkillFilter,
      selectedCategory,
      setSelectedCategory,
      selectedStatus,
      setSelectedStatus,
      searchQuery,
      setSearchQuery,
      activeView,
      setActiveView,
      toggleLike,
      toggleSave,
      createProject,
      updateProject,
      deleteProject,
      updateUserProfile,
      sendCollabRequest,
      respondToCollabRequest,
      withdrawCollabRequest,
      switchUser,
      loginUser,
      logoutUser,
      recheckSupabase,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      uploadPortfolioFile,
      getCreatorPortfolio,
      activeModal,
      setActiveModal,
      selectedProject,
      setSelectedProject,
      toast,
      showToast
    }),
    [
      currentUser,
      projects,
      loading,
      error,
      dataSource,
      supabaseStatus,
      likedProjectIds,
      savedProjectIds,
      collabRequests,
      portfolioItems,
      viewingCreator,
      creators,
      selectedSkillFilter,
      selectedCategory,
      selectedStatus,
      searchQuery,
      activeView,
      activeModal,
      selectedProject,
      toast
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
