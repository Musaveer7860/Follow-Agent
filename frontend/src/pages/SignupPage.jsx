import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, ArrowRight, AlertCircle, Layers, ShieldCheck, UserCheck, Crown, Users } from 'lucide-react';
import { HIGHER_ROLES, STANDARD_ROLES, isHigherRole } from '../utils/authUtils';

export const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Product Leader');
  const [customRole, setCustomRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedFinalRole = role === 'Other' ? (customRole.trim() || 'Team Member') : role;
  const isFullAccess = isHigherRole(selectedFinalRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, selectedFinalRole);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Follow Agent
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 font-medium">Select your workspace role & access level</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
          />

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Workspace Role & Access Level
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="👑 Higher / Leadership Roles (Full Access)">
                {HIGHER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r} — Full Access
                  </option>
                ))}
              </optgroup>
              <optgroup label="👤 Team Member Roles (Dashboard & Contact Leader Only)">
                {STANDARD_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r} — Dashboard & Contact Leader
                  </option>
                ))}
              </optgroup>
              <option value="Other">Custom Role / Title...</option>
            </select>

            {role === 'Other' && (
              <Input
                label="Custom Role Title"
                placeholder="e.g. Frontend Engineer, Product Designer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            )}

            {/* Access Permission Card Preview */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                isFullAccess
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {isFullAccess ? (
                  <>
                    <Crown className="w-4 h-4 text-indigo-600" />
                    <span>Higher Access Granted (Full Admin Privileges)</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Standard Access Granted (Dashboard & Contact Leader)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {isFullAccess
                  ? 'As a Product Leader/Manager/Admin, you get unrestricted access to analyze meetings, manage tasks, generate follow-up reminders, export MOM PDFs, and modify settings.'
                  : 'As a Team Member, you get direct access to the Analytics Dashboard and a dedicated Contact Leader channel to message and connect with your Product Lead & Managers.'}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full font-bold mt-2"
            icon={ArrowRight}
          >
            Create Account & Continue
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
