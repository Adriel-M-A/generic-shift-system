import { db } from '../../core/database'
import bcrypt from 'bcryptjs'

export function initAuthSchema() {
  // 1. Tabla Usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE, 
      password TEXT NOT NULL,
      level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
      last_login DATETIME,
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // 2. Tabla Roles
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY,
      label TEXT NOT NULL,
      permissions TEXT DEFAULT '[]'
    )
  `)

  // 3. Seed Roles
  const rolesCount = db.prepare('SELECT count(*) as count FROM roles').get() as any
  if (rolesCount.count === 0) {
    const adminPerms = JSON.stringify(['*'])
    const staffPerms = JSON.stringify(['shift', 'services', 'perfil', 'perfil_cuenta'])
    const auditorPerms = JSON.stringify(['dashboard'])

    const stmt = db.prepare('INSERT INTO roles (id, label, permissions) VALUES (?, ?, ?)')
    stmt.run(1, 'Administrador', adminPerms)
    stmt.run(2, 'Staff', staffPerms)
    stmt.run(3, 'Auditor', auditorPerms)
  }

  // 4. Seed Usuario Admin
  const userCount = db.prepare('SELECT count(*) as count FROM usuarios').get() as any
  if (userCount.count === 0) {
    const pass = bcrypt.hashSync('admin', 10)
    db.prepare(
      `
      INSERT INTO usuarios (nombre, apellido, usuario, password, level) 
      VALUES (?, ?, ?, ?, ?)
    `
    ).run('Admin', 'Principal', 'admin', pass, 1)
  }
}
