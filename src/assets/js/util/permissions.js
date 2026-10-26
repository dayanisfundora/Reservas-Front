import { useAuthStore } from 'src/stores/auth-store';

/**
 * Check if current user has a specific permission.
 * 
 * @param {string} permission - Permission name to check (e.g., 'nomenclatures.view')
 * @returns {boolean} True if user has permission
 */
export function hasPermission(permission) {
  const authStore = useAuthStore();
  return authStore.hasPermission(permission);
}

/**
 * Check if current user has any of the specified permissions.
 * 
 * @param {Array<string>} permissions - Array of permission names
 * @returns {boolean} True if user has at least one permission
 */
export function hasAnyPermission(permissions) {
  const authStore = useAuthStore();
  return authStore.hasAnyPermission(permissions);
}

/**
 * Check if current user has all specified permissions.
 * 
 * @param {Array<string>} permissions - Array of permission names
 * @returns {boolean} True if user has all permissions
 */
export function hasAllPermissions(permissions) {
  const authStore = useAuthStore();
  return authStore.hasAllPermissions(permissions);
}

/**
 * Check if current user has a specific role.
 * 
 * @param {string} role - Role name to check (e.g., 'Super Admin')
 * @returns {boolean} True if user has role
 */
export function hasRole(role) {
  const authStore = useAuthStore();
  return authStore.hasRole(role);
}

/**
 * Check if current user has any of the specified roles.
 * 
 * @param {Array<string>} roles - Array of role names
 * @returns {boolean} True if user has at least one role
 */
export function hasAnyRole(roles) {
  const authStore = useAuthStore();
  return authStore.hasAnyRole(roles);
}

/**
 * Permission mapping for nomenclature pages.
 * Maps route names to required permissions.
 */
export const nomenclaturePermissions = {
  'DatosEntidad': 'nomencladores.ver',
  'Estado': 'nomencladores.ver',
  'EstadoOrden': 'nomencladores.ver',
  'Moneda': 'nomencladores.ver',
  'Provincia': 'nomencladores.ver',
  'Brigada': 'nomencladores.ver',
  'Cadena': 'nomencladores.ver',
  'ClienteProveedor': 'nomencladores.ver',
  'ProductoServicio': 'nomencladores.ver',
  'TipoEquipo': 'nomencladores.ver',
  'TipoServicio': 'nomencladores.ver',
  'Familia': 'nomencladores.ver',
  'Lineas': 'nomencladores.ver',
  'DescCompra': 'nomencladores.ver',
  'EquipoMantenimiento': 'nomencladores.ver',
  'AnexosProveedores': 'nomencladores.ver',
  'Banco': 'nomencladores.ver',
  'CarteraProductos': 'nomencladores.ver',
  'ActividadesComerciales': 'nomencladores.ver',
  'TipoProveedor': 'nomencladores.ver',
  'EvaluacionDocumento': 'nomencladores.ver',
  'EvaluacionCalidad': 'nomencladores.ver',
  'ClasificacionPresupuesto': 'nomencladores.ver',
};

/**
 * Check if user can access a nomenclature page.
 * 
 * @param {string} routeName - Route name
 * @returns {boolean} True if user can access the page
 */
export function canAccessNomenclature(routeName) {
  const permission = nomenclaturePermissions[routeName];
  if (!permission) return false;
  return hasPermission(permission);
}

/**
 * Filter items based on user permissions.
 * 
 * @param {Array<Object>} items - Array of items with link or permission property
 * @param {string} permissionKey - Key to extract permission from items (default: 'permission')
 * @returns {Array<Object>} Filtered items user has access to
 */
export function filterByPermission(items, permissionKey = 'permission') {
  const authStore = useAuthStore();
  
  return items.filter(item => {
    // If item has explicit permission, check it
    if (item[permissionKey]) {
      return authStore.hasPermission(item[permissionKey]);
    }
    
    // If item has link and it's in nomenclature mapping, check nomenclature permission
    if (item.link && nomenclaturePermissions[item.link]) {
      return authStore.hasPermission(nomenclaturePermissions[item.link]);
    }
    
    // By default, show item if no permission specified
    return true;
  });
}
