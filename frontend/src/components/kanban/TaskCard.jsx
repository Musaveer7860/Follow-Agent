import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Calendar, ArrowRight, ArrowLeft, MailCheck, Clock, AlertCircle } from 'lucide-react';

export const TaskCard = ({ task, onStatusChange, onOpenReminders, onEdit }) => {
  const ownerInitial = task.owner ? task.owner.charAt(0).toUpperCase() : 'U';
  const scheduledDate = task.scheduled_email_date || task.deadline;
  const pLower = (task.priority || 'medium').toLowerCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <h5
          onClick={() => onEdit && onEdit(task)}
          className="text-xs font-bold text-slate-900 leading-relaxed hover:text-indigo-600 cursor-pointer transition-colors"
        >
          {task.title}
        </h5>
        <Badge type="priority">{task.priority}</Badge>
      </div>

      {/* Priority-Frequency Email Dispatch Badge */}
      <div className={`flex items-center gap-1.5 text-[10px] p-1.5 rounded-lg border font-semibold ${
        pLower === 'high'
          ? 'bg-rose-50 border-rose-200 text-rose-700'
          : pLower === 'low'
          ? 'bg-slate-100 border-slate-200 text-slate-700'
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
      }`}>
        {task.email_sent ? (
          <>
            <MailCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {pLower === 'high' && `🚨 Auto-Email Every 3 Hours Active`}
              {pLower === 'low' && `📌 Auto-Email 2x Per Day (12h)`}
              {pLower === 'medium' && `⚡ Auto-Email 1x Per Day (24h)`}
            </span>
          </>
        ) : (
          <>
            {pLower === 'high' ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            )}
            <span>
              {pLower === 'high' && `🚨 Auto-Email Every 3 Hours (Due: ${scheduledDate})`}
              {pLower === 'low' && `📌 Auto-Email 2x Per Day (Due: ${scheduledDate})`}
              {pLower === 'medium' && `⚡ Auto-Email 1x Per Day (Due: ${scheduledDate})`}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        {/* Human Avatar Chip */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-[10px] text-indigo-700">
            {ownerInitial}
          </div>
          <span className="font-semibold text-slate-700">{task.owner || 'Unassigned'}</span>
        </div>

        {/* Deadline Badge */}
        {task.deadline && (
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{task.deadline}</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-1">
        {onOpenReminders && (
          <button
            onClick={() => onOpenReminders(task)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Remind Now
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {task.status !== 'Pending' && (
            <button
              onClick={() => onStatusChange(task.id, task.status === 'Completed' ? 'In Progress' : 'Pending')}
              className="p-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Move Back"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {task.status !== 'Completed' && (
            <button
              onClick={() => onStatusChange(task.id, task.status === 'Pending' ? 'In Progress' : 'Completed')}
              className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 text-[10px] px-1.5 font-bold shadow-sm"
              title="Move Forward"
            >
              <span>{task.status === 'Pending' ? 'Start' : 'Done'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
