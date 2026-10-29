import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Sparkles, User, Briefcase, Link as LinkIcon, MessageSquare } from 'lucide-react';

export const CollabRequestModal: React.FC = () => {
  const { selectedProject, setActiveModal, sendCollabRequest, currentUser } = useApp();

  const [roleOffered, setRoleOffered] = useState('');
  const [message, setMessage] = useState('');
  const [portfolioLink, setPortfolioLink] = useState(currentUser?.portfolio_url || '');
  const [isSending, setIsSending] = useState(false);

  if (!selectedProject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleOffered.trim() || !message.trim()) return;

    setIsSending(true);
    await sendCollabRequest(
      selectedProject.id,
      roleOffered.trim(),
      message.trim(),
      portfolioLink.trim() || undefined
    );
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#090F1E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070B14]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Propose Creative Collaboration</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Target Badge */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
          <img
            src={selectedProject.cover_image}
            alt={selectedProject.title}
            className="w-12 h-12 rounded-lg object-cover border border-slate-700"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
              Applying to:
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {selectedProject.title}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              Creator: {selectedProject.creator.name} ({selectedProject.creator.discipline})
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Skill / Role You Offer *</span>
            </label>
            <input
              type="text"
              required
              value={roleOffered}
              onChange={e => setRoleOffered(e.target.value)}
              placeholder="e.g. Lead Vocalist, Foley Artist, Colorist, Screenwriter"
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white px-3.5 py-2.5 rounded-lg outline-none"
            />
            {/* Quick suggestions from the project's sought skills */}
            {selectedProject.required_skills && selectedProject.required_skills.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Suggested:</span>
                {selectedProject.required_skills.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRoleOffered(s)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700/80 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Pitch & Vision *</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Explain how your creative style fits this project, your timeline availability, and what you would like to contribute..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white p-3 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Portfolio / Reel / Bandcamp Link</span>
            </label>
            <input
              type="url"
              value={portfolioLink}
              onChange={e => setPortfolioLink(e.target.value)}
              placeholder="https://vimeo.com/... or soundcloud or behance"
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white px-3.5 py-2.5 rounded-lg outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send Collaboration Pitch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
