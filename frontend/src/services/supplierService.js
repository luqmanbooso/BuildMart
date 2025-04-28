import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const supplierService = {
  getAllSuppliers: async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },
  
  createSupplier: async (supplierData) => {
    try {
      const response = await axios.post(`${API_URL}/suppliers`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },
  
  updateSupplier: async (id, supplierData) => {
    try {
      // Check if ID is valid before making the request
      if (!id) {
        throw new Error('Invalid supplier ID');
      }
      const response = await axios.put(`${API_URL}/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },
  
  deleteSupplier: async (id) => {
    try {
      // Check if ID is valid before making the request
      if (!id) {
        throw new Error('Invalid supplier ID');
      }
      const response = await axios.delete(`${API_URL}/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }
};