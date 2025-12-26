import { useState } from 'react'
import { Customer, CustomerFormData } from '../types'
import { toast } from 'sonner'

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    documento: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '123-4567',
    email: 'juan@example.com'
  },
  {
    id: '2',
    documento: '87654321',
    nombre: 'Maria',
    apellido: 'Gomez',
    email: 'maria@example.com'
  }
]

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)
  const [isLoading, setIsLoading] = useState(false)

  const createCustomer = async (data: CustomerFormData) => {
    setIsLoading(true)
    try {
      const newCustomer: Customer = {
        ...data,
        id: Math.random().toString(36).substr(2, 9)
      }
      setCustomers((prev) => [...prev, newCustomer])
      toast.success('Cliente creado correctamente')
      return true
    } catch (error) {
      toast.error('Error al crear cliente')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateCustomer = async (id: string, data: CustomerFormData) => {
    setIsLoading(true)
    try {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...data, id } : c)))
      toast.success('Cliente actualizado correctamente')
      return true
    } catch (error) {
      toast.error('Error al actualizar cliente')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      toast.success('Cliente eliminado')
    } catch (error) {
      toast.error('Error al eliminar cliente')
    }
  }

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}
