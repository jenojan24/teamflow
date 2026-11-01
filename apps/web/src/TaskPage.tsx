
import { useEffect, useState } from 'react'
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getProjects,
   getTeamMembers,
} from './lib/api'
import type {
  Task,
  Project,
  TeamMember,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
} from './lib/api'
import Header from './components/Header'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  
  const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

  const matchesStatus =
    statusFilter === 'all' || task.status === statusFilter

  const matchesPriority =
    priorityFilter === 'all' || task.priority === priorityFilter

  const matchesProject =
    projectFilter === 'all' || task.projectId === projectFilter

  return (
    matchesSearch &&
    matchesStatus &&
    matchesPriority &&
    matchesProject
  )
})

const sortedTasks = [...filteredTasks].sort((a, b) => {
  switch (sortBy) {
    case 'dueDate': {
    
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1

      return (
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
      )
    }

    case 'priority': {
      const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1,
      }

      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }

    case 'title':
      return a.title.localeCompare(b.title)

    case 'newest':
    default:
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      )
  }
})

  
useEffect(() => {
  let cancelled = false

  async function loadDataOnMount() {
    try {
      setError('')

      const [taskData, projectData, memberData] = await Promise.all([
  getTasks(),
  getProjects(),
  getTeamMembers(),
])

      if (cancelled) return

      setTasks(taskData)
      setProjects(projectData)
      setTeamMembers(memberData)
      setProjectId(projectData[0]?._id ?? '')
    } catch {
      if (!cancelled) {
        setError(
          'Could not load tasks or projects. Check that the API is running.',
        )
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  void loadDataOnMount()

  return () => {
    cancelled = true
  }
}, [])

function handleEdit(task: Task) {
  setEditingTaskId(task._id)
  setTitle(task.title)
  setDescription(task.description)
  setProjectId(task.projectId)
  setAssignedTo(task.assignedTo ?? '')
  setStatus(task.status)
  setPriority(task.priority)
  setDueDate(
    task.dueDate ? task.dueDate.slice(0, 10) : '',
  )
  setError('')
  setMessage('')
}

function handleCancelEdit() {
  setEditingTaskId(null)
  setTitle('')
  setDescription('')
  setProjectId(projects[0]?._id ?? '')
  setAssignedTo('')
  setStatus('todo')
  setPriority('medium')
  setDueDate('')
  setError('')
  setMessage('')
}


async function handleDelete(task: Task) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${task.title}"?`,
  )

  if (!confirmed) return

  setError('')
  setMessage('')

  try {
    await deleteTask(task._id)

    setTasks((current) =>
      current.filter((item) => item._id !== task._id),
    )

    if (editingTaskId === task._id) {
      handleCancelEdit()
    }

    setMessage('Task deleted successfully!')
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Could not delete task.',
    )
  }
}


async function handleStatusChange(
  task: Task,
  newStatus: TaskStatus,
) {
  setError('')
  setMessage('')

  try {
    const updatedTask = await updateTask(task._id, {
      status: newStatus,
    })

    setTasks((current) =>
      current.map((item) =>
        item._id === task._id ? updatedTask : item,
      ),
    )

    setMessage('Task status updated successfully!')
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Could not update task status.',
    )
  }
}



