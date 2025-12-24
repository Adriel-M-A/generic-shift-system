import { Minus, Plus } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'

interface TimePickerProps {
  value: string // Formato esperado "HH:mm"
  onChange: (value: string) => void
  step?: number // Intervalo de minutos (por defecto 5)
}

export function TimePicker({ value, onChange, step = 5 }: TimePickerProps) {
  // Separamos el string "09:00" en horas y minutos numéricos
  const [hourStr, minuteStr] = value.split(':')
  const hour = parseInt(hourStr || '9')
  const minute = parseInt(minuteStr || '0')

  const pad = (n: number) => n.toString().padStart(2, '0')

  const updateTime = (newHour: number, newMinute: number) => {
    onChange(`${pad(newHour)}:${pad(newMinute)}`)
  }

  // Lógica de ajuste de HORA (Ciclo 0-23)
  const adjustHour = (amount: number) => {
    let newVal = hour + amount
    if (newVal > 23) newVal = 0
    if (newVal < 0) newVal = 23
    updateTime(newVal, minute)
  }

  // Lógica de ajuste de MINUTOS (Ciclo 0-55 con pasos)
  const adjustMinute = (amount: number) => {
    let newVal = minute + amount * step
    if (newVal >= 60) newVal = 0
    if (newVal < 0) newVal = 60 - step // Ej: si step es 5, vuelve a 55
    updateTime(hour, newVal)
  }

  // Manejo manual de input
  const handleInputChange = (type: 'hour' | 'minute', e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (isNaN(val)) return // Ignoramos si borra todo

    if (type === 'hour') {
      if (val > 23) val = 23
      if (val < 0) val = 0
      updateTime(val, minute)
    } else {
      if (val > 59) val = 59
      if (val < 0) val = 0
      updateTime(hour, val)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* HORA */}
      <div className="flex items-center flex-1 gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-9 shrink-0"
          onClick={() => adjustHour(-1)}
          tabIndex={-1}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="number"
            value={pad(hour)}
            onChange={(e) => handleInputChange('hour', e)}
            className="text-center font-mono text-lg h-10 px-2"
            placeholder="HH"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background pl-1">
            hs
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-9 shrink-0"
          onClick={() => adjustHour(1)}
          tabIndex={-1}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <span className="text-xl font-bold text-muted-foreground/30 pb-1">:</span>

      {/* MINUTOS */}
      <div className="flex items-center flex-1 gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-9 shrink-0"
          onClick={() => adjustMinute(-1)}
          tabIndex={-1}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="number"
            value={pad(minute)}
            onChange={(e) => handleInputChange('minute', e)}
            className="text-center font-mono text-lg h-10 px-2"
            placeholder="MM"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background pl-1">
            min
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-9 shrink-0"
          onClick={() => adjustMinute(1)}
          tabIndex={-1}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
