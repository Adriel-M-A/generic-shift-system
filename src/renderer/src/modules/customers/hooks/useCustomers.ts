import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Customer, CustomerFormData } from '../types'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar clientes desde la DB
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await window.api.customers.getAll()
      setCustomers(data)
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la lista de clientes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar datos al iniciar
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const createCustomer = async (data: CustomerFormData) => {
    try {
      await window.api.customers.create(data)
      toast.success('Cliente creado correctamente')
      fetchCustomers() // Recargar lista
      return true
    } catch (error: any) {
      console.error(error)
      // Mensaje de error personalizado si viene del backend (ej. duplicado)
      const message = error.message.includes('Error:')
        ? error.message.split('Error: ')[1]
        : 'Error al crear cliente'
      toast.error(message)
      return false
    }
  }

  const updateCustomer = async (id: string | number, data: CustomerFormData) => {
    try {
      await window.api.customers.update(id, data)
      toast.success('Cliente actualizado correctamente')
      fetchCustomers() // Recargar lista
      return true
    } catch (error: any) {
      console.error(error)
      const message = error.message.includes('Error:')
        ? error.message.split('Error: ')[1]
        : 'Error al actualizar cliente'
      toast.error(message)
      return false
    }
  }

  const deleteCustomer = async (id: string | number) => {
    try {
      await window.api.customers.delete(id)
      toast.success('Cliente eliminado')
      fetchCustomers() // Recargar lista
      return true
    } catch (error) {
      console.error(error)
      toast.error('Error al eliminar cliente')
      return false
    }
  }

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: fetchCustomers
  }
}
