import { db } from '../../core/database'

export class SettingsService {
  getAll() {
    const rows = db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]
    // Convertimos array [{key: 'a', value: '1'}] a objeto { a: '1' }
    return rows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
  }

  set(key: string, value: string) {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = @value
    `)
    return stmt.run({ key, value })
  }

  // Guardar múltiples settings a la vez
  setMany(settings: Record<string, string>) {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = @value
    `)

    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run({ key, value: String(value) })
      }
    })

    transaction(settings)
    return { success: true }
  }
}

export const settingsService = new SettingsService()
