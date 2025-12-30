const Database = require('better-sqlite3')
const path = require('path')

// Conexión a la base de datos en la raíz
const db = new Database(path.resolve(__dirname, 'app.db'))

// Configuraciones base
db.pragma('foreign_keys = OFF')

const ESTADOS = ['pendiente', 'completado', 'cancelado', 'ausente']
const SERVICIOS_BASE = [
  'Corte de Cabello',
  'Barba',
  'Coloración',
  'Tratamiento Capilar',
  'Peinado',
  'Manicura',
  'Pedicura',
  'Limpieza Facial',
  'Masaje Relajante',
  'Depilación',
  'Perfilado de Cejas',
  'Afeitado Clásico',
  'Exfoliación',
  'Nutrición',
  'Alisado',
  'Permanente',
  'Corte Niño',
  'Lavado Premium',
  'Diseño de Barba',
  'Combo Completo'
]

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate() {
  const start = new Date(2024, 0, 1).getTime()
  const end = new Date(2026, 11, 31).getTime()
  const randomDate = new Date(start + Math.random() * (end - start))
  const yyyy = randomDate.getFullYear()
  const mm = String(randomDate.getMonth() + 1).padStart(2, '0')
  const dd = String(randomDate.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getRandomTime() {
  const h = String(getRandomInt(8, 20)).padStart(2, '0')
  const m = ['00', '15', '30', '45'][getRandomInt(0, 3)]
  return `${h}:${m}`
}

const runSeed = () => {
  console.log('🚀 Iniciando limpieza y carga de datos...')

  try {
    // 1. Borrar tablas existentes con los nombres correctos del backend
    db.exec(`
      DROP TABLE IF EXISTS shifts;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS servicios;
    `)

    // 2. Recrear tablas con la estructura EXACTA de tus archivos schema.ts
    // Tabla Servicios
    db.exec(`
      CREATE TABLE servicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT (datetime('now', 'localtime'))
      );
    `)

    // Tabla Customers
    db.exec(`
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
      );
    `)

    // Tabla Shifts
    db.exec(`
      CREATE TABLE shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        cliente TEXT NOT NULL,
        servicio TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente',
        customer_id INTEGER,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `)

    console.log('✅ Tablas recreadas (servicios, customers, shifts).')

    // Proceso de inserción masiva
    const loadData = db.transaction(() => {
      // 3. Insertar servicios
      const insertService = db.prepare('INSERT INTO servicios (nombre, activo) VALUES (?, ?)')
      for (const nombre of SERVICIOS_BASE) {
        insertService.run(nombre, 1)
      }
      console.log('✅ 20 servicios creados.')

      // 4. Insertar 200 clientes en 'customers'
      const insertCustomer = db.prepare(`
        INSERT INTO customers (documento, nombre, apellido, telefono, email) 
        VALUES (?, ?, ?, ?, ?)
      `)
      for (let i = 1; i <= 200; i++) {
        insertCustomer.run(
          `DOC-${1000 + i}`,
          `Nombre-${i}`,
          `Apellido-${i}`,
          `11${getRandomInt(10000000, 99999999)}`,
          `cliente${i}@test.com`
        )
      }
      console.log('✅ 200 clientes creados.')

      // 5. Insertar 10,000 turnos en 'shifts'
      const insertShift = db.prepare(`
        INSERT INTO shifts (fecha, hora, cliente, servicio, estado, customer_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (let i = 0; i < 10000; i++) {
        const customerId = getRandomInt(1, 200)
        const numServicios = getRandomInt(1, 3)
        const serviciosElegidos = []
        for (let j = 0; j < numServicios; j++) {
          serviciosElegidos.push(SERVICIOS_BASE[getRandomInt(0, 19)])
        }

        insertShift.run(
          getRandomDate(),
          getRandomTime(),
          `Apellido-${customerId} Nombre-${customerId}`,
          serviciosElegidos.join(', '),
          ESTADOS[getRandomInt(0, 3)],
          customerId
        )
      }
      console.log('✅ 10,000 turnos creados.')
    })

    loadData()

    // Verificación de conteos usando los nombres de tabla correctos
    const counts = {
      clientes: db.prepare('SELECT COUNT(*) as c FROM customers').get().c,
      servicios: db.prepare('SELECT COUNT(*) as c FROM servicios').get().c,
      turnos: db.prepare('SELECT COUNT(*) as c FROM shifts').get().c
    }

    console.log('\n📊 Resumen de la carga:')
    console.log(`- Clientes (customers): ${counts.clientes}`)
    console.log(`- Servicios (servicios): ${counts.servicios}`)
    console.log(`- Turnos (shifts): ${counts.turnos}`)
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
  } finally {
    db.pragma('foreign_keys = ON')
    db.close()
    process.exit(0)
  }
}

runSeed()
