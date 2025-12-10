import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'Color Canvas',
    version: '0.1.0-beta',
  }),
  getters: {
    getTitle: state => state.title,
    getVersion: state => state.version,
  },
  actions: {
    setTitle(title: string) {
      this.title = title
    },
  },
})
