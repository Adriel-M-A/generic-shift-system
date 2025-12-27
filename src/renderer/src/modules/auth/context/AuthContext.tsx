import React, { createContext, useContext, useState, useEffect } from 'react'
import { FLAGS } from '@config/flags'
import { parseError } from '@lib/error-utils'

export interface User {
  id: number
  nombre: string
  apellido: string
  usuario: string
  level: number
  last_login?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  login: (usuario: string, password: string) => Promise<{ success: boolean; message?: string }>
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

  // En tu App.tsx, isLogin significa "mostrar pantalla de login", por eso es true si no hay user
  const isLogin = !user

  const loadUserPermissions = async (userLevel: number) => {
    if (userLevel === 1) {
      setPermissions(['*'])
      return
    }
    try {
      const result = await window.api.roles.getAll()
      if (result.success) {
        const myRole = result.roles.find((r: any) => r.id === userLevel)
        if (myRole) setPermissions(myRole.permissions)
      }
    } catch (error) {
      console.error('Error cargando permisos', error)
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
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      loadUserPermissions(parsedUser.level)
      window.api.window.setAppSize()
    } else {
      window.api.window.setLoginSize()
    }
  }, [])

  const login = async (usuario: string, password: string) => {
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
      // Ahora parseError devolverá "Contraseña incorrecta" o "Usuario no encontrado" limpiamente
      const rawMessage = parseError(error)

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
    return permissions.includes(permissionId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile: async (data) => true, // Simplificado para el ejemplo
        changePassword: async (c, n) => ({ success: true }),
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
