import { z } from 'zod'

export const CreateShiftSchema = z.object({
  fecha: z.string(),
  hora: z.string(),
  cliente: z.string(),
  // Ahora aceptamos un array de strings (nombres de servicios)
  servicio: z.array(z.string()).min(1, 'Debe seleccionar al menos un servicio'),
  customerId: z.number().nullable().optional(),
  createCustomer: z
    .object({
      nombre: z.string().min(1, 'El nombre es obligatorio'),
      apellido: z.string().min(1, 'El apellido es obligatorio'),
      documento: z.string().min(1),
      telefono: z.string().optional()
    })
    .optional()
})

export const DateParamSchema = z.string()
export const MonthlyLoadSchema = z.object({
  year: z.number(),
  month: z.number()
})
export const InitialDataSchema = z.object({
  date: z.string(),
  year: z.number(),
  month: z.number()
})
export const YearlyLoadSchema = z.number()
export const UpdateStatusSchema = z.object({
  id: z.number(),
  estado: z.string()
})
