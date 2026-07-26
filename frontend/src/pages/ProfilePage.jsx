import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/services';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Briefcase, Calendar, ShieldCheck, Check } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Product Manager');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await userAPI.updateProfile({ name, role });
      updateUserProfile(res.data);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">User Profile & Account</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your identity, role, and workspace credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card hover={false} className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-3xl mx-auto shadow-glow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.role || 'Product Lead'}</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Account</span>
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card hover={false} className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-white">Edit Profile Details</h3>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
            />

            <Input
              label="Email Address (Immutable)"
              disabled
              value={user?.email || ''}
              icon={Mail}
            />

            {user?.role === 'Server Admin' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Role / Designation (System Protected)
                </label>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-extrabold flex items-center justify-between">
                  <span>Server Admin (Fixed)</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200 uppercase tracking-wide">
                    Fixed Role
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  The Server Admin role is fixed and cannot be modified or changed.
                </p>
              </div>
            ) : (
              <Input
                label="Role / Title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                icon={Briefcase}
              />
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
