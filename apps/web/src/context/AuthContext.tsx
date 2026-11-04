
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  getCurrentUser,
  loginUser as loginApi,
  registerUser as registerApi,
  logoutUser as logoutApi,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from '../lib/api'

import { AuthContext } from './AuthContext.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  async function login(input: LoginInput) {
    const loggedInUser = await loginApi(input)
    setUser(loggedInUser)
  }

  async function register(input: RegisterInput) {
    return await registerApi(input)
  }

  async function logout() {
    await logoutApi()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
