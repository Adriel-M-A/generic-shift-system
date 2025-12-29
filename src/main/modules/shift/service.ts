import { Database } from 'better-sqlite3'
import { Shift, NewShiftData } from './schema'

export class ShiftService {
  constructor(private db: Database) {}

  async create(data: NewShiftData): Promise<number> {
    const stmt = this.db.prepare(
      'INSERT INTO shifts (fecha, hora, cliente, servicio, estado, customer_id) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      data.fecha,
      data.hora,
      data.cliente,
      data.servicio,
      'pendiente',
      data.customerId || null
    )
    return result.lastInsertRowid as number
  }

  async getByDate(date: string): Promise<Shift[]> {
    return this.db
      .prepare('SELECT * FROM shifts WHERE fecha = ? ORDER BY hora ASC')
      .all(date) as Shift[]
  }

  async getMonthlyLoad(params: { year: number; month: number }): Promise<any[]> {
    const monthStr = String(params.month).padStart(2, '0')
    const pattern = `${params.year}-${monthStr}-%`
    return this.db
      .prepare(
        "SELECT fecha, COUNT(*) as count FROM shifts WHERE fecha LIKE ? AND estado != 'cancelado' GROUP BY fecha"
      )
      .all(pattern)
  }

  async getInitialData(params: {
    date: string
    year: number
    month: number
  }): Promise<{ shifts: Shift[]; monthlyLoad: any[] }> {
    const shifts = await this.getByDate(params.date)
    const monthlyLoad = await this.getMonthlyLoad({ year: params.year, month: params.month })
    return { shifts, monthlyLoad }
  }

  async getYearlyLoad(year: number): Promise<any[]> {
    const pattern = `${year}-%`
    return this.db
      .prepare(
        "SELECT fecha, COUNT(*) as count FROM shifts WHERE fecha LIKE ? AND estado != 'cancelado' GROUP BY fecha"
      )
      .all(pattern)
  }

  async updateStatus(id: number, estado: string): Promise<void> {
    this.db.prepare('UPDATE shifts SET estado = ? WHERE id = ?').run(estado, id)
  }
}
