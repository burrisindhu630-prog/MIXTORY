import React from 'react';
import { useApp } from '../context/AppContext';
import { CreativeCategory, ProjectStatus } from '../types';
import { CATEGORY_ASSETS } from '../data/categoryAssets';
import {
  Search,
  SlidersHorizontal,
  Music,
  Mic2,
  Activity,
  Palette,
  BookOpen,
  Film,
  Video,
  CheckCircle2,
  Clock,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Users,
  X
} from 'lucide-react';

const CATEGORIES: { label: CreativeCategory; icon: React.ElementType }[] = [
  { label: 'Music', icon: Music },
  { label: 'Singing', icon: Mic2 },
  { label: 'Dance', icon: Activity },
  { label: 'Art', icon: Palette },
  { label: 'Writing', icon: BookOpen },
  { label: 'Filmmaking', icon: Film },
  { label: 'Video Editing', icon: Video }
];

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'All'; icon?: React.ElementType }[] = [
  { label: 'All Stages', value: 'All' },
  { label: 'Finished', value: 'Finished', icon: CheckCircle2 },
  { label: 'Unfinished (WIP)', value: 'Unfinished', icon: Clock },
  { label: 'Ideas & Concepts', value: 'Idea', icon: Lightbulb }
];

export const CategoryNav: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    projects,
    setActiveModal,
    selectedSkillFilter,
    setSelectedSkillFilter
  } = useApp();

  const activeCategoryMeta = selectedCategory !== 'All' ? CATEGORY_ASSETS[selectedCategory] : null;

  return (
    <div className="py-4 space-y-5">
      {/* Visual Category Strip with Distinct Photographic Backgrounds */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Creative Disciplines ({CATEGORIES.length})</span>
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Reset to All Disciplines
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Category Cards with Photographic Backgrounds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const asset = CATEGORY_ASSETS[label];
            const isSelected = selectedCategory === label;
            const count = projects.filter(p => p.category === label).length;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'All' : label)}
                className={`group relative h-28 rounded-xl overflow-hidden border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700 opacity-90 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                {/* Photographic Background Image */}
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle dark navy overlay ensuring titles are crisp and readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/75 to-[#070B14]/40" />

                {/* Content Overlay */}
                <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : 'bg-[#070B14]/80 text-cyan-400 border border-slate-700/80 backdrop-blur-sm'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-slate-300 border border-white/5">
                      {count}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold leading-tight ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                      {label}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                      {label === 'Music' && 'Recording & Synths'}
                      {label === 'Singing' && 'Vocal Mics & Hooks'}
                      {label === 'Dance' && 'Studio Rehearsal'}
                      {label === 'Art' && 'Painting Atelier'}
                      {label === 'Writing' && 'Notebooks & Scripts'}
                      {label === 'Filmmaking' && 'Cinema Camera Sets'}
                      {label === 'Video Editing' && 'DaVinci Timelines'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Category Spotlight Banner when a category is selected */}
      {activeCategoryMeta && (
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-xl bg-slate-900 animate-in fade-in duration-300">
          {/* Photographic Backdrop */}
          <div className="absolute inset-0">
            <img
              src={activeCategoryMeta.image}
              alt={activeCategoryMeta.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Measured Scrim: subtle dark gradient overlay for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-[#070B14]/85 to-[#070B14]/50" />
          </div>

          {/* Banner Text Content */}
          <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1.5">
                <span>Category Spotlight</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 font-normal">{activeCategoryMeta.tagline}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeCategoryMeta.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                {activeCategoryMeta.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveModal('create-project')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 whitespace-nowrap"
              >
                <span>Share a {activeCategoryMeta.category} Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedCategory('All')}
                className="px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-black/60 hover:bg-black/80 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Filters & Search Input Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
        {/* Completion Status Sub-bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stage:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map(({ label, value, icon: Icon }) => {
              const isSelected = selectedStatus === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedStatus(value)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 text-cyan-400" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects, skills (e.g. DaVinci, Synth, Foley)..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 pl-9 pr-8 py-2 rounded-lg transition-colors outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Cross-Discipline Collaboration & Required Skills Filter Bar */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-white tracking-wide">
              Cross-Category Collaboration:
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Filter by talents & skills needed (e.g., Musicians finding Dancers, Directors finding Writers)
            </span>
          </div>

          {selectedSkillFilter && (
            <button
              type="button"
              onClick={() => setSelectedSkillFilter(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <span>Reset Skill Filter ({selectedSkillFilter})</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedSkillFilter(null)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              !selectedSkillFilter
                ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
            }`}
          >
            All Skills
          </button>

          {[
            'Contemporary Dance',
            'Lead Vocals',
            'Screenwriting',
            'DaVinci Resolve',
            'Foley Artist',
            'Colorist',
            'Sound Design',
            'Synthesizers',
            'Concept Art',
            'Cinematography'
          ].map(skill => {
            const isSelected = selectedSkillFilter?.toLowerCase() === skill.toLowerCase();
            return (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkillFilter(isSelected ? null : skill)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{skill}</span>
                {isSelected && <X className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
