import { User, Users, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Cuenta } from './perfil/Cuenta'
import { Usuarios } from './perfil/Usuarios'
import { Permisos } from './perfil/Permisos'
import TabsSection, { TabDef } from '@ui/TabsSection'

export default function Perfil() {
  const { hasPermission } = useAuth()

  // Verificamos permisos para cada pestaña
  const pCuenta = hasPermission('perfil_cuenta')
  const pUsuarios = hasPermission('perfil_usuarios')
  const pPermisos = hasPermission('perfil_permisos')

  // Calcular defaultTab (la primera que tenga acceso)
  let defaultTab = ''
  if (pCuenta) defaultTab = 'cuenta'
  else if (pUsuarios) defaultTab = 'usuarios'
  else if (pPermisos) defaultTab = 'permisos'

  if (!defaultTab) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Acceso restringido a esta sección.
      </div>
    )
  }

  const tabs: TabDef[] = []
  if (pCuenta)
    tabs.push({
      value: 'cuenta',
      label: (
        <>
          <User className="h-4 w-4 mr-2" />
          Mi Cuenta
        </>
      ),
      content: <Cuenta />
    })
  if (pUsuarios)
    tabs.push({
      value: 'usuarios',
      label: (
        <>
          <Users className="h-4 w-4 mr-2" />
          Gestión de Usuarios
        </>
      ),
      content: <Usuarios />
    })
  if (pPermisos)
    tabs.push({
      value: 'permisos',
      label: (
        <>
          <KeyRound className="h-4 w-4 mr-2" />
          Permisos
        </>
      ),
      content: <Permisos />
    })

  const defaultTabComputed = tabs.length ? tabs[0].value : ''

  return (
    <TabsSection
      title="Perfil y Acceso"
      subtitle="Gestiona tu información personal, seguridad y usuarios del sistema."
      tabs={tabs}
      defaultValue={defaultTabComputed}
    />
  )
}
