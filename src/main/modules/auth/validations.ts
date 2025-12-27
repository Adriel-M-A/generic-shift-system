import { z } from 'zod'

export const LoginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export const CreateUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto'),
  apellido: z.string().min(2, 'El apellido es muy corto'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  level: z.number().int().min(1).max(3)
})

export const UpdateUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto').optional(),
  apellido: z.string().min(2, 'El apellido es muy corto').optional(),
  usuario: z.string().min(3, 'El usuario es muy corto').optional(),
  level: z.number().int().min(1).max(3).optional()
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
})

export const UpdateRoleSchema = z.object({
  label: z.string().min(1, 'El nombre del rol es requerido'),
  permissions: z.array(z.string())
})
