
import { useEffect, useState } from 'react'
import { checkApiHealth, getProjects } from './lib/api'
import type { Project } from './lib/api'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API...')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        setError('Could not load projects. Check that the backend is running.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">TeamFlow</a>
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
          <span className="project-count">{projects.length} projects</span>
        </div>

        {loading && <p className="empty-state">Loading projects...</p>}

        {!loading && error && <p className="error-message">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p className="empty-state">
            No projects yet. Your projects will appear here when you create them.
          </p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project._id}>
                <div className="project-card-heading">
                  <h3>{project.name}</h3>
                  <span className={`status status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-description">
                  {project.description || 'No description provided.'}
                </p>
                <p className="project-date">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
