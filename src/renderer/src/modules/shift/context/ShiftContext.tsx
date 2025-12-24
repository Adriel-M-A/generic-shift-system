import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { format } from 'date-fns'
import { Turno, ViewMode, ShiftStats, EstadoTurno } from '../types'
import { formatDateHeader } from '../utils'

export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
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
}

export const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [shifts, setShifts] = useState<Turno[]>([])
  const [monthlyLoad, setMonthlyLoad] = useState<Record<string, number>>({})

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
        formatDateHeader
      }}
    >
      {children}
    </ShiftContext.Provider>
  )
}
