import React, { useRef, useState } from 'react';
import { FaFileContract, FaHandshake, FaSignature, FaCheckCircle, FaExclamationTriangle, FaUserTie, FaHardHat, FaCalendarAlt, FaMoneyBillWave, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from "jspdf";

const ClientContractorAgreement = () => {
  const componentRef = useRef(null);
  
  const handlePrint = async () => {
    const element = componentRef.current;
    // console.log('element:', element);
    if(!element){
      return;
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF({
      orientation: "landscape",
      unit:"px",
      format: "a4"
    });

doc.addImage(imgData,"PNG", 100, 100);
doc.save("aggreement.pdf");
  }

  const [agreement] = useState({
    totalAmount: 8500,
    paymentSchedule: [
      { milestone: 'Initial Deposit', percentage: 30, amount: 2550, status: 'Paid', date: '2025-03-20' },
      { milestone: 'Demolition Complete', percentage: 20, amount: 1700, status: 'Pending', date: '2025-04-15' },
      { milestone: 'Cabinets Installed', percentage: 25, amount: 2125, status: 'Pending', date: '2025-05-10' },
      { milestone: 'Final Completion', percentage: 25, amount: 2125, status: 'Pending', date: '2025-06-15' }
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... (header and other elements remain the same) */}

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" >
        <div className="max-w-5xl mx-auto">
          {/* Printable content - this div will be referenced by the ref */}
          <div ref={componentRef}  className="bg-white">
            {/* Payment Schedule Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-3xl mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Payment Schedule</h2>
                    <p className="text-white text-opacity-80">Total Contract Value: ${agreement.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {agreement.paymentSchedule.map((payment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{payment.milestone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{payment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">{payment.percentage}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">${payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="font-medium">Next Payment Due: April 15, 2025</span>
                    </div>
                    <button className="bg-blue-900 text-white py-2 px-4 rounded flex items-center">
                      View Payment Details
                      <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* ... (all the content inside this div remains the same) */}
          </div>
        </div>
      </div>
      <div>Hello World</div>
      {/* Fixed download button outside printable area */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={handlePrint}
          className="bg-blue-900 text-white py-3 px-6 rounded-full shadow-lg flex items-center hover:bg-blue-800 transition-colors"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ClientContractorAgreement;
