import { db } from '../../core/database'

export function initSettingsSchema() {
  // 1. Crear tabla si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // 2. Insertar configuración por defecto SI la tabla está vacía
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

      // NUEVO: Configuración para ver historial
      ['show_finished_shifts', 'false']
    ]

    const transaction = db.transaction((items) => {
      for (const [key, value] of items) insert.run(key, value)
    })

    transaction(defaults)
  } else {
    // 3. MIGRACIÓN "AL VUELO": (Opcional pero recomendado)
    // Si la tabla ya existía pero no tenía 'show_finished_shifts', lo agregamos.
    const hasSetting = db.prepare("SELECT 1 FROM settings WHERE key = 'show_finished_shifts'").get()
    if (!hasSetting) {
      db.prepare("INSERT INTO settings (key, value) VALUES ('show_finished_shifts', 'false')").run()
    }
  }
}
