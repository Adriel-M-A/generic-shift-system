import React, { createContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Shift, NewShiftData, ShiftConfig, EstadoTurno } from '../types'
import { parseError } from '@lib/error-utils'

interface ShiftContextType {
  currentDate: Date
  view: 'month' | 'year'
  shifts: Shift[]
  loading: boolean
  config: ShiftConfig
  setCurrentDate: (date: Date) => void
  changeView: (view: 'month' | 'year') => void
  addShift: (data: NewShiftData) => Promise<void>
  changeShiftStatus: (id: number, estado: EstadoTurno) => Promise<void>
  updateConfig: (newConfig: ShiftConfig) => Promise<void>
  refreshShifts: () => void
  getDailyLoad: (date: Date) => number
  formatDateHeader: (date: Date) => string
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

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

  const toLocalISODate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const formatDateHeader = (date: Date) => format(date, "EEEE d 'de' MMMM", { locale: es })

  const getDailyLoad = useCallback(
    (date: Date) => {
      const dateStr = toLocalISODate(date)
      return shifts.filter((s) => s.fecha === dateStr).length
    },
    [shifts]
  )

  const fetchShifts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.shift.getByDate(toLocalISODate(currentDate))
      setShifts(result)
    } catch (error) {
      toast.error('Error al cargar turnos')
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    async function init() {
      const settings = await window.api.settings.getAll()
      setConfig({
        openingTime: settings.shift_opening || DEFAULT_CONFIG.openingTime,
        closingTime: settings.shift_closing || DEFAULT_CONFIG.closingTime,
        interval: Number(settings.shift_interval) || DEFAULT_CONFIG.interval,
        startOfWeek: (settings.calendar_start_day as any) || DEFAULT_CONFIG.startOfWeek,
        showFinishedShifts: settings.show_finished_shifts === 'true',
        thresholds: {
          low: Number(settings.threshold_low) || DEFAULT_CONFIG.thresholds.low,
          medium: Number(settings.threshold_medium) || DEFAULT_CONFIG.thresholds.medium
        }
      })
    }
    init()
  }, [])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const addShift = async (data: NewShiftData) => {
    try {
      await window.api.shift.create({ ...data, fecha: data.fecha || toLocalISODate(currentDate) })
      fetchShifts()
    } catch (e: any) {
      throw new Error(parseError(e))
    }
  }

  const changeShiftStatus = async (id: number, estado: EstadoTurno) => {
    try {
      await window.api.shift.updateStatus({ id, estado })
      setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, estado } : s)))
    } catch (e) {
      fetchShifts()
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
        setCurrentDate,
        changeView: setView,
        addShift,
        changeShiftStatus,
        updateConfig: async (c) => setConfig(c),
        refreshShifts: fetchShifts,
        getDailyLoad,
        formatDateHeader
      }}
    >
      {children}
    </ShiftContext.Provider>
  )
}

export { ShiftContext }
