import { db } from '../../core/database'

export interface ShiftDB {
  id: number
  fecha: string
  hora: string
  cliente: string
  servicio: string
  profesional: string
  estado: string
  customer_id?: number
}

export class ShiftService {
  create(data: {
    fecha: string
    hora: string
    cliente: string
    servicio: string
    customerId?: number
  }) {
    const stmt = db.prepare(`
      INSERT INTO turnos (fecha, hora, cliente, servicio, customer_id, profesional, estado)
      VALUES (@fecha, @hora, @cliente, @servicio, @customerId, 'Staff', 'pendiente')
    `)

    return stmt.run({
      fecha: data.fecha,
      hora: data.hora,
      cliente: data.cliente,
      servicio: data.servicio,
      customerId: data.customerId || null
    })
  }

  getByDate(fecha: string) {
    const stmt = db.prepare(`
      SELECT 
        t.id, 
        t.fecha, 
        t.hora, 
        t.servicio, 
        t.estado,
        t.customer_id,
        COALESCE(c.nombre || ' ' || c.apellido, t.cliente) as cliente,
        c.documento,
        c.telefono, 
        c.email
      FROM turnos t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.fecha = ? 
      ORDER BY t.hora ASC
    `)

    const results = stmt.all(fecha)

    return results.map((row: any) => ({
      id: row.id,
      fecha: row.fecha,
      hora: row.hora,
      cliente: row.cliente,
      servicio: row.servicio,
      estado: row.estado,
      customerId: row.customer_id,
      customerData: row.customer_id
        ? {
            documento: row.documento,
            telefono: row.telefono,
            email: row.email
          }
        : null
    }))
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

  getByYear(year: number) {
    const stmt = db.prepare(`
      SELECT fecha, count(*) as count 
      FROM turnos 
      WHERE fecha LIKE ? AND estado != 'cancelado'
      GROUP BY fecha
    `)
    return stmt.all(`${year}-%`)
  }

  updateStatus(id: number, estado: string) {
    const stmt = db.prepare(`UPDATE turnos SET estado = ? WHERE id = ?`)
    return stmt.run(estado, id)
  }
}

export const shiftService = new ShiftService()
