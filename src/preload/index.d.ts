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
        login: (credentials: any) => Promise<AuthResponse>
        createUser: (userData: UserFormData) => Promise<{ success: boolean; id: number }>
        updateUser: (id: number, data: UserFormData) => Promise<{ success: boolean }>
        changePassword: (
          id: number,
          current: string,
          newPass: string
        ) => Promise<{ success: boolean }>
        getUsers: () => Promise<User[]>
        deleteUser: (id: number) => Promise<{ success: boolean }>
      }
      roles: {
        getAll: () => Promise<{ success: boolean; roles: Role[] }>
        update: (data: Role) => Promise<{ success: boolean }>
      }
      shift: {
        create: (data: NewShiftData) => Promise<number>
        update: (id: number, data: any) => Promise<void>
        getByDate: (date: string) => Promise<Shift[]>
        getMonthlyLoad: (params: { year: number; month: number }) => Promise<any[]>
        getInitialData: (params: {
          date: string
          year: number
          month: number
        }) => Promise<{ shifts: Shift[]; monthlyLoad: any[] }>
        getYearlyLoad: (year: number) => Promise<any[]>
        updateStatus: (params: { id: number; estado: EstadoTurno }) => Promise<void>
        getHistoryByCustomer: (customerId: number) => Promise<Shift[]>
        searchGlobal: (query: string) => Promise<Shift[]>
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
        getAll: () => Promise<AppSettings>
        setMany: (settings: Partial<AppSettings>) => Promise<{ success: boolean }>
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
