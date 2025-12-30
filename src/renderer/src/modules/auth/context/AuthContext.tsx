import React, { createContext, useContext, useState, useEffect } from 'react'
import { FLAGS } from '@config/flags'
import { parseError } from '@lib/error-utils'
import { User, AuthResponse, Role } from '@shared/types'

interface AuthContextType {
  user: User | null
  login: (usuario: string, password: string) => Promise<AuthResponse>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  changePassword: (
    currentPass: string,
    newPass: string
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isAdmin: boolean
  isLogin: boolean
  hasPermission: (permissionId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])

  // isLogin indica si el usuario NO está autenticado (se muestra pantalla de login)
  const isLogin = !user

  const loadUserPermissions = async (userLevel: number) => {
    // El nivel 1 siempre es Administrador con acceso total
    if (userLevel === 1) {
      setPermissions(['*'])
      return
    }
    try {
      const result = await window.api.roles.getAll()
      if (result.success) {
        // Tipamos correctamente el rol encontrado
        const myRole = result.roles.find((r: Role) => r.id === userLevel)
        if (myRole) setPermissions(myRole.permissions)
      }
    } catch (error) {
      console.error('Error cargando permisos:', error)
    }
  }

  useEffect(() => {
    if (!FLAGS.ENABLE_AUTH) {
      setUser({ id: 0, nombre: 'Sistema', apellido: 'Admin', usuario: 'system', level: 1 })
      window.api.window.setAppSize()
      return
    }

    const savedUser = sessionStorage.getItem('user_session')
    if (savedUser) {
      const parsedUser: User = JSON.parse(savedUser)
      setUser(parsedUser)
      loadUserPermissions(parsedUser.level)
      window.api.window.setAppSize()
    } else {
      window.api.window.setLoginSize()
    }
  }, [])

  const login = async (usuario: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await window.api.auth.login({ usuario, password })

      if (response.success && response.user) {
        setUser(response.user)
        loadUserPermissions(response.user.level)
        sessionStorage.setItem('user_session', JSON.stringify(response.user))
        window.api.window.setAppSize()
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      const rawMessage = parseError(error)

      // Unificamos el mensaje para no dar pistas a atacantes
      if (rawMessage === 'Usuario no encontrado' || rawMessage === 'Contraseña incorrecta') {
        return { success: false, message: 'Usuario o contraseña incorrectos' }
      }

      return { success: false, message: rawMessage }
    }
  }

  const logout = () => {
    if (!FLAGS.ENABLE_AUTH) return
    setUser(null)
    setPermissions([])
    sessionStorage.removeItem('user_session')
    window.api.window.setLoginSize()
  }

  const hasPermission = (permissionId: string): boolean => {
    if (!FLAGS.ENABLE_AUTH || user?.level === 1) return true
    return permissions.includes(permissionId) || permissions.includes('*')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile: async () => true,
        changePassword: async () => ({ success: true }),
        isAdmin: user?.level === 1,
        isLogin,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return context
}
