import {
  LayoutDashboard,
  Settings,
  User,
  Palette,
  Monitor,
  Shield,
  Users,
  KeyRound
} from 'lucide-react'
// IMPORTAMOS DESDE SHARED (Ajusta la ruta según tu estructura final)
import { PERMISSIONS } from '../../../shared/permissions'
// Re-exportamos para que los componentes del frontend lo usen fácil
export { PERMISSIONS }

export const APP_NAVIGATION = [
  {
    id: PERMISSIONS.DASHBOARD,
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    type: 'item',
    hiddenInSidebar: false
  },
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
