
import { Routes, Route } from 'react-router-dom'

import ProjectsPage from './ProjectsPage'
import ProjectDetailPage from './components/ProjectDetailPage'
import TeamMembersPage from './TeamMembersPage'
import TasksPage from './TaskPage'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ProjectsPage />} />

        <Route
          path="/projects/:id"
          element={<ProjectDetailPage />}
        />

        <Route path="/team-members" element={<TeamMembersPage />} />

        <Route path="/task" element={<TasksPage />} />
      </Route>
    </Routes>
  )
}

export default App
