
import { useEffect, useState } from 'react'
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from './lib/api'
import type {
  TeamMember,
  TeamMemberRole,
  CreateTeamMemberInput,
} from './lib/api'
import './App.css'
import Header from './components/Header'


const emptyForm: CreateTeamMemberInput = {
  name: '',
  email: '',
  role: 'developer',
}

const roles: { value: TeamMemberRole; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'tester', label: 'Tester' },
  { value: 'other', label: 'Other' },
]

function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [form, setForm] = useState<CreateTeamMemberInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  
useEffect(() => {
  async function loadMembers() {
    try {
      const data = await getTeamMembers()
      setMembers(data)
      setError('')
    } catch {
      setError(
        'Unable to load team members. Please check that the API is running.',
      )
    } finally {
      setLoading(false)
    }
  }

  void loadMembers()
}, [])


  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        const updated = await updateTeamMember(editingId, form)
        setMembers((current) =>
          current.map((member) => member._id === updated._id ? updated : member),
        )
        setSuccess('Team member updated successfully.')
      } else {
        const created = await createTeamMember(form)
        setMembers((current) => [created, ...current])
        setSuccess('Team member added successfully.')
      }

      resetForm()
    } catch {
      setError('Could not save the team member. Check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(member: TeamMember) {
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
    })
    setEditingId(member._id)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(member: TeamMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteTeamMember(member._id)
      setMembers((current) =>
        current.filter((item) => item._id !== member._id),
      )

      if (editingId === member._id) resetForm()

      setSuccess('Team member deleted successfully.')
    } catch {
      setError(`Could not delete ${member.name}. Please try again.`)
    }
  }

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.trim().toLowerCase()

    return (
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    )
  })

  function formatRole(role: TeamMemberRole) {
    return roles.find((item) => item.value === role)?.label ?? role
  }

  return (
    <main className="app-container">
     <Header/>

      <section className="welcome-section">
        <h2>Team Members</h2>
        <p>Manage your team, contact details, and roles in one place.</p>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Members</h3>
          <p>{members.length}</p>
        </div>
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <h2>{editingId ? 'Edit Team Member' : 'Add a Team Member'}</h2>
            <p>
              {editingId
                ? 'Update this member’s information.'
                : 'Add someone to your TeamFlow team.'}
            </p>
          </div>
        </div>

        <form className="team-member-form" onSubmit={handleSubmit}>
  <div className="team-member-form-controls">
            <input
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              maxLength={100}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              maxLength={254}
              required
            />

            <select
              aria-label="Team member role"
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value as TeamMemberRole,
                })
              }
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : 'Add Member'}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <div className="section-heading">
          <div>
            <h2>Your Team</h2>
            <p>{members.length} team member(s)</p>
          </div>
        </div>

        <div className="team-member-search">
          <input
            type="search"
            placeholder="Search by name, email, or role..."
            aria-label="Search team members"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading && <p>Loading team members...</p>}

        {!loading && !error && members.length === 0 && (
          <p>No team members yet. Add your first member above.</p>
        )}

        {!loading && members.length > 0 && filteredMembers.length === 0 && (
          <p>No team members match your search.</p>
        )}

        {!loading && filteredMembers.length > 0 && (
          <div className="project-grid">
            {filteredMembers.map((member) => (
              <article className="team-member-card" key={member._id}>
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p>{formatRole(member.role)}</p>

                <div className="project-controls">
                  <button
                    type="button"
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(member)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default TeamMembersPage
