import { db } from '../../core/database'

export function initSettingsSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // Insertar configuración por defecto
  const count = db.prepare('SELECT count(*) as c FROM settings').get() as any
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')

    // Operativos
    insert.run('shift_opening', '08:00')
    insert.run('shift_closing', '20:00')
    insert.run('shift_interval', '5')

    // Visuales
    insert.run('calendar_start_day', 'monday')
    insert.run('threshold_low', '5')
    insert.run('threshold_medium', '10')
  }
}
