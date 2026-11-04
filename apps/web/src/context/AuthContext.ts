import { createContext } from 'react'
import type { AuthUser, LoginInput, RegisterInput } from '../lib/api'

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)