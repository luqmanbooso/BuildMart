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
      </div>

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