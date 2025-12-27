import { db } from '../../core/database'

export interface CustomerData {
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}

export class CustomerService {
  getAll() {
    return db.prepare('SELECT * FROM customers ORDER BY nombre ASC').all()
  }

  create(data: CustomerData) {
    const stmt = db.prepare(`
      INSERT INTO customers (documento, nombre, apellido, telefono, email)
      VALUES (@documento, @nombre, @apellido, @telefono, @email)
    `)
    return stmt.run(data)
  }

  update(id: string | number, data: CustomerData) {
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

  delete(id: string | number) {
    return db.prepare('DELETE FROM customers WHERE id = ?').run(id)
  }
}

export const customerService = new CustomerService()
