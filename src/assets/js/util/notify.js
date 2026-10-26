import { Notify } from 'quasar'

Notify.setDefaults({
  position: 'top-right',
  timeout: 3200,
  progress: true,
  multiLine: false,
  group: false,
  classes: 'app-notify',
  actions: []
})

/**
 * @param {Record<string, unknown>} config
 * @param {Record<string, unknown>} [extra]
 */
function createNotify(config, extra = {}) {
  const { actions: _ignoredActions, ...safeExtra } = extra || {}

  Notify.create({
    position: 'top-right',
    timeout: 3200,
    progress: true,
    // false = la X queda en la misma fila que el texto (no debajo)
    multiLine: false,
    group: false,
    ...config,
    ...safeExtra,
    multiLine: false,
    classes: ['app-notify', config.classes, safeExtra.classes]
      .filter(Boolean)
      .join(' '),
    actions: [
      {
        icon: 'close',
        color: 'grey-7',
        dense: true,
        round: true,
        handler: () => {}
      }
    ]
  })
}

export const Success = (message, extra = {}) => {
  createNotify(
    {
      message,
      icon: 'check_circle',
      classes: 'app-notify--success'
    },
    extra
  )
}

export const Info = (message, extra = {}) => {
  createNotify(
    {
      message,
      icon: 'info',
      classes: 'app-notify--info'
    },
    extra
  )
}

export const Verify = (message, extra = {}) => {
  createNotify(
    {
      message,
      icon: 'verified',
      classes: 'app-notify--warning'
    },
    extra
  )
}

export const Warning = (message, extra = {}) => {
  createNotify(
    {
      message,
      icon: 'warning',
      classes: 'app-notify--warning'
    },
    extra
  )
}

export const Error = (message, extra = {}) => {
  createNotify(
    {
      message,
      icon: 'error',
      classes: 'app-notify--error'
    },
    extra
  )
}
