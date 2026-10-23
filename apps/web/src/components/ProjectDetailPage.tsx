
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject } from '../lib/api'
import type { Project } from '../lib/api'

function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
     console.log('Detail page effect running. ID:', id)

    if (!id) {
      return
    }

    let cancelled = false

    getProject(id)
      .then((data) => {
         console.log('Project loaded:', data)
        if (!cancelled) {
          setProject(data)
        }
      })
      .catch((err) => {
        console.error('Project loading failed:', err)
        if (!cancelled) {
          setError('Could not load this project.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) {
    return (
      <main className="app">
        <p className="error-message">Project ID is missing.</p>
        <Link to="/">Back to projects</Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="app">
        <p>Loading project...</p>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="app">
        <p className="error-message">
          {error || 'Project not found.'}
        </p>
        <Link to="/">Back to projects</Link>
      </main>
    )
  }

  return (
    <main className="app">
      <p>
        <Link to="/">← Back to projects</Link>
      </p>

      <section className="project-detail">
        <p className="eyebrow">PROJECT DETAILS</p>
        <h1>{project.name}</h1>

      <div className="project-card-badges">
  <span className={`status status-${project.status}`}>
    {project.status}
  </span>

  <span className={`priority priority-${project.priority}`}>
    {project.priority} priority
  </span>
</div>

        <h2>Description</h2>
        <p>{project.description || 'No description provided.'}</p>

        <p>
          <strong>Created:</strong>{' '}
          {new Date(project.createdAt).toLocaleString()}
        </p>

        <p>
          <strong>Last updated:</strong>{' '}
          {new Date(project.updatedAt).toLocaleString()}
        </p>
      </section>
    </main>
  )
}

export default ProjectDetailPage
