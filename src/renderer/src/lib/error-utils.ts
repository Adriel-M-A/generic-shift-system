export function parseError(error: any): string {
  if (!error) return 'Error desconocido'
  const msg = error.message || String(error)
  // Limpia el prefijo técnico de Electron
  return msg.replace(/^Error:.*\sError:\s*/, '').replace(/^Error:\s*/, '')
}