async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setError('')
  setMessage('')

  if (!projectId) {
    setError('Please create a project before adding a task.')
    return
  }

  const taskData: CreateTaskInput = {
    title,
    description,
    projectId,
    status,
    priority,
    ...(assignedTo ? { assignedTo } : {}),
    ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
  }

  try {
    setSaving(true)

    if (editingTaskId) {
      const updatedTask = await updateTask(editingTaskId, taskData)

      setTasks((current) =>
        current.map((task) =>
          task._id === editingTaskId ? updatedTask : task,
        ),
      )

      setEditingTaskId(null)
      setMessage('Task updated successfully!')
    } else {
      const createdTask = await createTask(taskData)
      setTasks((current) => [createdTask, ...current])
      setMessage('Task created successfully!')
    }

    setTitle('')
    setDescription('')
    setProjectId(projects[0]?._id ?? '')
    setAssignedTo('')
    setStatus('todo')
    setPriority('medium')
    setDueDate('')
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Could not save task.',
    )
  } finally {
    setSaving(false)
  }
}

  if (loading) return <p>Loading tasks...</p>

  return (
    <main className="tasks-page">
      <Header/>
      <h1>Task Management</h1>
      <p>Create tasks and track your team's work.</p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <section>
        <h2>{editingTaskId ? 'Edit task' : 'Create a task'}</h2>

        {projects.length === 0 ? (
          <p>Create a project before adding tasks.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div>
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
              />
            </div>

            <div>
              <label htmlFor="task-project">Project</label>
              <select
                id="task-project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                required
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
<div>
  <label htmlFor="task-assignee">Assign to</label>
  <select
    id="task-assignee"
    value={assignedTo}
    onChange={(event) => setAssignedTo(event.target.value)}
  >
    <option value="">Unassigned</option>
    {teamMembers.map((member) => (
      <option key={member._id} value={member._id}>
        {member.name} ({member.role})
      </option>
    ))}
  </select>
</div>


            <div>
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date">Due date (optional)</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <button type="submit" disabled={saving}>
  {saving
    ? 'Saving...'
    : editingTaskId
      ? 'Save changes'
      : 'Create task'}
</button>

{editingTaskId && (
  <button type="button" onClick={handleCancelEdit} disabled={saving}>
    Cancel edit
  </button>
  
)}
          </form>
          
        )}
        
<div className="task-filters">
  <div>
    <label htmlFor="task-search">Search tasks</label>
    <input
      id="task-search"
      type="text"
      placeholder="Search by task title..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
    <button
  type="button"
  onClick={() => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
  }}
>
  Clear filters
</button>
  </div>

<div>
  <label htmlFor="task-sort">Sort by</label>
  <select
    id="task-sort"
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
  >
    <option value="newest">Newest first</option>
    <option value="dueDate">Due date</option>
    <option value="priority">Priority: High to Low</option>
    <option value="title">Title: A–Z</option>
  </select>
</div>

  <div>
    <label htmlFor="task-status-filter">Status</label>
    <select
      id="task-status-filter"
      value={statusFilter}
      onChange={(event) => setStatusFilter(event.target.value)}
    >
      <option value="all">All statuses</option>
      <option value="todo">To do</option>
      <option value="in-progress">In progress</option>
      <option value="completed">Completed</option>
    </select>
  </div>

  <div>
    <label htmlFor="task-priority-filter">Priority</label>
    <select
      id="task-priority-filter"
      value={priorityFilter}
      onChange={(event) => setPriorityFilter(event.target.value)}
    >
      <option value="all">All priorities</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>

  <div>
    <label htmlFor="task-project-filter">Project</label>
    <select
      id="task-project-filter"
      value={projectFilter}
      onChange={(event) => setProjectFilter(event.target.value)}
    >
      <option value="all">All projects</option>
      {projects.map((project) => (
        <option key={project._id} value={project._id}>
          {project.name}
        </option>
      ))}
    </select>
  </div>
</div>

      </section>

      <section>
        <h2>Tasks ({filteredTasks.length})</h2>

        {tasks.length === 0 ? (
          <p>No tasks yet. Create your first task above.</p>
        ) :  filteredTasks.length === 0 ? (
  <p>No tasks match your search and filters.</p>
) : (
            
          <ul>
           {sortedTasks.map((task) => (
              <li key={task._id}>
                <button
  type="button"
  onClick={() => handleEdit(task)}
>
  Edit
</button>

<button
  type="button"
  onClick={() => void handleDelete(task)}
>
  Delete
</button>
                <h3>{task.title}</h3>
                <p>{task.description || 'No description'}</p>
                
<p>
  Assigned to:{' '}
  {teamMembers.find(
    (member) => member._id === task.assignedTo,
  )?.name ?? 'Unassigned'}
</p>

                <p>
                  Project:{' '}
                  {projects.find((project) => project._id === task.projectId)?.name
                    ?? 'Unknown project'}
                </p>
               
<div>
  <label htmlFor={`status-${task._id}`}>Status: </label>
  <select
    id={`status-${task._id}`}
    value={task.status}
    onChange={(event) =>
      void handleStatusChange(
        task,
        event.target.value as TaskStatus,
      )
    }
  >
    <option value="todo">To do</option>
    <option value="in-progress">In progress</option>
    <option value="completed">Completed</option>
  </select>
</div>

                <p>Priority: {task.priority}</p>
                {task.dueDate && (
                  <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
