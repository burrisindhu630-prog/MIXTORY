import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MessageSquare,
  Check,
  XCircle,
  ExternalLink,
  Clock,
  Send,
  Inbox,
  Undo2,
  RotateCcw,
  Loader2,
  Sparkles
} from 'lucide-react';

export const CollabInboxModal: React.FC = () => {
  const {
    setActiveModal,
    collabRequests,
    currentUser,
    respondToCollabRequest,
    withdrawCollabRequest,
    setSelectedProject,
    projects,
    openCreatorProfile,
    getCreatorPortfolio
  } = useApp();

  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accept' | 'decline' | 'withdraw' | null>(null);

  const incomingRequests = collabRequests.filter(
    r => r.receiver_id === currentUser?.id
  );

  const outgoingRequests = collabRequests.filter(
    r => r.sender_id === currentUser?.id
  );

  const handleViewProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setActiveModal('project-detail');
    }
  };

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    setLoadingAction('accept');
    await respondToCollabRequest(id, 'accepted');
    setLoadingId(null);
    setLoadingAction(null);
  };

  const handleDecline = async (id: string) => {
    setLoadingId(id);
    setLoadingAction('decline');
    await respondToCollabRequest(id, 'declined');
    setLoadingId(null);
    setLoadingAction(null);
  };

  const handleWithdraw = async (id: string) => {
    setLoadingId(id);
    setLoadingAction('withdraw');
    await withdrawCollabRequest(id);
    setLoadingId(null);
    setLoadingAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#090F1E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#070B14]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Collaboration Hub & Pitches</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center border-b border-slate-800 px-6 pt-3 bg-slate-950/40 gap-4">
          <button
            onClick={() => setTab('incoming')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'incoming'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Pitches Received</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 font-mono tabular-nums">
              {incomingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setTab('outgoing')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'outgoing'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pitches Sent</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 font-mono tabular-nums">
              {outgoingRequests.length}
            </span>
          </button>
        </div>

        {/* List Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {tab === 'incoming' ? (
            incomingRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-300">No incoming pitches yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When creators propose collaboration on your projects, their role proposals and messages will appear here.
                </p>
              </div>
            ) : (
              incomingRequests.map(req => {
                const isLoading = loadingId === req.id;
                return (
                  <div
                    key={req.id}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-3 cursor-pointer group/sender"
                        onClick={() => openCreatorProfile(req.sender)}
                        title={`View ${req.sender.name}'s talent portfolio`}
                      >
                        <img
                          src={req.sender.avatar_url}
                          alt={req.sender.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-cyan-500/40 group-hover/sender:ring-cyan-400 transition-colors"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover/sender:text-cyan-300 transition-colors">
                              {req.sender.name}
                            </span>
                            <span className="text-[11px] text-cyan-400 font-mono">
                              · {req.sender.discipline}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block">
                            Offered Role:{' '}
                            <span className="font-semibold text-slate-200">{req.role_offered}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <button
                          onClick={() => openCreatorProfile(req.sender)}
                          className="text-xs text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded border border-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>Talent Portfolio ({getCreatorPortfolio(req.sender.id).length})</span>
                        </button>
                        <button
                          onClick={() => handleViewProject(req.project_id)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>For: {req.project_title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Message body */}
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      "{req.message}"
                    </div>

                    {/* Portfolio link */}
                    {req.portfolio_link && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Portfolio:</span>
                        <a
                          href={req.portfolio_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>{req.portfolio_link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Actions / Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Received {new Date(req.created_at).toLocaleDateString()}
                      </span>

                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isLoading}
                            onClick={() => handleDecline(req.id)}
                            className="px-3 py-1.5 text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            {isLoading && loadingAction === 'decline' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span>Decline</span>
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => handleAccept(req.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {isLoading && loadingAction === 'accept' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Accept & Co-Create</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded capitalize flex items-center gap-1 ${
                              req.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'declined'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {req.status === 'accepted' && <Check className="w-3.5 h-3.5" />}
                            {req.status === 'declined' && <XCircle className="w-3.5 h-3.5" />}
                            {req.status === 'withdrawn' && <RotateCcw className="w-3.5 h-3.5" />}
                            <span>{req.status === 'withdrawn' ? 'Withdrawn by Sender' : req.status}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : outgoingRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Send className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">No outgoing collaboration pitches</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore the discover feed and pitch your creative skills to unfinished projects or concept ideas.
              </p>
            </div>
          ) : (
            outgoingRequests.map(req => {
              const isLoading = loadingId === req.id;
              return (
                <div
                  key={req.id}
                  className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                        Target Project
                      </span>
                      <h4 className="text-xs font-bold text-white">{req.project_title}</h4>
                      <span className="text-[11px] text-slate-400 block">
                        Your Proposed Role: <strong className="text-slate-200">{req.role_offered}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {req.status === 'pending' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleWithdraw(req.id)}
                          className="px-2.5 py-1 text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/40 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          title="Withdraw this collaboration pitch"
                        >
                          {isLoading && loadingAction === 'withdraw' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                          ) : (
                            <Undo2 className="w-3 h-3 text-rose-400" />
                          )}
                          <span>Withdraw</span>
                        </button>
                      )}

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded capitalize flex items-center gap-1 ${
                          req.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'declined'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : req.status === 'withdrawn'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {req.status === 'accepted' && <Check className="w-3.5 h-3.5" />}
                        {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status === 'declined' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status === 'withdrawn' && <RotateCcw className="w-3.5 h-3.5" />}
                        <span>Status: {req.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                    "{req.message}"
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    <span>Sent {new Date(req.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleViewProject(req.project_id)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Project</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
