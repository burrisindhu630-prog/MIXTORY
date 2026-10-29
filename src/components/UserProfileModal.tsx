import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { CreativeCategory, PortfolioItem, UserProfile } from '../types';
import {
  X,
  User,
  Sparkles,
  MapPin,
  Globe,
  LogOut,
  Check,
  ArrowRight,
  Edit3,
  Save,
  Plus,
  Users,
  Target,
  ExternalLink,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  Trash2,
  Upload,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Lightbulb,
  Maximize2,
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

const SUGGESTED_ROLES = [
  'Music Producer',
  'Lead Vocalist',
  'Contemporary Dancer',
  'Screenwriter',
  'Cinematographer',
  'Video Editor',
  'Sound Designer',
  'Concept Artist',
  'Choreographer'
];

const SUGGESTED_TALENTS_WANTED = [
  'Lead Vocalist',
  'DaVinci Colorist',
  'Contemporary Dancer',
  'Screenwriter',
  'Foley Artist',
  'VFX Artist',
  'Synthesizer Specialist',
  'Session Guitarist',
  'Violinist',
  'Lyricist'
];

const SUGGESTED_SKILLS_BY_CATEGORY: Record<CreativeCategory, string[]> = {
  Music: ['Synthesizers', 'Ableton Live', 'Analog Modular', 'Sound Design', 'Mastering', 'Mixing', 'Tape Saturation'],
  Singing: ['Lead Vocals', 'Harmonies', 'Top-line Songwriting', 'Vocal Arranging', 'Microphone Technique', 'Falsetto'],
  Dance: ['Contemporary Dance', 'Improvisation', 'Choreography', 'Physical Theatre', 'Floor Work', 'Stage Direction'],
  Art: ['Digital Painting', 'Photoshop', 'Matte Painting', 'Blender 3D', 'Concept Art', 'Character Design', 'Storyboarding'],
  Writing: ['Screenwriting', 'Dialogue', 'Worldbuilding', 'Speculative Fiction', 'Plot Outlining', 'Audio Drama'],
  Filmmaking: ['Directing', 'Cinematography', 'Arri Alexa', 'Lighting Design', 'Color Scripting', 'Storyboarding'],
  'Video Editing': ['DaVinci Resolve', 'Premiere Pro', 'Color Grading', 'Rhythmic Pacing', 'Sound Sync', 'Film Grain']
};

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    viewingCreator,
    setViewingCreator,
    switchUser,
    logoutUser,
    setActiveModal,
    projects,
    setSelectedProject,
    updateUserProfile,
    portfolioItems,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    uploadPortfolioFile
  } = useApp();

  // Active profile is either the specific creator clicked, or the current user
  const activeProfile: UserProfile = viewingCreator || currentUser || DEMO_USERS[0];
  const isOwner = currentUser?.id === activeProfile.id;

  const [activeTab, setActiveTab] = useState<'portfolio' | 'projects' | 'about' | 'edit-needs' | 'switch-demo'>('portfolio');

  // Edit profile form state
  const [bio, setBio] = useState(activeProfile.bio || '');
  const [seekingDescription, setSeekingDescription] = useState(activeProfile.seeking_description || '');
  const [location, setLocation] = useState(activeProfile.location || '');
  const [portfolioUrl, setPortfolioUrl] = useState(activeProfile.portfolio_url || '');
  const [roles, setRoles] = useState<string[]>(activeProfile.roles || []);
  const [roleInput, setRoleInput] = useState('');
  const [needs, setNeeds] = useState<string[]>(activeProfile.needs_and_talents_wanted || []);
  const [needInput, setNeedInput] = useState('');
  const [skills, setSkills] = useState<string[]>(activeProfile.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Portfolio items for active creator
  const creatorPortfolio = portfolioItems.filter(item => item.creator_id === activeProfile.id);
  const creatorProjects = projects.filter(p => p.creator_id === activeProfile.id);

  // Portfolio Item Form / Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCategory, setItemCategory] = useState<CreativeCategory>(
    CATEGORIES.includes(activeProfile.discipline as CreativeCategory)
      ? (activeProfile.discipline as CreativeCategory)
      : 'Music'
  );
  const [itemMediaType, setItemMediaType] = useState<'audio' | 'video' | 'image' | 'link'>('audio');
  const [itemMediaUrl, setItemMediaUrl] = useState('');
  const [itemSkills, setItemSkills] = useState<string[]>([]);
  const [itemSkillInput, setItemSkillInput] = useState('');
  const [itemCompletedProject, setItemCompletedProject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);

  // Lightbox view for artwork
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Audio preview playing state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Delete item confirmation state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleClose = () => {
    setActiveModal(null);
    setViewingCreator(null);
  };

  const handleOpenPitchModal = () => {
    // If the creator has any project, set selectedProject so collab modal works smoothly
    const primaryProj = creatorProjects[0] || projects[0];
    if (primaryProj) {
      setSelectedProject(primaryProj);
    }
    setActiveModal('collab-request');
  };

  const handleSelectProject = (proj: any) => {
    setSelectedProject(proj);
    setActiveModal('project-detail');
  };

  // Roles & Needs tags
  const handleAddRole = (roleToAdd?: string) => {
    const val = (roleToAdd || roleInput).trim();
    if (val && !roles.includes(val)) {
      setRoles([...roles, val]);
      if (!roleToAdd) setRoleInput('');
    }
  };

  const handleRemoveRole = (r: string) => {
    setRoles(roles.filter(item => item !== r));
  };

  const handleAddNeed = (needToAdd?: string) => {
    const val = (needToAdd || needInput).trim();
    if (val && !needs.includes(val)) {
      setNeeds([...needs, val]);
      if (!needToAdd) setNeedInput('');
    }
  };

  const handleRemoveNeed = (n: string) => {
    setNeeds(needs.filter(item => item !== n));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    await updateUserProfile({
      bio: bio.trim(),
      seeking_description: seekingDescription.trim(),
      roles,
      needs_and_talents_wanted: needs,
      skills,
      location: location.trim(),
      portfolio_url: portfolioUrl.trim()
    });

    setIsSavingProfile(false);
    setActiveTab('about');
  };

  // Open Item Modal (Add or Edit)
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemDescription('');
    setItemCategory(
      CATEGORIES.includes(activeProfile.discipline as CreativeCategory)
        ? (activeProfile.discipline as CreativeCategory)
        : 'Music'
    );
    setItemMediaType('audio');
    setItemMediaUrl('');
    setItemSkills(activeProfile.skills?.slice(0, 3) || []);
    setItemCompletedProject('');
    setUploadError(null);
    setItemFormError(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemDescription(item.description);
    setItemCategory(item.category);
    setItemMediaType(item.media_type);
    setItemMediaUrl(item.media_url);
    setItemSkills(item.skills_used || []);
    setItemCompletedProject(item.completed_project_title || '');
    setUploadError(null);
    setItemFormError(null);
    setIsItemModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    // Auto-detect media type
    if (file.type.startsWith('audio/')) {
      setItemMediaType('audio');
    } else if (file.type.startsWith('video/')) {
      setItemMediaType('video');
    } else if (file.type.startsWith('image/')) {
      setItemMediaType('image');
    }

    const res = await uploadPortfolioFile(file);
    setIsUploading(false);

    if (res.url) {
      setItemMediaUrl(res.url);
    } else {
      setUploadError(res.error || 'Failed to process media file.');
    }
  };

  const handleAddSkillToItem = (skillToAdd?: string) => {
    const val = (skillToAdd || itemSkillInput).trim();
    if (val && !itemSkills.includes(val)) {
      setItemSkills([...itemSkills, val]);
      if (!skillToAdd) setItemSkillInput('');
    }
  };

  const handleRemoveSkillFromItem = (skill: string) => {
    setItemSkills(itemSkills.filter(s => s !== skill));
  };

  const handleSavePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError(null);

    if (!itemTitle.trim()) {
      setItemFormError('Please enter a title for this portfolio piece.');
      return;
    }

    if (!itemMediaUrl.trim()) {
      setItemFormError('Please provide a media URL or upload an asset file.');
      return;
    }

    setIsSavingItem(true);

    if (editingItem) {
      const ok = await updatePortfolioItem(editingItem.id, {
        title: itemTitle.trim(),
        description: itemDescription.trim(),
        category: itemCategory,
        media_type: itemMediaType,
        media_url: itemMediaUrl.trim(),
        skills_used: itemSkills,
        completed_project_title: itemCompletedProject.trim() || undefined
      });
      setIsSavingItem(false);
      if (ok) setIsItemModalOpen(false);
    } else {
      const ok = await addPortfolioItem({
        title: itemTitle.trim(),
        description: itemDescription.trim(),
        category: itemCategory,
        media_type: itemMediaType,
        media_url: itemMediaUrl.trim(),
        skills_used: itemSkills,
        completed_project_title: itemCompletedProject.trim() || undefined
      });
      setIsSavingItem(false);
      if (ok) setIsItemModalOpen(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deletePortfolioItem(id);
    setDeletingItemId(null);
  };

  const toggleAudioPlayback = (itemId: string, audioUrl: string) => {
    const audioElement = document.getElementById(`audio-player-${itemId}`) as HTMLAudioElement;
    if (!audioElement) return;

    if (playingAudioId === itemId) {
      audioElement.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any previously playing
      if (playingAudioId) {
        const prev = document.getElementById(`audio-player-${playingAudioId}`) as HTMLAudioElement;
        if (prev) prev.pause();
      }
      audioElement.play().catch(e => console.warn('Audio play error', e));
      setPlayingAudioId(itemId);
    }
  };

  const getMediaTypeIcon = (type: PortfolioItem['media_type']) => {
    switch (type) {
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-cyan-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'link':
        return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#090F1E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070B14]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              {isOwner ? 'My Creator Profile & Talent Showcase' : `${activeProfile.name}'s Creator Profile`}
            </h2>
            {!isOwner && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 ml-2">
                Public Showcase
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Hero Header Banner */}
        <div className="p-6 bg-gradient-to-r from-[#0B132B]/80 via-[#070B14] to-[#0A1124] border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={activeProfile.avatar_url}
                alt={activeProfile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-cyan-500/50 shadow-lg shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">{activeProfile.name}</h3>
                  {isOwner && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      You
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-cyan-400 font-semibold block mt-0.5">
                  @{activeProfile.username} · {activeProfile.discipline}
                </span>
                {activeProfile.location && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeProfile.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {!isOwner ? (
                <button
                  onClick={handleOpenPitchModal}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Pitch Collaboration</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenAddItem}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Portfolio Piece</span>
                </button>
              )}

              {activeProfile.portfolio_url && (
                <a
                  href={activeProfile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                  title="External Portfolio Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/40 gap-3 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Talent Portfolio ({creatorPortfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>MIXTORY Projects ({creatorProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span>Bio & Talents Wanted</span>
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => setActiveTab('edit-needs')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'edit-needs'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Roles & Needs</span>
              </button>

              <button
                onClick={() => setActiveTab('switch-demo')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'switch-demo'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch Creator Account</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* TAB 1: TALENT PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Header explanation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Verified Creative Talent Showcase</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Direct samples of completed works, master audio tracks, video reels, concept art, and manuscripts. Review before proposing a collaboration.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleOpenAddItem}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Portfolio Grid */}
              {creatorPortfolio.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#090F1E]/60 p-8">
                  <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">No portfolio pieces published yet</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                    {isOwner
                      ? 'Add your best audio tracks, video reels, high-resolution artwork, or script samples to showcase your skills to potential collaborators.'
                      : 'This creator has not uploaded individual portfolio pieces yet. Check their MIXTORY projects or bio.'}
                  </p>
                  {isOwner && (
                    <button
                      onClick={handleOpenAddItem}
                      className="mt-4 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Portfolio Piece</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creatorPortfolio.map(item => {
                    const isAudioPlaying = playingAudioId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="bg-[#0B1222] border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Media Header Preview */}
                          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800/80">
                            {/* Visual Artwork / Photo */}
                            {item.media_type === 'image' && (
                              <>
                                <img
                                  src={item.media_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                                  onClick={() => setLightboxImage(item.media_url)}
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  onClick={() => setLightboxImage(item.media_url)}
                                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs flex items-center gap-1 backdrop-blur-sm transition-colors cursor-pointer"
                                  title="Expand full image"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Audio Player Preview */}
                            {item.media_type === 'audio' && (
                              <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-cyan-950/60 via-slate-900 to-black">
                                <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
                                  <span className="flex items-center gap-1.5">
                                    <Music className="w-4 h-4 text-cyan-400" />
                                    <span>Audio Master Take</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">HQ Stream</span>
                                </div>

                                <div className="flex items-center justify-center gap-4 my-auto">
                                  <button
                                    onClick={() => toggleAudioPlayback(item.id, item.media_url)}
                                    className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                    title={isAudioPlaying ? 'Pause track' : 'Play audio track'}
                                  >
                                    {isAudioPlaying ? (
                                      <Pause className="w-5 h-5 fill-current" />
                                    ) : (
                                      <Play className="w-5 h-5 fill-current ml-0.5" />
                                    )}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 h-8">
                                      {[40, 70, 30, 90, 60, 100, 45, 80, 55, 65, 85, 30, 75, 95, 50, 80].map((h, i) => (
                                        <div
                                          key={i}
                                          className={`flex-1 rounded-full transition-all ${
                                            isAudioPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                                          }`}
                                          style={{ height: `${h}%` }}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono block text-right mt-1">
                                      {isAudioPlaying ? 'Streaming...' : 'Click to preview'}
                                    </span>
                                  </div>
                                </div>

                                {/* Hidden HTML5 Audio Element */}
                                <audio
                                  id={`audio-player-${item.id}`}
                                  src={item.media_url}
                                  onEnded={() => setPlayingAudioId(null)}
                                  preload="none"
                                />

                                <div className="text-[11px] text-cyan-400/80 flex items-center gap-1 truncate">
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <a
                                    href={item.media_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline truncate"
                                  >
                                    Direct audio link
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Video Reel Preview */}
                            {item.media_type === 'video' && (
                              <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                                {item.media_url.includes('youtube.com') || item.media_url.includes('youtu.be') ? (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${
                                      item.media_url.includes('v=')
                                        ? item.media_url.split('v=')[1]?.split('&')[0]
                                        : item.media_url.split('/').pop()
                                    }`}
                                    title={item.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="w-full h-full relative group/vid">
                                    <img
                                      src={item.media_url.startsWith('http') && (item.media_url.includes('unsplash') || item.media_url.includes('image'))
                                        ? item.media_url
                                        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'}
                                      alt={item.title}
                                      className="w-full h-full object-cover opacity-80"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <a
                                        href={item.media_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-12 h-12 rounded-full bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                      >
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                      </a>
                                    </div>
                                    <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded text-white">
                                      Video Showcase Reel
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Writing / Manuscript Link Preview */}
                            {item.media_type === 'link' && (
                              <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-[#070B14]">
                                <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    <span>Script & Narrative Lore</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">Written Draft</span>
                                </div>

                                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 italic line-clamp-3">
                                  "{item.description}"
                                </div>

                                <a
                                  href={item.media_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Read Script / Document</span>
                                </a>
                              </div>
                            )}

                            {/* Category & Media Badge Overlay */}
                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="text-[10px] font-semibold bg-slate-950/90 text-white px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1 shadow-sm">
                                {getMediaTypeIcon(item.media_type)}
                                <span className="capitalize">{item.media_type}</span>
                              </span>
                              <span className="text-[10px] font-semibold bg-cyan-950/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/80 shadow-sm">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-4 space-y-2.5">
                            <h5 className="text-sm font-bold text-white leading-snug">{item.title}</h5>
                            <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                            {/* Skills used */}
                            {item.skills_used && item.skills_used.length > 0 && (
                              <div className="pt-2">
                                <div className="flex flex-wrap gap-1">
                                  {item.skills_used.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Associated Completed Project */}
                            {item.completed_project_title && (
                              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-cyan-400/90">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-slate-400">Completed Project:</span>
                                <span className="font-semibold truncate">{item.completed_project_title}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Owner Controls (Edit / Delete) */}
                        {isOwner && (
                          <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Added {item.created_at}
                            </span>
                            <div className="flex items-center gap-2">
                              {deletingItemId === item.id ? (
                                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                                  <span className="text-[11px] text-rose-300">Confirm delete?</span>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setDeletingItemId(null)}
                                    className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleOpenEditItem(item)}
                                    className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                    title="Edit portfolio piece"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingItemId(item.id)}
                                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                    title="Delete portfolio piece"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MIXTORY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Projects Published on MIXTORY ({creatorProjects.length})
                </span>
                {isOwner && (
                  <button
                    onClick={() => setActiveModal('create-project')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                )}
              </div>

              {creatorProjects.length === 0 ? (
                <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No projects published on MIXTORY yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {creatorProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className="p-3 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition-colors flex items-center gap-3 group/p"
                    >
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white group-hover/p:text-cyan-300 block truncate">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            · {p.status}
                          </span>
                        </div>
                        {p.required_skills && p.required_skills.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 truncate">
                            <span>Needs:</span>
                            <span className="text-slate-300 truncate">{p.required_skills.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover/p:text-cyan-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ABOUT & COLLABORATOR NEEDS */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Bio Statement */}
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Creative Statement & Philosophy
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeProfile.bio || 'No artist bio provided yet.'}
                </p>

                {activeProfile.portfolio_url && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <a
                      href={activeProfile.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline truncate"
                    >
                      {activeProfile.portfolio_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Roles Offered */}
              {activeProfile.roles && activeProfile.roles.length > 0 && (
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                    Creative Roles & Services Offered
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeProfile.roles.map((r, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded-lg font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Talents Wanted / Collaboration Seeking */}
              <div className="p-5 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>Actively Seeking Collaborators & Talents:</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80">Cross-Disciplinary</span>
                </div>

                {activeProfile.seeking_description && (
                  <p className="text-xs text-slate-200 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-amber-900/40">
                    "{activeProfile.seeking_description}"
                  </p>
                )}

                {activeProfile.needs_and_talents_wanted && activeProfile.needs_and_talents_wanted.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeProfile.needs_and_talents_wanted.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs bg-amber-950/80 text-amber-200 border border-amber-700/60 rounded-lg font-medium"
                      >
                        + {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No specific talent needs listed yet.</span>
                )}
              </div>

              {/* Core Skills */}
              {activeProfile.skills && activeProfile.skills.length > 0 && (
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Core Technical Skills & Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProfile.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EDIT ROLES & NEEDS (OWNER ONLY) */}
          {activeTab === 'edit-needs' && isOwner && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-slate-300">
                <strong className="text-cyan-300 block mb-0.5">Cross-Category Matchmaking Profile:</strong>
                Specify your creative roles and exactly what talents you want to collaborate with.
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Artist Bio / Creative Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Introduce yourself, your artistic philosophy, and what mediums you work with..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white p-3 rounded-lg outline-none"
                />
              </div>

              {/* Roles Offered */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    My Creative Roles (What I Bring)
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. Lead Vocalist, DaVinci Colorist</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    placeholder="Add a role you perform..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddRole()}
                    className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-400 py-0.5">Quick add:</span>
                  {SUGGESTED_ROLES.map(sr => (
                    <button
                      key={sr}
                      type="button"
                      onClick={() => handleAddRole(sr)}
                      disabled={roles.includes(sr)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        roles.includes(sr)
                          ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                          : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      + {sr}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {roles.map(r => (
                    <span
                      key={r}
                      className="px-2.5 py-1 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded flex items-center gap-1.5"
                    >
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(r)}
                        className="text-cyan-500 hover:text-rose-400 text-sm leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Talents Wanted */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Talents & Collaborators Wanted</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Who do you want to work with?</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={needInput}
                    onChange={e => setNeedInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNeed();
                      }
                    }}
                    placeholder="e.g. Contemporary Dancer, Foley Artist, Screenwriter..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNeed()}
                    className="px-3 py-2 text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-400 py-0.5">Quick add:</span>
                  {SUGGESTED_TALENTS_WANTED.map(sn => (
                    <button
                      key={sn}
                      type="button"
                      onClick={() => handleAddNeed(sn)}
                      disabled={needs.includes(sn)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        needs.includes(sn)
                          ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                          : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border-amber-800/50'
                      }`}
                    >
                      + {sn}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {needs.map(n => (
                    <span
                      key={n}
                      className="px-2.5 py-1 text-xs bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded flex items-center gap-1.5"
                    >
                      <span>{n}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNeed(n)}
                        className="text-amber-500 hover:text-rose-400 text-sm leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Seeking Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description of Needs & Talents Wanted
                </label>
                <textarea
                  rows={3}
                  value={seekingDescription}
                  onChange={e => setSeekingDescription(e.target.value)}
                  placeholder="Detail the collaborative projects you want to make, styles you resonate with, and how you envision partnering..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white p-3 rounded-lg outline-none"
                />
              </div>

              {/* Location & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location / Base
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Berlin / Remote"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Portfolio / Website Link
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile & Needs'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: SWITCH DEMO CREATOR (OWNER ONLY) */}
          {activeTab === 'switch-demo' && isOwner && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-slate-300">
                <strong className="text-cyan-300 block mb-0.5">Demo Account Switcher:</strong>
                Switch identity to test collaborative interactions, portfolio management, and pitches from different creator perspectives.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_USERS.map(user => {
                  const isActive = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user);
                        setBio(user.bio);
                        setSeekingDescription(user.seeking_description || '');
                        setRoles(user.roles || []);
                        setNeeds(user.needs_and_talents_wanted || []);
                        setSkills(user.skills || []);
                        setLocation(user.location || '');
                        setPortfolioUrl(user.portfolio_url || '');
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/30'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs font-bold block">{user.name}</span>
                          <span className="text-[11px] text-cyan-400 font-semibold block">
                            {user.discipline}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{user.location}</span>
                        </div>
                      </div>

                      {isActive && (
                        <span className="p-1 rounded-full bg-cyan-400 text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PORTFOLIO ITEM CREATE / EDIT MODAL */}
      {isItemModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsItemModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#090F1E] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Portfolio Piece' : 'Add Talent Portfolio Piece'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemFormError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{itemFormError}</span>
              </div>
            )}

            <form onSubmit={handleSavePortfolioItem} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Piece Title *
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={e => setItemTitle(e.target.value)}
                  placeholder="e.g. Analog Tape Sessions / Noir Short Teaser / Bioluminescent Caverns"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              {/* Category & Media Type Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Creative Category
                  </label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value as CreativeCategory)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Media Format
                  </label>
                  <select
                    value={itemMediaType}
                    onChange={e => setItemMediaType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="audio">Audio Track / Master Recording</option>
                    <option value="video">Video Reel / Film Excerpt</option>
                    <option value="image">Artwork / Illustration / Photo</option>
                    <option value="link">Script / Manuscript / External Link</option>
                  </select>
                </div>
              </div>

              {/* Media URL + File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Media Asset (URL or Upload) *
                </label>
                <input
                  type="text"
                  required
                  value={itemMediaUrl}
                  onChange={e => setItemMediaUrl(e.target.value)}
                  placeholder="Paste audio link, YouTube URL, Vimeo, image link, or soundcloud..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none font-mono"
                />

                {/* Upload Button */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isUploading ? 'Processing File...' : 'Upload Asset / Media File'}</span>
                    <input
                      type="file"
                      accept="image/*,audio/*,video/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Supports MP3, WAV, MP4, PNG, JPG (up to 12MB)
                  </span>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/60">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Piece Description & Execution Context
                </label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  placeholder="Explain how this piece was created, techniques used, production notes..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white p-3 rounded-lg outline-none"
                />
              </div>

              {/* Skills Used Tags */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Skills & Disciplines Applied
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. Synthesizers, Arri Alexa</span>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={itemSkillInput}
                    onChange={e => setItemSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillToItem();
                      }
                    }}
                    placeholder="Add a skill used in this piece..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToItem()}
                    className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions based on selected category */}
                {SUGGESTED_SKILLS_BY_CATEGORY[itemCategory] && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-[10px] text-slate-400 py-0.5">Suggestions:</span>
                    {SUGGESTED_SKILLS_BY_CATEGORY[itemCategory].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkillToItem(s)}
                        disabled={itemSkills.includes(s)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          itemSkills.includes(s)
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {itemSkills.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded flex items-center gap-1.5"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillFromItem(s)}
                        className="text-cyan-500 hover:text-rose-400 text-sm leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Link to Completed MIXTORY Project */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Associate with Completed Project (Optional)
                </label>
                <input
                  type="text"
                  value={itemCompletedProject}
                  onChange={e => setItemCompletedProject(e.target.value)}
                  placeholder="e.g. Analog Dreams: Modular Synth EP"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-5 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {isSavingItem ? 'Saving...' : editingItem ? 'Update Piece' : 'Add to Talent Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR ARTWORK */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Artwork Full View"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
