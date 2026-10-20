
import { useEffect, useState } from 'react'
import { checkApiHealth, getProjects } from './lib/api'
import type { Project } from './lib/api'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectCard from './components/ProjectCard'
import EditProjectForm from './components/EditProjectForm'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API...')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    checkApiHealth()
      .then((result) => setApiStatus(result.message))
      .catch(() => setApiStatus('API unavailable'))

    getProjects()
      .then((data) => {
        setProjects(data)
        setError('')
      })
      .catch(() => {
        setError(
          'Could not load projects. Check that the backend is running.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  function handleProjectCreated(newProject: Project) {
    setProjects((currentProjects) => [
      newProject,
      ...currentProjects,
    ])
  }

  function handleProjectUpdated(updatedProject: Project) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project._id === updatedProject._id ? updatedProject : project,
      ),
    )

    setEditingProject(null)
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          TeamFlow
        </a>
        <span className="api-badge">{apiStatus}</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR TEAM WORKSPACE</p>
        <h1>Good work starts with a plan.</h1>
        <p className="subtitle">
          Organize projects, track progress, and keep your team moving forward.
        </p>
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h2>Projects</h2>
          </div>

          <span className="project-count">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        <CreateProjectForm onProjectCreated={handleProjectCreated} />

        {loading && (
          <p className="empty-state">Loading projects...</p>
        )}

        {!loading && error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="empty-state">
            No projects yet. Create your first project above!
          </p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="project-grid">
            {projects.map((project) => (
              <div key={project._id}>
                {editingProject?._id === project._id ? (
                  <EditProjectForm
                    project={project}
                    onProjectUpdated={handleProjectUpdated}
                    onCancel={() => setEditingProject(null)}
                  />
                ) : (
                  <ProjectCard
                    project={project}
                    onEdit={setEditingProject}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
