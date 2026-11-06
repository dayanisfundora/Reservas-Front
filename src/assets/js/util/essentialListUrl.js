export const essentialListUrl = [
    {
        title: 'Calendario',
        icon: 'calendar_month',
        link: 'CalendarioReservas',
        permission: ['ver_reservas'],
    },
    {
        title: 'Listado de reservas',
        icon: 'event_available',
        link: 'Reservas',
        permission: ['ver_reservas'],
    },
    {
        title: 'Reportes',
        icon: 'assessment',
        link: 'ReportesReservas',
        permission: ['ver_reservas'],
    },
    {
        title: 'CONFIGURACIÓN',
        children: [
            {
                title: 'Gestionar habitaciones',
                icon: 'meeting_room',
                link: 'GestionHabitaciones',
                permission: ['gestionar_habitaciones'],
            },
            {
                title: 'Gestionar casas',
                icon: 'home_work',
                link: 'GestionCasas',
                permission: ['gestionar_casas'],
            },
        ],
    },
    {
        title: 'SEGURIDAD',
        children: [
            {
                title: 'Usuarios y roles',
                icon: 'manage_accounts',
                link: 'GestionUsuarios',
                permission: ['ver_usuarios'],
            },
            {
                title: 'Respaldo de base de datos',
                icon: 'mdi-database-export',
                link: 'BackupBd',
                permission: ['respaldar_bd'],
            },
        ],
    },
]

export default essentialListUrl
