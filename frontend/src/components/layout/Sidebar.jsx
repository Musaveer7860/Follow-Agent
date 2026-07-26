import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isHigherRole } from '../../utils/authUtils';
import { 
  LayoutDashboard, 
  FilePlus, 
  Video, 
  KanbanSquare, 
  Send, 
  User, 
  Settings,
  Users,
  Lock,
  Crown,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

const standardNavigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isLeaderOnly: false },
  { name: 'Contact Leader', path: '/contact-leader', icon: Users, isLeaderOnly: false },
  { name: 'New Meeting', path: '/upload', icon: FilePlus, isLeaderOnly: true },
  { name: 'Meeting History', path: '/meetings', icon: Video, isLeaderOnly: true },
  { name: 'Task Board', path: '/tasks', icon: KanbanSquare, isLeaderOnly: true },
  { name: 'Follow-ups', path: '/reminders', icon: Send, isLeaderOnly: true },
  { name: 'Profile', path: '/profile', icon: User, isLeaderOnly: false },
  { name: 'Settings', path: '/settings', icon: Settings, isLeaderOnly: true },
  { name: 'Admin Portal', path: '/admin', icon: ShieldCheck, isLeaderOnly: true },
];

const serverAdminNavigationItems = [
  { name: 'Admin Portal', path: '/admin', icon: ShieldCheck },
  { name: 'Member Queries', path: '/admin?tab=queries', icon: MessageSquare },
  { name: 'Profile', path: '/profile', icon: User },
];

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isServerAdmin = user?.role === 'Server Admin';
  const userIsLeader = !isServerAdmin && isHigherRole(user?.role);

  const navItems = isServerAdmin ? serverAdminNavigationItems : standardNavigationItems;

  const checkIsActive = (itemPath) => {
    const fullPath = location.pathname + location.search;
    if (itemPath.includes('?')) {
      return fullPath === itemPath;
    }
    return location.pathname === itemPath && (!location.search || location.search === '?tab=preassigned');
  };

  return (
    <aside className="w-60 border-r border-slate-200 bg-white p-3 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isServerAdmin ? 'Admin Navigation' : 'Workspace Nav'}
            </p>
            {isServerAdmin ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 text-amber-600" /> Fixed Admin
              </span>
            ) : userIsLeader ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 text-amber-500" /> Leader Access
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Standard Access
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isRestricted = !isServerAdmin && item.isLeaderOnly && !userIsLeader;
              const isActive = checkIsActive(item.path);

              if (isRestricted) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-50 transition-all opacity-70"
                    title="Product Leader / Manager Access Required"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </div>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Card in Sidebar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isServerAdmin ? 'bg-amber-500' : userIsLeader ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
          <span className="text-xs font-bold text-slate-800 truncate">
            {user?.role || 'Team Member'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          {isServerAdmin ? 'Fixed Server Admin Portal' : userIsLeader ? 'Product Lead privileges' : 'Dashboard & Contact access'}
        </p>
      </div>
    </aside>
  );
};
