import { ElectronAPI } from '@electron-toolkit/preload'
import {
  Customer,
  CustomerFormData,
  Service,
  Shift,
  NewShiftData,
  EstadoTurno
} from '../shared/types'

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
        deleteUser: (id: number) => Promise<{ success: boolean }>
      }
      roles: {
        getAll: () => Promise<{ success: boolean; roles: any[] }>
        update: (data: {
          id: number
          label: string
          permissions: string[]
        }) => Promise<{ success: boolean }>
      }
      shift: {
        create: (data: NewShiftData) => Promise<number>
        getByDate: (date: string) => Promise<Shift[]>
        getMonthlyLoad: (params: { year: number; month: number }) => Promise<any[]>
        getInitialData: (params: {
          date: string
          year: number
          month: number
        }) => Promise<{ shifts: Shift[]; monthlyLoad: any[] }>
        getYearlyLoad: (year: number) => Promise<any[]>
        updateStatus: (params: { id: number; estado: EstadoTurno }) => Promise<void>
      }
      services: {
        getPaginated: (params: {
          page: number
          limit: number
          search: string
        }) => Promise<{ services: Service[]; total: number }>
        getAll: () => Promise<Service[]>
        create: (nombre: string) => Promise<any>
        update: (params: { id: number; nombre: string }) => Promise<void>
        toggle: (id: number) => Promise<number>
        delete: (id: number) => Promise<void>
      }
      settings: {
        getAll: () => Promise<Record<string, string>>
        setMany: (settings: Record<string, string>) => Promise<any>
      }
      customers: {
        getPaginated: (params: {
          page: number
          limit: number
          search: string
        }) => Promise<{ customers: Customer[]; total: number }>
        findByDocument: (documento: string) => Promise<Customer | undefined>
        create: (data: CustomerFormData) => Promise<number>
        update: (id: number, data: CustomerFormData) => Promise<void>
        delete: (id: number) => Promise<void>
      }
    }
  }
}
