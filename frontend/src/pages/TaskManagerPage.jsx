import React, { useState, useEffect } from 'react';
import { taskAPI } from '../api/services';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ReminderModal } from '../components/meeting/ReminderModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Filter, Send } from 'lucide-react';

export const TaskManagerPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  // New/Edit task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Pending');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      if (editingTask) {
        await taskAPI.update(editingTask.id, {
          title: taskTitle,
          owner: taskOwner || 'Unassigned',
          deadline: taskDeadline,
          priority: taskPriority,
          status: taskStatus,
        });
      } else {
        await taskAPI.create({
          title: taskTitle,
          owner: taskOwner || 'Unassigned',
          deadline: taskDeadline,
          priority: taskPriority,
          status: taskStatus,
        });
      }
      resetTaskForm();
      fetchTasks();
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskOwner(task.owner || '');
    setTaskDeadline(task.deadline || '');
    setTaskPriority(task.priority || 'Medium');
    setTaskStatus(task.status || 'Pending');
    setIsAddModalOpen(true);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskOwner('');
    setTaskDeadline('');
    setTaskPriority('Medium');
    setTaskStatus('Pending');
    setIsAddModalOpen(false);
  };

  const handleOpenReminder = (task) => {
    setSelectedTaskIds([task.id]);
    setIsReminderOpen(true);
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.owner && t.owner.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesOwner = !ownerFilter || (t.owner && t.owner.toLowerCase().includes(ownerFilter.toLowerCase()));
    return matchesSearch && matchesPriority && matchesOwner;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Action Item Task Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kanban board tracking deliverables extracted from meetings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            icon={Send}
            onClick={() => {
              setSelectedTaskIds(filteredTasks.map(t => t.id));
              setIsReminderOpen(true);
            }}
          >
            Bulk Reminders
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              resetTaskForm();
              setIsAddModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card hover={false} className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search tasks by title or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { label: 'All Priorities', value: '' },
              { label: 'High Priority', value: 'High' },
              { label: 'Medium Priority', value: 'Medium' },
              { label: 'Low Priority', value: 'Low' },
            ]}
          />

          <Input
            placeholder="Filter by owner name..."
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            icon={Filter}
          />
        </div>
      </Card>

      {/* Main Kanban Board */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading Kanban board...</p>
        </div>
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onOpenReminders={handleOpenReminder}
          onEditTask={handleOpenEditModal}
        />
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={resetTaskForm}
        title={editingTask ? 'Edit Action Item' : 'Add Manual Action Item'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title / Description"
            required
            placeholder="e.g. Build JWT authentication API"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner / Assignee"
              placeholder="e.g. Assignee name"
              value={taskOwner}
              onChange={(e) => setTaskOwner(e.target.value)}
            />

            <Input
              label="Target Deadline"
              type="date"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              options={[
                { label: 'High Priority', value: 'High' },
                { label: 'Medium Priority', value: 'Medium' },
                { label: 'Low Priority', value: 'Low' },
              ]}
            />

            <Select
              label="Status"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Completed', value: 'Completed' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={resetTaskForm}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reminders Generator Modal */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        taskIds={selectedTaskIds}
      />
    </div>
  );
};
