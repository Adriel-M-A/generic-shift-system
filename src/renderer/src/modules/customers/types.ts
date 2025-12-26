export interface Customer {
  id: string
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}

export type CustomerFormData = Omit<Customer, 'id'>
