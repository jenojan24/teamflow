
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const isProjectsPage = location.pathname === '/'  || location.pathname.startsWith('/projects/')
  const isTeamMembersPage = location.pathname === '/team-members'
  const isTasksPage =
    location.pathname === '/task' || location.pathname === '/tasks'

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
    </header>
  )
}

export default Header
