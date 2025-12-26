import { Database } from 'better-sqlite3'

export function runMigrations(db: Database) {
  // Configuración para alto rendimiento (WAL) y soporte de claves foráneas
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  console.log('Base de datos configurada: WAL mode + Foreign Keys')
}
