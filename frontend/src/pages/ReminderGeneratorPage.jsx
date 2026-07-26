import React, { useState, useEffect } from 'react';
import { taskAPI } from '../api/services';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Copy, Check, User, Calendar, Mail, Zap, Clock, AlertCircle } from 'lucide-react';

export const ReminderGeneratorPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [platform, setPlatform] = useState('email');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      const pending = res.data.filter(t => t.status !== 'Completed');
      setTasks(pending);
      const initialIds = pending.map(t => t.id);
      setSelectedTaskIds(initialIds);
      if (initialIds.length > 0) {
        generateInitialReminders(initialIds, 'email');
      }
    } catch (err) {
      console.error("Failed to load tasks for reminders:", err);
    }
  };

  const generateInitialReminders = async (taskIds, targetPlatform) => {
    setLoading(true);
    try {
      const res = await taskAPI.generateReminders(taskIds, targetPlatform);
      setReminders(res.data.messages || []);
    } catch (err) {
      console.error("Failed to generate reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Automated Follow-Up Reminder Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          100% Zero-Click Priority Email Dispatcher — Emails auto-sent at exact priority intervals without manual admin action.
        </p>
      </div>

      {/* Zero-Click Permanent Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-700">
            <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>⚡ Zero-Click Automated Background Dispatcher Active</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
            Auto-Sending
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded-xl bg-white border border-emerald-200 text-rose-700 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>High Priority: Every 3 Hours</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-emerald-200 text-slate-700 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Low Priority: 2x Per Day (12h)</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-emerald-200 text-indigo-700 font-bold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Medium Priority: 1x Per Day (24h)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Select Tasks */}
        <Card hover={false} className="space-y-4 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Active Deliverables ({selectedTaskIds.length})</h3>
            <button
              onClick={() => setSelectedTaskIds(selectedTaskIds.length === tasks.length ? [] : tasks.map(t => t.id))}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              {selectedTaskIds.length === tasks.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-medium">No pending action items requiring follow-up.</p>
            ) : (
              tasks.map((t) => {
                const isSelected = selectedTaskIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-slate-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-1">
                        <p className="font-semibold leading-tight text-slate-900">{t.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><User className="w-3 h-3 text-indigo-600" />{t.owner || 'Unassigned'}</span>
                          {t.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" />{t.deadline}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Channel Preview Buttons */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Preview Target Channel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setPlatform('email'); generateInitialReminders(selectedTaskIds, 'email'); }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  platform === 'email' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => { setPlatform('slack'); generateInitialReminders(selectedTaskIds, 'slack'); }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  platform === 'slack' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Slack
              </button>
              <button
                onClick={() => { setPlatform('whatsapp'); generateInitialReminders(selectedTaskIds, 'whatsapp'); }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  platform === 'whatsapp' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>
        </Card>

        {/* Right Column: Generated Copy Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Auto-Dispatched Email Messages</h3>
            <span className="text-xs text-indigo-600 font-bold">● Priority-Driven Subject & Cadence</span>
          </div>

          {loading ? (
            <Card hover={false} className="py-20 text-center space-y-2 bg-white">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading priority email preview...</p>
            </Card>
          ) : reminders.length === 0 ? (
            <Card hover={false} className="py-20 text-center text-slate-500 text-xs font-medium bg-white">
              Select action items on the left to view auto-dispatched message templates.
            </Card>
          ) : (
            <div className="space-y-4">
              {reminders.map((rem, idx) => (
                <Card key={idx} hover={false} className="space-y-3 bg-white">
                  {/* Refined Subject Bar */}
                  {rem.subject && (
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Email Subject:</span>
                      <span className="font-mono text-indigo-700 font-bold truncate max-w-md">{rem.subject}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">Recipient: {rem.owner}</Badge>
                      <Badge type="priority">{rem.priority}</Badge>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Deadline: {rem.deadline}</span>
                  </div>

                  {/* Message Body */}
                  <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {rem.message}
                  </pre>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Auto-Dispatched in Background
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={copiedIndex === idx ? Check : Copy}
                        onClick={() => handleCopy(rem.message, idx)}
                      >
                        {copiedIndex === idx ? 'Copied!' : 'Copy Text'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
