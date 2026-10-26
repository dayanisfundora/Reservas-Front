import { defineStore } from 'pinia'
import { Dark, LocalStorage } from 'quasar'

const STORAGE_KEY = 'reservas-theme-dark'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        dark: false
    }),

    actions: {
        hydrate() {
            const saved = LocalStorage.getItem(STORAGE_KEY)
            this.setDark(saved === true || saved === 'true')
        },

        setDark(value) {
            this.dark = Boolean(value)
            Dark.set(this.dark)
            LocalStorage.set(STORAGE_KEY, this.dark)
            document.documentElement.classList.toggle('app-dark', this.dark)
            document.body.classList.toggle('app-dark', this.dark)
        },

        toggle() {
            this.setDark(!this.dark)
        }
    }
})
