import { api } from 'boot/axios';

/**
 * Get all users with pagination
 */
export const get_users = async (params = {}) => {
  try {
    const response = await api.get('users', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all users without pagination
 */
export const get_users_without_pagination = async () => {
  try {
    const response = await api.get('users/without-pagination');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by id
 */
export const get_user_by_id = async (id) => {
  try {
    const response = await api.get(`users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new user
 */
export const create_user = async (data) => {
  try {
    const response = await api.post('users', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user
 */
export const update_user = async (id, data) => {
  try {
    const response = await api.put(`users/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user
 */
export const delete_user = async (id) => {
  try {
    const response = await api.delete(`users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle user status
 */
export const toggle_user_status = async (id) => {
  try {
    const response = await api.post(`users/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user roles and permissions
 */
export const get_user_roles_permissions = async (id) => {
  try {
    const response = await api.get(`users/${id}/roles-permissions`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign roles to user
 */
export const assign_roles_to_user = async (id, roles) => {
  try {
    const response = await api.post(`users/${id}/roles`, { roles });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign permissions to user
 */
export const assign_permissions_to_user = async (id, permissions) => {
  try {
    const response = await api.post(`users/${id}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    throw error;
  }
};
