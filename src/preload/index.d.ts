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

interface API {
  window: WindowAPI
  auth: AuthAPI
  roles: RolesAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
