import api from './api';

const AdminService = {
  listUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data; // Expected: array of user objects
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users.' };
    }
  },

  approveUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/approve`);
      return response.data; // Expected: { message: string, user: object }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve user.' };
    }
  },

  revokeUserAccess: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/revoke`);
      return response.data; // Expected: { message: string, user: object }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to revoke user access.' };
    }
  },

  setUserAdminStatus: async (userId, isAdmin) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { isAdmin });
      return response.data; // Expected: { message: string, user: object }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to set user admin status.' };
    }
  },
};

export default AdminService;
