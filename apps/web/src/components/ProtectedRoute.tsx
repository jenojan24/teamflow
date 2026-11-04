
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  // Wait until the login status has been checked
  if (isLoading) {
    return <p>Checking authentication...</p>
  }

  // Redirect users who are not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Allow authenticated users to access the page
  return <Outlet />
}

export default ProtectedRoute
