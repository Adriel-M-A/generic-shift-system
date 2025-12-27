/* eslint-disable @typescript-eslint/no-var-requires */
const Database = require('better-sqlite3')
const path = require('path')

// 1. Conexión a la base de datos
// Asumimos que app.db está en la raíz (modo desarrollo)
const dbPath = path.join(process.cwd(), 'app.db')
console.log(`📂 Conectando a la base de datos en: ${dbPath}`)

const db = new Database(dbPath)

// Configuración de la semilla
const CONFIG = {
  SERVICES_COUNT: 7,
  CUSTOMERS_COUNT: 10,
  SHIFTS_COUNT: 2000,
  START_DATE: new Date('2024-01-01'),
  END_DATE: new Date('2025-12-31')
}

// Datos base para generación aleatoria
const SERVICE_NAMES = [
  'Corte Clásico',
  'Corte con Navaja',
  'Barba y Perfilado',
  'Coloración',
  'Alisado Permanente',
  'Peinado Evento',
  'Tratamiento Capilar'
]

const NAMES = [
  'Juan',
  'Pedro',
  'Maria',
  'Ana',
  'Luis',
  'Carlos',
  'Sofia',
  'Lucia',
  'Miguel',
  'Elena'
]
const SURNAMES = [
  'Gomez',
  'Perez',
  'Rodriguez',
  'Lopez',
  'Garcia',
  'Martinez',
  'Fernandez',
  'Gonzalez',
  'Diaz',
  'Sanchez'
]

// --- FUNCIONES AUXILIARES ---

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomArrayElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Formato YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

// Formato HH:mm (Solo horas laborales aprox 09:00 a 20:00)
function getRandomTime() {
  const hour = getRandomInt(9, 20).toString().padStart(2, '0')
  const minute = getRandomArrayElement(['00', '15', '30', '45'])
  return `${hour}:${minute}`
}

// --- EJECUCIÓN PRINCIPAL ---

const runSeed = () => {
  try {
    console.log('🌱 Iniciando proceso de Seed...')

    // 1. INSERTAR SERVICIOS
    console.log(`✂️  Insertando ${CONFIG.SERVICES_COUNT} servicios...`)
    const insertService = db.prepare(`
      INSERT OR IGNORE INTO servicios (nombre, activo) VALUES (?, 1)
    `)

    // Usamos transaction para mayor velocidad
    const insertServicesTx = db.transaction((services) => {
      for (const serviceName of services) {
        insertService.run(serviceName)
      }
    })
    insertServicesTx(SERVICE_NAMES.slice(0, CONFIG.SERVICES_COUNT))

    // Recuperamos los servicios para usarlos en los turnos
    const servicesInDb = db.prepare('SELECT nombre FROM servicios').all()

    // 2. INSERTAR CLIENTES
    console.log(`busts_in_silhouette: Insertando ${CONFIG.CUSTOMERS_COUNT} clientes...`)
    const insertCustomer = db.prepare(`
      INSERT OR IGNORE INTO customers (documento, nombre, apellido, telefono, email)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertCustomersTx = db.transaction(() => {
      for (let i = 0; i < CONFIG.CUSTOMERS_COUNT; i++) {
        const nombre = getRandomArrayElement(NAMES)
        const apellido = getRandomArrayElement(SURNAMES)
        // Documento aleatorio único basado en iteración para evitar colisiones simples
        const documento = (10000000 + i + getRandomInt(1, 9999)).toString()
        const telefono = `11${getRandomInt(10000000, 99999999)}`
        const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@test.com`

        insertCustomer.run(documento, nombre, apellido, telefono, email)
      }
    })
    insertCustomersTx()

    // Recuperamos clientes para los turnos (necesitamos ID y Nombre completo)
    const customersInDb = db.prepare('SELECT id, nombre, apellido FROM customers').all()

    if (customersInDb.length === 0 || servicesInDb.length === 0) {
      throw new Error('No se pudieron crear clientes o servicios. Abortando creación de turnos.')
    }

    // 3. INSERTAR TURNOS
    console.log(`📅 Insertando ${CONFIG.SHIFTS_COUNT} turnos (entre 2024 y 2025)...`)

    const insertShift = db.prepare(`
      INSERT INTO turnos (cliente, fecha, hora, servicio, customer_id, profesional, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const insertShiftsTx = db.transaction(() => {
      for (let i = 0; i < CONFIG.SHIFTS_COUNT; i++) {
        const customer = getRandomArrayElement(customersInDb)
        const service = getRandomArrayElement(servicesInDb)
        const date = getRandomDate(CONFIG.START_DATE, CONFIG.END_DATE)
        const dateStr = formatDate(date)
        const timeStr = getRandomTime()

        // Lógica de estado: Si la fecha es anterior a hoy, "finalizado" o "cancelado". Si es futuro, "pendiente".
        const now = new Date()
        let estado = 'pendiente'

        if (date < now) {
          // 90% probabilidad de completado en el pasado
          estado = Math.random() > 0.1 ? 'finalizado' : 'cancelado'
        } else {
          estado = 'pendiente'
        }

        const clienteNombreCompleto = `${customer.nombre} ${customer.apellido}`

        insertShift.run(
          clienteNombreCompleto, // cliente (texto)
          dateStr, // fecha
          timeStr, // hora
          service.nombre, // servicio
          customer.id, // customer_id
          'Staff', // profesional (default)
          estado // estado
        )
      }
    })
    insertShiftsTx()

    console.log('✅ Seed completado con éxito.')
    console.log('-----------------------------------')
    console.log(`Total Servicios: ${servicesInDb.length}`)
    console.log(`Total Clientes: ${customersInDb.length}`)
    console.log(`Total Turnos creados: ${CONFIG.SHIFTS_COUNT}`)
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error)
  } finally {
    db.close()
  }
}

runSeed()
