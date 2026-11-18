import { boot } from 'quasar/wrappers'
import { useBrandStore } from 'src/stores/brand-store'

export default boot(({ store }) => {
    const brand = useBrandStore(store)
    brand.apply()
    brand.load()
})
