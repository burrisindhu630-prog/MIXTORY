import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Heart,
  Bookmark,
  Users,
  ExternalLink,
  Shield,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Lightbulb,
  Music,
  Share2,
  Sparkles
} from 'lucide-react';

export const ProjectDetailModal: React.FC = () => {
  const {
    selectedProject,
    setSelectedProject,
    setActiveModal,
    likedProjectIds,
    savedProjectIds,
    toggleLike,
    toggleSave,
    currentUser,
    deleteProject,
    updateProject,
    showToast,
    collabRequests,
    openCreatorProfile,
    getCreatorPortfolio
  } = useApp();

  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  if (!selectedProject) return null;

  const isLiked = likedProjectIds.has(selectedProject.id);
  const isSaved = savedProjectIds.has(selectedProject.id);
  const isOwner = currentUser?.id === selectedProject.creator_id;

  // Requests specifically for this project
  const projectRequests = collabRequests.filter(r => r.project_id === selectedProject.id);

  const handleClose = () => {
    setActiveModal(null);
    setSelectedProject(null);
  };

  const handleCollabClick = () => {
    setActiveModal('collab-request');
  };

  const handlePrivacyChange = async (newVisibility: 'public' | 'community' | 'unlisted') => {
    setIsUpdatingPrivacy(true);
    await updateProject(selectedProject.id, { visibility: newVisibility });
    setIsUpdatingPrivacy(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${selectedProject.title}"?`)) {
      await deleteProject(selectedProject.id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Project link copied to clipboard!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#090F1E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070B14]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-cyan-400">{selectedProject.category}</span>
            <span aria-hidden="true">·</span>
            <span>Created {selectedProject.created_at}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              <span className="tabular-nums">{selectedProject.views_count} views</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Share project link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="max-h-[80vh] overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Visual Artwork / Media */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
            <img
              src={selectedProject.cover_image}
              alt={selectedProject.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Subtle dark navy gradient overlay ensuring readable titles */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090F1E] via-[#090F1E]/60 to-black/30 pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-slate-950/80 text-white rounded border border-slate-700/80 flex items-center gap-1.5">
                    {selectedProject.status === 'Finished' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {selectedProject.status === 'Unfinished' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    {selectedProject.status === 'Idea' && <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{selectedProject.status}</span>
                  </span>
                  {selectedProject.completion_percentage !== undefined && (
                    <span className="px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-900/80 text-cyan-300 rounded border border-slate-800">
                      {selectedProject.completion_percentage}% completed
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {selectedProject.title}
                </h1>
              </div>

              {/* Like / Bookmark Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleLike(selectedProject.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums flex items-center gap-1.5 backdrop-blur-md transition-colors ${
                    isLiked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-black/60 text-slate-200 hover:bg-black/80 border border-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{selectedProject.likes_count}</span>
                </button>

                <button
                  onClick={() => toggleSave(selectedProject.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums flex items-center gap-1.5 backdrop-blur-md transition-colors ${
                    isSaved
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-black/60 text-slate-200 hover:bg-black/80 border border-white/10'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audio preview strip if available */}
          {selectedProject.audio_preview_url && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Project Audio Sketch / Stem</span>
                  <span className="text-[11px] text-slate-400 block">Listen to scratch track reference</span>
                </div>
              </div>
              <audio controls className="h-8 max-w-xs">
                <source src={selectedProject.audio_preview_url} type="audio/ogg" />
                Your browser does not support audio element.
              </audio>
            </div>
          )}

          {/* Two-Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Description & Required Roles */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Project Vision & Synopsis
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              {/* Demo / Reel Link */}
              {selectedProject.demo_link && (
                <div className="pt-2">
                  <a
                    href={selectedProject.demo_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-850 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>External Work-in-Progress Demo Link</span>
                  </a>
                </div>
              )}

              {/* Required Skills & Collaborators Sought */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Collaborators & Roles Needed
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    {selectedProject.open_for_collab ? 'Open for Pitches' : 'Team Complete'}
                  </span>
                </div>

                {selectedProject.required_skills && selectedProject.required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.required_skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Open to all creative disciplines.</p>
                )}

                {/* Collaboration Pitch CTA */}
                {selectedProject.open_for_collab && !isOwner && (
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-800/40 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Have skills for this project?
                      </span>
                      <span className="text-xs text-slate-300 block">
                        Pitch your creative contribution directly to {selectedProject.creator.name}.
                      </span>
                    </div>
                    <button
                      onClick={handleCollabClick}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Pitch Collaboration</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Owner View: List of Collab Requests */}
              {isOwner && (
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                      Collaboration Requests Received ({projectRequests.length})
                    </h3>
                  </div>

                  {projectRequests.length === 0 ? (
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                      No collaboration pitches received yet for this project. They will appear here once creative talent applies.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectRequests.map(req => (
                        <div
                          key={req.id}
                          className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={req.sender.avatar_url}
                              alt={req.sender.name}
                              className="w-8 h-8 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{req.sender.name}</span>
                                <span className="text-[11px] text-cyan-400 font-mono">
                                  ({req.role_offered})
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                                "{req.message}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                                req.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : req.status === 'declined'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {req.status}
                            </span>
                            <button
                              onClick={() => setActiveModal('collab-inbox')}
                              className="text-xs text-cyan-400 hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Creator Card & Privacy Settings */}
            <div className="space-y-6">
              {/* Creator Card */}
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Project Lead
                  </span>
                  <button
                    onClick={() => openCreatorProfile(selectedProject.creator)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Talent Portfolio ({getCreatorPortfolio(selectedProject.creator.id).length})</span>
                  </button>
                </div>

                <div
                  className="flex items-center gap-3 cursor-pointer group/lead"
                  onClick={() => openCreatorProfile(selectedProject.creator)}
                  title={`View ${selectedProject.creator.name}'s talent portfolio`}
                >
                  <img
                    src={selectedProject.creator.avatar_url}
                    alt={selectedProject.creator.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover/lead:ring-cyan-400 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover/lead:text-cyan-300 transition-colors">
                      {selectedProject.creator.name}
                    </h4>
                    <span className="text-xs text-cyan-400 font-medium block">
                      {selectedProject.creator.discipline}
                    </span>
                    {selectedProject.creator.location && (
                      <span className="text-[11px] text-slate-400 block">
                        {selectedProject.creator.location}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProject.creator.bio}
                </p>

                {selectedProject.creator.skills && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-1.5">Lead Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.creator.skills.map((s, idx) => (
                        <span key={idx} className="text-[11px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Settings (Rule 9: Privacy settings so creators control project visibility) */}
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Project Privacy & Visibility</span>
                </div>

                {isOwner ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 mb-2">
                      You are the creator. You can adjust visibility at any time:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(['public', 'community', 'unlisted'] as const).map(vis => (
                        <button
                          key={vis}
                          disabled={isUpdatingPrivacy}
                          onClick={() => handlePrivacyChange(vis)}
                          className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors flex items-center justify-between ${
                            selectedProject.visibility === vis
                              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 font-semibold'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="capitalize">{vis}</span>
                          <span className="text-[10px] text-slate-400">
                            {vis === 'public'
                              ? 'Discoverable everywhere'
                              : vis === 'community'
                              ? 'Logged-in members only'
                              : 'Direct collab link only'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={handleDelete}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300">
                    Current visibility:{' '}
                    <span className="font-semibold capitalize text-cyan-400">
                      {selectedProject.visibility}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {selectedProject.visibility === 'public'
                        ? 'This project is publicly indexed on MIXTORY.'
                        : 'Visible only to verified MIXTORY creators.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
