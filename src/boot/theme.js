import { boot } from 'quasar/wrappers'
import { useThemeStore } from 'src/stores/theme-store'

export default boot(() => {
    useThemeStore().hydrate()
})
