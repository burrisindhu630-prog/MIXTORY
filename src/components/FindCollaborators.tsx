import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreativeCategory, UserProfile } from '../types';
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  ExternalLink,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  MessageSquare
} from 'lucide-react';

const CATEGORIES: CreativeCategory[] = [
  'Music',
  'Singing',
  'Dance',
  'Art',
  'Writing',
  'Filmmaking',
  'Video Editing'
];

const POPULAR_SKILLS = [
  'Contemporary Dance',
  'Lead Vocals',
  'DaVinci Resolve',
  'Sound Design',
  'Foley Artist',
  'Screenwriting',
  'Colorist',
  'Cinematography',
  'Synthesizers',
  'Digital Painting',
  'Film Score Composer'
];

export const FindCollaborators: React.FC = () => {
  const {
    creators,
    projects,
    setSelectedProject,
    setActiveModal,
    currentUser,
    selectedSkillFilter,
    setSelectedSkillFilter,
    openCreatorProfile,
    getCreatorPortfolio
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeekingOnly, setFilterSeekingOnly] = useState<boolean>(false);

  // Filter creators
  const filteredCreators = creators.filter(creator => {
    // Category filter
    if (selectedCategory !== 'All' && creator.discipline !== selectedCategory) {
      return false;
    }

    // Skill filter
    if (selectedSkillFilter) {
      const matchSkill = creator.skills.some(s =>
        s.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      );
      const matchRole = creator.roles?.some(r =>
        r.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      );
      const matchNeeds = creator.needs_and_talents_wanted?.some(n =>
        n.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      );
      if (!matchSkill && !matchRole && !matchNeeds) return false;
    }

    // Seeking only filter
    if (filterSeekingOnly) {
      if (!creator.needs_and_talents_wanted || creator.needs_and_talents_wanted.length === 0) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = creator.name.toLowerCase().includes(q);
      const matchUsername = creator.username.toLowerCase().includes(q);
      const matchBio = creator.bio.toLowerCase().includes(q);
      const matchDiscipline = creator.discipline.toLowerCase().includes(q);
      const matchSeeking = creator.seeking_description?.toLowerCase().includes(q);
      const matchSkills = creator.skills.some(s => s.toLowerCase().includes(q));
      const matchNeeds = creator.needs_and_talents_wanted?.some(n => n.toLowerCase().includes(q));
      if (!matchName && !matchUsername && !matchBio && !matchDiscipline && !matchSeeking && !matchSkills && !matchNeeds) {
        return false;
      }
    }

    return true;
  });

  const handleOpenProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setActiveModal('project-detail');
    }
  };

  const handlePitchToCreator = (creator: UserProfile) => {
    // Find an open project owned by this creator if any
    const openProj = projects.find(p => p.creator_id === creator.id && p.open_for_collab);
    if (openProj) {
      setSelectedProject(openProj);
      setActiveModal('collab-request');
    } else {
      // Find any project by this creator
      const anyProj = projects.find(p => p.creator_id === creator.id);
      if (anyProj) {
        setSelectedProject(anyProj);
        setActiveModal('collab-request');
      } else {
        setActiveModal('profile');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B1528] via-[#091122] to-[#070B14] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Cross-Category Talent Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Find Creative Collaborators
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover verified artists, filmmakers, dancers, music producers, and writers. Review their actual works, what talents they are seeking, and pitch co-creation opportunities across disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveModal('profile')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Update My Needs & Talents</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search talent by name, role, or need (e.g. Contemporary Dancer, Foley, DaVinci)..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 pl-10 pr-8 py-2.5 rounded-lg outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Toggle: Currently Seeking Talent Only */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-lg hover:border-slate-700 select-none shrink-0">
            <input
              type="checkbox"
              checked={filterSeekingOnly}
              onChange={e => setFilterSeekingOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-800 text-cyan-500 focus:ring-cyan-400"
            />
            <span>Only show creators actively seeking collaborators</span>
          </label>
        </div>

        {/* Category Filter Chips */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Disciplines
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Tag Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span>Filter Skill:</span>
          </span>
          {selectedSkillFilter && (
            <button
              onClick={() => setSelectedSkillFilter(null)}
              className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 shrink-0"
            >
              <span>{selectedSkillFilter}</span>
              <span className="font-bold">✕</span>
            </button>
          )}
          {POPULAR_SKILLS.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkillFilter(selectedSkillFilter === skill ? null : skill)}
              className={`text-[11px] px-2.5 py-0.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                selectedSkillFilter === skill
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Directory Grid */}
      {filteredCreators.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#090F1E]/60 p-8">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No creators match your filters</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing the skill filter, or selecting "All Disciplines".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSkillFilter(null);
              setSearchQuery('');
              setFilterSeekingOnly(false);
            }}
            className="mt-4 px-3.5 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCreators.map(creator => {
            const creatorProjects = projects.filter(p => p.creator_id === creator.id);
            const isSelf = currentUser?.id === creator.id;

            return (
              <div
                key={creator.id}
                className="bg-[#090F1E]/95 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-200 shadow-xl flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Creator Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex items-center gap-3.5 cursor-pointer group/lead"
                      onClick={() => openCreatorProfile(creator)}
                      title="View creator's talent portfolio & public profile"
                    >
                      <img
                        src={creator.avatar_url}
                        alt={creator.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover/lead:ring-cyan-400 transition-all shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white leading-tight group-hover/lead:text-cyan-300 transition-colors">
                            {creator.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-cyan-400 font-medium block">
                          @{creator.username} · {creator.discipline}
                        </span>
                        {creator.location && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{creator.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openCreatorProfile(creator)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Inspect creator's talent portfolio"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Portfolio ({getCreatorPortfolio(creator.id).length})</span>
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handlePitchToCreator(creator)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Pitch Collab</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {creator.bio}
                  </p>

                  {/* Roles */}
                  {creator.roles && creator.roles.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Roles:</span>
                      {creator.roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actively Seeking / Talents Wanted Section (Requirement 2 & 3) */}
                  {creator.needs_and_talents_wanted && creator.needs_and_talents_wanted.length > 0 && (
                    <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Talents & Needs Wanted</span>
                        </span>
                        <span className="text-[10px] text-cyan-400/80 font-mono">Open For Pitches</span>
                      </div>

                      {creator.seeking_description && (
                        <p className="text-xs text-slate-200 leading-relaxed italic">
                          "{creator.seeking_description}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {creator.needs_and_talents_wanted.map((talent, idx) => (
                          <span
                            key={idx}
                            onClick={() => setSelectedSkillFilter(talent)}
                            className="text-xs font-medium bg-cyan-950/80 text-cyan-200 hover:text-white hover:border-cyan-400 px-2.5 py-0.5 rounded border border-cyan-700/60 transition-colors cursor-pointer"
                            title={`Filter creators matching ${talent}`}
                          >
                            + {talent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Offered */}
                  {creator.skills && creator.skills.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/70">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Skills & Services Offered:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {creator.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            onClick={() => setSelectedSkillFilter(skill)}
                            className="text-xs text-slate-300 bg-slate-900 hover:border-cyan-500/50 px-2 py-0.5 rounded border border-slate-800 transition-colors cursor-pointer"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actual Projects By This Creator (Requirement 3: shows their actual projects) */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Active Projects ({creatorProjects.length})
                    </span>
                    {creator.portfolio_url && (
                      <a
                        href={creator.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>External Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {creatorProjects.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No published projects yet</span>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {creatorProjects.map(proj => (
                        <div
                          key={proj.id}
                          onClick={() => handleOpenProject(proj.id)}
                          className="group/p p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2.5"
                        >
                          <img
                            src={proj.cover_image}
                            alt={proj.title}
                            className="w-10 h-10 rounded-md object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-white group-hover/p:text-cyan-300 block truncate">
                              {proj.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {proj.category} · {proj.status}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover/p:text-cyan-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
