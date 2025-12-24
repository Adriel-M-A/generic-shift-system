import { useState, useEffect } from 'react'
import { Turno, ViewMode, ShiftStats, EstadoTurno } from '../types'

export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
}

const INITIAL_DATA: Turno[] = [
  {
    id: 1,
    cliente: 'Maria Gonzalez',
    servicio: 'Corte y Color',
    hora: '09:00',
    profesional: 'Ana B.',
    estado: 'completado'
  },
  {
    id: 2,
    cliente: 'Carlos Perez',
    servicio: 'Barba y Corte',
    hora: '10:30',
    profesional: 'Juan D.',
    estado: 'en_curso'
  },
  {
    id: 3,
    cliente: 'Lucia Diaz',
    servicio: 'Manicura',
    hora: '11:00',
    profesional: 'Ana B.',
    estado: 'pendiente'
  },
  {
    id: 4,
    cliente: 'Roberto Gomez',
    servicio: 'Masaje',
    hora: '14:00',
    profesional: 'Pedro S.',
    estado: 'pendiente'
  },
  {
    id: 5,
    cliente: 'Elena Torres',
    servicio: 'Alisado',
    hora: '16:30',
    profesional: 'Sofia M.',
    estado: 'cancelado'
  },
  {
    id: 6,
    cliente: 'Ana Lopez',
    servicio: 'Peinado',
    hora: '17:00',
    profesional: 'Sofia M.',
    estado: 'pendiente'
  },
  {
    id: 7,
    cliente: 'Jorge Luis',
    servicio: 'Corte Niño',
    hora: '18:00',
    profesional: 'Juan D.',
    estado: 'pendiente'
  }
]

export function useShifts() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [shifts, setShifts] = useState<Turno[]>(INITIAL_DATA)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Función para agregar turno
  const addShift = (data: NewShiftData) => {
    const newShift: Turno = {
      id: Date.now(),
      cliente: data.cliente,
      servicio: data.servicio,
      hora: data.hora,
      profesional: 'Staff',
      estado: 'pendiente'
    }
    setShifts((prev) => [...prev, newShift])
  }

  const changeShiftStatus = (id: number, newStatus: EstadoTurno) => {
    setShifts((prev) =>
      prev.map((turno) => (turno.id === id ? { ...turno, estado: newStatus } : turno))
    )
  }

  const stats: ShiftStats = {
    total: shifts.length,
    pendientes: shifts.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso').length,
    completados: shifts.filter((t) => t.estado === 'completado').length
  }

  const getDailyLoad = (d: Date) => {
    const seed = d.getDate() + d.getMonth()
    return seed % 12
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const formatDateHeader = (d: Date) =>
    d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return {
    date,
    setDate,
    viewMode,
    setViewMode,
    currentTime,
    shifts,
    addShift,
    changeShiftStatus,
    stats,
    getDailyLoad,
    formatTime,
    formatDateHeader
  }
}
