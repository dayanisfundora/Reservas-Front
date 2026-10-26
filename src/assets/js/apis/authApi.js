import { api } from 'boot/axios';

/**
 * Authentication API service.
 * Handles all authentication-related HTTP requests.
 */
const authApi = {
  /**
   * Login user with credentials.
   * 
   * @param {string} username - Username
   * @param {string} password - User password
   * @returns {Promise<Object>} Response with user and token
   */
  login(username, password) {
    return api.post('/api/login', { username, password });
  },

  /**
   * Register new user.
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user and token
   */
  register(userData) {
    return api.post('/api/register', userData);
  },

  /**
   * Logout current user.
   * 
   * @returns {Promise<Object>} Logout response
   */
  logout() {
    return api.post('/api/logout');
  },

  /**
   * Get current authenticated user.
   * 
   * @returns {Promise<Object>} User data
   */
  getUser() {
    return api.get('/api/user');
  },

  /**
   * Get available juegos de datos for a username.
   * 
   * @param {string} username - Username
   * @returns {Promise<Object>} Available juegos
   */
  getJuegosDatos(username) {
    return api.post('/api/juegos-datos', { username });
  },
};

export default authApi;
