import { Palette, Database } from 'lucide-react'
import { useAuth } from '@auth/context/AuthContext'

// Importamos los sub-componentes
import Apariencia from './configuracion/Apariencia'
import Backups from './configuracion/Backups'
import TabsSection, { TabDef } from '@ui/TabsSection'

export default function Configuracion() {
  const { hasPermission } = useAuth()

  // Calculamos qué pestaña mostrar por defecto según permisos
  const canSeeApariencia = hasPermission('config_apariencia')
  const canSeeSistema = hasPermission('config_sistema')

  const tabs: TabDef[] = []
  if (canSeeApariencia)
    tabs.push({
      value: 'apariencia',
      label: (
        <>
          <Palette className="h-4 w-4 mr-2" />
          Apariencia
        </>
      ),
      content: <Apariencia />
    })
  if (canSeeSistema)
    tabs.push({
      value: 'sistema',
      label: (
        <>
          <Database className="h-4 w-4 mr-2" />
          Sistema y Backups
        </>
      ),
      content: <Backups />
    })

  // Lógica para seleccionar la primera pestaña disponible automáticamente
  const defaultTab = tabs.length ? tabs[0].value : ''

  return (
    <TabsSection
      title="Configuración"
      subtitle="Ajustes generales del sistema, copias de seguridad y preferencias."
      tabs={tabs}
      defaultValue={defaultTab}
    />
  )
}
