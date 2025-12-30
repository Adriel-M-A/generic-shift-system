import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Shift, NewShiftData, ShiftConfig, EstadoTurno } from '@shared/types'
import { parseError } from '@lib/error-utils'

interface ShiftContextType {
  currentDate: Date
  view: 'month' | 'year'
  shifts: Shift[]
  filteredShifts: Shift[]
  loading: boolean
  config: ShiftConfig
  getDailyLoad: (date: Date) => number
  changeDate: (date: Date) => void
  changeView: (view: 'month' | 'year') => void
  addShift: (data: NewShiftData) => Promise<void>
  changeShiftStatus: (id: number, estado: EstadoTurno) => Promise<void>
  updateConfig: (newConfig: ShiftConfig) => Promise<void>
  fetchShiftsAndLoads: () => Promise<void>
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

const DEFAULT_CONFIG: ShiftConfig = {
  openingTime: '08:00',
  closingTime: '20:00',
  interval: 30,
  startOfWeek: 'monday',
  showCompleted: false,
  showCancelled: false,
  showAbsent: false,
  thresholds: { low: 5, medium: 10 }
}

export const ShiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<'month' | 'year'>('month')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [dailyLoads, setDailyLoads] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ShiftConfig>(DEFAULT_CONFIG)

  const toLocalISODate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const loadConfig = async () => {
    try {
      const settings = await window.api.settings.getAll()
      if (settings) {
        setConfig({
          openingTime: settings.shift_opening || DEFAULT_CONFIG.openingTime,
          closingTime: settings.shift_closing || DEFAULT_CONFIG.closingTime,
          interval: Number(settings.shift_interval) || DEFAULT_CONFIG.interval,
          startOfWeek: settings.calendar_start_day || DEFAULT_CONFIG.startOfWeek,
          showCompleted: settings.show_completed === 'true',
          showCancelled: settings.show_cancelled === 'true',
          showAbsent: settings.show_absent === 'true',
          thresholds: {
            low: Number(settings.threshold_low) || DEFAULT_CONFIG.thresholds.low,
            medium: Number(settings.threshold_medium) || DEFAULT_CONFIG.thresholds.medium
          }
        })
      }
    } catch (e) {
      console.error('Error cargando configuración:', e)
    }
  }

  const fetchShiftsAndLoads = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        date: toLocalISODate(currentDate),
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      }

      const { shifts: dayShifts, monthlyLoad: loadsArray } =
        await window.api.shift.getInitialData(params)
      setShifts(dayShifts)

      const loadsMap: Record<string, number> = {}
      if (Array.isArray(loadsArray)) {
        loadsArray.forEach((item: any) => {
          loadsMap[item.fecha] = item.count
        })
      }
      setDailyLoads(loadsMap)
    } catch (error) {
      console.error('Error al obtener turnos:', error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  const filteredShifts = useMemo(() => {
    return shifts
      .filter((s) => {
        if (s.estado === 'pendiente') return true
        if (s.estado === 'completado' && config.showCompleted) return true
        if (s.estado === 'cancelado' && config.showCancelled) return true
        if (s.estado === 'ausente' && config.showAbsent) return true
        return false
      })
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }, [shifts, config])

  const getDailyLoad = useCallback(
    (date: Date) => {
      const key = toLocalISODate(date)
      return dailyLoads[key] || 0
    },
    [dailyLoads]
  )

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    fetchShiftsAndLoads()
  }, [fetchShiftsAndLoads])

  const addShift = async (data: NewShiftData) => {
    try {
      const fecha = data.fecha || toLocalISODate(currentDate)
      await window.api.shift.create({ ...data, fecha })
      await fetchShiftsAndLoads()
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  const changeShiftStatus = async (id: number, estado: EstadoTurno) => {
    try {
      await window.api.shift.updateStatus({ id, estado })
      await fetchShiftsAndLoads()
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  const updateConfig = async (newConfig: ShiftConfig) => {
    try {
      const s = {
        shift_opening: newConfig.openingTime,
        shift_closing: newConfig.closingTime,
        shift_interval: String(newConfig.interval),
        calendar_start_day: newConfig.startOfWeek,
        show_completed: String(newConfig.showCompleted),
        show_cancelled: String(newConfig.showCancelled),
        show_absent: String(newConfig.showAbsent),
        threshold_low: String(newConfig.thresholds.low),
        threshold_medium: String(newConfig.thresholds.medium)
      }
      await window.api.settings.setMany(s)
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
        filteredShifts,
        loading,
        config,
        getDailyLoad,
        changeDate: setCurrentDate,
        changeView: setView,
        addShift,
        changeShiftStatus,
        updateConfig,
        fetchShiftsAndLoads
      }}
    >
      {children}
    </ShiftContext.Provider>
  )
}

export { ShiftContext }
