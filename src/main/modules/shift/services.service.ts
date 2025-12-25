import { db } from '../../core/database'

export class ServicesService {
  getAll() {
    const stmt = db.prepare('SELECT * FROM servicios ORDER BY nombre ASC')
    return stmt.all()
  }

  getActive() {
    const stmt = db.prepare('SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre ASC')
    return stmt.all()
  }

  create(nombre: string) {
    // Validar duplicados
    const exists = db.prepare('SELECT id FROM servicios WHERE lower(nombre) = lower(?)').get(nombre)
    if (exists) {
      throw new Error('El servicio ya existe.')
    }

    const stmt = db.prepare('INSERT INTO servicios (nombre, activo) VALUES (?, 1)')
    const info = stmt.run(nombre.trim())

    return {
      id: info.lastInsertRowid,
      nombre,
      activo: 1
    }
  }

  update(id: number, nombre: string) {
    const stmt = db.prepare('UPDATE servicios SET nombre = ? WHERE id = ?')
    stmt.run(nombre.trim(), id)
  }

  toggleActive(id: number) {
    const current = db.prepare('SELECT activo FROM servicios WHERE id = ?').get(id) as {
      activo: number
    }
    if (!current) throw new Error('Servicio no encontrado')

    const newStatus = current.activo === 1 ? 0 : 1
    const stmt = db.prepare('UPDATE servicios SET activo = ? WHERE id = ?')
    stmt.run(newStatus, id)

    return newStatus
  }

  delete(id: number) {
    const stmt = db.prepare('DELETE FROM servicios WHERE id = ?')
    stmt.run(id)
  }
}

// Exportamos la instancia única
export const servicesService = new ServicesService()
