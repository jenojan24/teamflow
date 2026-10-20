
import { useState } from 'react'
import { createProject } from '../lib/api'
import type { CreateProjectInput, Project } from '../lib/api'

interface CreateProjectFormProps {
  onProjectCreated: (project: Project) => void
}

function CreateProjectForm({
  onProjectCreated,
}: CreateProjectFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] =
    useState<CreateProjectInput['status']>('planning')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setFormError('')

    const projectInput: CreateProjectInput = {
      name: name.trim(),
      description: description.trim(),
      status,
    }

    setSubmitting(true)

    try {
      const newProject = await createProject(projectInput)
      onProjectCreated(newProject)

      setName('')
      setDescription('')
      setStatus('planning')
    } catch {
      setFormError('Could not create the project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="create-project-form" onSubmit={handleSubmit}>
      <h2>Create a project</h2>

      <label htmlFor="project-name">Project name</label>
      <input
        id="project-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Enter project name"
        required
        maxLength={100}
      />

      <label htmlFor="project-description">Description</label>
      <textarea
        id="project-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="What is this project about?"
        maxLength={2000}
      />

      <label htmlFor="project-status">Status</label>
      <select
        id="project-status"
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as CreateProjectInput['status'])
        }
      >
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      {formError && <p className="error-message">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}

export default CreateProjectForm
