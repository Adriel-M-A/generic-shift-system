import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    setLoginSize: () => ipcRenderer.send('window:setLoginSize'),
    setAppSize: () => ipcRenderer.send('window:setAppSize')
  },
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    createUser: (userData) => ipcRenderer.invoke('auth:createUser', userData),
    updateUser: (id, data) => ipcRenderer.invoke('auth:updateUser', { id, data }),
    changePassword: (id, currentPassword, newPassword) =>
      ipcRenderer.invoke('auth:changePassword', { id, currentPassword, newPassword }),
    getUsers: () => ipcRenderer.invoke('auth:getUsers'),
    deleteUser: (id) => ipcRenderer.invoke('auth:deleteUser', id)
  },
  roles: {
    getAll: () => ipcRenderer.invoke('roles:getAll'),
    update: (data) => ipcRenderer.invoke('roles:update', data)
  },
  shift: {
    create: (data) => ipcRenderer.invoke('shift:create', data),
    getByDate: (date) => ipcRenderer.invoke('shift:getByDate', date),
    getMonthlyLoad: (params) => ipcRenderer.invoke('shift:getMonthlyLoad', params),
    getInitialData: (params) => ipcRenderer.invoke('shift:getInitialData', params),
    getYearlyLoad: (year) => ipcRenderer.invoke('shift:getYearlyLoad', year),
    updateStatus: (params) => ipcRenderer.invoke('shift:updateStatus', params)
  },
  services: {
    getPaginated: (params: { page: number; limit: number; search: string }) =>
      ipcRenderer.invoke('services:getPaginated', params),
    getAll: () => ipcRenderer.invoke('services:getAll'),
    create: (nombre: string) => ipcRenderer.invoke('services:create', nombre),
    update: (id: number, nombre: string) => ipcRenderer.invoke('services:update', { id, nombre }),
    toggle: (id: number) => ipcRenderer.invoke('services:toggle', id),
    delete: (id: number) => ipcRenderer.invoke('services:delete', id)
  },
  customers: {
    getPaginated: (params: { page: number; limit: number; search: string }) =>
      ipcRenderer.invoke('customers:getPaginated', params),
    create: (data: any) => ipcRenderer.invoke('customers:create', data),
    update: (id: string | number, data: any) => ipcRenderer.invoke('customers:update', id, data),
    delete: (id: string | number) => ipcRenderer.invoke('customers:delete', id)
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    setMany: (settings) => ipcRenderer.invoke('settings:setMany', settings)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
