import { db } from '../../core/database'

export interface ShiftDB {
  id: number
  fecha: string
  hora: string
  cliente: string
  servicio: string
  profesional: string
  estado: string
}

export class ShiftService {
  create(data: Omit<ShiftDB, 'id' | 'estado' | 'profesional'>) {
    const stmt = db.prepare(`
      INSERT INTO turnos (fecha, hora, cliente, servicio, profesional, estado)
      VALUES (@fecha, @hora, @cliente, @servicio, 'Staff', 'pendiente')
    `)
    return stmt.run(data)
  }

  getByDate(fecha: string) {
    const stmt = db.prepare(`
      SELECT * FROM turnos 
      WHERE fecha = ? 
      ORDER BY hora ASC
    `)
    return stmt.all(fecha) as ShiftDB[]
  }

  getByMonth(year: number, month: number) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`
    const stmt = db.prepare(`
      SELECT fecha, count(*) as count 
      FROM turnos 
      WHERE fecha LIKE ? AND estado != 'cancelado'
      GROUP BY fecha
    `)
    return stmt.all(`${monthStr}-%`)
  }

  updateStatus(id: number, estado: string) {
    const stmt = db.prepare(`UPDATE turnos SET estado = ? WHERE id = ?`)
    return stmt.run(estado, id)
  }
}

export const shiftService = new ShiftService()
