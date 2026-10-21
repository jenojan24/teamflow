
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export type ProjectStatus = 'planning' | 'active' | 'completed'

export interface Project {
  _id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export async function checkApiHealth() {
  const response = await fetch(`${API_URL}/api/health`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<{
    status: string
    message: string
  }>
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/projects`)

  if (!response.ok) {
    throw new Error(`Failed to load projects: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<Project[]>

  if (!result.success) {
    throw new Error('The API could not load projects.')
  }

  return result.data
}


export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_URL}/api/projects/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to load project: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<Project>

  if (!result.success) {
    throw new Error('The API could not load the project.')
  }

  return result.data
}

export interface CreateProjectInput {
  name: string
  description: string
  status: ProjectStatus
}

export async function createProject(
  project: CreateProjectInput,
): Promise<Project> {
  const response = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  })

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<Project>

  if (!result.success) {
    throw new Error('The API could not create the project.')
  }

  return result.data
}


export async function updateProject(
  id: string,
  project: Partial<CreateProjectInput>,
): Promise<Project> {
  const response = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  })

  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<Project>

  if (!result.success) {
    throw new Error('The API could not update the project.')
  }

  return result.data
}


export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.status}`)
  }

  const result = (await response.json()) as { success: boolean }

  if (!result.success) {
    throw new Error('The API could not delete the project.')
  }
}
