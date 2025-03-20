import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/images/buildmart_logo1.png';
import {  useLocation, useNavigate, useParams } from 'react-router-dom';

const AcceptedAgreementView = () => {
  // Get data from location state
  const navigate  = useNavigate();
  const location = useLocation();
  const { jobId, bidId } = useParams();
  
  // Extract data from location state
  const { 
    jobDetails, 
    bidDetails, 
    clientDetails, 
    contractorDetails, 
    paymentSchedule 
  } = location.state || {};
  
  console.log("Client details in AcceptedAgreementView:", clientDetails);
  
  const printRef = useRef();

  // Setup print handler
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Project_Agreement_${jobDetails?._id}`,
    onAfterPrint: () => toast.success('Agreement printed successfully')
  });

  // Replace the entire handleDownloadPdf function with this approach that doesn't use html2canvas

const handleDownloadPdf = async () => {
  toast.info("Generating agreement PDF...");
  
  try {
    // Create a new PDF document with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Define constants for positioning
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add a title with proper spacing
    const addTitle = (text, size, isBold = false, marginBottom = 5) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.text(text, pageWidth / 2, yPosition, { align: "center" });
      yPosition += marginBottom;
    };
    
    // Helper function to add text with wrapping
    const addText = (text, x, y, maxWidth) => {
      if (!text) return y;
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * 5);
    };
    
    // Add logo and title
    addTitle("BuildMart", 22, true, 10);
    addTitle("Project Agreement", 18, true, 15);
    addTitle(jobDetails?.title || "Project", 16, true, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;
    
    // Client and contractor section
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text("Client", margin, yPosition);
    pdf.text("Contractor", pageWidth - margin - 40, yPosition);
    
    yPosition += 7;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    
    // Client details
    pdf.text(clientDetails?.name || clientDetails?.username || "Client", margin, yPosition);
    yPosition += 5;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(clientDetails?.email || "No email provided", margin, yPosition);
    
    // Contractor details
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(contractorDetails?.name || bidDetails?.contractorname || "Contractor", pageWidth - margin - 40, yPosition - 5);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(contractorDetails?.email || "", pageWidth - margin - 40, yPosition);
    
    yPosition += 15;
    
    // Add project details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Details", margin, yPosition);
    yPosition += 7;
    
    // Draw a horizontal line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 7;
    
    // Project details - in a grid layout
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Bid Amount", margin, yPosition);
    pdf.text("Timeline", margin + 60, yPosition);
    pdf.text("Start Date", margin + 140, yPosition);
    
    yPosition += 5;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`LKR ${parseFloat(bidDetails?.price || 0).toLocaleString()}`, margin, yPosition);
    pdf.text(`${bidDetails?.timeline || "N/A"} days`, margin + 60, yPosition);
    pdf.text(`${new Date().toLocaleDateString()}`, margin + 140, yPosition);
    
    yPosition += 15;
    
    // Project description
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Description", margin, yPosition);
    yPosition += 7;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    
    // Add a light gray background for the description
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 30, 'F');
    
    // Add description text with wrapping
    yPosition = addText(jobDetails?.description || "No description provided", 
                        margin + 3, yPosition + 5, pageWidth - (margin * 2) - 6);
    
    yPosition += 10;
    
    // Check if we need a new page for payment schedule
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Payment schedule
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Schedule", margin, yPosition);
    yPosition += 7;
    
    // Draw a horizontal line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 7;
    
    // Table headers for payment schedule
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont("helvetica", "bold");
    
    // Column positions
    const col1 = margin + 2;
    const col2 = margin + 40;
    const col3 = pageWidth - margin - 65;
    const col4 = pageWidth - margin - 35;
    
    pdf.text("Milestone", col1, yPosition + 5);
    pdf.text("Description", col2, yPosition + 5);
    pdf.text("Due Date", col3, yPosition + 5);
    pdf.text("Amount", col4, yPosition + 5);
    
    yPosition += 8;
    
    // Table rows
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    // Determine if we have payment schedule items
    if (paymentSchedule && paymentSchedule.length > 0) {
      let alternateRow = false;
      
      for (const payment of paymentSchedule) {
        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
          
          // Repeat table headers on new page
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
          
          pdf.setFontSize(9);
          pdf.setTextColor(80, 80, 80);
          pdf.setFont("helvetica", "bold");
          
          pdf.text("Milestone", col1, yPosition + 5);
          pdf.text("Description", col2, yPosition + 5);
          pdf.text("Due Date", col3, yPosition + 5);
          pdf.text("Amount", col4, yPosition + 5);
          
          yPosition += 8;
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
        }
        
        // Alternate row backgrounds
        if (alternateRow) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, yPosition, pageWidth - (margin * 2), 7, 'F');
        }
        alternateRow = !alternateRow;
        
        // Add row data
        pdf.text(payment.milestone || "", col1, yPosition + 4, { maxWidth: 35 });
        
        // Truncate description if too long
        const desc = payment.description || "";
        const shortDesc = desc.length > 30 ? desc.substring(0, 27) + "..." : desc;
        pdf.text(shortDesc, col2, yPosition + 4, { maxWidth: pageWidth - col2 - 70 });
        
        pdf.text(payment.date || "", col3, yPosition + 4);
        pdf.text(`LKR ${payment.amount.toLocaleString()}`, col4, yPosition + 4, { align: 'right' });
        
        yPosition += 7;
      }
      
      // Total row
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Total", col1, yPosition + 5);
      pdf.text(`LKR ${parseFloat(bidDetails?.price || 0).toLocaleString()}`, col4, yPosition + 5, { align: 'right' });
      
      yPosition += 15;
    } else {
      pdf.text("No payment schedule items available", margin, yPosition + 5);
      yPosition += 10;
    }
    
    // Check if we need a new page for terms
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Terms and conditions
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Terms & Conditions", margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    const terms = [
      "Work shall be carried out according to industry standards and local building codes.",
      "Changes to the project scope require written approval from both parties.",
      "The Contractor shall obtain all necessary permits and approvals before work begins.",
      "All materials used shall be new and of good quality unless otherwise specified.",
      "The Contractor shall maintain insurance coverage throughout the project.",
      "The Client agrees to provide access to the work site as needed.",
      "Payment shall be made according to the payment schedule upon completion of each milestone.",
      "Either party may terminate this agreement with written notice if the other fails to comply with its terms."
    ];
    
    terms.forEach((term, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(`${index + 1}. ${term}`, margin, yPosition, { 
        maxWidth: pageWidth - (margin * 2) 
      });
      yPosition += 7;
    });
    
    // Check if we need a new page for signatures
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Add signature section
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Signatures", margin, yPosition);
    yPosition += 10;
    
    // Client signature
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Client:", margin, yPosition);
    pdf.line(margin, yPosition + 15, margin + 70, yPosition + 15);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(clientDetails?.name || clientDetails?.username || "", margin, yPosition + 20); // Move name down
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition + 25); // Add date below name

    // Contractor signature
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Contractor:", pageWidth - margin - 70, yPosition);
    pdf.line(pageWidth - margin - 70, yPosition + 15, pageWidth - margin, yPosition + 15);;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(contractorDetails?.name || bidDetails?.contractorname || "", pageWidth - margin - 70, yPosition + 20); // Move name down
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 70, yPosition + 25); // Add date below name

    yPosition += 35; // Increase the spacing after signatures
    
    // Save the PDF
    pdf.save(`${jobDetails?.title || 'Project'}_Agreement.pdf`);
    toast.success("Agreement PDF downloaded successfully");
  } catch (err) {
    console.error("Error generating PDF:", err);
    // Fall back to browser print
    toast.error(`Could not generate PDF: ${err.message}`);
    toast.info("Trying alternative print method...");
    handlePrint();
  }
};

  // Send agreement via email
  const sendAgreementEmail = async () => {
    if (!contractorDetails?.email) {
      toast.error("Contractor email not found");
      return;
    }
    
    try {
      toast.info("Sending agreement to contractor...");
      
      // Prepare the data
      const emailData = {
        recipientEmail: contractorDetails.email,
        subject: `Project Agreement: ${jobDetails?.title}`,
        projectTitle: jobDetails?.title,
        clientName: clientDetails?.name || clientDetails?.username,
        contractorName: contractorDetails?.name || bidDetails?.contractorname,
        agreementId: jobDetails?._id,
        bidAmount: parseFloat(bidDetails?.price).toLocaleString()
      };
      
      // Make API request
      const response = await axios.post('http://localhost:5000/api/email/send-agreement', emailData);
      toast.success("Agreement sent to contractor's email!");
      
      // If using Ethereal for testing, open the preview URL
      if (response.data.previewUrl) {
        window.open(response.data.previewUrl, '_blank');
      }
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Fallback to mailto if API fails
      const fallbackToMailto = window.confirm(
        "Email service is currently unavailable. Would you like to open your email client instead?"
      );
      
      if (fallbackToMailto) {
        const subject = encodeURIComponent(`Project Agreement: ${jobDetails?.title || 'Project'}`);
        const body = encodeURIComponent(
          `Dear ${contractorDetails?.name || bidDetails?.contractorname},\n\n` +
          `I'm sending you the agreement for the project "${jobDetails?.title}". ` +
          `The bid amount is LKR ${parseFloat(bidDetails?.price).toLocaleString()} ` +
          `with a timeline of ${bidDetails?.timeline} days.\n\n` +
          `Please review the agreement details.\n\n` +
          `Regards,\n${clientDetails?.name || clientDetails?.username}`
        );
        
        window.location.href = `mailto:${contractorDetails.email}?subject=${subject}&body=${body}`;
      } else {
        toast.error("Failed to send email. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Action buttons placed before the printable area */}
        <div className="mb-6 flex justify-end space-x-3">
          
        <button
            onClick={() => navigate('/ongoing-works')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Ongoing Works
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
          {contractorDetails?.email && (
            <button
              onClick={sendAgreementEmail}
              className="px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email to Contractor
            </button>
          )}
        </div>
        
        {/* Agreement Status Banner */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Agreement Accepted</h3>
              <p className="text-sm text-green-700 mt-1">
                This agreement has been accepted and the project is in progress.
              </p>
            </div>
          </div>
        </div>
        
        {/* Printable Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{jobDetails?.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Accepted Project Agreement</p>
            </div>
            
            <div ref={printRef} id="agreement-content" className="print-content">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-center mb-6 print:block">
                  <img src={logo} alt="BuildMart Logo" className="h-10" />
                  <h3 className="text-lg font-medium text-center ml-4">Project Agreement</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client:</h4>
                    <p className="text-md font-medium text-gray-900">
                      {clientDetails?.name || clientDetails?.username || 'Client'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {clientDetails?.email || 'No email provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contractor:</h4>
                    <p className="text-md font-medium text-gray-900">{contractorDetails?.name || bidDetails?.contractorname}</p>
                    <p className="text-sm text-gray-500">{contractorDetails?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Bid Amount:</h4>
                    <p className="text-md font-medium text-gray-900">LKR {parseFloat(bidDetails?.price).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Timeline:</h4>
                    <p className="text-md font-medium text-gray-900">{bidDetails?.timeline} days</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date:</h4>
                    <p className="text-md font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Project Description:</h4>
                  <p className="text-md text-gray-700 bg-gray-50 p-4 rounded">{jobDetails?.description}</p>
                </div>
                
                {/* Payment Milestones */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Schedule:</h4>
                  
                  <div className="overflow-x-auto bg-gray-50 rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentSchedule.map((payment, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.milestone}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.percentage}%</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              LKR {payment.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            LKR {parseFloat(bidDetails?.price).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions:</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Work shall be carried out according to industry standards and local building codes.</li>
                    <li>Changes to the project scope require written approval from both parties.</li>
                    <li>The Contractor shall obtain all necessary permits and approvals before work begins.</li>
                    <li>All materials used shall be new and of good quality unless otherwise specified.</li>
                    <li>The Contractor shall maintain insurance coverage throughout the project.</li>
                    <li>The Client agrees to provide access to the work site as needed.</li>
                    <li>Payment shall be made according to the payment schedule upon completion of each milestone.</li>
                    <li>Either party may terminate this agreement with written notice if the other fails to comply with its terms.</li>
                  </ul>
                </div>
                
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptedAgreementView;