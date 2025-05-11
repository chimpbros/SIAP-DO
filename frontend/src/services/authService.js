import api from './api';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed due to network error.' };
    }
  },

  register: async (userData) => {
    // userData should include: nama, pangkat, nrp, email, password
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed due to network error.' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // No API call needed for basic JWT logout, but can be added if server-side invalidation is implemented
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  changePassword: async (passwordData) => {
    // passwordData should include: oldPassword, newPassword, confirmNewPassword
    // Backend expects oldPassword, newPassword
    try {
      const payload = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword, // Backend will validate newPassword === confirmNewPassword
      };
      const response = await api.post('/auth/change-password', payload);
      return response.data; // Should be a success message e.g., { message: 'Password berhasil diubah.' }
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengubah password karena kesalahan jaringan.' };
    }
  },

  // Optional: Fetch current user details from backend to verify token and get fresh data
  // verifyCurrentUser: async () => {
  //   try {
  //     const response = await api.get('/auth/me');
  //     localStorage.setItem('user', JSON.stringify(response.data));
  //     return response.data;
  //   } catch (error) {
  //     // If /auth/me fails (e.g. token expired), logout user
  //     AuthService.logout();
  //     throw error.response?.data || { message: 'Session verification failed.' };
  //   }
  // }
};

export default AuthService;
