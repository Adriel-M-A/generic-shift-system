import { db } from '../../core/database' // <--- Importación directa (Singleton)

// Eliminamos el parámetro (db: Database) de aquí
export function initShiftSchema() {
  // Tabla existente
  db.exec(`
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      telefono TEXT,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      servicio TEXT NOT NULL,
      profesional TEXT DEFAULT 'Staff',
      estado TEXT DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // --- NUEVA TABLA: SERVICIOS ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}
