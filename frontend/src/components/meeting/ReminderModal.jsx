import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { taskAPI } from '../../api/services';
import { Copy, Check, Send, Mail, MessageSquare, Zap, CheckCircle2 } from 'lucide-react';

export const ReminderModal = ({ isOpen, onClose, taskIds = [] }) => {
  const [platform, setPlatform] = useState('email');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (isOpen && taskIds.length > 0) {
      fetchReminders();
    }
  }, [isOpen, taskIds, platform]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await taskAPI.generateReminders(taskIds, platform);
      setReminders(res.data.messages || []);
    } catch (err) {
      console.error("Failed to generate reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Automated Priority Email Dispatch Status">
      <div className="space-y-4">
        {/* Zero-Click Automated Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 font-bold">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>⚡ 100% Zero-Click Automated Dispatch Active: Reminders auto-sent (3hrs for High, 12h for Low, 24h for Medium).</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wide">
            Auto-Sent
          </span>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setPlatform('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              platform === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Dispatch Preview
          </button>
          <button
            onClick={() => setPlatform('slack')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              platform === 'slack' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Slack / Teams Preview
          </button>
          <button
            onClick={() => setPlatform('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              platform === 'whatsapp' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            WhatsApp Preview
          </button>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading priority email preview...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            No tasks selected.
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                {rem.subject && (
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">Subject:</span>
                    <span className="font-mono text-indigo-700 font-bold truncate max-w-xs">{rem.subject}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600">Recipient: {rem.owner}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Deadline: {rem.deadline}</span>
                </div>
                <pre className="text-xs text-slate-900 font-sans whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {rem.message}
                </pre>
                <div className="flex justify-end">
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
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
