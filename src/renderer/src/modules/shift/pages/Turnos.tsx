import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Calendar as CalendarIcon, LayoutGrid, Maximize } from 'lucide-react'

// Imports Locales
import { useShifts } from '../hooks/useShifts'
import { ShiftHeader } from '../components/ShiftHeader'
import { StatsCards } from '../components/StatsCards'
import { ShiftList } from '../components/ShiftList'

// AQUÍ USAMOS NUESTROS COMPONENTES PERSONALIZADOS
import { MonthView } from '../components/MonthView'
import { YearView } from '../components/YearView'

export function Turnos() {
  const {
    date,
    setDate,
    viewMode,
    setViewMode,
    currentTime,
    shifts,
    stats,
    getDailyLoad,
    formatTime,
    formatDateHeader
  } = useShifts()

  // Guardamos una referencia segura a la fecha (si date es undefined, usamos hoy)
  const safeDate = date || new Date()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 animate-in fade-in duration-500">
      {/* 1. HEADER (Reloj) */}
      <ShiftHeader
        currentTime={currentTime}
        formatTime={formatTime}
        formatDateHeader={formatDateHeader}
      />

      {/* 2. GRID PRINCIPAL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* === COLUMNA IZQUIERDA (60%) === */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0">
          {/* TARJETA DE CALENDARIO */}
          <Card className="flex-1 border-border/50 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pb-2 shrink-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {/* Usamos safeDate para evitar errores si date es undefined */}
                <span>Calendario {safeDate.getFullYear()}</span>
              </CardTitle>

              {/* SELECTOR DE VISTA */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setViewMode('month')}
                >
                  <Maximize className="h-3 w-3" /> Mes
                </Button>
                <Button
                  variant={viewMode === 'year' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setViewMode('year')}
                >
                  <LayoutGrid className="h-3 w-3" /> Año
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 min-h-0 overflow-hidden relative">
              {/* RENDERIZADO CONDICIONAL DE VISTAS */}
              {viewMode === 'month' ? (
                <MonthView
                  date={safeDate} // <--- AQUÍ ESTABA EL ERROR. Usamos safeDate.
                  setDate={setDate}
                  getDailyLoad={getDailyLoad}
                />
              ) : (
                <YearView
                  year={safeDate.getFullYear()}
                  currentDate={date} // YearView parece aceptar undefined, lo dejamos así
                  onSelectDate={setDate}
                />
              )}
            </CardContent>
          </Card>

          {/* TARJETAS DE ESTADO */}
          <StatsCards stats={stats} />
        </div>

        {/* === COLUMNA DERECHA (40%) === */}
        <div className="lg:col-span-5 flex flex-col h-full gap-4 min-h-0">
          <ShiftList date={date} shifts={shifts} formatDateHeader={formatDateHeader} />
        </div>
      </div>
    </div>
  )
}
