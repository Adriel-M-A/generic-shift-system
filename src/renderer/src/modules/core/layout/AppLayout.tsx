import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@ui/sheet'
import { Button } from '@ui/button'
import { Menu, NotebookPen } from 'lucide-react'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    // Usamos h-full para que ocupe el 100% del espacio que le da App.tsx
    <div className="flex h-full w-full overflow-hidden text-foreground">
      {/* --- MODO 1: DESKTOP (> 1024px) --- */}
      <Sidebar className="hidden lg:flex" collapsed={false} />

      {/* --- MODO 2: TABLET (768px - 1024px) --- */}
      <Sidebar className="hidden md:flex lg:hidden" collapsed={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* --- MODO 3: MÓVIL (< 768px) --- */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-sidebar text-sidebar-foreground shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg">
            <NotebookPen className="h-5 w-5" />
            <span>Control</span>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 flex items-center justify-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-70 border-r-0 [&>button]:hidden">
              <SheetTitle className="sr-only">Menú Principal</SheetTitle>
              <Sidebar
                className="w-full h-full border-none"
                onMobileClick={() => setIsMobileMenuOpen(false)}
                collapsed={false}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* CONTENIDO PRINCIPAL: Ocupa el resto del espacio disponible */}
        <div className="flex-1 overflow-y-auto relative bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
