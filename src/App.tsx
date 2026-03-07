import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { YearProvider } from './contexts/YearContext';
import { Layout, AdminLayout } from './components/Layout';

// User Pages
import { HomePage } from './pages/HomePage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminMemberDetail } from './pages/admin/AdminMemberDetail';
import { AdminActivities } from './pages/admin/AdminActivities';
import { AdminActivityDetail } from './pages/admin/AdminActivityDetail';
import { AdminArchive } from './pages/admin/AdminArchive';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <YearProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:id" element={<ActivityDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="members/:id" element={<AdminMemberDetail />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="activities/:id" element={<AdminActivityDetail />} />
              <Route path="archive" element={<AdminArchive />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </YearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
