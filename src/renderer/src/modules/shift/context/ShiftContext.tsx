import React, { createContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Shift, NewShiftData, ShiftConfig, EstadoTurno } from '../types'
import { parseError } from '@lib/error-utils'

interface ShiftContextType {
  // Estado
  currentDate: Date
  view: 'month' | 'year'
  shifts: Shift[]
  loading: boolean
  config: ShiftConfig

  // Acciones
  changeDate: (date: Date) => void
  changeView: (view: 'month' | 'year') => void
  addShift: (data: NewShiftData) => Promise<void>
  changeShiftStatus: (id: number, estado: EstadoTurno) => Promise<void>
  updateConfig: (newConfig: ShiftConfig) => Promise<void>
  refreshShifts: () => void
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

// Configuración por defecto para evitar pantallas blancas si falla la carga inicial
const DEFAULT_CONFIG: ShiftConfig = {
  openingTime: '08:00',
  closingTime: '20:00',
  interval: 30,
  startOfWeek: 'monday',
  showFinishedShifts: false,
  thresholds: { low: 5, medium: 10 }
}

export const ShiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<'month' | 'year'>('month')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ShiftConfig>(DEFAULT_CONFIG)

  // --- Helpers ---

  // Convierte Date a 'YYYY-MM-DD' usando la hora local (evita problemas de UTC)
  const toLocalISODate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // --- Carga de Datos ---

  const loadConfig = async () => {
    try {
      const settings = await window.api.settings.getAll()
      // Mapeamos los settings planos (key-value) al objeto ShiftConfig
      const mappedConfig: ShiftConfig = {
        openingTime: settings.shift_opening || DEFAULT_CONFIG.openingTime,
        closingTime: settings.shift_closing || DEFAULT_CONFIG.closingTime,
        interval: Number(settings.shift_interval) || DEFAULT_CONFIG.interval,
        startOfWeek: (settings.calendar_start_day as any) || DEFAULT_CONFIG.startOfWeek,
        showFinishedShifts: settings.show_finished_shifts === 'true',
        thresholds: {
          low: Number(settings.threshold_low) || DEFAULT_CONFIG.thresholds.low,
          medium: Number(settings.threshold_medium) || DEFAULT_CONFIG.thresholds.medium
        }
      }
      setConfig(mappedConfig)
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }

  const fetchShifts = useCallback(async () => {
    setLoading(true)
    try {
      const dateStr = toLocalISODate(currentDate)
      const result = await window.api.shift.getByDate(dateStr)
      setShifts(result)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar los turnos')
      setShifts([])
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  // Carga inicial
  useEffect(() => {
    loadConfig()
  }, [])

  // Recargar turnos cuando cambia la fecha seleccionada
  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  // --- Acciones ---

  const changeDate = (date: Date) => {
    setCurrentDate(date)
  }

  const changeView = (newView: 'month' | 'year') => {
    setView(newView)
  }

  const addShift = async (data: NewShiftData) => {
    // Si no viene fecha en el objeto, usamos la fecha seleccionada actualmente
    const shiftData = {
      ...data,
      fecha: data.fecha || toLocalISODate(currentDate)
    }

    try {
      await window.api.shift.create(shiftData)
      fetchShifts()
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  const changeShiftStatus = async (id: number, estado: EstadoTurno) => {
    try {
      await window.api.shift.updateStatus({ id, estado })
      setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, estado } : s)))
    } catch (error) {
      fetchShifts()
      throw new Error(parseError(error))
    }
  }

  const updateConfig = async (newConfig: ShiftConfig) => {
    try {
      // CORRECCIÓN: Convertimos explícitamente a String los valores numéricos y booleanos
      const settingsToSave = {
        shift_opening: newConfig.openingTime,
        shift_closing: newConfig.closingTime,
        shift_interval: String(newConfig.interval),
        calendar_start_day: newConfig.startOfWeek,
        threshold_low: String(newConfig.thresholds.low),
        threshold_medium: String(newConfig.thresholds.medium),
        show_finished_shifts: String(newConfig.showFinishedShifts)
      }

      await window.api.settings.setMany(settingsToSave)
      setConfig(newConfig)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  return (
    <ShiftContext.Provider
      value={{
        currentDate,
        view,
        shifts,
        loading,
        config,
        changeDate,
        changeView,
        addShift,
        changeShiftStatus,
        updateConfig,
        refreshShifts: fetchShifts
      }}
    >
      {children}
    </ShiftContext.Provider>
  )
}

export { ShiftContext }
export type { ShiftContextType }
