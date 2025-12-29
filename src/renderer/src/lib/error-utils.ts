export function parseError(error: any): string {
  if (!error) return 'Error desconocido'

  let msg = ''

  if (typeof error === 'string') {
    msg = error
  } else if (error.message) {
    msg = error.message
  } else {
    msg = String(error)
  }

  if (msg.includes('Error:')) {
    const parts = msg.split('Error:')
    msg = parts[parts.length - 1]
  }

  const cleanMsg = msg.trim().replace(/^Error:\s*/, '')

  return cleanMsg || 'Ocurrió un error inesperado'
}
