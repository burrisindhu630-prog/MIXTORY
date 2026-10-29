import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Code,
  ShieldCheck,
  Server
} from 'lucide-react';

const RECOMMENDED_SQL_SCHEMA = `-- MIXTORY Supabase Backend Tables & Policies
-- Run this in your Supabase SQL Editor if creating or verifying tables

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  discipline TEXT,
  bio TEXT,
  skills TEXT[],
  location TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  creator_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator JSONB,
  likes_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  views_count INT DEFAULT 1,
  visibility TEXT DEFAULT 'public',
  cover_image TEXT,
  demo_link TEXT,
  audio_preview_url TEXT,
  open_for_collab BOOLEAN DEFAULT true,
  completion_percentage INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.projects FOR SELECT USING (visibility = 'public');

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);
`;

export const SupabaseStatusModal: React.FC = () => {
  const { supabaseStatus, recheckSupabase, setActiveModal, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard?.writeText(RECOMMENDED_SQL_SCHEMA);
    setCopied(true);
    showToast('SQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setIsChecking(true);
    await recheckSupabase();
    setIsChecking(false);
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
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Supabase Backend Integration Status</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              supabaseStatus.isConfigured
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
            }`}
          >
            {supabaseStatus.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Server className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-bold text-white">
                {supabaseStatus.isConfigured
                  ? 'Connected to Existing Supabase Backend'
                  : 'Running in Demo Sandbox Mode (Ready for Tomorrow\'s Demo)'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {supabaseStatus.isConfigured
                  ? `Active connection detected: ${supabaseStatus.supabaseUrl}. Database schema has been safely inspected.`
                  : 'All features (project feed, filtering, creating, liking, saving, and collaboration requests) are fully operational using persistent local sandbox storage. No database replacement was performed.'}
              </p>
            </div>
          </div>

          {/* Table Schema Probing Results */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Safe Database Schema Inspection
              </span>
              <button
                onClick={handleRefresh}
                disabled={isChecking}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Re-Inspect Database</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                { name: 'projects table', found: supabaseStatus.tableProjectsFound },
                { name: 'profiles table', found: supabaseStatus.tableProfilesFound }
              ].map(table => (
                <div
                  key={table.name}
                  className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-xs font-mono text-slate-300">{table.name}</span>
                  {supabaseStatus.isConfigured ? (
                    table.found ? (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Found
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Sandbox</span>
                  )}
                </div>
              ))}
            </div>

            {supabaseStatus.lastError && (
              <p className="text-[11px] text-amber-300/80 font-mono mt-1">
                Notice: {supabaseStatus.lastError}
              </p>
            )}
          </div>

          {/* Configuration Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Connecting Your Team's Supabase Project
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              To link your team's live Supabase instance, supply these standard Vite environment variables:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 select-all space-y-1">
              <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...</div>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Credentials remain strictly in environment variables, never hardcoded in source.</span>
            </p>
          </div>

          {/* Recommended Supabase Schema SQL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Reference Schema DDL for Your Supabase Database</span>
              </span>
              <button
                onClick={handleCopySQL}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {RECOMMENDED_SQL_SCHEMA}
            </pre>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
