import { db } from '../../../core/database'
import bcrypt from 'bcryptjs'
import { authService } from './AuthService' // Dependencia
import { PERMISSIONS } from '../../../../shared/permissions'

export class UserService {
  private formatName(text: string): string {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  getUsers() {
    return db
      .prepare('SELECT id, nombre, apellido, usuario, level, last_login, created_at FROM usuarios')
      .all()
  }

  createUser(data: any) {
    if (!authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) {
      throw new Error('No tienes permiso para crear usuarios')
    }

    const { nombre, apellido, usuario, password, level } = data

    try {
      const hashedPassword = bcrypt.hashSync(password, 10)
      const info = db
        .prepare(
          `INSERT INTO usuarios (nombre, apellido, usuario, password, level) VALUES (?, ?, ?, ?, ?)`
        )
        .run(this.formatName(nombre), this.formatName(apellido), usuario, hashedPassword, level)
      return { success: true, id: info.lastInsertRowid }
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new Error('El usuario ya existe')
      throw error
    }
  }

  updateUser(id: number, data: any) {
    const currentUser = authService.getCurrentUser()
    const isSelf = currentUser?.id === id
    const hasPerm = authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)

    if (!isSelf && !hasPerm) throw new Error('No autorizado')

    const updates: string[] = []
    const params: any[] = []

    if (data.nombre) {
      updates.push('nombre = ?')
      params.push(this.formatName(data.nombre))
    }
    if (data.apellido) {
      updates.push('apellido = ?')
      params.push(this.formatName(data.apellido))
    }
    if (data.usuario) {
      updates.push('usuario = ?')
      params.push(data.usuario)
    }

    if (data.level) {
      if (!hasPerm) throw new Error('No puedes cambiar el nivel de acceso')
      updates.push('level = ?')
      params.push(data.level)
    }

    if (updates.length === 0) return { success: true }

    params.push(id)
    db.prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    // Si me edito a mí mismo, actualizar mi sesión (opcional pero recomendado)
    // Esto requeriría un método extra en AuthService para actualizar la sesión activa.

    return { success: true }
  }

  deleteUser(id: number) {
    if (!authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) throw new Error('No autorizado')
    if (authService.getCurrentUser()?.id === id) throw new Error('No puedes eliminarte a ti mismo')

    db.prepare('DELETE FROM usuarios WHERE id = ?').run(id)
    return { success: true }
  }

  changePassword(id: number, currentPass: string, newPass: string) {
    if (authService.getCurrentUser()?.id !== id) throw new Error('No autorizado')

    const user = db.prepare('SELECT password FROM usuarios WHERE id = ?').get(id) as any
    if (!user || !bcrypt.compareSync(currentPass, user.password)) {
      throw new Error('Contraseña actual incorrecta')
    }

    const hashedNew = bcrypt.hashSync(newPass, 10)
    db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(hashedNew, id)
    return { success: true }
  }
}

export const userService = new UserService()
