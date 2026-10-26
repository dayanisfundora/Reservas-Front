import { boot } from 'quasar/wrappers'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/QCalendarMonth'
import '@quasar/quasar-ui-qcalendar/QCalendarMonth.css'

export default boot(({ app }) => {
    app.component('QCalendarMonth', QCalendarMonth)
})
