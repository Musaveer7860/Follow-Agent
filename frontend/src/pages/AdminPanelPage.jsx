import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI, userAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Users, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  UserCheck, 
  RefreshCw,
  Search,
  MessageSquare,
  Send,
  HelpCircle,
  MessageCircle,
  Building,
  UserCheck2
} from 'lucide-react';
import { HIGHER_ROLES, STANDARD_ROLES, isHigherRole } from '../utils/authUtils';

export const AdminPanelPage = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields for pre-assignment
  const [email, setEmail] = useState('');
  const [assignedRole, setAssignedRole] = useState('Software Engineer');
  const [assignedLeadId, setAssignedLeadId] = useState('');

  // Reply Modal state
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tabParam || 'preassigned'); // 'preassigned' | 'active_users' | 'queries'

  useEffect(() => {
    if (tabParam && ['preassigned', 'active_users', 'queries'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const isServerAdmin = (currentUser?.role === 'Server Admin') || 
    ['mohammadmusaveer06@gmail.com', 'mohammadmusaveermusaveer06@gmail.com'].includes(currentUser?.email?.toLowerCase());

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resAssignments, resUsers, resLeaders, resQueries] = await Promise.all([
        adminAPI.getAssignments(),
        adminAPI.getUsers(),
        userAPI.getLeaders(),
        adminAPI.getAdminQueries(),
      ]);
      setAssignments(resAssignments.data || []);
      setUsers(resUsers.data || []);
      setLeaders(resLeaders.data || []);
      setQueries(resQueries.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load admin management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        assigned_role: assignedRole,
        assigned_lead_id: assignedLeadId ? parseInt(assignedLeadId) : (isServerAdmin ? null : currentUser.id),
      };

      await adminAPI.assignRole(payload);
      setSuccess(`Successfully pre-authorized and assigned employee: ${email}`);
      setEmail('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to pre-assign role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (id, assignEmail) => {
    if (!window.confirm(`Revoke pre-authorized privileges for ${assignEmail}?`)) return;
    setError('');
    setSuccess('');
    try {
      await adminAPI.deleteAssignment(id);
      setSuccess(`Revoked privileges for ${assignEmail}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete role assignment.');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRoleTeam(userId, { role: newRole, team_lead_id: null });
      setSuccess('Updated user role successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  const handleOpenReplyModal = (q) => {
    setSelectedQuery(q);
    setReplyText(q.reply || '');
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await adminAPI.replyQuery(selectedQuery.id, { reply: replyText.trim() });
      setSuccess(`Response sent successfully to ${selectedQuery.sender_name || 'Team Member'}.`);
      setIsReplyModalOpen(false);
      setSelectedQuery(null);
      setReplyText('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reply to query.');
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assigned_role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQueries = queries.filter((q) =>
    (q.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.sender_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingQueriesCount = queries.filter(q => q.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin & Manager Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Employee Management & Queries Inbox
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Add employees under your leadership team, manage member privileges, and resolve incoming queries from your assigned team members directly.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            loading={loading}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold shrink-0 self-start md:self-auto"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Members</p>
            <p className="text-xl font-black text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pre-authorized</p>
            <p className="text-xl font-black text-slate-900">{assignments.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Queries</p>
            <p className="text-xl font-black text-amber-600">{pendingQueriesCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Queries</p>
            <p className="text-xl font-black text-slate-900">{queries.length}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-500 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Grant Privileges / Add Employee Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Add & Authorize New Team Employee</h2>
            <p className="text-xs text-slate-500 font-medium">
              Grant privileges or add employees under your leadership. When they sign in with this email, they will belong under your team.
            </p>
          </div>
        </div>

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <Input
            label="Employee Email Address"
            type="email"
            required
            placeholder="employee@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Role / Designation
            </label>
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="👤 Team Member Roles">
                {STANDARD_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </optgroup>
              <optgroup label="👑 Leadership & Privilege Roles">
                {HIGHER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r} — Full Access
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assign Under Team Lead / Manager
            </label>
            <select
              value={assignedLeadId}
              onChange={(e) => setAssignedLeadId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                {isServerAdmin ? '(Default: Unassigned Lead)' : `My Leadership (${currentUser?.name})`}
              </option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={actionLoading}
              icon={ShieldCheck}
              className="w-full font-bold"
            >
              Authorize & Add Employee
            </Button>
          </div>
        </form>
      </div>

      {/* Tabs & Search Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTabChange('preassigned')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'preassigned'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pre-Authorized Invites ({assignments.length})
            </button>

            <button
              onClick={() => handleTabChange('active_users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'active_users'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active Team Employees ({users.length})
            </button>

            <button
              onClick={() => handleTabChange('queries')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'queries'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Member Queries Inbox ({queries.length})</span>
              {pendingQueriesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                  {pendingQueriesCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search email, role, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tab 1: Pre-Authorized Invites */}
        {activeTab === 'preassigned' && (
          <div className="overflow-x-auto">
            {filteredAssignments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                <Mail className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <p>No pre-authorized employee invites found matching your search.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Employee Email</th>
                    <th className="pb-3 px-3">Assigned Role</th>
                    <th className="pb-3 px-3">Authorized Date</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-all">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{item.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          {item.assigned_role.toLowerCase().includes('admin') ? (
                            <Crown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-indigo-500" />
                          )}
                          {item.assigned_role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAssignment(item.id, item.email)}
                          icon={Trash2}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Revoke Access
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Active Registered Users */}
        {activeTab === 'active_users' && (
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                <Users className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <p>No active team members found matching your search.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Employee Name</th>
                    <th className="pb-3 px-3">Email Address</th>
                    <th className="pb-3 px-3">Current Role</th>
                    <th className="pb-3 px-3">Joined Date</th>
                    <th className="pb-3 px-3 text-right">Modify Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-all">
                      <td className="py-3 px-3 font-extrabold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          u.role === 'Server Admin'
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : u.role.toLowerCase().includes('lead') || u.role.toLowerCase().includes('manager')
                            ? 'bg-indigo-100 text-indigo-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.role === 'Server Admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 font-extrabold text-xs shadow-2xs">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            Fixed Server Admin
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="Team Member">Team Member</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Product Lead">Product Lead</option>
                            <option value="HR Manager">HR Manager</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Member Queries Inbox */}
        {activeTab === 'queries' && (
          <div className="space-y-4">
            {filteredQueries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <p>No queries or messages received yet from team members.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredQueries.map((q) => (
                  <div 
                    key={q.id} 
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      q.status === 'Pending' 
                        ? 'bg-amber-50/40 border-amber-200' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                          {q.sender_name ? q.sender_name.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{q.sender_name || 'Team Member'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">({q.sender_role || 'Employee'})</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{q.sender_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          q.status === 'Pending' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {q.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(q.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900">{q.subject}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {q.message}
                      </p>
                    </div>

                    {/* Display existing reply if answered */}
                    {q.reply && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Your Reply Sent:</span>
                        </p>
                        <p className="whitespace-pre-line">{q.reply}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        variant={q.status === 'Pending' ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleOpenReplyModal(q)}
                        icon={Send}
                        className="text-xs font-bold"
                      >
                        {q.reply ? 'Update Response' : 'Reply to Query'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedQuery && (
        <Modal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          title={`Reply to Query from ${selectedQuery.sender_name || 'Team Member'}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Subject: {selectedQuery.subject}</p>
              <p className="text-slate-600 italic">"{selectedQuery.message}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Answer / Direct Message Response
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write your response to resolve this query..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsReplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={replyLoading}
                icon={Send}
                className="font-bold"
              >
                Send Answer & Notify Member
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
