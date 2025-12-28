import { db } from '../../core/database'

export interface Customer {
  id: number
  documento: string
  nombre: string
  apellido: string
  telefono?: string | null
  email?: string | null
  created_at?: string
  updated_at?: string
}

export function initCustomersSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
  `)
}
