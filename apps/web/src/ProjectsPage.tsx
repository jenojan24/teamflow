
import { useEffect, useState } from 'react'
import { checkApiHealth, getProjects, deleteProject } from './lib/api'
import type { Project } from './lib/api'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectCard from './components/ProjectCard'
import EditProjectForm from './components/EditProjectForm'
import './App.css'

function ProjectsPage() {
  const [apiStatus, setApiStatus] = useState('Checking API...')
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function loadProjects() {
      try {
        await checkApiHealth()
        setApiStatus('Connected')

        const data = await getProjects()
        setProjects(data)
      } catch {
        setApiStatus('Disconnected')
        setError('Unable to load projects. Please check that the API is running.')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])



  function handleProjectCreated(newProject: Project) {
    setProjects((currentProjects) => [newProject, ...currentProjects])
    setCurrentPage(1)
  }

  function handleProjectUpdated(updatedProject: Project) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project._id === updatedProject._id ? updatedProject : project,
      ),
    )

    setEditingProject(null)
  }

  async function handleProjectDeleted(projectId: string) {
    setDeletingProjectId(projectId)
    setDeleteError('')

    try {
      await deleteProject(projectId)

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project._id !== projectId),
      )
    } catch {
      setDeleteError('Unable to delete the project. Please try again.')
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
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        )
      }

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
    })

  const totalPages = Math.ceil(
    filteredProjects.length / projectsPerPage,
  )

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage,
  )

  return (
    <main className="app-container">
      <header className="topbar">
        <div className="brand">
          <h1>TeamFlow</h1>
          <p>Project Management</p>
        </div>

        <div className="api-status">
          <span
            className={
              apiStatus === 'Connected'
                ? 'status-indicator connected'
                : 'status-indicator disconnected'
            }
          />
          API: {apiStatus}
        </div>
      </header>

      <section className="welcome-section">
        <h2>Welcome to TeamFlow</h2>
        <p>Organize your projects and keep your work moving forward.</p>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>{totalProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Planning</h3>
          <p>{planningProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Active</h3>
          <p>{activeProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>{completedProjects}</p>
        </div>
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <h2>Your Projects</h2>
            <p>Manage, search, and organize your projects.</p>
          </div>
        </div>

        <CreateProjectForm onProjectCreated={handleProjectCreated} />

        <div className="project-controls">
          <input
            type="search"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search projects"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter projects by status"
          >
            <option value="all">All statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort projects"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {deleteError && (
          <p className="error-message" role="alert">
            {deleteError}
          </p>
        )}

        {loading && <p>Loading projects...</p>}

        {!loading && error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p>No projects yet. Create your first project above.</p>
        )}

        {!loading &&
          !error &&
          projects.length > 0 &&
          filteredProjects.length === 0 && (
            <p>No projects match your search or selected filter.</p>
          )}

        {!loading && !error && filteredProjects.length > 0 && (
          <>
            <div className="project-grid">
              {paginatedProjects.map((project) => (
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
                        onDelete={() => handleProjectDeleted(project._id)}
                      isDeleting={deletingProjectId === project._id}
                    />
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default ProjectsPage
