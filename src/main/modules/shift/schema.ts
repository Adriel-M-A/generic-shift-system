export const createShiftTable = `
  CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    cliente TEXT NOT NULL,
    servicio TEXT NOT NULL,
    profesional TEXT DEFAULT 'Staff',
    estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`
