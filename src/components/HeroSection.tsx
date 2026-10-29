import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Sparkles, Users, Layers, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveModal, setSelectedStatus, setActiveView, projects } = useApp();

  const totalCollaborationsOpen = projects.filter(p => p.open_for_collab).length;
  const unfinishedCount = projects.filter(p => p.status === 'Unfinished' || p.status === 'Idea').length;

  return (
    <section className="relative overflow-hidden pt-6 pb-12 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split-screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-400 mb-3">
              <span>Co-Creation Network</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 font-normal">Not Social Media</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              Where Creative Sparks Meet the Right Collaborators.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              MIXTORY is built specifically for creators to share finished works, work-in-progress projects, and early ideas across music, film, art, dance, and writing to find partners with the exact skills needed to finish them.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveModal('create-project')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-500/25"
              >
                <span>Post Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('Unfinished');
                  setActiveView('feed');
                }}
                className="px-5 py-2.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Explore Open Collabs</span>
              </button>
            </div>

            {/* Quiet reassurance note */}
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>Full privacy controls: Choose Public, Community Only, or Unlisted for each creation</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity Studio Image Visual */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="relative w-full h-[280px] sm:h-[340px] lg:h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src="/src/assets/images/mixtory_all_talents_hero_1793239768355.jpg"
                alt="Multidisciplinary creative studio representing music, singing, painting, filmmaking, writing, and video editing"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-transparent opacity-80" />
              
              {/* Subtle caption overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Multidisciplinary Creative Studio</span>
                  <span className="text-cyan-400 font-mono text-[11px]">All 7 Talents</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  Writers, painters, filmmakers, vocalists, editors & musicians co-creating together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-Column KPI strip below hero split */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {projects.length}
            </span>
            <span className="text-xs text-slate-400 mt-1">Total Active Projects</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tabular-nums tracking-tight">
              {totalCollaborationsOpen}
            </span>
            <span className="text-xs text-slate-400 mt-1">Open For Collaboration</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {unfinishedCount}
            </span>
            <span className="text-xs text-slate-400 mt-1">WIPs & Concept Ideas</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
              100%
            </span>
            <span className="text-xs text-slate-400 mt-1">Creative Focus (Zero Ads)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
