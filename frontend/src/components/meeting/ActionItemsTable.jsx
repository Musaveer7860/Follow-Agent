import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { User, Calendar, Eye } from 'lucide-react';

export const ActionItemsTable = ({ tasks = [], onStatusChange, onOpenReminders }) => {
  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs font-medium">
        No action items extracted from this meeting.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
            <th className="py-3 px-4">Action Item</th>
            <th className="py-3 px-4">Owner</th>
            <th className="py-3 px-4">Deadline</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            return (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                  <span className={isCompleted ? 'line-through text-slate-400 font-normal' : ''}>
                    {task.title}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{task.owner || 'Unassigned'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {task.deadline ? (
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.deadline}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">TBD</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <Badge type="priority">{task.priority}</Badge>
                </td>

                <td className="py-3.5 px-4">
                  <Badge type="status">{task.status}</Badge>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant={isCompleted ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => onStatusChange(task.id, isCompleted ? 'Pending' : 'Completed')}
                    >
                      {isCompleted ? 'Reopen' : 'Mark Done'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => onOpenReminders([task.id])}
                      title="Preview Auto-Dispatched Email"
                    >
                      Preview Email
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
