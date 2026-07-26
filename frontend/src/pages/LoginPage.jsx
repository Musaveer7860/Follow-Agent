import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight, AlertCircle, Layers, ShieldCheck, Crown } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'Server Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid login credentials. Please check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Follow Agent
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Authorized Sign In</h2>
          <p className="text-xs text-slate-500 font-medium">Sign in to your pre-authorized meeting workspace</p>
        </div>

        {/* Server Admin Quick Access Credentials Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Server Admin Credentials</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('Admin06@gmail.com');
                setPassword('admin123');
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Fill Admin
            </button>
          </div>
          <div className="text-[11px] text-amber-800/90 font-mono space-y-0.5 bg-amber-100/60 p-2 rounded-xl border border-amber-200/60">
            <div><span className="font-semibold text-amber-950">Email:</span> Admin06@gmail.com</div>
            <div><span className="font-semibold text-amber-950">Password:</span> admin123</div>
          </div>
        </div>

        {/* Enterprise Security Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Pre-Authorized Access Only</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            Enter your company email address. Workspace access and leadership roles are pre-granted by Server Admin.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Authorized Email Address"
            type="email"
            required
            placeholder="you@company.com"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full font-bold"
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 font-medium">
          Access restricted to invited team members & server admin.
        </div>
      </div>
    </div>
  );
};

