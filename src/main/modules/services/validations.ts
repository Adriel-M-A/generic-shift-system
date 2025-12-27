import { z } from 'zod'

export const ServiceNameSchema = z
  .string()
  .min(1, 'El nombre es requerido')
  .min(2, 'El nombre del servicio debe tener al menos 2 caracteres')
  .max(50, 'El nombre es muy largo')
