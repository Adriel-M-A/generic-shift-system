import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Customer, CustomerFormData } from '../types'

export function useCustomers(page: number, limit: number, search: string) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchCustomers = useCallback(async (p: number, l: number, s: string) => {
    try {
      setIsLoading(true)
      const result = await window.api.customers.getPaginated({ page: p, limit: l, search: s })
      setCustomers(result.customers)
      setTotal(result.total)
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la lista de clientes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      fetchCustomers(page, limit, search)
    }, 300)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [page, limit, search, fetchCustomers])

  const createCustomer = async (data: CustomerFormData) => {
    try {
      await window.api.customers.create(data)
      toast.success('Cliente creado correctamente')
      fetchCustomers(page, limit, search)
      return true
    } catch (error: any) {
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
      fetchCustomers(page, limit, search)
      return true
    } catch (error: any) {
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
      fetchCustomers(page, limit, search)
      return true
    } catch (error) {
      toast.error('Error al eliminar cliente')
      return false
    }
  }

  return {
    customers,
    total,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: () => fetchCustomers(page, limit, search)
  }
}
