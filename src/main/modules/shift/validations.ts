import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

export const CreateShiftSchema = z.object({
  fecha: z.string().regex(dateRegex, 'La fecha debe tener formato YYYY-MM-DD'),
  hora: z.string().regex(timeRegex, 'La hora debe tener formato HH:mm'),
  cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  servicio: z.string().min(1, 'El servicio es requerido'),
  customerId: z.number().optional()
})

export const DateParamSchema = z.string().regex(dateRegex, 'Fecha inválida (requerido YYYY-MM-DD)')

export const MonthlyLoadSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12)
})

export const InitialDataSchema = z.object({
  date: z.string().regex(dateRegex, 'Fecha inválida'),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12)
})

export const YearlyLoadSchema = z.number().int().min(2000).max(2100)

export const UpdateStatusSchema = z.object({
  id: z.number().int().positive(),
  estado: z.enum(['pendiente', 'completado', 'cancelado', 'ausente'] as const, {
    message: 'Estado de turno inválido'
  })
})
