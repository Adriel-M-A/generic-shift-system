import { Database } from 'better-sqlite3'
import { Shift, NewShiftData } from './schema'

export class ShiftService {
  constructor(private db: Database) {}

  create(data: any): number {
    let customerId = data.customerId

    if (!customerId && data.createCustomer) {
      const stmtCust = this.db.prepare(
        'INSERT INTO customers (nombre, apellido, documento, telefono) VALUES (?, ?, ?, ?)'
      )
      const res = stmtCust.run(
        data.createCustomer.nombre,
        data.createCustomer.apellido,
        data.createCustomer.documento,
        data.createCustomer.telefono
      )
      customerId = res.lastInsertRowid as number
    }

    const serviciosString = Array.isArray(data.servicio) ? data.servicio.join(', ') : data.servicio

    const stmt = this.db.prepare(
      'INSERT INTO shifts (fecha, hora, cliente, servicio, estado, customer_id) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      data.fecha,
      data.hora,
      data.cliente,
      serviciosString,
      'pendiente',
      customerId || null
    )
    return result.lastInsertRowid as number
  }

  update(id: number, data: any): void {
    const serviciosString = Array.isArray(data.servicio) ? data.servicio.join(', ') : data.servicio
    const stmt = this.db.prepare(
      'UPDATE shifts SET fecha = ?, hora = ?, cliente = ?, servicio = ?, customer_id = ? WHERE id = ?'
    )
    stmt.run(data.fecha, data.hora, data.cliente, serviciosString, data.customerId || null, id)
  }

  getByDate(date: string): Shift[] {
    return this.db
      .prepare('SELECT * FROM shifts WHERE fecha = ? ORDER BY hora ASC')
      .all(date) as Shift[]
  }

  getMonthlyLoad(params: { year: number; month: number }): any[] {
    const monthStr = String(params.month).padStart(2, '0')
    const pattern = `${params.year}-${monthStr}-%`
    return this.db
      .prepare(
        "SELECT fecha, COUNT(*) as count FROM shifts WHERE fecha LIKE ? AND estado != 'cancelado' GROUP BY fecha"
      )
      .all(pattern)
  }

  getInitialData(params: { date: string; year: number; month: number }) {
    return {
      shifts: this.getByDate(params.date),
      monthlyLoad: this.getMonthlyLoad({ year: params.year, month: params.month })
    }
  }

  getYearlyLoad(year: number): any[] {
    const pattern = `${year}-%`
    return this.db
      .prepare(
        "SELECT fecha, COUNT(*) as count FROM shifts WHERE fecha LIKE ? AND estado != 'cancelado' GROUP BY fecha"
      )
      .all(pattern)
  }

  updateStatus(id: number, estado: string): void {
    this.db.prepare('UPDATE shifts SET estado = ? WHERE id = ?').run(estado, id)
  }

  getHistoryByCustomer(customerId: number): Shift[] {
    return this.db
      .prepare('SELECT * FROM shifts WHERE customer_id = ? ORDER BY fecha DESC, hora DESC')
      .all(customerId) as Shift[]
  }

  searchGlobal(query: string): Shift[] {
    const searchTerm = `%${query}%`
    return this.db
      .prepare(
        `
        SELECT s.* FROM shifts s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.cliente LIKE ? 
           OR c.nombre LIKE ? 
           OR c.apellido LIKE ? 
           OR c.documento LIKE ?
        ORDER BY s.fecha DESC, s.hora DESC
        LIMIT 50
      `
      )
      .all(searchTerm, searchTerm, searchTerm, searchTerm) as Shift[]
  }
}
