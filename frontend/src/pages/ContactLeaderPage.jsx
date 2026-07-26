import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, queryAPI } from '../api/services';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  Users, 
  Crown, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Building,
  HelpCircle,
  Clock
} from 'lucide-react';
import { isHigherRole } from '../utils/authUtils';

export const ContactLeaderPage = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myQueries, setMyQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Contact Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resLeaders, resQueries] = await Promise.all([
        userAPI.getLeaders(),
        queryAPI.getQueries(),
      ]);
      setLeaders(resLeaders.data || []);
      setMyQueries(resQueries.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load leaders or queries list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openContactModal = (leader) => {
    setSelectedLeader(leader);
    setSubject(`Query / Update Request from ${user?.name || 'Team Member'}`);
    setMessage('');
    setSuccessMsg('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedLeader || !subject.trim() || !message.trim()) return;

    setSending(true);
    setError('');
    setSuccessMsg('');

    try {
      await queryAPI.sendQuery({
        recipient_id: selectedLeader.id,
        subject: subject.trim(),
        message: message.trim()
      });
      setSuccessMsg(`Your query has been sent to ${selectedLeader.name} (${selectedLeader.role})!`);
      fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send message to leader.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Leadership & Admin Queries Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Contact Leaders & Ask Queries
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Reach out directly to your assigned Leaders, Product Managers, and System Admins. Track your submitted questions and view responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            loading={loading}
            icon={Sparkles}
          >
            Refresh Directory
          </Button>
        </div>
      </div>

      {/* User Role Info Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{user?.name}</span>
              <Badge variant={isHigherRole(user?.role) ? "primary" : "secondary"}>
                {user?.role || 'Team Member'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {isHigherRole(user?.role) 
                ? "You have Managerial & Admin Privileges. You can respond to queries in the Admin Portal." 
                : "You can ask queries directly to your assigned leader below."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Direct Leader Messaging Enabled</span>
        </div>
      </div>

      {/* Notification messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Leaders List Section */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-600" />
          <span>Available Leaders & Managers ({leaders.length})</span>
        </h2>

        {leaders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            No leaders listed in directory currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaders.map((leader) => (
              <div 
                key={leader.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <Badge variant="primary">
                      {leader.role || 'Leader'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{leader.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{leader.email}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openContactModal(leader)}
                  icon={MessageSquare}
                  className="w-full font-bold justify-center"
                >
                  Send Query to {leader.name.split(' ')[0]}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Submitted Queries History Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">My Queries & Leader Responses</h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {myQueries.length} Total
          </span>
        </div>

        {myQueries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium space-y-1">
            <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
            <p>You haven't submitted any queries yet. Click "Send Query" on any leader above to ask a question.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myQueries.map((q) => (
              <div 
                key={q.id} 
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  q.status === 'Answered' 
                    ? 'bg-emerald-50/30 border-emerald-200' 
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">{q.subject}</h3>
                    <p className="text-[11px] text-slate-500">To: {q.recipient_name || 'Leader'} • {new Date(q.created_at).toLocaleString()}</p>
                  </div>

                  <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    q.status === 'Answered' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-100">
                  {q.message}
                </p>

                {q.reply && (
                  <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Leader Answer / Response:</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed font-medium">{q.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Query Modal */}
      {selectedLeader && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Send Query to ${selectedLeader.name}`}
        >
          <form onSubmit={handleSendMessage} className="space-y-4">
            {successMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">Recipient Leader: {selectedLeader.name}</p>
                  <p className="text-slate-500">Designation: {selectedLeader.role} ({selectedLeader.email})</p>
                </div>

                <Input
                  label="Subject / Topic"
                  required
                  placeholder="e.g. Query regarding sprint tasks or project assignment..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Query Details / Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your question or query here for your leader to review and reply..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={sending}
                    icon={Send}
                    className="font-bold"
                  >
                    Submit Query to Leader
                  </Button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};
