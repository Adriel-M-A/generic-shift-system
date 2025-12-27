import { db } from '../../core/database'

export function initSettingsSchema() {
  // 1. Crear tabla
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // 2. Insertar configuración por defecto (Solo si está vacía)
  const count = db.prepare('SELECT count(*) as c FROM settings').get() as any

  if (count.c === 0) {
    console.log('⚙️ Insertando configuración por defecto...')
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')

    const defaults = [
      // Operativos
      ['shift_opening', '08:00'],
      ['shift_closing', '20:00'],
      ['shift_interval', '30'],

      // Visuales
      ['calendar_start_day', 'monday'],
      ['threshold_low', '5'],
      ['threshold_medium', '10'],

      // Historial
      ['show_finished_shifts', 'false']
    ]

    const transaction = db.transaction((items) => {
      for (const [key, value] of items) insert.run(key, value)
    })

    transaction(defaults)
  }
}
