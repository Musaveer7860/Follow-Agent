import React from 'react';
import { KanbanColumn } from './KanbanColumn';

export const KanbanBoard = ({ tasks = [], onStatusChange, onOpenReminders, onEditTask }) => {
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="Pending"
        status="Pending"
        tasks={pendingTasks}
        onStatusChange={onStatusChange}
        onOpenReminders={onOpenReminders}
        onEditTask={onEditTask}
      />
      <KanbanColumn
        title="In Progress"
        status="In Progress"
        tasks={inProgressTasks}
        onStatusChange={onStatusChange}
        onOpenReminders={onOpenReminders}
        onEditTask={onEditTask}
      />
      <KanbanColumn
        title="Completed"
        status="Completed"
        tasks={completedTasks}
        onStatusChange={onStatusChange}
        onOpenReminders={onOpenReminders}
        onEditTask={onEditTask}
      />
    </div>
  );
};
