import api from './api';

const StatsService = {
  getCountDocumentsThisMonth: async () => {
    try {
      const response = await api.get('/stats/docs/count-current-month');
      return response.data; // Expected: { count: number }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch count of documents this month.' };
    }
  },

  getMonthlyUploadStats: async () => {
    try {
      const response = await api.get('/stats/docs/monthly-uploads');
      return response.data; // Expected: { stats: [{ month_year: string, count: string/number }] }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch monthly upload stats.' };
    }
  },

  getDashboardSummaryStats: async () => {
    try {
      const response = await api.get('/stats/summary');
      // Expected: {
      //   countThisMonth: number,
      //   totalDocuments: number,
      //   suratMasukCount: number,
      //   suratKeluarCount: number
      // }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard summary stats.' };
    }
  }
};

export default StatsService;
