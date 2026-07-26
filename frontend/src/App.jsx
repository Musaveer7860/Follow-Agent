import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { isHigherRole } from './utils/authUtils';
import { AccessRestricted } from './components/common/AccessRestricted';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingUploadPage } from './pages/MeetingUploadPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { MeetingsListPage } from './pages/MeetingsListPage';
import { TaskManagerPage } from './pages/TaskManagerPage';
import { ReminderGeneratorPage } from './pages/ReminderGeneratorPage';
import { ContactLeaderPage } from './pages/ContactLeaderPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Executive / Leader Privilege Route Wrapper
const ExecutiveRoute = ({ children, featureName }) => {
  const { user } = useAuth();
  if (user?.role === 'Server Admin') {
    return <Navigate to="/admin" replace />;
  }
  if (!isHigherRole(user?.role)) {
    return <AccessRestricted featureName={featureName} />;
  }
  return children;
};

// Route wrapper to redirect Server Admin directly to Admin Portal
const NonAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'Server Admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Route wrapper for Queries directory page
const QueriesRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'Server Admin') {
    return <Navigate to="/admin?tab=queries" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />

      {/* Protected App Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Available to All Users (Standard & Higher Roles) */}
        <Route
          path="/dashboard"
          element={
            <NonAdminRoute>
              <DashboardPage />
            </NonAdminRoute>
          }
        />
        <Route
          path="/contact-leader"
          element={
            <QueriesRoute>
              <ContactLeaderPage />
            </QueriesRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Executive / Leader Restricted Pages */}
        <Route
          path="/upload"
          element={
            <ExecutiveRoute featureName="Meeting Transcript Upload & AI Analysis">
              <MeetingUploadPage />
            </ExecutiveRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ExecutiveRoute featureName="Meeting History & PDF Export">
              <MeetingsListPage />
            </ExecutiveRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <ExecutiveRoute featureName="Meeting Details & Analysis">
              <MeetingDetailPage />
            </ExecutiveRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ExecutiveRoute featureName="Kanban Task Board Management">
              <TaskManagerPage />
            </ExecutiveRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ExecutiveRoute featureName="Follow-up Reminder Generator">
              <ReminderGeneratorPage />
            </ExecutiveRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ExecutiveRoute featureName="Workspace Settings">
              <SettingsPage />
            </ExecutiveRoute>
          }
        />
        <Route path="/admin" element={<AdminPanelPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
