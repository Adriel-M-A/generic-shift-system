import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function Apariencia() {
  const { setTheme, theme } = useTheme()

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle>Personalización</CardTitle>
        <CardDescription>Selecciona el tema visual de la interfaz.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 flex gap-4">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
          className="flex-1 gap-2"
        >
          <Sun className="h-4 w-4" /> Claro
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
          className="flex-1 gap-2"
        >
          <Moon className="h-4 w-4" /> Oscuro
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          onClick={() => setTheme('system')}
          className="flex-1 gap-2"
        >
          <Monitor className="h-4 w-4" /> Sistema
        </Button>
      </CardContent>
    </Card>
  )
}
