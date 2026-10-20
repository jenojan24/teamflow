
import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateProject } from '../lib/api'
import type { Project, ProjectStatus } from '../lib/api'

interface EditProjectFormProps {
  project: Project
  onProjectUpdated: (project: Project) => void
  onCancel: () => void
}

function EditProjectForm({
  project,
  onProjectUpdated,
  onCancel,
}: EditProjectFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Please enter a project name.')
      return
    }

    setSubmitting(true)

    try {
      const updatedProject = await updateProject(project._id, {
        name: name.trim(),
        description: description.trim(),
        status,
      })

      onProjectUpdated(updatedProject)
    } catch {
      setFormError('Could not update the project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="create-project-form" onSubmit={handleSubmit}>
      <h3>Edit project</h3>

      <label htmlFor={`edit-name-${project._id}`}>Project name</label>
      <input
        id={`edit-name-${project._id}`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        maxLength={100}
      />

      <label htmlFor={`edit-description-${project._id}`}>
        Description
      </label>
      <textarea
        id={`edit-description-${project._id}`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={2000}
      />

      <label htmlFor={`edit-status-${project._id}`}>Status</label>
      <select
        id={`edit-status-${project._id}`}
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as ProjectStatus)
        }
      >
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      {formError && <p className="error-message" role="alert">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save changes'}
      </button>

      <button type="button" onClick={onCancel} disabled={submitting}>
        Cancel
      </button>
    </form>
  )
}

export default EditProjectForm
