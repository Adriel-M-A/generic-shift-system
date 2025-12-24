import { ElectronAPI } from '@electron-toolkit/preload'

interface WindowAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  setLoginSize: () => void
  setAppSize: () => void
}

interface AuthAPI {
  login: (credentials: any) => Promise<any>
  createUser: (userData: any) => Promise<any>
  updateUser: (id: number, data: any) => Promise<any>
  changePassword: (id: number, current: string, newPass: string) => Promise<any>
  getUsers: () => Promise<{ success: boolean; users: any[] }>
  deleteUser: (id: number) => Promise<{ success: boolean; message?: string }>
}

interface RolesAPI {
  getAll: () => Promise<{ success: boolean; roles: any[] }>
  update: (data: {
    id: number
    label: string
    permissions: string[]
  }) => Promise<{ success: boolean; message?: string }>
}

interface ShiftAPI {
  create: (data: { fecha: string; hora: string; cliente: string; servicio: string }) => Promise<any>
  getByDate: (date: string) => Promise<any[]>
  getMonthlyLoad: (params: { year: number; month: number }) => Promise<any[]>
  updateStatus: (params: { id: number; estado: string }) => Promise<any>
}

interface SettingsAPI {
  getAll: () => Promise<Record<string, string>>
  setMany: (settings: Record<string, string>) => Promise<any>
}

interface API {
  window: WindowAPI
  auth: AuthAPI
  roles: RolesAPI
  shift: ShiftAPI
  settings: SettingsAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
