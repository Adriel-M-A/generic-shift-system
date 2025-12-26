import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { format } from 'date-fns'
import { Turno, ViewMode, ShiftStats, ShiftConfig, EstadoTurno } from '../types'
import { formatDateHeader } from '../utils'

// Datos necesarios para crear un turno
export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
  fecha?: string
  customerId?: number
}

const DEFAULT_CONFIG: ShiftConfig = {
  openingTime: '08:00',
  closingTime: '20:00',
  interval: 30,
  startOfWeek: 'monday',
  thresholds: {
    low: 5,
    medium: 10
  }
}

export interface ShiftContextType {
  // Estado
  currentDate: Date
  setCurrentDate: (date: Date) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  shifts: Turno[]
  loading: boolean
  stats: ShiftStats
  config: ShiftConfig

  // Acciones
  addShift: (data: NewShiftData) => Promise<boolean>
  changeShiftStatus: (id: number, status: EstadoTurno) => Promise<void>
  refreshShifts: () => Promise<void>
  updateConfig: (newConfig: Partial<ShiftConfig>) => Promise<void>

  // Helpers
  getDailyLoad: (date: Date) => number
  formatDateHeader: (d: Date) => string
}

export const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [shifts, setShifts] = useState<Turno[]>([])
  const [loading, setLoading] = useState(false)

  // CAMBIO: Ahora almacenamos la carga de TODO el año
  const [workloadMap, setWorkloadMap] = useState<Record<string, number>>({})

  const [config, setConfig] = useState<ShiftConfig>(DEFAULT_CONFIG)

  // 1. CARGAR CONFIGURACIÓN AL INICIO
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.api.settings.getAll()
        if (settings) {
          setConfig({
            openingTime: settings.shift_opening || '08:00',
            closingTime: settings.shift_closing || '20:00',
            interval: parseInt(settings.shift_interval || '30'),
            startOfWeek: (settings.calendar_start_day as 'monday' | 'sunday') || 'monday',
            thresholds: {
              low: parseInt(settings.threshold_low || '5'),
              medium: parseInt(settings.threshold_medium || '10')
            }
          })
        }
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
    loadSettings()
  }, [])

  // 2. OBTENER TURNOS DEL DÍA SELECCIONADO
  const fetchDailyShifts = useCallback(async () => {
    if (!currentDate) return
    try {
      setLoading(true)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const data = await window.api.shift.getByDate(dateStr)
      setShifts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  // 3. OBTENER CARGA DE TRABAJO DE TODO EL AÑO (NUEVO)
  // Se ejecuta solo cuando cambia el AÑO de currentDate
  const fetchYearlyLoad = useCallback(async () => {
    if (!currentDate) return
    try {
      const year = currentDate.getFullYear()
      // Usamos la nueva API getYearlyLoad que creamos en el backend
      const data = await window.api.shift.getYearlyLoad(year)

      const loadMap: Record<string, number> = {}
      data.forEach((item: any) => {
        loadMap[item.fecha] = item.count
      })
      setWorkloadMap(loadMap)
    } catch (error) {
      console.error('Error cargando heatmap anual:', error)
    }
  }, [currentDate.getFullYear()]) // Dependencia: solo el año

  // Función pública para refrescar datos
  const refreshShifts = async () => {
    // Ejecutamos ambas en paralelo para velocidad
    await Promise.all([fetchDailyShifts(), fetchYearlyLoad()])
  }

  // Efecto principal: Recargar cuando cambia la fecha o el año
  useEffect(() => {
    // fetchDailyShifts tiene dependencia 'currentDate' completa
    fetchDailyShifts()

    // fetchYearlyLoad tiene dependencia 'year', así que solo se dispara si cambias de año
    fetchYearlyLoad()
  }, [fetchDailyShifts, fetchYearlyLoad])

  // --- ACCIONES ---

  const addShift = async (data: NewShiftData): Promise<boolean> => {
    try {
      const dateStr = data.fecha || format(currentDate, 'yyyy-MM-dd')
      await window.api.shift.create({
        ...data,
        fecha: dateStr
      })
      await refreshShifts()
      return true
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const changeShiftStatus = async (id: number, newStatus: EstadoTurno) => {
    try {
      await window.api.shift.updateStatus({ id, estado: newStatus })
      // Al cambiar estado (ej. cancelar), necesitamos actualizar el conteo visual
      await refreshShifts()
    } catch (error) {
      console.error(error)
    }
  }

  const updateConfig = async (newConfig: Partial<ShiftConfig>) => {
    try {
      const settingsToSave: Record<string, string> = {}
      if (newConfig.openingTime) settingsToSave['shift_opening'] = newConfig.openingTime
      if (newConfig.closingTime) settingsToSave['shift_closing'] = newConfig.closingTime
      if (newConfig.interval) settingsToSave['shift_interval'] = newConfig.interval.toString()
      if (newConfig.startOfWeek) settingsToSave['calendar_start_day'] = newConfig.startOfWeek
      if (newConfig.thresholds) {
        if (newConfig.thresholds.low)
          settingsToSave['threshold_low'] = newConfig.thresholds.low.toString()
        if (newConfig.thresholds.medium)
          settingsToSave['threshold_medium'] = newConfig.thresholds.medium.toString()
      }

      await window.api.settings.setMany(settingsToSave)

      setConfig((prev) => ({
        ...prev,
        ...newConfig,
        thresholds: { ...prev.thresholds, ...(newConfig.thresholds || {}) }
      }))
    } catch (e) {
      console.error('Error guardando configuración:', e)
    }
  }

  // --- COMPUTADOS ---

  const stats: ShiftStats = {
    total: shifts.length,
    pendientes: shifts.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso').length,
    completados: shifts.filter((t) => t.estado === 'completado').length
  }

  // Este helper ahora busca en el mapa anual
  const getDailyLoad = (d: Date) => {
    const dateKey = format(d, 'yyyy-MM-dd')
    return workloadMap[dateKey] || 0
  }

  return (
    <ShiftContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        shifts,
        loading,
        addShift,
        changeShiftStatus,
        refreshShifts,
        stats,
        getDailyLoad,
        formatDateHeader,
        config,
        updateConfig
      }}
    >
      {children}
    </ShiftContext.Provider>
  )
}
