import {
  Settings,
  User,
  Palette,
  Monitor,
  Shield,
  Users,
  KeyRound,
  CalendarClock,
  Tags
} from 'lucide-react'

// IMPORTAMOS DESDE SHARED
import { PERMISSIONS } from '../../../shared/permissions'

// Re-exportamos para facilitar el uso en componentes
export { PERMISSIONS }

export const APP_NAVIGATION = [
  // --- TURNOS (SHIFT) ---
  {
    id: PERMISSIONS.SHIFT,
    label: 'Turnos',
    path: '/turnos',
    icon: CalendarClock,
    type: 'item',
    hiddenInSidebar: false
  },
  // --- SERVICIOS (SERVICES) ---
  {
    id: PERMISSIONS.SERVICES,
    label: 'Servicios',
    path: '/servicios',
    icon: Tags,
    type: 'item',
    hiddenInSidebar: false
  },
  // --- CLIENTES (CUSTOMERS) ---
  {
    id: PERMISSIONS.CUSTOMERS,
    label: 'Clientes',
    path: '/clientes',
    icon: Users,
    type: 'item',
    hiddenInSidebar: false
  },
  // --- PERFIL ---
  {
    id: PERMISSIONS.PERFIL.ROOT,
    label: 'Perfil y Acceso',
    path: '/perfil',
    icon: User,
    type: 'section',
    hiddenInSidebar: true,
    children: [
      { id: PERMISSIONS.PERFIL.CUENTA, label: 'Mi Cuenta', icon: User },
      { id: PERMISSIONS.PERFIL.SEGURIDAD, label: 'Seguridad', icon: KeyRound },
      { id: PERMISSIONS.PERFIL.USUARIOS, label: 'Gestión de Usuarios', icon: Users },
      { id: PERMISSIONS.PERFIL.PERMISOS, label: 'Matriz de Permisos', icon: Shield }
    ]
  },
  // --- CONFIGURACIÓN ---
  {
    id: PERMISSIONS.CONFIG.ROOT,
    label: 'Configuración',
    path: '/configuracion',
    icon: Settings,
    type: 'section',
    hiddenInSidebar: false,
    children: [
      { id: PERMISSIONS.CONFIG.APARIENCIA, label: 'Apariencia', icon: Palette },
      { id: PERMISSIONS.CONFIG.SISTEMA, label: 'Sistema', icon: Monitor }
    ]
  }
]
