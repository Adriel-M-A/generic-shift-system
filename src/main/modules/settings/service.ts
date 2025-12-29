import { Database } from 'better-sqlite3'

export class SettingsService {
  constructor(private db: Database) {}

  getAll() {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]
    return rows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
  }

  set(key: string, value: string) {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = @value
    `)
    return stmt.run({ key, value })
  }

  setMany(settings: Record<string, string>) {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = @value
    `)
    const transaction = this.db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run({ key, value: String(value) })
      }
    })
    transaction(settings)
    return { success: true }
  }
}
