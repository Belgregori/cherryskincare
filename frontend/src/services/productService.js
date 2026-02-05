import api from './api';

export const productService = {
  async getAllProducts() {
    try {
      console.log('Fetching products from:', '/products');
      const response = await api.get('/products');
      console.log('Products response:', response);
      
      // El backend puede retornar una lista directamente o un objeto PageResponseDTO
      // Si es un objeto con 'content', extraer el array
      if (response.data && Array.isArray(response.data)) {
        console.log('Products array received, count:', response.data.length);
        return response.data;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        console.log('Products from PageResponseDTO, count:', response.data.content.length);
        return response.data.content;
      }
      console.warn('Unexpected response format:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error en productService.getAllProducts:', error);
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Request error - no response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async getProductsByCategory(category) {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  async searchProducts(query) {
    const response = await api.get('/products/search', {
      params: { q: query }
    });
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/products/categories');
    return response.data;
  }
};


