import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isHigherRole } from '../../utils/authUtils';
import { Bell, LogOut, User, Settings, Plus, Layers, Send, Crown, Users } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ notifications = [], onNotificationClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isServerAdmin = user?.role === 'Server Admin';
  const userIsLeader = !isServerAdmin && isHigherRole(user?.role);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Brand logo */}
        <Link to={user ? (isServerAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition-colors">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900">
              Follow Agent
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Pro
            </span>
          </div>
        </Link>

        {/* Center / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isServerAdmin ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => navigate('/admin')}
                  className="hidden sm:inline-flex text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white border-none"
                >
                  Admin Portal
                </Button>
              ) : userIsLeader ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate('/upload')}
                  className="hidden sm:inline-flex text-xs font-semibold"
                >
                  New Meeting
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Send}
                  onClick={() => navigate('/contact-leader')}
                  className="hidden sm:inline-flex text-xs font-semibold"
                >
                  Contact Leader
                </Button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                      <span className="text-[11px] text-indigo-600 font-semibold">{unreadCount} unread</span>
                    </div>
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onNotificationClick && onNotificationClick(n.id)}
                            className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50 text-slate-900 border border-indigo-100'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 flex items-center justify-between">
                              {n.title}
                              {!n.is_read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                            </div>
                            <p className="mt-1 line-clamp-2 text-slate-600 whitespace-pre-line">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full ${isServerAdmin ? 'bg-amber-600' : 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      {isServerAdmin ? <Crown className="w-2.5 h-2.5 text-amber-600" /> : userIsLeader ? <Crown className="w-2.5 h-2.5 text-amber-500" /> : <Users className="w-2.5 h-2.5 text-slate-400" />}
                      {user.role || 'Team Member'}
                    </p>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-extrabold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-indigo-600 font-semibold">{user.role || 'Team Member'}</p>
                    </div>

                    {isServerAdmin ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg transition-colors"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          Admin Portal
                        </Link>
                        <Link
                          to="/admin?tab=queries"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-600" />
                          Member Queries
                        </Link>
                      </>
                    ) : (
                      <>
                        {!userIsLeader && (
                          <Link
                            to="/contact-leader"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Contact Leader
                          </Link>
                        )}

                        {userIsLeader && (
                          <Link
                            to="/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Settings
                          </Link>
                        )}
                      </>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      Profile
                    </Link>

                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="primary" size="sm" className="font-bold">Authorized Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
