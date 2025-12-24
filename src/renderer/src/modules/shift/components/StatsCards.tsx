import { Card } from '@ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { ShiftStats } from '../types'

export function StatsCards({ stats }: { stats: ShiftStats }) {
  return (
    <div className="h-32 grid grid-cols-3 gap-4 shrink-0">
      <Card className="border-border/50 shadow-sm flex flex-col justify-center items-center bg-primary/5 border-primary/20">
        <span className="text-4xl font-bold text-primary">{stats.total}</span>
        <span className="text-sm text-primary/80 font-medium mt-1">Total Turnos</span>
      </Card>
      <Card className="border-border/50 shadow-sm flex flex-col justify-center items-center">
        <span className="text-4xl font-bold text-orange-500">{stats.pendientes}</span>
        <span className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Pendientes
        </span>
      </Card>
      <Card className="border-border/50 shadow-sm flex flex-col justify-center items-center">
        <span className="text-4xl font-bold text-green-600">{stats.completados}</span>
        <span className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Completados
        </span>
      </Card>
    </div>
  )
}
