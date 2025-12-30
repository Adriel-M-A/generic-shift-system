export interface User {
  id: number
  nombre: string
  apellido: string
  usuario: string
  level: number
  last_login?: string
  created_at?: string
}

export interface Role {
  id: number
  label: string
  permissions: string[]
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
}

export interface UserFormData extends Partial<Omit<User, 'id' | 'created_at' | 'last_login'>> {
  password?: string
}
