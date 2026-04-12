import api from './api';

const categoryService = {
  async getAll() {
    const response = await api.get('/products/categories');
    return response.data || [];
  },
};

export { categoryService };
