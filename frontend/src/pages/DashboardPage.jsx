import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, meetingAPI } from '../api/services';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { TaskCompletionChart } from '../components/dashboard/TaskCompletionChart';
import { PriorityChart } from '../components/dashboard/PriorityChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Button } from '../components/ui/Button';
import { FilePlus, KanbanSquare, Send } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, meetingsRes] = await Promise.all([
          userAPI.getDashboardStats(),
          meetingAPI.getAll()
        ]);
        setStats(statsRes.data);
        setMeetings(meetingsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading workspace analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner - Fresh Light/Dark Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Welcome back,</span>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">{user?.role || 'Product Lead'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {user?.name || 'Team Leader'}'s Dashboard
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You have <strong className="text-slate-900 dark:text-white font-semibold">{stats?.pending_tasks ?? 0} active deliverables</strong> across {stats?.total_meetings ?? 0} recent meetings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={FilePlus}
            onClick={() => navigate('/upload')}
          >
            New Meeting
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={KanbanSquare}
            onClick={() => navigate('/tasks')}
          >
            Task Board
          </Button>
          <Button
            variant="glass"
            size="sm"
            icon={Send}
            onClick={() => navigate('/reminders')}
          >
            Reminders
          </Button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <MetricsOverview stats={stats} />

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskCompletionChart data={stats?.meetings_trend || []} />
        </div>
        <div>
          <PriorityChart priorityData={stats?.priority_distribution || {}} />
        </div>
      </div>

      {/* Recent Activity List */}
      <RecentActivity meetings={meetings} />
    </div>
  );
};
