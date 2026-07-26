import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  KanbanSquare, 
  Send, 
  ArrowRight,
  Video,
  Layers,
  Sparkles,
  Users,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white flex flex-col selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0B0F17]/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Follow Agent
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="primary" size="sm" icon={ArrowRight} className="font-bold">Authorized Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Follow-up Agent for Product & Tech Teams</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white max-w-3xl mx-auto"
          >
            Meetings end. Action items <span className="text-indigo-600 dark:text-indigo-400">shouldn't get lost.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Paste your transcript or meeting notes. Follow Agent automatically extracts key decisions, assigns owners, tracks deadlines on a Kanban board, and generates Slack follow-up reminders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link to="/login">
              <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto text-sm px-6 font-bold">
                Authorized Workspace Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Clean App Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8 max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <span>meetmind-workspace.app/meeting/q3-roadmap</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Live Sync</span>
              </div>

              <div className="p-6 text-left space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Q3 Product Strategy & Tech Architecture Sync</h4>
                    <p className="text-xs text-slate-500">45 mins • 4 Attendees • July 25</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    4 Action Items Extracted
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">📌 Executive Summary</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      The team aligned on Q3 launch targets. Responsibilities were assigned for JWT auth security, Gemini API fallback caching, and visual assets.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">⚡ Assigned Deliverables</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">Finalize JWT refresh token flow</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-bold">Alex • High</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">Gemini fallback caching layer</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold">Vikram • High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 px-6 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Everything You Need After a Meeting</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Designed to save product leads, managers, and engineers hours of manual note-taking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automatic Owner Assignment</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects who promised to do what during the discussion and creates task cards with target deadlines.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <KanbanSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kanban Task Tracking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Move deliverables across Pending, In Progress, and Completed columns. Filter by priority and team member.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1-Click Slack & Email Copy</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates polite, formatted reminder messages tailored for Slack, Email, or WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Follow Agent — Smart Executive Meeting Intelligence.</p>
      </footer>
    </div>
  );
};
