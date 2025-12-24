import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let dbInstance: Database.Database | undefined

// Exportamos la ruta para que otros módulos sepan dónde está el archivo
export const dbPath = app.isPackaged
  ? join(app.getPath('userData'), 'app.db')
  : join(process.cwd(), 'app.db')

export function getDB(): Database.Database {
  if (!dbInstance) {
    // @ts-ignore
    dbInstance = new Database(dbPath)
    dbInstance.pragma('journal_mode = WAL')
  }
  return dbInstance
}

// NUEVA FUNCIÓN: Cierra la conexión (Vital para restaurar backup)
export function closeDB() {
  if (dbInstance && dbInstance.open) {
    dbInstance.close()
    dbInstance = undefined
  }
}

export const db: Database.Database = getDB()
