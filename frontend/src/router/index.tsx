// src/router/index.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/views/DashboardPage";
import NewMeetingPage from "../features/sessions/views/NewMeetingPage";
import LoginPage from "../features/auth/views/LoginPage";
import RequireAuth from "../shared/components/RequireAuth";
import SummaryView from "../features/sessions/views/SummaryView";
import SummaryProView from "../features/sessions/views/SummaryProView";
import NewProjectPage from "../features/projects/views/NewProjectPage";
import ProjectsPage from "../features/projects/views/ProjectsPage";
import MeetingsPage from "../features/sessions/views/MeetingsPage";
import HomePage from "../features/home/views/HomePage";
import RecordingView from "../features/sessions/views/RecordingView";
import ProjectView from "../features/projects/views/ProjectView";
import RegisterPage from "../features/auth/views/RegisterPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home publique */}
        <Route path="/" element={<HomePage />} />

        {/* 🔑 Register */}
         <Route path="/register" element={<RegisterPage />} />

        {/* 🔑 Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* ♻️ Redirection propre : /dashboard → /app/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* 🔐 Zone protégée */}
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          {/* /app = Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* /app/dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* /app/new-meeting */}
          <Route path="new-meeting" element={<NewMeetingPage />} />

          {/* /app/summary/:sessionId */}
          <Route path="summary/:sessionId" element={<SummaryView />} />

          {/* /app/summaries/pro */}
          <Route path="summaries/pro" element={<SummaryProView />} />

          {/* /app/projects/new */}
          <Route path="projects/new" element={<NewProjectPage />} />

          {/* /app/projects */}
          <Route path="projects" element={<ProjectsPage />} />

          {/* /app/meetings */}
          <Route path="meetings" element={<MeetingsPage />} />

          <Route path="recording/:sessionId" element={<RecordingView />} />

          <Route path="projects/:projectId" element={<ProjectView />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
