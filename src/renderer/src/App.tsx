import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@ui/sonner'
import { FLAGS } from '@config/flags'
import { Loader2 } from 'lucide-react'

import TitleBar from '@core/layout/TitleBar'
import AppLayout from '@core/layout/AppLayout'
import Configuracion from '@core/pages/Configuracion'

import { AuthProvider, useAuth } from '@auth/context/AuthContext'
import Login from '@auth/pages/Login'
import Perfil from '@auth/pages/Perfil'

import { UIProvider, useUI } from '@core/context/UIContext'

const BlockOverlay = () => {
  const { isBlocked, blockMessage } = useUI()

  if (!isBlocked) return null

  return (
    <div className="fixed inset-0 z-9999 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-8 bg-card border rounded-lg shadow-xl max-w-sm text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="text-xl font-bold">{blockMessage}</h3>
        <p className="text-sm text-muted-foreground">
          Por favor, no cierres la aplicación ni desconectes el equipo.
        </p>
      </div>
    </div>
  )
}

const RootRoutes = () => {
  const { user } = useAuth()

  return (
    <div className="flex h-screen flex-col overflow-hidden relative">
      <BlockOverlay />
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<div className="p-10 text-2xl font-bold">Panel de Inicio</div>}
              />
              <Route path="/configuracion" element={<Configuracion />} />
              {FLAGS.ENABLE_AUTH && <Route path="/perfil" element={<Perfil />} />}
              <Route
                path="*"
                element={<div className="p-10 text-red-500">Página no encontrada</div>}
              />
            </Route>
          </Routes>
        )}
      </div>
    </div>
  )
}

function App(): React.ReactElement {
  return (
    <UIProvider>
      <AuthProvider>
        <HashRouter>
          <RootRoutes />
        </HashRouter>
        <Toaster position="bottom-center" />
      </AuthProvider>
    </UIProvider>
  )
}

export default App
