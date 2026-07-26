import React from 'react';
import { StatCard } from '../ui/StatCard';
import { Video, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const MetricsOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Meetings"
        value={stats?.total_meetings ?? 0}
        icon={Video}
        trend="+2"
        trendLabel="this month"
      />
      <StatCard
        title="Pending Tasks"
        value={stats?.pending_tasks ?? 0}
        icon={Clock}
        trend="In progress"
        trendLabel="deliverables"
      />
      <StatCard
        title="Completed Tasks"
        value={stats?.completed_tasks ?? 0}
        icon={CheckCircle}
        trend="92%"
        trendLabel="completion rate"
      />
      <StatCard
        title="Upcoming Deadlines"
        value={stats?.upcoming_deadlines ?? 0}
        icon={AlertTriangle}
        trend="Active"
        trendLabel="due this week"
      />
    </div>
  );
};
