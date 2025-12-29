import { z } from 'zod'

export const CustomerSchema = z.object({
  documento: z.string().min(1, 'El documento es obligatorio'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  email: z.union([
    z.string().email('El email no es válido'),
    z.string().length(0),
    z.null(),
    z.undefined()
  ])
})

export const UpdateCustomerSchema = CustomerSchema.partial()
