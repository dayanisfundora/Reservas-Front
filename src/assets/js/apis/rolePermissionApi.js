import { api } from 'boot/axios';

/**
 * Get all roles
 */
export const get_roles = async () => {
  try {
    const response = await api.get('roles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get role by id
 */
export const get_role_by_id = async (id) => {
  try {
    const response = await api.get(`roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new role
 */
export const create_role = async (data) => {
  try {
    const response = await api.post('roles', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update role
 */
export const update_role = async (id, data) => {
  try {
    const response = await api.put(`roles/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete role
 */
export const delete_role = async (id) => {
  try {
    const response = await api.delete(`roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign permissions to role
 */
export const assign_permissions_to_role = async (id, permissions) => {
  try {
    const response = await api.post(`roles/${id}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all permissions
 */
export const get_permissions = async () => {
  try {
    const response = await api.get('permissions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get permission by id
 */
export const get_permission_by_id = async (id) => {
  try {
    const response = await api.get(`permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new permission
 */
export const create_permission = async (data) => {
  try {
    const response = await api.post('permissions', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update permission
 */
export const update_permission = async (id, data) => {
  try {
    const response = await api.put(`permissions/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete permission
 */
export const delete_permission = async (id) => {
  try {
    const response = await api.delete(`permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
