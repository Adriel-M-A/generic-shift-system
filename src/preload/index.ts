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
