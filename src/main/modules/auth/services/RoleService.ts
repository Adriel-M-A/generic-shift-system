import { Database } from 'better-sqlite3'
import { AuthService } from './AuthService'

export class RoleService {
  constructor(
    private db: Database,
    private authService: AuthService
  ) {}

  getRoles() {
    const roles = this.db.prepare('SELECT * FROM roles ORDER BY id ASC').all() as any[]
    return roles.map((r) => ({ ...r, permissions: JSON.parse(r.permissions) }))
  }

  updateRole(id: number, label: string, permissions: string[]) {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser || currentUser.level !== 1) {
      throw new Error('Solo el administrador puede editar roles')
    }

    this.db
      .prepare('UPDATE roles SET label = ?, permissions = ? WHERE id = ?')
      .run(label, JSON.stringify(permissions), id)

    return { success: true }
  }
}
