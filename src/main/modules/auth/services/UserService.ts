import { Database } from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { PERMISSIONS } from '../../../../shared/permissions'
import { AuthService } from './AuthService'

export class UserService {
  constructor(
    private db: Database,
    private authService: AuthService
  ) {}

  private formatName(text: string): string {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  getUsers() {
    return this.db
      .prepare('SELECT id, nombre, apellido, usuario, level, last_login, created_at FROM usuarios')
      .all()
  }

  createUser(data: any) {
    if (!this.authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)) {
      throw new Error('No tienes permiso para crear usuarios')
    }

    const { nombre, apellido, usuario, password, level } = data

    try {
      const hashedPassword = bcrypt.hashSync(password, 10)
      const info = this.db
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
    const currentUser = this.authService.getCurrentUser()
    const isSelf = currentUser?.id === id
    const hasPerm = this.authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS)

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
    this.db.prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    return { success: true }
  }

  deleteUser(id: number) {
    if (!this.authService.checkPermission(PERMISSIONS.PERFIL.USUARIOS))
      throw new Error('No autorizado')
    if (this.authService.getCurrentUser()?.id === id)
      throw new Error('No puedes eliminarte a ti mismo')

    this.db.prepare('DELETE FROM usuarios WHERE id = ?').run(id)
    return { success: true }
  }

  changePassword(id: number, currentPass: string, newPass: string) {
    if (this.authService.getCurrentUser()?.id !== id) throw new Error('No autorizado')

    const user = this.db.prepare('SELECT password FROM usuarios WHERE id = ?').get(id) as any
    if (!user || !bcrypt.compareSync(currentPass, user.password)) {
      throw new Error('Contraseña actual incorrecta')
    }

    const hashedNew = bcrypt.hashSync(newPass, 10)
    this.db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(hashedNew, id)
    return { success: true }
  }
}
