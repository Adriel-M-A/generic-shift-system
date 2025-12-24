import { db } from '../../core/database'
import bcrypt from 'bcryptjs'
import { PERMISSIONS } from '../../../shared/permissions'

// Estado de sesión simple en memoria (Main Process)
let currentSession: { id: number; level: number } | null = null

const formatName = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const AuthService = {
  // --- VERIFICACIÓN DE SEGURIDAD ---
  getCurrentUser: () => currentSession,

  logout: () => {
    currentSession = null
    return { success: true }
  },

  // Verifica si el usuario logueado tiene el permiso requerido
  checkPermission: (requiredPerm: string): boolean => {
    if (!currentSession) return false
    if (currentSession.level === 1) return true // Admin siempre pasa

    try {
      const role = db
        .prepare('SELECT permissions FROM roles WHERE id = ?')
        .get(currentSession.level) as any
      if (!role) return false

      const perms = JSON.parse(role.permissions)
      return perms.includes(requiredPerm)
    } catch (e) {
      return false
    }
  },

  // --- USUARIOS ---
  login: (usuario: string, password: string) => {
    const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario) as any
    if (!user) return { success: false, message: 'Usuario no encontrado' }

    const match = bcrypt.compareSync(password, user.password)
    if (!match) return { success: false, message: 'Contraseña incorrecta' }

    // GUARDAMOS LA SESIÓN EN BACKEND
    currentSession = { id: user.id, level: user.level }

    db.prepare('UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id)

    const { password: _, ...userData } = user
    return { success: true, user: userData }
  },

  getUsers: () => {
    return db
      .prepare('SELECT id, nombre, apellido, usuario, level, last_login, created_at FROM usuarios')
      .all()
  },

  createUser: (data: any) => {
    // PROTECCIÓN: Solo si tiene permiso de gestionar usuarios
    if (!AuthService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) {
      return { success: false, message: 'No tienes permiso para crear usuarios' }
    }

    const { nombre, apellido, usuario, password, level } = data
    const nombreFmt = formatName(nombre)
    const apellidoFmt = formatName(apellido)

    try {
      const hashedPassword = bcrypt.hashSync(password, 10)
      const info = db
        .prepare(
          `INSERT INTO usuarios (nombre, apellido, usuario, password, level) VALUES (?, ?, ?, ?, ?)`
        )
        .run(nombreFmt, apellidoFmt, usuario, hashedPassword, level)
      return { success: true, id: info.lastInsertRowid }
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, message: 'El usuario ya existe' }
      }
      return { success: false, message: 'Error al crear usuario' }
    }
  },

  updateUser: (id: number, data: any) => {
    // PROTECCIÓN: Permitir si es admin O si se edita a sí mismo
    const isSelf = currentSession?.id === id
    const hasPerm = AuthService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)

    if (!isSelf && !hasPerm) {
      return { success: false, message: 'No autorizado' }
    }

    const updates: string[] = []
    const params: any[] = []

    if (data.nombre) {
      updates.push('nombre = ?')
      params.push(formatName(data.nombre))
    }
    if (data.apellido) {
      updates.push('apellido = ?')
      params.push(formatName(data.apellido))
    }
    if (data.usuario) {
      updates.push('usuario = ?')
      params.push(data.usuario)
    }
    if (data.level) {
      // PROTECCIÓN EXTRA: Solo Admin puede cambiar roles
      if (!AuthService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) {
        return { success: false, message: 'No puedes cambiar el nivel de acceso' }
      }
      updates.push('level = ?')
      params.push(data.level)
    }

    if (updates.length === 0) return { success: true }

    params.push(id)
    try {
      db.prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`).run(...params)
      const updatedUser = db
        .prepare('SELECT id, nombre, apellido, usuario, level FROM usuarios WHERE id = ?')
        .get(id)

      // Actualizamos sesión si nos editamos a nosotros mismos
      if (isSelf && updatedUser) {
        // @ts-ignore
        currentSession.level = updatedUser.level
      }

      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, message: 'Error al actualizar' }
    }
  },

  deleteUser: (id: number) => {
    if (!AuthService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) {
      return { success: false, message: 'No autorizado' }
    }

    if (currentSession?.id === id) {
      return { success: false, message: 'No puedes eliminarte a ti mismo' }
    }

    try {
      db.prepare('DELETE FROM usuarios WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Error al eliminar' }
    }
  },

  changePassword: (id: number, currentPass: string, newPass: string) => {
    // Solo permitirse cambiarse a uno mismo
    if (currentSession?.id !== id) {
      return { success: false, message: 'No autorizado' }
    }

    const user = db.prepare('SELECT password FROM usuarios WHERE id = ?').get(id) as any
    if (!user) return { success: false, message: 'Usuario no encontrado' }

    if (!bcrypt.compareSync(currentPass, user.password)) {
      return { success: false, message: 'La contraseña actual es incorrecta' }
    }

    const hashedNew = bcrypt.hashSync(newPass, 10)
    db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(hashedNew, id)
    return { success: true }
  },

  // --- ROLES ---
  getRoles: () => {
    const roles = db.prepare('SELECT * FROM roles ORDER BY id ASC').all() as any[]
    return roles.map((r) => ({ ...r, permissions: JSON.parse(r.permissions) }))
  },

  updateRole: (id: number, label: string, permissions: string[]) => {
    // Solo ADMIN (Nivel 1) puede tocar roles.
    if (!currentSession || currentSession.level !== 1) {
      return { success: false, message: 'Solo el administrador puede editar roles' }
    }

    const permsString = JSON.stringify(permissions)
    db.prepare('UPDATE roles SET label = ?, permissions = ? WHERE id = ?').run(
      label,
      permsString,
      id
    )
    return { success: true }
  }
}
