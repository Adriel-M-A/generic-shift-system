import { db } from '../../core/database'

export interface Shift {
  id: number
  fecha: string
  hora: string
  cliente: string
  servicio: string
  estado: string
  customer_id?: number | null
  created_at?: string
}

export interface NewShiftData {
  fecha: string
  hora: string
  cliente: string
  servicio: string
  customerId?: number
}

export function initShiftSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      cliente TEXT NOT NULL,
      servicio TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      customer_id INTEGER,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `)
}
