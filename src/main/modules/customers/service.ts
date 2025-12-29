import { Database } from 'better-sqlite3'
import { Customer } from './schema'

export class CustomerService {
  constructor(private db: Database) {}

  getAll(): Customer[] {
    return this.db.prepare('SELECT * FROM customers ORDER BY apellido ASC').all() as Customer[]
  }

  search(query: string): Customer[] {
    const searchTerm = `%${query}%`
    return this.db
      .prepare(
        `SELECT * FROM customers 
         WHERE nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? 
         LIMIT 50`
      )
      .all(searchTerm, searchTerm, searchTerm) as Customer[]
  }

  getById(id: number): Customer {
    return this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer
  }

  create(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = this.db.prepare(
      'INSERT INTO customers (nombre, apellido, documento, telefono, email) VALUES (?, ?, ?, ?, ?)'
    )
    const result = stmt.run(data.nombre, data.apellido, data.documento, data.telefono, data.email)
    return result.lastInsertRowid as number
  }

  update(id: number, data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): void {
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined)
    if (entries.length === 0) return

    const fields = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = entries.map(([_, v]) => v)

    this.db
      .prepare(
        `UPDATE customers SET ${fields}, updated_at = datetime('now', 'localtime') WHERE id = ?`
      )
      .run(...values, id)
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM customers WHERE id = ?').run(id)
  }
}
