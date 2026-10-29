import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreativeCategory, ProjectStatus, ProjectVisibility } from '../types';
import { X, Sparkles, Plus, Image as ImageIcon, Shield, CheckCircle2, Clock, Lightbulb } from 'lucide-react';

const CATEGORIES: CreativeCategory[] = [
  'Music',
  'Singing',
  'Dance',
  'Art',
  'Writing',
  'Filmmaking',
  'Video Editing'
];

const PRESET_COVERS = [
  { name: 'Music (Instruments & Studio)', url: '/src/assets/images/creative_project_music_1793209901138.jpg' },
  { name: 'Singing (Microphone & Vocal Booth)', url: '/src/assets/images/cat_bg_singing_1793237432240.jpg' },
  { name: 'Dance (Dancer in Studio)', url: '/src/assets/images/cat_bg_dance_1793237432007.jpg' },
  { name: 'Art (Painting & Atelier)', url: '/src/assets/images/cat_bg_art_1793237434236.jpg' },
  { name: 'Writing (Notebooks & Drafts)', url: '/src/assets/images/cat_bg_writing_1793237434131.jpg' },
  { name: 'Filmmaking (Cinema Camera Set)', url: '/src/assets/images/creative_project_film_1793209901624.jpg' },
  { name: 'Video Editing (Timeline Suite)', url: '/src/assets/images/cat_bg_video_editing_1793237434610.jpg' }
];

export const CreateProjectModal: React.FC = () => {
  const { setActiveModal, createProject } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CreativeCategory>('Music');
  const [status, setStatus] = useState<ProjectStatus>('Unfinished');
  const [visibility, setVisibility] = useState<ProjectVisibility>('public');
  const [openForCollab, setOpenForCollab] = useState(true);
  const [demoLink, setDemoLink] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Skills tags
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'Sound Design',
    'Mixing Engineer'
  ]);

  const [completionPercentage, setCompletionPercentage] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const finalCover = customCoverUrl.trim() || coverImage;

    await createProject({
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      visibility,
      open_for_collab: openForCollab,
      required_skills: requiredSkills,
      demo_link: demoLink.trim() || undefined,
      cover_image: finalCover,
      completion_percentage: completionPercentage
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#090F1E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070B14]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-base font-bold text-white">Share a Project on MIXTORY</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Neon Horizon - Synthwave Short Film Soundtrack"
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white px-3.5 py-2.5 rounded-lg outline-none transition-colors"
            />
          </div>

          {/* Category & Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Creative Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CreativeCategory)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-white px-3.5 py-2.5 rounded-lg outline-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Stage / Completion Status *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Idea', 'Unfinished', 'Finished'] as ProjectStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatus(st);
                      if (st === 'Finished') setCompletionPercentage(100);
                      else if (st === 'Idea') setCompletionPercentage(20);
                      else setCompletionPercentage(60);
                    }}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-colors flex items-center justify-center gap-1 ${
                      status === st
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'Finished' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {st === 'Unfinished' && <Clock className="w-3 h-3 text-amber-400" />}
                    {st === 'Idea' && <Lightbulb className="w-3 h-3 text-cyan-400" />}
                    <span>{st}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Progress / Completion:
              </span>
              <span className="font-mono text-cyan-400 tabular-nums font-bold">
                {completionPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={completionPercentage}
              onChange={e => setCompletionPercentage(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Description & Collaboration Goal *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your creative vision, the aesthetic tone, what has been produced so far, and what kind of collaborators you are looking to work with..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white p-3 rounded-lg outline-none transition-colors"
            />
          </div>

          {/* Required Skills Tagging */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Required Skills / Roles Needed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Colorist, Lyricist, Session Drummer, Foley Artist"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick cross-category suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                Cross-Talent Suggestions:
              </span>
              {[
                'Contemporary Dancer',
                'Lead Vocalist',
                'Screenwriter',
                'DaVinci Colorist',
                'Foley Artist',
                'VFX Artist',
                'Concept Illustrator'
              ].map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    if (!requiredSkills.includes(sug)) {
                      setRequiredSkills([...requiredSkills, sug]);
                    }
                  }}
                  disabled={requiredSkills.includes(sug)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    requiredSkills.includes(sug)
                      ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700 hover:text-white border-slate-700'
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-300 rounded border border-cyan-800/50 flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-cyan-500 hover:text-rose-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Demo Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              WIP Demo / Reel Link (Optional)
            </label>
            <input
              type="url"
              value={demoLink}
              onChange={e => setDemoLink(e.target.value)}
              placeholder="https://soundcloud.com/... or https://vimeo.com/... or drive/notion url"
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3.5 py-2 rounded-lg outline-none"
            />
          </div>

          {/* Cover Image Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Cover Artwork
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_COVERS.map(preset => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setCoverImage(preset.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                    coverImage === preset.url && !customCoverUrl
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-white p-1 text-center truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={customCoverUrl}
              onChange={e => setCustomCoverUrl(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none"
            />
          </div>

          {/* Privacy & Visibility Settings (Rule 9) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Privacy & Collaboration Permissions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'public', title: 'Public', desc: 'Listed on homepage feed & search' },
                  { id: 'community', title: 'Community', desc: 'Only visible to signed-in creators' },
                  { id: 'unlisted', title: 'Unlisted', desc: 'Accessible only via direct share link' }
                ] as const
              ).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVisibility(opt.id)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    visibility === opt.id
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={openForCollab}
                onChange={e => setOpenForCollab(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-xs text-slate-300">
                Allow other creators to send collaboration pitches for this project
              </span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to MIXTORY'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
