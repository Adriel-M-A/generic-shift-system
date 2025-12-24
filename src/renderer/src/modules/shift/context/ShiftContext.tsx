import { createContext, useState, ReactNode } from 'react'
import { format, addDays } from 'date-fns' // Importamos utilidades de fecha
import { Turno, ViewMode, ShiftStats, EstadoTurno } from '../types'
import { formatDateHeader } from '../utils'

export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
}

// --- GENERACIÓN DE DATOS DE PRUEBA DINÁMICOS ---
// Esto asegura que siempre veas turnos en el día actual y siguiente al probar la app
const TODAY = new Date()
const TODAY_STR = format(TODAY, 'yyyy-MM-dd')
const TOMORROW_STR = format(addDays(TODAY, 1), 'yyyy-MM-dd')

const INITIAL_DATA: Turno[] = [
  {
    id: 1,
    fecha: TODAY_STR,
    cliente: 'Maria Gonzalez',
    servicio: 'Corte y Color',
    hora: '09:00',
    profesional: 'Ana B.',
    estado: 'completado'
  },
  {
    id: 2,
    fecha: TODAY_STR,
    cliente: 'Carlos Perez',
    servicio: 'Barba y Corte',
    hora: '10:30',
    profesional: 'Juan D.',
    estado: 'en_curso'
  },
  {
    id: 3,
    fecha: TODAY_STR,
    cliente: 'Lucia Diaz',
    servicio: 'Manicura',
    hora: '11:00',
    profesional: 'Ana B.',
    estado: 'pendiente'
  },
  {
    id: 4,
    fecha: TODAY_STR,
    cliente: 'Roberto Gomez',
    servicio: 'Masaje',
    hora: '14:00',
    profesional: 'Pedro S.',
    estado: 'pendiente'
  },
  // Turnos para mañana (para probar navegación)
  {
    id: 5,
    fecha: TOMORROW_STR,
    cliente: 'Elena Torres',
    servicio: 'Alisado',
    hora: '16:30',
    profesional: 'Sofia M.',
    estado: 'cancelado'
  },
  {
    id: 6,
    fecha: TOMORROW_STR,
    cliente: 'Ana Lopez',
    servicio: 'Peinado',
    hora: '17:00',
    profesional: 'Sofia M.',
    estado: 'pendiente'
  },
  {
    id: 7,
    fecha: TOMORROW_STR,
    cliente: 'Jorge Luis',
    servicio: 'Corte Niño',
    hora: '18:00',
    profesional: 'Juan D.',
    estado: 'pendiente'
  }
]

export interface ShiftContextType {
  date: Date | undefined
  setDate: (date: Date) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  shifts: Turno[]
  addShift: (data: NewShiftData) => void
  changeShiftStatus: (id: number, status: EstadoTurno) => void
  stats: ShiftStats
  getDailyLoad: (date: Date) => number
  formatDateHeader: (d: Date) => string
}

export const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [shifts, setShifts] = useState<Turno[]>(INITIAL_DATA)

  // Función para agregar turno
  const addShift = (data: NewShiftData) => {
    // Si no hay fecha seleccionada, usamos hoy
    const targetDate = date || new Date()

    const newShift: Turno = {
      id: Date.now(),
      fecha: format(targetDate, 'yyyy-MM-dd'), // Guardamos la fecha correcta
      cliente: data.cliente,
      servicio: data.servicio,
      hora: data.hora,
      profesional: 'Staff', // Hardcoded por ahora
      estado: 'pendiente'
    }
    setShifts((prev) => [...prev, newShift])
  }

  const changeShiftStatus = (id: number, newStatus: EstadoTurno) => {
    setShifts((prev) =>
      prev.map((turno) => (turno.id === id ? { ...turno, estado: newStatus } : turno))
    )
  }

  // Estadísticas globales (podrías querer filtrarlas por mes/año en el futuro)
  const stats: ShiftStats = {
    total: shifts.length,
    pendientes: shifts.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso').length,
    completados: shifts.filter((t) => t.estado === 'completado').length
  }

  // --- LÓGICA REAL DEL HEATMAP ---
  const getDailyLoad = (dateQuery: Date) => {
    // Convertimos la fecha consultada al mismo formato string que usamos en los datos
    const dateKey = format(dateQuery, 'yyyy-MM-dd')

    // Contamos cuántos turnos activos (no cancelados) hay en esa fecha
    return shifts.filter((s) => s.fecha === dateKey && s.estado !== 'cancelado').length
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
