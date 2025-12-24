import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { format } from 'date-fns'
import { Turno, ViewMode, ShiftStats, EstadoTurno } from '../types'
import { formatDateHeader } from '../utils'

export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
}

export interface ShiftConfig {
  openingTime: string
  closingTime: string
  interval: number
  // Configuración Visual
  startOfWeek: 'monday' | 'sunday'
  thresholds: {
    low: number
    medium: number
  }
}

// Estos valores se usan SOLO mientras carga la base de datos
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
  date: Date | undefined
  setDate: (date: Date) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  shifts: Turno[]
  addShift: (data: NewShiftData) => Promise<void>
  changeShiftStatus: (id: number, status: EstadoTurno) => Promise<void>
  stats: ShiftStats
  getDailyLoad: (date: Date) => number
  formatDateHeader: (d: Date) => string
  config: ShiftConfig
  updateConfig: (newConfig: Partial<ShiftConfig>) => Promise<void>
}

export const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [shifts, setShifts] = useState<Turno[]>([])
  const [monthlyLoad, setMonthlyLoad] = useState<Record<string, number>>({})

  // Iniciamos con default, pero será sobrescrito inmediatamente por la DB
  const [config, setConfig] = useState<ShiftConfig>(DEFAULT_CONFIG)

  // 1. CARGAR CONFIGURACIÓN DESDE BASE DE DATOS
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.api.settings.getAll()
        if (settings) {
          setConfig({
            // Si la DB tiene valor, lo usa. Si no, usa el default (fallback)
            openingTime: settings.shift_opening || '08:00',
            closingTime: settings.shift_closing || '20:00',
            interval: parseInt(settings.shift_interval || '30'),

            // Nuevas claves visuales
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

  // 2. CARGAR TURNOS DEL DÍA
  const fetchDailyShifts = useCallback(async () => {
    if (!date) return
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const data = await window.api.shift.getByDate(dateStr)
      setShifts(data)
    } catch (error) {
      console.error(error)
    }
  }, [date])

  // 3. CARGAR MAPA DE CALOR
  const fetchMonthlyLoad = useCallback(async () => {
    if (!date) return
    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const data = await window.api.shift.getMonthlyLoad({ year, month })
      const loadMap: Record<string, number> = {}
      data.forEach((item: any) => {
        loadMap[item.fecha] = item.count
      })
      setMonthlyLoad(loadMap)
    } catch (error) {
      console.error(error)
    }
  }, [date?.getMonth(), date?.getFullYear()])

  useEffect(() => {
    fetchDailyShifts()
    fetchMonthlyLoad()
  }, [fetchDailyShifts, fetchMonthlyLoad])

  // --- ACCIONES ---

  const addShift = async (data: NewShiftData) => {
    if (!date) return
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      await window.api.shift.create({
        ...data,
        fecha: dateStr
      })
      fetchDailyShifts()
      fetchMonthlyLoad()
    } catch (error) {
      console.error(error)
    }
  }

  const changeShiftStatus = async (id: number, newStatus: EstadoTurno) => {
    try {
      await window.api.shift.updateStatus({ id, estado: newStatus })
      fetchDailyShifts()
      if (newStatus === 'cancelado' || newStatus === 'pendiente') {
        fetchMonthlyLoad()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // --- ACTUALIZAR CONFIGURACIÓN Y GUARDAR EN BD ---
  const updateConfig = async (newConfig: Partial<ShiftConfig>) => {
    try {
      const settingsToSave: Record<string, string> = {}

      // Mapeo: Objeto Config -> Claves de Base de Datos
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

      // 1. Guardar en SQLite
      await window.api.settings.setMany(settingsToSave)

      // 2. Actualizar estado en React (Merge profundo para no perder datos anidados)
      setConfig((prev) => ({
        ...prev,
        ...newConfig,
        thresholds: {
          ...prev.thresholds,
          ...(newConfig.thresholds || {})
        }
      }))
    } catch (e) {
      console.error('Error guardando configuración:', e)
    }
  }

  const stats: ShiftStats = {
    total: shifts.length,
    pendientes: shifts.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso').length,
    completados: shifts.filter((t) => t.estado === 'completado').length
  }

  const getDailyLoad = (d: Date) => {
    const dateKey = format(d, 'yyyy-MM-dd')
    return monthlyLoad[dateKey] || 0
  }

  return (
    <ShiftContext.Provider
      value={{
        date,
        setDate,
        viewMode,
        setViewMode,
        shifts,
        addShift,
        changeShiftStatus,
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
