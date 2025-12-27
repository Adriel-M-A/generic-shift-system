import { db } from '../../../core/database'
import { authService } from './AuthService'

export class RoleService {
  getRoles() {
    const roles = db.prepare('SELECT * FROM roles ORDER BY id ASC').all() as any[]
    return roles.map((r) => ({ ...r, permissions: JSON.parse(r.permissions) }))
  }

  updateRole(id: number, label: string, permissions: string[]) {
    // Solo Admin (Nivel 1) puede editar roles
    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.level !== 1) {
      throw new Error('Solo el administrador puede editar roles')
    }

    db.prepare('UPDATE roles SET label = ?, permissions = ? WHERE id = ?').run(
      label,
      JSON.stringify(permissions),
      id
    )

    return { success: true }
  }
}

export const roleService = new RoleService()
