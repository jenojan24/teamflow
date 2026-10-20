
import type { Project } from '../lib/api'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
}

function ProjectCard({ project, onEdit }: ProjectCardProps) {
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

      <button type="button" onClick={() => onEdit(project)}>
        Edit
      </button>
    </article>
  )
}

export default ProjectCard
