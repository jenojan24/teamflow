
import { useEffect, useState } from 'react'
import { checkApiHealth, getProjects,deleteProject } from './lib/api'
import type { Project } from './lib/api'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectCard from './components/ProjectCard'
import EditProjectForm from './components/EditProjectForm'
import './App.css'

function  ProjectsPage() {
  const [apiStatus, setApiStatus] = useState('Checking API...')
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

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

  async function handleProjectDeleted(project: Project) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
  )

  if (!confirmed) {
    return
  }

  setDeletingProjectId(project._id)
  setDeleteError('')

  try {
    await deleteProject(project._id)

    setProjects((currentProjects) =>
      currentProjects.filter(
        (currentProject) => currentProject._id !== project._id,
      ),
    )
  } catch {
    setDeleteError(
      `Could not delete "${project.name}". Please try again.`,
    )
  } finally {
    setDeletingProjectId(null)
  }
}
const totalProjects = projects.length

const activeProjects = projects.filter(
  (project) => project.status === 'active',
).length

const planningProjects = projects.filter(
  (project) => project.status === 'planning',
).length

const completedProjects = projects.filter(
  (project) => project.status === 'completed',
).length


const filteredProjects = projects
  .filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })
  .sort((a, b) => {
    if (sortBy === 'newest') {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
    }

    if (sortBy === 'oldest') {
      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      )
    }

    return a.name.localeCompare(b.name)
  })


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

      <section className="dashboard-stats">
  <article className="stat-card">
    <h3>Total Projects</h3>
    <p>{totalProjects}</p>
  </article>

  <article className="stat-card">
    <h3>Active</h3>
    <p>{activeProjects}</p>
  </article>

  <article className="stat-card">
    <h3>Planning</h3>
    <p>{planningProjects}</p>
  </article>

  <article className="stat-card">
    <h3>Completed</h3>
    <p>{completedProjects}</p>
  </article>
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
          
<div className="project-filters">
  <input
    type="search"
    placeholder="Search projects..."
    aria-label="Search projects by name"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <select
    aria-label="Filter projects by status"
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
  >
    <option value="all">All statuses</option>
    <option value="planning">Planning</option>
    <option value="active">Active</option>
    <option value="completed">Completed</option>
  </select>

  <select
    aria-label="Sort projects"
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
    <option value="name">Project name (A–Z)</option>
  </select>
</div>


        {deleteError && (
  <p className="error-message" role="alert">
    {deleteError}
  </p>
)}

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
            {filteredProjects.map((project) => (
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
                    onDelete={handleProjectDeleted}
                    isDeleting={deletingProjectId === project._id}
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

export default ProjectsPage
