import { Database } from 'better-sqlite3'
import bcrypt from 'bcryptjs'

// Definimos la estructura de una migración
interface Migration {
  id: number
  name: string
  up: (db: Database) => void
}

// --- LISTA DE MIGRACIONES ---
// Aquí irás agregando { id: 2, ... }, { id: 3, ... } en el futuro
const migrationsList: Migration[] = [
  {
    id: 1,
    name: '001_initial_auth_schema',
    up: (db: Database) => {
      console.log('Ejecutando migración: 001_initial_auth_schema')

      // 1. Crear Tabla Usuarios
      db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          usuario TEXT NOT NULL UNIQUE, 
          password TEXT NOT NULL,
          level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 2. Crear Tabla Roles
      db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY,
          label TEXT NOT NULL,
          permissions TEXT DEFAULT '[]'
        )
      `)

      // 3. Datos Semilla (Seeds) - Roles
      const rolesCount = db.prepare('SELECT count(*) as count FROM roles').get() as any
      if (rolesCount.count === 0) {
        const adminPerms = JSON.stringify(['*'])
        db.prepare('INSERT INTO roles (id, label, permissions) VALUES (?, ?, ?)').run(
          1,
          'Administrador',
          adminPerms
        )

        const staffPerms = JSON.stringify(['shift', 'services', 'perfil', 'perfil_cuenta'])
        db.prepare('INSERT INTO roles (id, label, permissions) VALUES (?, ?, ?)').run(
          2,
          'Staff',
          staffPerms
        )

        const auditorPerms = JSON.stringify(['dashboard'])
        db.prepare('INSERT INTO roles (id, label, permissions) VALUES (?, ?, ?)').run(
          3,
          'Auditor',
          auditorPerms
        )
      }

      // 4. Datos Semilla (Seeds) - Admin Default
      const userCount = db.prepare('SELECT count(*) as count FROM usuarios').get() as any
      if (userCount.count === 0) {
        const pass = bcrypt.hashSync('admin123', 10)
        db.prepare(
          `
          INSERT INTO usuarios (nombre, apellido, usuario, password, level) 
          VALUES (?, ?, ?, ?, ?)
        `
        ).run('Admin', 'Principal', 'administrador', pass, 1)
      }
    }
  },
  {
    id: 2,
    name: '002_add_services_to_staff',
    up: (db: Database) => {
      console.log('Ejecutando migración: 002_add_services_to_staff')
      const row = db.prepare('SELECT permissions FROM roles WHERE id = ?').get(2) as any
      if (row && row.permissions) {
        try {
          const perms = JSON.parse(row.permissions) as string[]
          const set = new Set(perms)
          set.add('services')
          set.add('shift')
          const newPerms = JSON.stringify(Array.from(set))
          db.prepare('UPDATE roles SET permissions = ? WHERE id = ?').run(newPerms, 2)
        } catch (e) {
          console.error('Error al parsear permisos del rol 2:', e)
        }
      }
    }
  },
  {
    id: 3,
    name: '003_create_shifts_table',
    up: (db: Database) => {
      console.log('Ejecutando migración: 003_create_shifts_table')

      // Creamos la tabla 'turnos'
      db.exec(`
        CREATE TABLE IF NOT EXISTS turnos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          cliente TEXT NOT NULL,
          servicio TEXT NOT NULL,
          profesional TEXT DEFAULT 'Staff',
          estado TEXT DEFAULT 'pendiente',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }
  }
]

// --- LÓGICA DEL EJECUTOR (RUNNER) ---
export function runMigrations(db: Database) {
  // 1. Crear tabla de control de migraciones si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 2. Obtener migraciones ya aplicadas
  const applied = db.prepare('SELECT id FROM _migrations').all() as { id: number }[]
  const appliedIds = new Set(applied.map((m) => m.id))

  // 3. Ejecutar las pendientes en orden
  for (const migration of migrationsList.sort((a, b) => a.id - b.id)) {
    if (!appliedIds.has(migration.id)) {
      try {
        // Usamos una transacción: si falla algo, no se aplica nada de esta migración
        const transaction = db.transaction(() => {
          migration.up(db)
          db.prepare('INSERT INTO _migrations (id, name) VALUES (?, ?)').run(
            migration.id,
            migration.name
          )
        })
        transaction()
        console.log(`✅ Migración aplicada: ${migration.name}`)
      } catch (error) {
        console.error(`❌ Error en migración ${migration.name}:`, error)
        throw error // Detenemos la app porque la DB está en estado inconsistente
      }
    }
  }
}
