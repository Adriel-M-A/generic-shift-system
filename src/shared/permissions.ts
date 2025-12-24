// IDs DE PERMISOS (Compartidos entre Back y Front)
export const PERMISSIONS = {
  SHIFT: 'shift',
  SERVICES: 'services',
  PERFIL: {
    ROOT: 'perfil',
    CUENTA: 'perfil_cuenta',
    SEGURIDAD: 'perfil_seguridad',
    USUARIOS: 'perfil_usuarios',
    PERMISOS: 'perfil_permisos'
  },
  CONFIG: {
    ROOT: 'configuracion',
    APARIENCIA: 'config_apariencia',
    SISTEMA: 'config_sistema'
  }
} as const
