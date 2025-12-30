export interface Customer {
  id: number
  documento: string
  nombre: string
  apellido: string
  telefono?: string | null
  email?: string | null
  created_at?: string
  updated_at?: string
}

export interface CustomerFormData {
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}
