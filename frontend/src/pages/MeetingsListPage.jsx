import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../api/services';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Video, Search, FilePlus, Calendar, ChevronRight } from 'lucide-react';

export const MeetingsListPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await meetingAPI.getAll();
      setMeetings(res.data);
    } catch (err) {
      console.error("Failed to load meetings list:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.summary && m.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Meeting Intelligence History</h1>
          <p className="text-xs text-slate-500 mt-1">Browse, search, and export minutes for past meeting transcripts</p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={FilePlus}
          onClick={() => navigate('/upload')}
        >
          Analyze New Meeting
        </Button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by meeting title or summary keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Meetings Grid / List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading meeting history...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card hover={false} className="py-16 text-center space-y-4">
          <Video className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">No Meetings Found</h4>
            <p className="text-xs text-slate-500 font-medium">Try adjusting your search filter or paste a new transcript.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/upload')}>
            Analyze First Meeting
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform mt-1 sm:mt-0">
                    <Video className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {meeting.title}
                      </h3>
                      <Badge variant="info">{meeting.tasks?.length || 0} Action Items</Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                      {meeting.summary || "Transcript processed with AI action extraction."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.date}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
