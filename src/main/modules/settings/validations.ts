import { z } from 'zod'

export const SetSettingSchema = z.object({
  key: z.string().min(1, 'La clave de configuración es requerida'),
  value: z.union([z.string(), z.number(), z.boolean()])
})

export const SetManySchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
