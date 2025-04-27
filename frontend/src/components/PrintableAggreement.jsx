import React from 'react';

const PrintableAgreement = React.forwardRef(({ agreement, reportCriteria = { 
  showParties: true,
  showTimeline: true,
  showCostBreakdown: true,
  showWorkSchedule: true,
  showPaymentSchedule: true,
  showTerms: true
} }, ref) => {
  console.log('PrintableAgreement is rendering:', agreement); // Debug log
  
  // Calculate totals only once to avoid redundancy
  const totalCost = agreement.costBreakdown?.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0), 0
  ) || 0;
  
  return (
    <div ref={ref} className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contract Agreement</h1>
      <h2 className="text-xl font-bold mb-2">{agreement.projectTitle}</h2>
      
      {reportCriteria.showParties && (
        <div className="mb-4">
          <h3 className="font-bold">Parties</h3>
          <p><strong>Client:</strong> {agreement.clientName}</p>
          <p><strong>Contractor:</strong> {agreement.contractorName}</p>
        </div>
      )}

      {reportCriteria.showTimeline && (
        <div className="mb-4">
          <h3 className="font-bold">Timeline</h3>
          <p><strong>Start Date:</strong> {agreement.startDate}</p>
          <p><strong>End Date:</strong> {agreement.endDate}</p>
          <p><strong>Duration:</strong> {agreement.timeline} days</p>
        </div>
      )}

      {reportCriteria.showCostBreakdown && agreement.costBreakdown && agreement.costBreakdown.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold">Cost Breakdown</h3>
          <table className="min-w-full border mb-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-right">Amount (RS)</th>
              </tr>
            </thead>
            <tbody>
              {agreement.costBreakdown.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-2">{item.description}</td>
                  <td className="border px-4 py-2 text-right">{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border px-4 py-2">Total</td>
                <td className="border px-4 py-2 text-right">{totalCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {reportCriteria.showWorkSchedule && agreement.workItems && agreement.workItems.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold">Work Schedule</h3>
          <table className="min-w-full border mb-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Task</th>
                <th className="border px-4 py-2 text-left">Start Date</th>
                <th className="border px-4 py-2 text-left">End Date</th>
                <th className="border px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {agreement.workItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{new Date(item.startDate).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{new Date(item.endDate).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{item.duration} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportCriteria.showPaymentSchedule && (
        <div className="mb-4">
          <h3 className="font-bold">Payment Schedule</h3>
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Milestone</th>
                <th className="border px-4 py-2 text-left">Due Date</th>
                <th className="border px-4 py-2 text-left">Percentage</th>
                <th className="border px-4 py-2 text-right">Amount</th>
                <th className="border px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {agreement.paymentSchedule.map((payment, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-2">{payment.milestone}</td>
                  <td className="border px-4 py-2">{payment.date}</td>
                  <td className="border px-4 py-2">{payment.percentage}%</td>
                  <td className="border px-4 py-2 text-right">${payment.amount.toLocaleString()}</td>
                  <td className="border px-4 py-2">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportCriteria.showTerms && (
        <div className="mb-4">
          <h3 className="font-bold">Terms & Conditions</h3>
          <ul className="list-disc pl-5">
            {agreement.terms.map((term, index) => (
              <li key={index} className="mb-1">{term}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default PrintableAgreement;