import { Database } from 'better-sqlite3'
import { Customer } from './schema'

export class CustomerService {
  constructor(private db: Database) {}

  getPaginated(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit
    const hasSearch = search && search.trim().length > 0
    const searchTerm = hasSearch ? `%${search}%` : null

    let whereClause = ''
    let params: any[] = []

    if (hasSearch) {
      whereClause = ' WHERE nombre LIKE ? OR apellido LIKE ? OR documento = ?'
      params = [searchTerm, searchTerm, search.trim()]
    }

    const data = this.db
      .prepare(`SELECT * FROM customers${whereClause} ORDER BY apellido ASC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as Customer[]

    const countResult = this.db
      .prepare(`SELECT COUNT(*) as count FROM customers${whereClause}`)
      .get(...params) as { count: number }

    return { customers: data, total: countResult.count }
  }

  findByDocument(documento: string): Customer | undefined {
    return this.db.prepare('SELECT * FROM customers WHERE documento = ?').get(documento.trim()) as
      | Customer
      | undefined
  }

  create(data: any): number {
    const stmt = this.db.prepare(
      'INSERT INTO customers (nombre, apellido, documento, telefono, email) VALUES (?, ?, ?, ?, ?)'
    )
    return stmt.run(data.nombre, data.apellido, data.documento, data.telefono, data.email)
      .lastInsertRowid as number
  }

  update(id: number, data: any): void {
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined)
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
