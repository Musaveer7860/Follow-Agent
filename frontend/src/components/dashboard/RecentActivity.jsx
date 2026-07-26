import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Video, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivity = ({ meetings = [] }) => {
  return (
    <Card hover={false} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Meetings Analyzed</h4>
          <p className="text-xs text-slate-500">Click a meeting to view full summary, MOM & action items</p>
        </div>
        <Link to="/meetings" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {meetings.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No meeting transcripts analyzed yet.</p>
        ) : (
          meetings.slice(0, 4).map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {meeting.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {meeting.summary || "Transcript processed with AI action extraction."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{meeting.date}</span>
                </div>
                <Badge variant="info">{meeting.tasks?.length || 0} Action Items</Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
};
