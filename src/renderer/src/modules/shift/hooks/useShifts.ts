import { useState, useEffect } from 'react'
import { Turno, ViewMode, ShiftStats } from '../types'

// --- MOCK DATA ---
const MOCK_TURNOS: Turno[] = [
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

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Estadísticas calculadas
  const stats: ShiftStats = {
    total: MOCK_TURNOS.length,
    pendientes: MOCK_TURNOS.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso')
      .length,
    completados: MOCK_TURNOS.filter((t) => t.estado === 'completado').length
  }

  // Simulación de carga de trabajo por día
  const getDailyLoad = (d: Date) => {
    const seed = d.getDate() + d.getMonth()
    return seed % 12 // Retorna entre 0 y 11 turnos
  }

  // Helpers de formato
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
    shifts: MOCK_TURNOS,
    stats,
    getDailyLoad,
    formatTime,
    formatDateHeader
  }
}
