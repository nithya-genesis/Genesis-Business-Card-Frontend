import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SystemAdminLayout } from '../layouts/SystemAdminLayout';
import { LoginPage } from '../pages/LoginPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CollegesPage } from '../pages/CollegesPage';
import { CollegeDetailPage } from '../pages/CollegeDetailPage';
import { ProposalsPage } from '../pages/ProposalsPage';
import { ProposalBuilderPage } from '../pages/ProposalBuilderPage';
import { ProposalDetailPage } from '../pages/ProposalDetailPage';
import { PublicProposalViewPage } from '../pages/PublicProposalViewPage';
import { PlansPage } from '../pages/PlansPage';
import { AddonsPage } from '../pages/AddonsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { UsersPage } from '../pages/UsersPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { PendingApprovalPage } from '../pages/PendingApprovalPage';
import { TrainingProgramsPage } from '../pages/TrainingProgramsPage';
import { AdminCollegesPage } from '../pages/admin/AdminCollegesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public College Facing Route (No Auth Required) */}
      <Route path="/proposal/view/:token" element={<PublicProposalViewPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Normal BD Workspace (BD_EXECUTIVE, BD_MANAGER) */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="colleges" element={<CollegesPage />} />
        <Route path="colleges/new" element={<CollegesPage />} />
        <Route path="colleges/:id" element={<CollegeDetailPage />} />
        <Route path="proposals" element={<ProposalsPage />} />
        <Route path="proposals/pending-approval" element={<PendingApprovalPage />} />
        <Route path="proposals/new" element={<ProposalBuilderPage />} />
        <Route path="proposals/:id" element={<ProposalDetailPage />} />
        <Route path="proposals/:id/edit" element={<ProposalBuilderPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="programs" element={<TrainingProgramsPage />} />
        <Route path="addons" element={<AddonsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Dedicated System Admin Workspace (SYSTEM_ADMIN only) */}
      <Route path="/admin" element={<SystemAdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="colleges" element={<AdminCollegesPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="programs" element={<TrainingProgramsPage />} />
        <Route path="addons" element={<AddonsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
