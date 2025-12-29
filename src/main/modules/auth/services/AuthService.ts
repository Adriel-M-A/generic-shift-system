import { Database } from 'better-sqlite3'
import bcrypt from 'bcryptjs'

export class AuthService {
  private currentSession: { id: number; level: number } | null = null

  constructor(private db: Database) {}

  getCurrentUser() {
    return this.currentSession
  }

  logout() {
    this.currentSession = null
    return { success: true }
  }

  login(usuario: string, password: string) {
    const user = this.db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario) as any
    if (!user) throw new Error('Usuario no encontrado')

    const match = bcrypt.compareSync(password, user.password)
    if (!match) throw new Error('Contraseña incorrecta')

    this.currentSession = { id: user.id, level: user.level }

    this.db
      .prepare("UPDATE usuarios SET last_login = datetime('now', 'localtime') WHERE id = ?")
      .run(user.id)

    const { password: _, ...userData } = user
    return { success: true, user: userData }
  }

  checkPermission(requiredPerm: string): boolean {
    if (!this.currentSession) return false
    if (this.currentSession.level === 1) return true

    try {
      const role = this.db
        .prepare('SELECT permissions FROM roles WHERE id = ?')
        .get(this.currentSession.level) as any
      if (!role) return false
      const perms = JSON.parse(role.permissions)
      return perms.includes(requiredPerm)
    } catch (e) {
      return false
    }
  }
}
