import React, { useState, useEffect } from 'react';
import { fetchInventoryItems } from '../../services/inventoryService';
import { checkItemHasSupplier, addSupplier } from '../../services/supplierService';
import './AddSupplierForm.css';

const AddSupplierForm = () => {
  const [formData, setFormData] = useState({
    supplierName: '',
    itemId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItemCategory, setSelectedItemCategory] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Load inventory items when component mounts
    const loadItems = async () => {
      try {
        const items = await fetchInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Failed to load inventory items', error);
      }
    };
    
    loadItems();
  }, []);
  
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Handle item selection
    if (name === 'itemId' && value) {
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        setSelectedItemCategory(selectedItem.category);
        
        // Check if item already has a supplier
        try {
          const hasSupplier = await checkItemHasSupplier(value);
          if (hasSupplier) {
            setFormErrors({
              ...formErrors,
              itemId: 'This item already has a supplier assigned'
            });
          } else {
            // Clear the error if it exists
            const updatedErrors = { ...formErrors };
            delete updatedErrors.itemId;
            setFormErrors(updatedErrors);
          }
        } catch (error) {
          console.error('Error checking supplier', error);
        }
      }
    } else if (name === 'itemId') {
      // Clear category if no item selected
      setSelectedItemCategory('');
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    }
    
    if (!formData.itemId) {
      errors.itemId = 'Item selection is required';
    }
    
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = 'Email format is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await addSupplier({
          ...formData,
          itemCategory: selectedItemCategory
        });
        
        // Reset form after successful submission
        setFormData({
          supplierName: '',
          itemId: '',
          contactName: '',
          contactEmail: '',
          contactPhone: ''
        });
        setSelectedItemCategory('');
        alert('Supplier added successfully!');
      } catch (error) {
        console.error('Error adding supplier', error);
        alert('Failed to add supplier');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="form-container">
      <h2>Add New Supplier</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="supplierName">Supplier Name</label>
          <input 
            type="text" 
            id="supplierName" 
            name="supplierName" 
            value={formData.supplierName} 
            onChange={handleChange} 
          />
          {formErrors.supplierName && <div className="error-message">{formErrors.supplierName}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="itemId">Select Item</label>
          <select 
            id="itemId" 
            name="itemId" 
            value={formData.itemId} 
            onChange={handleChange}
          >
            <option value="">-- Select an Item --</option>
            {inventoryItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {formErrors.itemId && <div className="error-message">{formErrors.itemId}</div>}
        </div>
        
        {selectedItemCategory && (
          <div className="form-group">
            <label>Item Category</label>
            <p className="category-display">{selectedItemCategory}</p>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="contactName">Contact Person</label>
          <input 
            type="text" 
            id="contactName" 
            name="contactName" 
            value={formData.contactName} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactEmail">Email</label>
          <input 
            type="email" 
            id="contactEmail" 
            name="contactEmail" 
            value={formData.contactEmail} 
            onChange={handleChange} 
          />
          {formErrors.contactEmail && <div className="error-message">{formErrors.contactEmail}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPhone">Phone</label>
          <input 
            type="tel" 
            id="contactPhone" 
            name="contactPhone" 
            value={formData.contactPhone} 
            onChange={handleChange} 
          />
        </div>
        
        <button type="submit" disabled={isSubmitting || Object.keys(formErrors).length > 0}>
          Add Supplier
        </button>
      </form>
    </div>
  );
};

export default AddSupplierForm;
