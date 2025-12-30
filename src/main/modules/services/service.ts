import { Database } from 'better-sqlite3'

export interface Service {
  id: number
  nombre: string
  activo: number
}

export class ServicesService {
  constructor(private db: Database) {}

  getPaginated(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit
    const hasSearch = search && search.trim().length > 0
    const searchTerm = hasSearch ? `%${search}%` : null

    let whereClause = ''
    let params: any[] = []

    if (hasSearch) {
      whereClause = ' WHERE nombre LIKE ?'
      params = [searchTerm]
    }

    const data = this.db
      .prepare(`SELECT * FROM servicios${whereClause} ORDER BY nombre ASC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as Service[]

    const countResult = this.db
      .prepare(`SELECT COUNT(*) as count FROM servicios${whereClause}`)
      .get(...params) as { count: number }

    return {
      services: data,
      total: countResult.count
    }
  }

  getAll() {
    return this.db
      .prepare('SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre ASC')
      .all() as Service[]
  }

  create(nombre: string) {
    const stmt = this.db.prepare('INSERT INTO servicios (nombre) VALUES (?)')
    return stmt.run(nombre)
  }

  update(id: number, nombre: string) {
    const stmt = this.db.prepare('UPDATE servicios SET nombre = ? WHERE id = ?')
    return stmt.run(nombre, id)
  }

  toggleActive(id: number) {
    const current = this.db.prepare('SELECT activo FROM servicios WHERE id = ?').get(id) as any
    const newState = current.activo === 1 ? 0 : 1
    this.db.prepare('UPDATE servicios SET activo = ? WHERE id = ?').run(newState, id)
    return newState
  }

  delete(id: number) {
    return this.db.prepare('DELETE FROM servicios WHERE id = ?').run(id)
  }
}
