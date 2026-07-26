import React from 'react';
import { TaskCard } from './TaskCard';

export const KanbanColumn = ({ title, status, tasks = [], onStatusChange, onOpenReminders, onEditTask }) => {
  const columnHeaderColors = {
    Pending: 'border-t-4 border-t-slate-400 bg-slate-100/60',
    'In Progress': 'border-t-4 border-t-indigo-600 bg-indigo-50/40',
    Completed: 'border-t-4 border-t-emerald-600 bg-emerald-50/40',
  };

  return (
    <div className={`rounded-2xl p-4 flex flex-col h-full min-h-[500px] border border-slate-200 shadow-sm ${columnHeaderColors[status] || 'bg-white'}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium bg-white/50">
            No tasks in {title.toLowerCase()}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onOpenReminders={onOpenReminders}
              onEdit={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
