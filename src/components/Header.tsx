import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Database, Plus, Bookmark, MessageSquare, Compass, User, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    setActiveModal,
    collabRequests,
    supabaseStatus,
    savedProjectIds,
    openCreatorProfile
  } = useApp();

  // Pending incoming requests count for current user
  const incomingPendingCount = collabRequests.filter(
    r => r.receiver_id === currentUser?.id && r.status === 'pending'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('feed')}
              className="text-xl font-extrabold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-base shadow-sm shadow-cyan-500/20">
                M
              </span>
              <span className="tracking-wider">MIXTORY</span>
            </button>
            <span className="hidden xl:inline text-xs text-slate-400 font-normal">
              Creative Co-Creation Platform
            </span>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveView('feed')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
                activeView === 'feed' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setActiveView('collaborators')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
                activeView === 'collaborators' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Find Talent</span>
            </button>

            <button
              onClick={() => setActiveView('collaborations')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 relative ${
                activeView === 'collaborations' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Collab Hub</span>
              {incomingPendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-cyan-500 text-slate-950 rounded-full tabular-nums">
                  {incomingPendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('saved')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
                activeView === 'saved' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedProjectIds.size > 0 && (
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  ({savedProjectIds.size})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('my-projects')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
                activeView === 'my-projects' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>My Projects</span>
            </button>

            <button
              onClick={() => setActiveModal('supabase-inspector')}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded bg-slate-900 border border-slate-800"
              title="Inspect Supabase backend database connection & schema"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseStatus.isConfigured ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span className="whitespace-nowrap font-mono text-[11px]">
                {supabaseStatus.isConfigured ? 'Supabase Live' : 'Supabase Sandbox'}
              </span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action + User Profile trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => openCreatorProfile(currentUser)}
                className="flex items-center gap-2 p-1 pl-2 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                title="View Creator Profile & Switch Demo Account"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/50"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('auth')}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => setActiveModal('create-project')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Share Project</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
