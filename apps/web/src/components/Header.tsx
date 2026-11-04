
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isProjectsPage =
    location.pathname === '/' || location.pathname.startsWith('/projects/')

  const isTeamMembersPage = location.pathname === '/team-members'

  const isTasksPage =
    location.pathname === '/task' || location.pathname === '/tasks'

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="topbar">
      <div className="brand">
        <h1>TeamFlow</h1>
        <p>Project Management</p>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/" aria-current={isProjectsPage ? 'page' : undefined}>
          Projects
        </Link>

        <Link
          to="/team-members"
          aria-current={isTeamMembersPage ? 'page' : undefined}
        >
          Team Members
        </Link>

        <Link
          to="/task"
          aria-current={isTasksPage ? 'page' : undefined}
        >
          Tasks
        </Link>
      </nav>

      <div className="header-user">
        <span>{user?.name}</span>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
