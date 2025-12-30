import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export function useServices(page: number, limit: number, search: string) {
  const [services, setServices] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchServices = useCallback(async (p: number, l: number, s: string) => {
    try {
      setIsLoading(true)
      const result = await window.api.services.getPaginated({ page: p, limit: l, search: s })
      setServices(result.services)
      setTotal(result.total)
    } catch (error) {
      toast.error('Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchServices(page, limit, search)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [page, limit, search, fetchServices])

  const createService = async (nombre: string) => {
    try {
      await window.api.services.create(nombre)
      toast.success('Servicio creado')
      fetchServices(page, limit, search)
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    }
  }

  const toggleService = async (id: number) => {
    try {
      await window.api.services.toggle(id)
      fetchServices(page, limit, search)
    } catch (error) {
      toast.error('Error al cambiar estado')
    }
  }

  const deleteService = async (id: number) => {
    try {
      await window.api.services.delete(id)
      toast.success('Servicio eliminado')
      fetchServices(page, limit, search)
      return true
    } catch (error) {
      toast.error('Error al eliminar')
      return false
    }
  }

  return { services, total, isLoading, createService, toggleService, deleteService }
}
