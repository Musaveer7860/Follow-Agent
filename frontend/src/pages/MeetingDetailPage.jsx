import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingAPI, taskAPI } from '../api/services';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { ActionItemsTable } from '../components/meeting/ActionItemsTable';
import { ReminderModal } from '../components/meeting/ReminderModal';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Trash2,
  Sparkles,
  Zap
} from 'lucide-react';

export const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchMeetingDetail();
  }, [id]);

  const fetchMeetingDetail = async () => {
    try {
      const res = await meetingAPI.getById(id);
      setMeeting(res.data);
    } catch (err) {
      console.error("Failed to load meeting details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      fetchMeetingDetail();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await meetingAPI.exportPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Minutes_of_Meeting_${meeting.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF MOM:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this meeting record?")) {
      try {
        await meetingAPI.delete(id);
        navigate('/meetings');
      } catch (err) {
        console.error("Failed to delete meeting:", err);
      }
    }
  };

  const handleOpenReminderModal = (taskIds) => {
    setSelectedTaskIds(taskIds);
    setIsReminderOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-500 text-sm font-medium">Meeting record not found.</p>
        <Link to="/meetings"><Button variant="secondary" size="sm">Back to Meetings</Button></Link>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Executive Summary', icon: Sparkles },
    { id: 'tasks', label: 'Action Items & Owners', icon: CheckCircle2, count: meeting.tasks?.length || 0 },
    { id: 'decisions', label: 'Decisions & Risks', icon: AlertTriangle, count: (meeting.decisions?.length || 0) + (meeting.risks?.length || 0) },
    { id: 'transcript', label: 'Raw Transcript', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/meetings')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Meeting History
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
          >
            Delete
          </Button>

          <Button
            variant="glass"
            size="sm"
            icon={Send}
            onClick={() => handleOpenReminderModal(meeting.tasks.map(t => t.id))}
          >
            Preview Copy
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            loading={pdfLoading}
            onClick={handleExportPDF}
          >
            Export MOM PDF
          </Button>
        </div>
      </div>

      {/* Zero-Click Automated Email Delivery Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-emerald-700">
          <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>⚡ Zero-Click Email Dispatch: Email reminders auto-sent to assigned owners for deliverables due before meeting deadlines.</span>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold shrink-0 text-[11px]">
          ✓ Auto-Dispatched
        </span>
      </div>

      {/* Title & Metadata Card */}
      <Card hover={false} className="border-indigo-100 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="info">AI Analyzed</Badge>
              <span className="text-xs text-slate-500 font-medium">{meeting.duration || '30 mins'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{meeting.title}</h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{meeting.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{meeting.tasks?.length || 0} Action Items</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content Views */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <Card hover={false} className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">Executive Summary</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
              {meeting.summary || "No summary recorded."}
            </p>
          </Card>

          {/* Quick Action Items Preview */}
          <Card hover={false} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Extracted Action Items ({meeting.tasks?.length || 0})</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>View All</Button>
            </div>
            <ActionItemsTable
              tasks={meeting.tasks || []}
              onStatusChange={handleTaskStatusChange}
              onOpenReminders={handleOpenReminderModal}
            />
          </Card>
        </div>
      )}

      {activeTab === 'tasks' && (
        <Card hover={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Action Items & Owner Assignments</h3>
            <Button
              variant="glass"
              size="sm"
              icon={Send}
              onClick={() => handleOpenReminderModal(meeting.tasks.map(t => t.id))}
            >
              Preview Messages
            </Button>
          </div>
          <ActionItemsTable
            tasks={meeting.tasks || []}
            onStatusChange={handleTaskStatusChange}
            onOpenReminders={handleOpenReminderModal}
          />
        </Card>
      )}

      {activeTab === 'decisions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Decisions */}
          <Card hover={false} className="space-y-3 border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">Key Decisions Approved</h3>
            </div>
            {meeting.decisions && meeting.decisions.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-800 font-medium">
                {meeting.decisions.map((dec, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{dec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 font-medium">No explicit key decisions detected.</p>
            )}
          </Card>

          {/* Risks & Followups */}
          <Card hover={false} className="space-y-3 border-amber-200 bg-amber-50/20">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">Identified Risks & Follow-ups</h3>
            </div>
            {meeting.risks && meeting.risks.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-800 font-medium">
                {meeting.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 font-medium">No risks identified.</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'transcript' && (
        <Card hover={false} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Raw Meeting Transcript</h3>
          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {meeting.transcript}
          </pre>
        </Card>
      )}

      {/* Reminder Generation Modal */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        taskIds={selectedTaskIds}
      />
    </div>
  );
};
