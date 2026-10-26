// #region NOMENCLATORS
/**************************************************************************************************
*                                     NOMENCLATORS COLUMN DATA                                        *
**************************************************************************************************/
// #region STATES
/*********************************************************************
*                STATES COLUMN DATA                     *
*********************************************************************/

export const dataColumnStates = Object.freeze([
    {
        name: 'code',
        align: 'center',
        label: 'Código',
        field: 'code',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'state',
        align: 'center',
        label: 'Activo',
        field: 'state',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region CURRENCIES
/*********************************************************************
*                CURRENCIES COLUMN DATA                     *
*********************************************************************/
export const dataColumnCurrencies = Object.freeze([
    {
        name: 'code',
        align: 'center',
        label: 'Código',
        field: 'code',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'abbr',
        align: 'center',
        label: 'Abreviatura',
        field: 'abbr',
        sortable: true
    },
    {
        name: 'rate',
        align: 'center',
        label: 'Tasa',
        field: 'rate',
        sortable: true
    },
    {
        name: 'base_currency',
        align: 'center',
        label: 'Moneda Base',
        field: 'base_currency',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'state',
        align: 'center',
        label: 'Activo',
        field: 'state',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region PROVINCE
/*********************************************************************
*                PROVINCE COLUMN DATA                     *
*********************************************************************/
export const dataColumnProvince = Object.freeze([
    {
        name: 'code',
        align: 'center',
        label: 'Código',
        field: 'code',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'abbr',
        align: 'center',
        label: 'Abreviatura',
        field: 'abbr',
        sortable: true
    },
    {
        name: 'state',
        align: 'center',
        label: 'Activo',
        field: 'state',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region ORIGEN
/*********************************************************************
*                ORIGEN COLUMN DATA                     *
*********************************************************************/
export const dataColumnOrigin = Object.freeze([
    {
        name: 'code',
        align: 'center',
        label: 'Código',
        field: 'code',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'state',
        align: 'center',
        label: 'Activo',
        field: 'state',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region OPERATION
/*********************************************************************
*                OPERATION COLUMN DATA                     *
*********************************************************************/
// #region ORIGEN
/*********************************************************************
*                ORIGEN COLUMN DATA                     *
*********************************************************************/
export const dataColumnOperation = Object.freeze([
    {
        name: 'code',
        align: 'center',
        label: 'Código',
        field: 'code',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'state',
        align: 'center',
        label: 'Activo',
        field: 'state',
        sortable: true,
        format: (val) => val,
        style: 'width: 100px',
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region TRACE
/*********************************************************************
*                TRACE COLUMN DATA                     *
*********************************************************************/
export const dataColumnTrace = Object.freeze([
    {
        name: 'id',
        align: 'center',
        label: 'ID',
        field: 'id',
        sortable: true
    },
    {
        name: 'description',
        align: 'center',
        label: 'Descripción',
        field: 'description',
        sortable: true
    },
    {
        name: 'log_name',
        align: 'center',
        label: 'Tabla',
        field: 'log_name',
        sortable: true,
        format: (val) => {
            const translations = {
                'Application': 'Solicitud',
                'Bank': 'Banco',
                'Brigade': 'Brigada',
                'BuysDescription': 'Descripcición de Compra',
                'Chain': 'Cadena',
                'ComercialActivities': 'Actividades Comerciales',
                'ContratType': 'Tipo de Contrato',
                'Contrat': 'Contrato',
                'Currency': 'Moneda',
                'CustomerSupplier': 'Cliente / Proveedor',
                'DocumentEvaluation': 'Evaluación de Documento',
                'Entity': 'Entidad',
                'EquipmentType': 'Tipo de Equipo',
                'Family': 'Familia',
                'Line': 'Línea',
                'MaintenanceEquipment': 'Equipo de Mantenimiento',
                'ProductService': 'Producto / Servicio',
                'Province': 'Provincia',
                'QualityEvaluation': 'Evaluación de Calidad',
                'ServiceType': 'Tipo de Servicio',
                'State': 'Estado',
                'SupplierAnnexes': 'Anexos de Proveedores',
                'SupplierType': 'Tipo de Proveedor',
                'User': 'Usuario',
                'MaintenanceContract': 'Contrato de Mantenimiento Preventivo',
                'OrderStatus': 'Estado de Orden de Compra',
                'ContractAbroad': 'Contrato al Exterior',
                'Parts': 'Partes y Piezas',
                'PurchaseOrder': 'Orden de Compra',
                'ApplicationsAbroad': 'Solicitud al Exterior'
            };
            return translations[val] || val;
        }
    },
    {
        name: 'properties.ip',
        align: 'center',
        label: 'IP',
        field: row => row.properties.ip,
        sortable: true
    },
    {
        name: 'created_at',
        align: 'center',
        label: 'Fecha y Hora',
        field: 'created_at',
        sortable: true,
        format: (val) => {
            if (!val) return '-';
            const date = new Date(val);
            // Format as d/m/Y, H:i:s (same format as MySQL DATE_FORMAT)
            const day = date.getUTCDate();
            const month = date.getUTCMonth() + 1;
            const year = date.getUTCFullYear();
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
        },
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: true
    }
])

// #region USERS
/*********************************************************************
*                USERS COLUMN DATA                     *
*********************************************************************/

export const dataColumnUsers = Object.freeze([
    {
        name: 'name',
        align: 'center',
        label: 'Nombre',
        field: 'name',
        sortable: true
    },
    {
        name: 'username',
        align: 'center',
        label: 'Usuario',
        field: 'username',
        sortable: true
    },
    {
        name: 'email',
        align: 'center',
        label: 'Email',
        field: 'email',
        sortable: true
    },
    {
        name: 'roles',
        align: 'center',
        label: 'Roles',
        field: 'roles',
        sortable: false,
        format: (val) => val && val.length > 0 ? val.map(r => r.name).join(', ') : 'Sin rol'
    },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: false
    }
]);

// #region ROLES
/*********************************************************************
*                ROLES COLUMN DATA                     *
*********************************************************************/

export const dataColumnRoles = Object.freeze([
    {
        name: 'name',
        align: 'center',
        label: 'Nombre del Rol',
        field: 'name',
        sortable: true
    },
    {
        name: 'permissions_count',
        align: 'center',
        label: 'Permisos',
        field: 'permissions',
        sortable: false,
        format: (val) => val ? val.length : 0
    },
    // {
    //     name: 'created_at',
    //     align: 'center',
    //     label: 'Fecha de Creación',
    //     field: 'created_at',
    //     sortable: true,
    //     format: (val) => {
    //         if (!val) return '-';
    //         let dateStr = val;
    //         if (dateStr.includes('T')) {
    //             dateStr = dateStr.split('T')[0];
    //         }
    //         const [year, month, day] = dateStr.split('-');
    //         return `${day}/${month}/${year}`;
    //     }
    // },
    {
        name: 'action',
        align: 'center',
        label: 'Acciones',
        field: 'action',
        sortable: false
    }
]);