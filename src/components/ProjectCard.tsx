import React, { useState } from 'react';
import { Project } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Bookmark, Users, Sparkles, Lock, ArrowUpRight, CheckCircle2, Clock, Lightbulb } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const {
    likedProjectIds,
    savedProjectIds,
    toggleLike,
    toggleSave,
    setSelectedProject,
    setActiveModal,
    currentUser,
    selectedSkillFilter,
    setSelectedSkillFilter,
    openCreatorProfile
  } = useApp();

  const [imgLoaded, setImgLoaded] = useState(true);
  const isLiked = likedProjectIds.has(project.id);
  const isSaved = savedProjectIds.has(project.id);
  const isOwner = currentUser?.id === project.creator_id;

  const handleOpenDetail = () => {
    setSelectedProject(project);
    setActiveModal('project-detail');
  };

  const handleCollaborate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setActiveModal('collab-request');
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'Finished':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Unfinished':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case 'Idea':
        return <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <article
      onClick={handleOpenDetail}
      className="group flex flex-col justify-between bg-[#0B1222]/90 hover:bg-[#0E172C] border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
    >
      <div>
        {/* Card Media Container */}
        <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
          {imgLoaded && project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              onError={() => setImgLoaded(false)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#0A1628] text-slate-500 p-6">
              <Sparkles className="w-8 h-8 text-cyan-500/40 mb-2" />
              <span className="text-xs font-medium text-slate-400">{project.category} Project</span>
            </div>
          )}

          {/* Privacy Indicator overlay if community or unlisted */}
          {project.visibility !== 'public' && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded text-[11px] font-medium text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span className="capitalize">{project.visibility}</span>
            </div>
          )}

          {/* Status badge in top right */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-md text-xs font-medium text-white border border-slate-800 flex items-center gap-1.5 shadow-sm">
            {getStatusIcon(project.status)}
            <span>{project.status}</span>
          </div>

          {/* Scrim gradient overlay ensuring title and metadata readability on photographic backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1222] via-[#0B1222]/50 to-black/20 pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Unboxed Metadata Line with typographic separators (Rule 1A: Zero-Pill) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2.5">
            <span className="text-cyan-400">{project.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{project.created_at}</span>
            {project.completion_percentage !== undefined && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums">{project.completion_percentage}% done</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
            {project.title}
          </h2>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Required Skills Section */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Seeking Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.required_skills.slice(0, 3).map((skill, idx) => {
                  const isFiltered = selectedSkillFilter === skill;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSkillFilter(isFiltered ? null : skill);
                      }}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        isFiltered
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-semibold'
                          : 'text-slate-300 bg-slate-800/80 border-slate-700/80 hover:border-cyan-500/50 hover:text-white'
                      }`}
                      title={`Filter by ${skill}`}
                    >
                      {skill}
                    </button>
                  );
                })}
                {project.required_skills.length > 3 && (
                  <span className="text-xs text-cyan-400/80 px-1 py-0.5 font-mono tabular-nums">
                    +{project.required_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Creator Info & Interaction Bar */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 bg-[#090F1C]/40">
        {/* Creator Info */}
        <div
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group/lead"
          onClick={e => {
            e.stopPropagation();
            openCreatorProfile(project.creator);
          }}
          title={`View ${project.creator.name}'s talent portfolio`}
        >
          <img
            src={project.creator.avatar_url}
            alt={project.creator.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 group-hover/lead:ring-cyan-400 transition-colors"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 block truncate group-hover/lead:text-cyan-300 transition-colors">
              {project.creator.name}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {project.creator.discipline}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          {/* Like */}
          <button
            onClick={() => toggleLike(project.id)}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            className={`p-1.5 rounded-md text-xs font-mono tabular-nums flex items-center gap-1 transition-colors ${
              isLiked
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Applaud project"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{project.likes_count}</span>
          </button>

          {/* Save */}
          <button
            onClick={() => toggleSave(project.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save project'}
            className={`p-1.5 rounded-md text-xs font-mono tabular-nums flex items-center gap-1 transition-colors ${
              isSaved
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Bookmark project"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Collab CTA */}
          {project.open_for_collab && !isOwner ? (
            <button
              onClick={handleCollaborate}
              className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-1 shadow-sm"
            >
              <Users className="w-3 h-3" />
              <span>Collab</span>
            </button>
          ) : (
            <button
              onClick={handleOpenDetail}
              className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-md transition-colors"
              title="View full project"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
