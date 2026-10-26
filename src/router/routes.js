const authRoute = (path, name, component, meta = {}) => ({
  path,
  component: () => import('layouts/AuthLayout.vue'),
  children: [{ path: '', name, component, meta }],
})

const routes = [
  authRoute('/login', 'Login', () => import('pages/auth/LoginPage.vue'), { requiresGuest: true }),
  authRoute('/reset-password', 'ResetPassword', () => import('pages/auth/ResetPasswordPage.vue'), { requiresGuest: true }),
  authRoute('/seleccionar-empresa', 'SelectEmpresa', () => import('pages/auth/SelectEmpresaPage.vue'), { requiresAuth: true, requiresEmpresaSelection: true, skipEmpresaRequired: true }),
  authRoute('/unauthorized', 'Unauthorized', () => import('pages/auth/UnauthorizedPage.vue')),
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'CalendarioReservas' } },
      { path: 'reservas', name: 'Reservas', component: () => import('pages/reservas/ReservasPage.vue'), meta: { requiresAuth: true, permissions: ['ver_reservas'] } },
      { path: 'calendario', name: 'CalendarioReservas', component: () => import('pages/reservas/CalendarioReservasPage.vue'), meta: { requiresAuth: true, permissions: ['ver_reservas'], compactDrawer: true } },
      { path: 'habitaciones', name: 'GestionHabitaciones', component: () => import('pages/admin/GestionHabitacionesPage.vue'), meta: { requiresAuth: true, permissions: ['gestionar_habitaciones'] } },
      { path: 'casas', name: 'GestionCasas', component: () => import('pages/admin/GestionCasasPage.vue'), meta: { requiresAuth: true, permissions: ['gestionar_casas'] } },
      { path: 'perfil', name: 'EditarPerfil', component: () => import('pages/auth/EditarPerfilPage.vue'), meta: { requiresAuth: true } },
      { path: 'usuarios', name: 'GestionUsuarios', component: () => import('pages/admin/GestionUsuariosPage.vue'), meta: { requiresAuth: true, permissions: ['ver_usuarios'] } },
    ],
  },
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
