import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Turno, ViewMode, ShiftStats, ShiftConfig, EstadoTurno, NewShiftData } from '../types'
import { formatDateHeader } from '../utils'

// Exportamos NewShiftData para que otros lo usen si lo necesitan
export type { NewShiftData }

const DEFAULT_CONFIG: ShiftConfig = {
  openingTime: '08:00',
  closingTime: '20:00',
  interval: 30,
  startOfWeek: 'monday',
  showFinishedShifts: false, // Por defecto ocultamos el historial antiguo
  thresholds: {
    low: 5,
    medium: 10
  }
}

export interface ShiftContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  shifts: Turno[] // Turnos filtrados listos para usar
  allShifts: Turno[] // Turnos crudos (por si acaso)

  loading: boolean
  stats: ShiftStats
  config: ShiftConfig

  addShift: (data: NewShiftData) => Promise<boolean>
  changeShiftStatus: (id: number, status: EstadoTurno) => Promise<void>
  refreshShifts: () => Promise<void>
  updateConfig: (newConfig: Partial<ShiftConfig>) => Promise<void>

  getDailyLoad: (date: Date) => number
  formatDateHeader: (d: Date) => string
}

export const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const [rawShifts, setRawShifts] = useState<Turno[]>([]) // Datos crudos del backend
  const [loading, setLoading] = useState(false)
  const [workloadMap, setWorkloadMap] = useState<Record<string, number>>({})
  const [config, setConfig] = useState<ShiftConfig>(DEFAULT_CONFIG)

  // 1. CARGAR CONFIGURACIÓN
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
            // Convertimos el string "true"/"false" a booleano
            showFinishedShifts: settings.show_finished_shifts === 'true',
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

  // 2. OBTENER TURNOS (Trae TODO del backend)
  const fetchDailyShifts = useCallback(async () => {
    if (!currentDate) return
    try {
      setLoading(true)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      // Asumimos que el backend arreglado devuelve TODOS (pendientes, finalizados, cancelados)
      const data = await window.api.shift.getByDate(dateStr)
      setRawShifts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  const fetchYearlyLoad = useCallback(async () => {
    if (!currentDate) return
    try {
      const year = currentDate.getFullYear()
      const data = await window.api.shift.getYearlyLoad(year)
      const loadMap: Record<string, number> = {}
      data.forEach((item: any) => {
        loadMap[item.fecha] = item.count
      })
      setWorkloadMap(loadMap)
    } catch (error) {
      console.error('Error cargando heatmap anual:', error)
    }
  }, [currentDate.getFullYear()])

  const refreshShifts = async () => {
    await Promise.all([fetchDailyShifts(), fetchYearlyLoad()])
  }

  useEffect(() => {
    fetchDailyShifts()
    fetchYearlyLoad()
  }, [fetchDailyShifts, fetchYearlyLoad])

  // --- FILTRADO INTELIGENTE (MEMOIZED) ---
  // Esto es lo que consume la UI. Si cambia el config.showFinishedShifts, se recalcula al instante.
  const processedShifts = useMemo(() => {
    if (config.showFinishedShifts) {
      return rawShifts
    }
    // Si está desactivado, filtramos los finalizados y cancelados
    return rawShifts.filter((t) => t.estado !== 'finalizado' && t.estado !== 'cancelado')
  }, [rawShifts, config.showFinishedShifts])

  // --- ACCIONES ---

  const addShift = async (data: NewShiftData): Promise<boolean> => {
    try {
      const dateStr = data.fecha || format(currentDate, 'yyyy-MM-dd')
      await window.api.shift.create({ ...data, fecha: dateStr })
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

      // Guardamos el booleano como string
      if (newConfig.showFinishedShifts !== undefined)
        settingsToSave['show_finished_shifts'] = String(newConfig.showFinishedShifts)

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

  const stats: ShiftStats = {
    total: rawShifts.length,
    pendientes: rawShifts.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso').length,
    completados: rawShifts.filter((t) => t.estado === 'finalizado').length
  }

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
        shifts: processedShifts, // Enviamos los filtrados por defecto
        allShifts: rawShifts, // Enviamos los crudos por si acaso
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
