import React from 'react';

const PrintableAgreement = React.forwardRef(({ agreement }, ref) => {
    console.log('PrintableAgreement is rendering:', agreement); // Debug log
  return (
    <div ref={ref} className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contract Agreement</h1>
      <h2 className="text-xl font-bold mb-2">{agreement.projectTitle}</h2>
      
      <div className="mb-4">
        <h3 className="font-bold">Parties</h3>
        <p><strong>Client:</strong> {agreement.clientName}</p>
        <p><strong>Contractor:</strong> {agreement.contractorName}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Timeline</h3>
        <p><strong>Start Date:</strong> {agreement.startDate}</p>
        <p><strong>End Date:</strong> {agreement.endDate}</p>
        <p><strong>Duration:</strong> {agreement.timeline} days</p>
      </div>

      {/* Cost Breakdown - New Addition */}
      {agreement.costBreakdown && agreement.costBreakdown.length > 0 && (
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
                <td className="border px-4 py-2 text-right">
                  {agreement.costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Work Schedule - New Addition */}
      {agreement.workItems && agreement.workItems.length > 0 && (
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

      <div className="mb-4">
        <h3 className="font-bold">Payment Schedule</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Due Date</th>
              <th>Percentage</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {agreement.paymentSchedule.map((payment, index) => (
              <tr key={index}>
                <td>{payment.milestone}</td>
                <td>{payment.date}</td>
                <td>{payment.percentage}%</td>
                <td>${payment.amount.toLocaleString()}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Terms & Conditions</h3>
        <ul>
          {agreement.terms.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default PrintableAgreement;