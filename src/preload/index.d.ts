/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'

// --- Tipos Compartidos ---

interface Customer {
  id: number
  documento: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
}

interface Service {
  id: number
  nombre: string
  activo: number // 1 o 0
}

// --- API Principal ---

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        setLoginSize: () => void
        setAppSize: () => void
      }
      auth: {
        login: (credentials: any) => Promise<any>
        createUser: (userData: any) => Promise<any>
        updateUser: (id: number, data: any) => Promise<any>
        changePassword: (id: number, current: string, newPass: string) => Promise<any>
        getUsers: () => Promise<{ success: boolean; users: any[] }>
        deleteUser: (id: number) => Promise<{ success: boolean; message?: string }>
      }
      roles: {
        getAll: () => Promise<{ success: boolean; roles: any[] }>
        update: (data: {
          id: number
          label: string
          permissions: string[]
        }) => Promise<{ success: boolean; message?: string }>
      }
      shift: {
        create: (data: {
          fecha?: string
          hora: string
          cliente: string
          servicio: string
          customerId?: number
        }) => Promise<any>
        getByDate: (date: string) => Promise<any[]>
        getMonthlyLoad: (params: { year: number; month: number }) => Promise<any[]>
        getYearlyLoad: (year: number) => Promise<any[]>
        updateStatus: (params: { id: number; estado: string }) => Promise<any>
      }
      services: {
        getAll: () => Promise<Service[]>
        create: (nombre: string) => Promise<any>
        update: (id: number, nombre: string) => Promise<void>
        toggle: (id: number) => Promise<number>
        delete: (id: number) => Promise<void>
      }
      settings: {
        getAll: () => Promise<Record<string, string>>
        setMany: (settings: Record<string, string>) => Promise<any>
      }
      customers: {
        getAll: () => Promise<Customer[]>
        create: (data: any) => Promise<boolean>
        update: (id: number | string, data: any) => Promise<boolean>
        delete: (id: number | string) => Promise<void>
      }
    }
  }
}
