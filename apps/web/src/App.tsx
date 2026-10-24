import { Routes, Route } from 'react-router-dom'
import ProjectsPage from './ProjectsPage'
import ProjectDetailPage from './components/ProjectDetailPage'
import TeamMembersPage from './TeamMembersPage'


function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage />} />
      <Route
        path="/projects/:id"
        element={<ProjectDetailPage />}
      />
      <Route path="/team-members" element={<TeamMembersPage />} />
    </Routes>
  )
}

export default App