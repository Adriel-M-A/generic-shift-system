import { Minus, Plus } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'

interface TimePickerProps {
  value: string // "HH:mm"
  onChange: (value: string) => void
  step?: number // Minutos (ej: 15, 30)
  minTime?: string // Ej: "08:00"
  maxTime?: string // Ej: "20:00"
}

export function TimePicker({
  value,
  onChange,
  step = 15,
  minTime = '00:00',
  maxTime = '23:59'
}: TimePickerProps) {
  const [hourStr, minuteStr] = value.split(':')
  let hour = parseInt(hourStr || '0')
  let minute = parseInt(minuteStr || '0')

  // Parseamos límites
  const [minH, minM] = minTime.split(':').map(Number)
  const [maxH, maxM] = maxTime.split(':').map(Number)

  const pad = (n: number) => n.toString().padStart(2, '0')

  const updateTime = (newHour: number, newMinute: number) => {
    onChange(`${pad(newHour)}:${pad(newMinute)}`)
  }

  // Ajuste de HORA (Respetando rango Apertura - Cierre)
  const adjustHour = (amount: number) => {
    let newVal = hour + amount

    // Lógica de Loop: Si me paso del cierre, vuelvo a la apertura (y viceversa)
    if (newVal > maxH) newVal = minH
    if (newVal < minH) newVal = maxH

    updateTime(newVal, minute)
  }

  // Ajuste de MINUTOS (Ciclo 0-59 respetando el paso)
  const adjustMinute = (amount: number) => {
    let newVal = minute + amount * step

    if (newVal >= 60) newVal = 0
    if (newVal < 0) newVal = 60 - step

    // Opcional: Si el paso es grande (ej: 60 min), asegurar que no quede en negativo raro
    if (newVal < 0) newVal = 0

    updateTime(hour, newVal)
  }

  // Validación manual al escribir
  const handleInputChange = (type: 'hour' | 'minute', e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (isNaN(val)) return

    if (type === 'hour') {
      // Si escribe una hora fuera de rango, la forzamos al límite más cercano
      if (val > maxH) val = maxH
      if (val < minH) val = minH
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
