import axios from 'axios';

const API_URL = 'https://build-mart-backend.vercel.app/api/restock';

export const restockService = {
  getAllRequests: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching restock requests:', error);
      throw error;
    }
  },
  
  createRequest: async (restockData) => {
    try {
      const response = await axios.post(API_URL, restockData);
      return response.data;
    } catch (error) {
      console.error('Error creating restock request:', error);
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating restock status:', error);
      throw error;
    }
  },
  
  processPayment: async (id, paymentDetails) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/payment`, paymentDetails);
      return response.data;
    } catch (error) {
      console.error('Error processing restock payment:', error);
      throw error;
    }
  }
};