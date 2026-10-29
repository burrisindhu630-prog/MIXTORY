import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryNav } from './components/CategoryNav';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { CollabRequestModal } from './components/CollabRequestModal';
import { CollabInboxModal } from './components/CollabInboxModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { AuthModal } from './components/AuthModal';
import { FindCollaborators } from './components/FindCollaborators';
import {
  Sparkles,
  Bookmark,
  MessageSquare,
  Plus,
  Compass,
  AlertCircle,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Heart
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    projects,
    loading,
    error,
    selectedCategory,
    selectedStatus,
    searchQuery,
    activeView,
    setActiveView,
    savedProjectIds,
    currentUser,
    setActiveModal,
    activeModal,
    toast,
    supabaseStatus,
    selectedSkillFilter,
    setSelectedSkillFilter
  } = useApp();

  // Filter projects according to view, category, status, required skill, search, and visibility
  const filteredProjects = projects.filter(project => {
    // Privacy filter: Unlisted projects only shown to owner unless direct ID matched
    if (project.visibility === 'unlisted' && project.creator_id !== currentUser?.id) {
      return false;
    }
    if (project.visibility === 'community' && !currentUser) {
      return false;
    }

    // View filter
    if (activeView === 'saved') {
      if (!savedProjectIds.has(project.id)) return false;
    }
    if (activeView === 'my-projects') {
      if (project.creator_id !== currentUser?.id) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && project.category !== selectedCategory) {
      return false;
    }

    // Completion Status filter
    if (selectedStatus !== 'All' && project.status !== selectedStatus) {
      return false;
    }

    // Required Skill Filter (Cross-category matching e.g. Musician finding Dancers)
    if (selectedSkillFilter) {
      const matchSkill = project.required_skills?.some(s =>
        s.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      );
      if (!matchSkill) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchCategory = project.category.toLowerCase().includes(q);
      const matchCreator = project.creator.name.toLowerCase().includes(q);
      const matchSkill = project.required_skills?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCategory && !matchCreator && !matchSkill) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100">
      {/* Top Bar Navigation */}
      <Header />

      {/* Hero section only on main feed */}
      {activeView === 'feed' && !searchQuery && selectedCategory === 'All' && selectedStatus === 'All' && (
        <HeroSection />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Supabase Sandbox indicator banner for clarity */}
        {!supabaseStatus.isConfigured && (
          <div className="mb-6 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-cyan-200">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Sandbox Demo Mode Active:</strong> Full project discovery, co-creation pitches, and saves are operational. Set <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">VITE_SUPABASE_URL</code> to link your team's existing backend.
              </span>
            </div>
            <button
              onClick={() => setActiveModal('supabase-inspector')}
              className="px-2.5 py-1 text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-semibold rounded text-[11px] whitespace-nowrap transition-colors"
            >
              Inspect Backend
            </button>
          </div>
        )}

        {/* View Header if not main feed */}
        {activeView !== 'feed' && (
          <div className="mb-6 pb-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                <span>MIXTORY Workspace</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 font-normal">Active Collection</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {activeView === 'saved' && 'Saved Creative Projects'}
                {activeView === 'my-projects' && 'My Projects & Drafts'}
                {activeView === 'collaborations' && 'Active Collaboration Network'}
                {activeView === 'collaborators' && 'Cross-Disciplinary Creative Talent Network'}
              </h2>
            </div>

            <button
              onClick={() => setActiveView('feed')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Back to Discover Feed</span>
            </button>
          </div>
        )}

        {/* Category & Status Filter Bar */}
        {activeView !== 'collaborations' && activeView !== 'collaborators' && <CategoryNav />}

        {/* Collaborators View: Find Talent */}
        {activeView === 'collaborators' ? (
          <FindCollaborators />
        ) : (
          <>
            {/* Collaborations View Specific Content */}
            {activeView === 'collaborations' && (
              <div className="py-4">
                <div className="p-6 bg-[#090F1E] border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Collaboration Inbox & Pitches</h3>
                    </div>
                    <button
                      onClick={() => setActiveModal('collab-inbox')}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open Full Collab Drawer</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Connect directly with directors, vocalists, synth designers, and choreographers. Manage incoming pitches on your projects or track sent requests.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div
                    key={n}
                    className="bg-[#0B1222]/80 border border-slate-800/80 rounded-2xl overflow-hidden animate-pulse h-96 flex flex-col justify-between p-5"
                  >
                    <div className="aspect-[16/10] bg-slate-900 rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-850 rounded w-full" />
                    </div>
                    <div className="h-8 bg-slate-800/80 rounded mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center rounded-2xl border border-slate-800/80 bg-[#090F1E]/60 max-w-2xl mx-auto my-8 p-8">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No creative projects found</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {selectedSkillFilter
                    ? `No projects found currently seeking "${selectedSkillFilter}". Try selecting a different skill or clear the filter.`
                    : searchQuery
                    ? `No projects matched "${searchQuery}". Try searching for specific disciplines like Music, Film, or skills like DaVinci or Foley.`
                    : activeView === 'saved'
                    ? 'You have not saved any projects yet. Click the bookmark icon on any project card to curate your inspiration library.'
                    : activeView === 'my-projects'
                    ? "You haven't posted any projects yet. Share your unfinished work or concept idea to find collaborators."
                    : 'No projects match the selected category and stage filters.'}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  {selectedSkillFilter && (
                    <button
                      onClick={() => setSelectedSkillFilter(null)}
                      className="px-3.5 py-2 text-xs font-medium text-cyan-300 hover:text-white bg-slate-900 border border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear "{selectedSkillFilter}" Filter
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModal('create-project')}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Share a Project</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Projects Grid: Responsive 1, 2, 3 columns */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 pb-12">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean Footer (Constitution: No telemetry tickers, quiet links) */}
      <footer className="border-t border-slate-800/80 bg-[#070B14] py-8 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-wider text-white">MIXTORY</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Creative Talent Discovery & Co-Creation Network</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveModal('supabase-inspector')}
              className="hover:text-cyan-400 transition-colors"
            >
              Database Architecture
            </button>
            <button
              onClick={() => setActiveModal('profile')}
              className="hover:text-cyan-400 transition-colors"
            >
              Demo Creator Hub
            </button>
            <span className="text-slate-400 font-mono">
              © {new Date().getFullYear()} MIXTORY
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {activeModal === 'project-detail' && <ProjectDetailModal />}
      {activeModal === 'create-project' && <CreateProjectModal />}
      {activeModal === 'collab-request' && <CollabRequestModal />}
      {activeModal === 'collab-inbox' && <CollabInboxModal />}
      {activeModal === 'profile' && <UserProfileModal />}
      {activeModal === 'supabase-inspector' && <SupabaseStatusModal />}
      {activeModal === 'auth' && <AuthModal />}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
