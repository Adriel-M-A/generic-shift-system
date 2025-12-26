import { db } from '../../core/database'

export class ServicesService {
  getAll() {
    return db.prepare('SELECT * FROM servicios ORDER BY nombre ASC').all()
  }

  create(nombre: string) {
    const stmt = db.prepare('INSERT INTO servicios (nombre) VALUES (?)')
    return stmt.run(nombre)
  }

  update(id: number, nombre: string) {
    const stmt = db.prepare('UPDATE servicios SET nombre = ? WHERE id = ?')
    return stmt.run(nombre, id)
  }

  toggleActive(id: number) {
    const current = db.prepare('SELECT activo FROM servicios WHERE id = ?').get(id) as any
    const newState = current.activo === 1 ? 0 : 1
    db.prepare('UPDATE servicios SET activo = ? WHERE id = ?').run(newState, id)
    return newState
  }

  delete(id: number) {
    return db.prepare('DELETE FROM servicios WHERE id = ?').run(id)
  }
}

export const servicesService = new ServicesService()
