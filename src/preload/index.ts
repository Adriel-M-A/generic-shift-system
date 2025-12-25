import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    setLoginSize: () => ipcRenderer.send('window:set-login-size'),
    setAppSize: () => ipcRenderer.send('window:set-app-size')
  },
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    createUser: (userData) => ipcRenderer.invoke('auth:create-user', userData),
    updateUser: (id, data) => ipcRenderer.invoke('auth:update-user', { id, data }),
    changePassword: (id, currentPassword, newPassword) =>
      ipcRenderer.invoke('auth:change-password', { id, currentPassword, newPassword }),
    getUsers: () => ipcRenderer.invoke('auth:get-users'),
    deleteUser: (id) => ipcRenderer.invoke('auth:delete-user', id)
  },
  roles: {
    getAll: () => ipcRenderer.invoke('roles:get'),
    update: (data) => ipcRenderer.invoke('roles:update', data)
  },
  shift: {
    create: (data) => ipcRenderer.invoke('shift:create', data),
    getByDate: (date) => ipcRenderer.invoke('shift:getByDate', date),
    getMonthlyLoad: (params) => ipcRenderer.invoke('shift:getMonthlyLoad', params),
    updateStatus: (params) => ipcRenderer.invoke('shift:updateStatus', params)
  },
  services: {
    getAll: () => ipcRenderer.invoke('services:get-all'),
    create: (nombre) => ipcRenderer.invoke('services:create', nombre),
    update: (id, nombre) => ipcRenderer.invoke('services:update', { id, nombre }),
    toggle: (id) => ipcRenderer.invoke('services:toggle', id),
    delete: (id) => ipcRenderer.invoke('services:delete', id)
  },
  // ------------------------------
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
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
