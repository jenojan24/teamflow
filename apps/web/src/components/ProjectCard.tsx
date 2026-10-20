
import type { Project } from '../lib/api'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  isDeleting: boolean
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  isDeleting,
}: ProjectCardProps) {
  return (
    <article className="project-card">
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

      <div className="project-card-actions">
        <button type="button" onClick={() => onEdit(project)}>
          Edit
        </button>

        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(project)}
           disabled={isDeleting}
        >
           {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </article>
  )
}

export default ProjectCard
