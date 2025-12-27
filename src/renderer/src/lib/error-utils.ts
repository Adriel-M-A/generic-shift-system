export function parseError(error: any): string {
  if (!error) return 'Error desconocido'

  let msg = error.message || String(error)

  if (msg.includes('Error:')) {
    const parts = msg.split('Error:')
    msg = parts[parts.length - 1]
  }

  return msg.trim().replace(/^Error:\s*/, '')
}
