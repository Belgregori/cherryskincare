import api from './api';

export const orderService = {
  async createOrder(userId, orderData) {
    const response = await api.post(`/orders/user/${userId}`, orderData);
    return response.data;
  },

  async getUserOrders(userId) {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }
};


