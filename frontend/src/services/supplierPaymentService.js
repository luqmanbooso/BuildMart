import axios from 'axios';

const API_URL = 'https://build-mart-backend.vercel.app/api/supplier-payments';

export const supplierPaymentService = {
  createPayment: async (paymentData) => {
    try {
      console.log('Creating payment with data:', paymentData);
      const response = await axios.post(API_URL, paymentData);
      console.log('Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier payment:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllPayments: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier payments:', error.response?.data || error.message);
      throw error;
    }
  },

  getPaymentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier payment:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePaymentStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating supplier payment status:', error.response?.data || error.message);
      throw error;
    }
  }
};