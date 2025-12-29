import { Database } from 'better-sqlite3'

export class ServicesService {
  constructor(private db: Database) {}

  getAll() {
    return this.db.prepare('SELECT * FROM servicios ORDER BY nombre ASC').all()
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
