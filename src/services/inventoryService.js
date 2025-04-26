import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/inventory`;

/**
 * Fetch all inventory items
 * @returns {Promise<Array>} - Array of inventory items
 */
export const fetchInventoryItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

/**
 * Fetch a single inventory item by ID
 * @param {string} itemId - The ID of the item to fetch
 * @returns {Promise<Object>} - The inventory item
 */
export const fetchInventoryItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory item ${itemId}:`, error);
    throw error;
  }
};
