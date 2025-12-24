import { useEffect, useState } from 'react'
import { Card, CardContent } from '@ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table'
import { Input } from '@ui/input'
import { Checkbox } from '@ui/checkbox'
import { Button } from '@ui/button'
import { toast } from 'sonner'
import { Shield, Save, RefreshCw, FileText } from 'lucide-react'
import { APP_NAVIGATION } from '@config/navigation'

interface Role {
  id: number
  label: string
  permissions: string[]
}

export function Permisos() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    const result = await window.api.roles.getAll()
    if (result.success) {
      setRoles(result.roles)
    }
    setLoading(false)
  }

  const handleNameChange = (roleId: number, newName: string) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, label: newName } : r)))
  }

  const handlePermissionToggle = (roleId: number, permissionId: string) => {
    if (roleId === 1) return

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r

        const hasPerm = r.permissions.includes(permissionId)
        let newPerms = [...r.permissions]

        const section = APP_NAVIGATION.find((s) => s.id === permissionId)
        const parentSection = APP_NAVIGATION.find((s) =>
          s.children?.some((c) => c.id === permissionId)
        )

        const isSection = !!section
        const isTab = !!parentSection

        if (hasPerm) {
          newPerms = newPerms.filter((p) => p !== permissionId)

          if (isSection && section?.children) {
            const childrenIds = section.children.map((c) => c.id)
            newPerms = newPerms.filter((p) => !childrenIds.includes(p))
          }

          if (isTab && parentSection) {
            const siblings = parentSection.children?.map((c) => c.id) || []
            const anySiblingActive = siblings.some((s) => newPerms.includes(s))

            if (!anySiblingActive) {
              newPerms = newPerms.filter((p) => p !== parentSection.id)
            }
          }
        } else {
          newPerms.push(permissionId)

          if (isSection && section?.children) {
            section.children.forEach((child) => {
              if (!newPerms.includes(child.id)) {
                newPerms.push(child.id)
              }
            })
          }

          if (isTab && parentSection) {
            if (!newPerms.includes(parentSection.id)) {
              newPerms.push(parentSection.id)
            }
          }
        }
        return { ...r, permissions: newPerms }
      })
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = roles.map((role) =>
        window.api.roles.update({
          id: role.id,
          label: role.label,
          permissions: role.permissions
        })
      )

      await Promise.all(promises)
      toast.success('Matriz de permisos actualizada')
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const renderPermissionRow = (item: any, isChild = false) => {
    const Icon = item.icon || FileText

    return (
      <TableRow
        key={item.id}
        className={
          isChild ? 'hover:bg-muted/30 border-0' : 'bg-muted/30 hover:bg-muted/50 border-t'
        }
      >
        <TableCell className="py-3">
          <div className={`flex items-center gap-2 ${isChild ? 'pl-8' : ''}`}>
            {isChild && (
              <div className="h-4 w-4 border-l border-b border-muted-foreground/30 absolute left-4 -mt-4 rounded-bl-sm" />
            )}
            <Icon className={`h-4 w-4 ${isChild ? 'text-muted-foreground' : 'text-primary'}`} />
            <span className={`text-sm ${isChild ? 'font-normal' : 'font-bold'}`}>{item.label}</span>
          </div>
        </TableCell>

        {roles.map((role) => {
          const isAdmin = role.id === 1
          const isChecked = isAdmin || role.permissions.includes(item.id)

          return (
            <TableCell key={`${role.id}-${item.id}`} className="text-center p-0">
              <div className="flex justify-center items-center h-full">
                <Checkbox
                  checked={isChecked}
                  disabled={isAdmin}
                  onCheckedChange={() => handlePermissionToggle(role.id, item.id)}
                  className={isAdmin ? 'opacity-50 data-[state=checked]:bg-primary/50' : ''}
                />
              </div>
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Cargando matriz...</div>

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Control de Accesos
          </h2>
          <p className="text-sm text-muted-foreground">Gestiona permisos por nivel y sección.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="w-87.5 pl-4">Funcionalidad</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-30 py-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                        Nivel {role.id}
                      </span>
                      <Input
                        value={role.label}
                        onChange={(e) => handleNameChange(role.id, e.target.value)}
                        className="h-7 text-center text-xs font-semibold bg-background border-border/60 shadow-none w-28 focus-visible:ring-1"
                        disabled={role.id === 1}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {APP_NAVIGATION.map((section) => (
                <>
                  {renderPermissionRow(section)}
                  {section.children &&
                    section.children.map((tab) => renderPermissionRow(tab, true))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs border border-blue-500/10">
        <Shield className="h-4 w-4" />
        <span>
          <strong>Nota:</strong> Los permisos del Nivel 1 (Administrador) son inmutables para
          garantizar la accesibilidad del sistema.
        </span>
      </div>
    </div>
  )
}
