export interface Customer {
  id: number
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  created_at?: string
}

export interface CustomerFormData {
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}
