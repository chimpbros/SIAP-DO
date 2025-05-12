import api from './api';

const AuthService = {
  login: async (email, password) => {
    console.log('AuthService.login called'); // Added log
    try {
      console.log('Attempting API login post to /auth/login'); // Added log
      const response = await api.post('/auth/login', { email, password });
      console.log('API login post response received:', response); // Added log

      if (response.data && response.data.token) { // Added check for response.data
        console.log('Token found in response, setting localStorage.'); // Added log
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.log('No token found in response data:', response.data); // Added log
      }
      return response.data;
    } catch (error) {
      console.error('Error inside AuthService.login catch block:', error); // Added log
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
