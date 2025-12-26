import { db } from '../../core/database'

export function initShiftSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      servicio TEXT NOT NULL,
      customer_id INTEGER,
      profesional TEXT DEFAULT 'Staff',
      estado TEXT DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `)
}
