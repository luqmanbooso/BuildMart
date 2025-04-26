import React, { createContext, useContext, useState } from 'react';

const SupplierPaymentContext = createContext();

export const SupplierPaymentProvider = ({ children }) => {
  const [supplierPayments, setSupplierPayments] = useState([]);

  const addSupplierPayment = (payment) => {
    setSupplierPayments(prev => [...prev, {
      id: `SP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...payment,
      createdAt: new Date().toISOString()
    }]);
  };

  return (
    <SupplierPaymentContext.Provider value={{ 
      supplierPayments, 
      setSupplierPayments, // Export the setter
      addSupplierPayment 
    }}>
      {children}
    </SupplierPaymentContext.Provider>
  );
};

export const useSupplierPayments = () => useContext(SupplierPaymentContext);