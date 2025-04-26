import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/suppliers`;

/**
 * Add a new supplier
 * @param {Object} supplierData - The supplier data
 * @returns {Promise} - The created supplier
 */
export const addSupplier = async (supplierData) => {
  try {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
  } catch (error) {
    console.error('Error adding supplier:', error);
    throw error;
  }
};

/**
 * Check if an item already has a supplier
 * @param {string} itemId - The ID of the item to check
 * @returns {Promise<boolean>} - True if the item has a supplier, false otherwise
 */
export const checkItemHasSupplier = async (itemId) => {
  try {
    const response = await axios.get(`${API_URL}?itemId=${itemId}`);
    return response.data.length > 0;
  } catch (error) {
    console.error('Error checking if item has supplier:', error);
    throw error;
  }
};

/**
 * Get all suppliers
 * @returns {Promise<Array>} - Array of suppliers
 */
export const getSuppliers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};
