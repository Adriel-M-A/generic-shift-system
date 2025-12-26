import { db } from '../../core/database'

export interface CustomerData {
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}

export class CustomerService {
  static getAll() {
    return db.prepare('SELECT * FROM customers ORDER BY nombre ASC').all()
  }

  static create(data: CustomerData) {
    const stmt = db.prepare(`
      INSERT INTO customers (documento, nombre, apellido, telefono, email)
      VALUES (@documento, @nombre, @apellido, @telefono, @email)
    `)
    return stmt.run(data)
  }

  static update(id: number | string, data: CustomerData) {
    const stmt = db.prepare(`
      UPDATE customers
      SET documento = @documento,
          nombre = @nombre,
          apellido = @apellido,
          telefono = @telefono,
          email = @email,
          updated_at = datetime('now', 'localtime')
      WHERE id = @id
    `)
    return stmt.run({ ...data, id })
  }

  static delete(id: number | string) {
    return db.prepare('DELETE FROM customers WHERE id = ?').run(id)
  }
}
