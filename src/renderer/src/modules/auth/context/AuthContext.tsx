import React, { createContext, useContext, useState, useEffect } from 'react'
import { FLAGS } from '@config/flags'

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
  // NUEVO: Función para verificar permisos
  hasPermission: (permissionId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([]) // Almacena los permisos cargados

  const isLogin = !user

  // Función auxiliar para cargar permisos desde la BD
  const loadUserPermissions = async (userLevel: number) => {
    // Si es Admin (1), no necesitamos cargar nada, tiene pase libre
    if (userLevel === 1) {
      setPermissions(['*'])
      return
    }

    try {
      const result = await window.api.roles.getAll()
      if (result.success) {
        const myRole = result.roles.find((r: any) => r.id === userLevel)
        if (myRole) {
          setPermissions(myRole.permissions)
        } else {
          setPermissions([])
        }
      }
    } catch (error) {
      console.error('Error cargando permisos', error)
      setPermissions([])
    }
  }

  useEffect(() => {
    if (!FLAGS.ENABLE_AUTH) {
      setUser({
        id: 0,
        nombre: 'Sistema',
        apellido: 'Admin',
        usuario: 'system',
        level: 1
      })
      window.api.window.setAppSize()
      return
    }

    // Usamos sessionStorage para que la sesión no persista cuando la app se cierra
    const savedUser = sessionStorage.getItem('user_session')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      loadUserPermissions(parsedUser.level) // <--- Cargar permisos al recargar
      window.api.window.setAppSize()
    } else {
      window.api.window.setLoginSize()
    }
  }, [])

  const login = async (usuario: string, password: string) => {
    const response = await window.api.auth.login({ usuario, password })
    if (response.success && response.user) {
      setUser(response.user)
      loadUserPermissions(response.user.level) // <--- Cargar permisos al login
      // Guardamos en sessionStorage para que se borre al cerrar la app
      sessionStorage.setItem('user_session', JSON.stringify(response.user))
      window.api.window.setAppSize()
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return false
    const response = await window.api.auth.updateUser(user.id, data)
    if (response.success && response.user) {
      const newUser = { ...user, ...response.user }
      setUser(newUser)
      // Actualizamos la sesión en sessionStorage
      sessionStorage.setItem('user_session', JSON.stringify(newUser))

      // Si el nivel cambió, recargamos permisos
      if (response.user.level !== user.level) {
        loadUserPermissions(response.user.level)
      }
      return true
    }
    return false
  }

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!user) return { success: false, message: 'No hay sesión' }
    return await window.api.auth.changePassword(user.id, currentPass, newPass)
  }

  const logout = () => {
    if (!FLAGS.ENABLE_AUTH) return
    setUser(null)
    setPermissions([])
    // Borramos la sesión en sessionStorage
    sessionStorage.removeItem('user_session')
    window.api.window.setLoginSize()
  }

  const isAdmin = user?.level === 1

  // Lógica principal de verificación
  const hasPermission = (permissionId: string): boolean => {
    // Si no hay Auth, asumimos acceso total (modo desarrollo/venta simple)
    if (!FLAGS.ENABLE_AUTH) return true

    // Si es Admin, acceso total siempre
    if (isAdmin) return true

    // Verificar si el permiso está en la lista
    return permissions.includes(permissionId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        changePassword,
        isAdmin,
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
