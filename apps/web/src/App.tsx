import { Routes, Route } from 'react-router-dom'
import ProjectsPage from './ProjectsPage'
import ProjectDetailPage from './components/ProjectDetailPage'
import TeamMembersPage from './TeamMembersPage'
import TasksPage from './TaskPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage />} />
      <Route
        path="/projects/:id"
        element={<ProjectDetailPage />}
      />
      <Route path="/team-members" element={<TeamMembersPage />} />
      <Route path ="/task" element={<TasksPage/>}/>
   
    </Routes>
  )
}

export default App