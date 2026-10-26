
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export type ProjectStatus = 'planning' | 'active' | 'completed'

export type ProjectPriority = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'in-progress' | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TeamMemberRole =
  | 'developer'
  | 'designer'
  | 'project-manager' 
  | 'tester'
  | 'other'

export interface TeamMember {
  _id: string
  name: string
  email: string
  role: TeamMemberRole
  createdAt: string
  updatedAt: string
}


export interface Task {
  _id: string
  title: string
  description: string
  projectId: string
  assignedTo?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  projectId: string
  assignedTo?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  assignedTo?: string | null
  dueDate?: string | null
}

export interface CreateTeamMemberInput {
  name: string
  email: string
  role: TeamMemberRole
}

export interface Project {
  _id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
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
  priority: ProjectPriority
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


export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch(`${API_URL}/api/team-members`)

  if (!response.ok) {
    throw new Error(`Failed to load team members: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<TeamMember[]>

  if (!result.success) {
    throw new Error('The API could not load team members.')
  }

  return result.data
}

export async function createTeamMember(
  member: CreateTeamMemberInput,
): Promise<TeamMember> {
  const response = await fetch(`${API_URL}/api/team-members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(member),
  })

  if (!response.ok) {
    throw new Error(`Failed to create team member: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<TeamMember>

  if (!result.success) {
    throw new Error('The API could not create the team member.')
  }

  return result.data
}

export async function updateTeamMember(
  id: string,
  member: Partial<CreateTeamMemberInput>,
): Promise<TeamMember> {
  const response = await fetch(`${API_URL}/api/team-members/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(member),
  })

  if (!response.ok) {
    throw new Error(`Failed to update team member: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<TeamMember>

  if (!result.success) {
    throw new Error('The API could not update the team member.')
  }

  return result.data
}

export async function deleteTeamMember(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/team-members/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete team member: ${response.status}`)
  }

  const result = (await response.json()) as { success: boolean }

  if (!result.success) {
    throw new Error('The API could not delete the team member.')
  }
}


export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks`)

  if (!response.ok) {
    throw new Error(`Failed to load tasks: ${response.status}`)
  }

  return response.json() as Promise<Task[]>
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to load task: ${response.status}`)
  }

  return response.json() as Promise<Task>
}

export async function createTask(
  task: CreateTaskInput,
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`)
  }

  return response.json() as Promise<Task>
}

export async function updateTask(
  id: string,
  task: UpdateTaskInput,
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status}`)
  }

  return response.json() as Promise<Task>
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.status}`)
  }
}
