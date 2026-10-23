
import { useState } from 'react'
import type { FormEvent } from 'react'
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
  const [successMessage, setSuccessMessage] = useState('')
  const [priority, setPriority] = useState<CreateProjectInput['priority']>('medium')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')
    const projectInput: CreateProjectInput = {
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
    }

    if (!projectInput.name) {
      setFormError('Please enter a project name.')
      return
    }

    setSubmitting(true)

    try {
      const newProject = await createProject(projectInput)

      onProjectCreated(newProject)

      setName('')
      setDescription('')
      setStatus('planning')
      setPriority('medium')
      setSuccessMessage('Project created successfully!')
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

      <label htmlFor="project-priority">Priority</label>
<select
  id="project-priority"
  value={priority}
  onChange={(event) =>
    setPriority(event.target.value as CreateProjectInput['priority'])
  }
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>

      {formError && (
        <p className="error-message" role="alert">
          {formError}
        </p>
      )}

      {successMessage && (
        <p role="status">
          {successMessage}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}

export default CreateProjectForm
