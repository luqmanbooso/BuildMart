import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/images/buildmart_logo1.png';
import {  useLocation, useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

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
      
      // Define constants for positioning with better spacing
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 14; 
      let yPosition = margin;
      
      // Helper functions
      const addTitle = (text, size, isBold = false, marginBottom = 5) => {
        pdf.setFontSize(size);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.text(text, pageWidth / 2, yPosition, { align: "center" });
        yPosition += marginBottom;
      };
      
      const addText = (text, x, y, maxWidth) => {
        if (!text) return y;
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * 4.5);
      };
      
      // Add logo and title
      addTitle("BuildMart", 18, true, 7);
      addTitle("Project Agreement", 16, true, 7);
      addTitle(jobDetails?.title || "Project", 13, true, 7);
      
      // Add date
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;
      
      // Client and contractor section
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Client", margin, yPosition);
      pdf.text("Contractor", pageWidth - margin - 30, yPosition);
      
      yPosition += 5;
      
      // Client details
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(clientDetails?.name || clientDetails?.username || "Client", margin, yPosition);
      yPosition += 4;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(clientDetails?.email || '', margin, yPosition);
      
      // Contractor details
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(contractorDetails?.name || bidDetails?.contractorname || "Contractor", pageWidth - margin - 30, yPosition - 4);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(contractorDetails?.email || bidDetails?.email || '', pageWidth - margin - 30, yPosition);
      
      yPosition += 10;
      
      // Add project details
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Project Details", margin, yPosition);
      yPosition += 5;
      
      // Draw a horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;
      
      // Project details
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Bid Amount", margin, yPosition);
      pdf.text("Timeline", margin + 50, yPosition);
      pdf.text("Start Date", margin + 120, yPosition);
      
      yPosition += 4;
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`LKR ${parseFloat(bidDetails?.price || 0).toLocaleString()}`, margin, yPosition);
      pdf.text(`${bidDetails?.timeline || "N/A"} days`, margin + 50, yPosition);
      pdf.text(`${new Date().toLocaleDateString()}`, margin + 120, yPosition);
      
      yPosition += 10;
      
      // Project description
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Project Description", margin, yPosition);
      yPosition += 6;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      
      // Add a light gray background for the description
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 22, 'F');
      
      // Add description text with wrapping
      yPosition = addText(jobDetails?.description || "No description provided", 
                          margin + 2, yPosition + 4, pageWidth - (margin * 2) - 4);
      
      yPosition += 8;
      
      // Payment schedule
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Payment Schedule", margin, yPosition);
      yPosition += 6;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;
      
      // Table headers for payment schedule
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 7, 'F');
      
      pdf.setFontSize(7);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont("helvetica", "bold");
      
      // Column positions with better spacing
      const col1 = margin + 2;
      const col2 = margin + 35;
      const col3 = pageWidth - margin - 55;
      const col4 = pageWidth - margin - 25;
      
      pdf.text("Milestone", col1, yPosition + 4.5);
      pdf.text("Description", col2, yPosition + 4.5);
      pdf.text("Due Date", col3, yPosition + 4.5);
      pdf.text("Amount", col4, yPosition + 4.5);
      
      yPosition += 7;
      
      // Table rows
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      // Determine if we have payment schedule items
      if (paymentSchedule && paymentSchedule.length > 0) {
        let alternateRow = false;
        
        for (const payment of paymentSchedule) {
          // Add row data with alternating background
          if (alternateRow) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, yPosition, pageWidth - (margin * 2), 6, 'F');
          }
          alternateRow = !alternateRow;
          
          // Add row data
          pdf.text(payment.milestone || "", col1, yPosition + 4, { maxWidth: 30 });
          
          // Truncate description if too long
          const desc = payment.description || "";
          const shortDesc = desc.length > 25 ? desc.substring(0, 22) + "..." : desc;
          pdf.text(shortDesc, col2, yPosition + 4, { maxWidth: pageWidth - col2 - 60 });
          
          pdf.text(payment.date || "", col3, yPosition + 4);
          pdf.text(`LKR ${payment.amount.toLocaleString()}`, col4, yPosition + 4, { align: 'right' });
          
          yPosition += 6;
        }
        
        // Total row
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition, pageWidth - (margin * 2), 7, 'F');
        
        pdf.setFont("helvetica", "bold");
        pdf.text("Total", col1, yPosition + 4.5);
        pdf.text(`LKR ${parseFloat(bidDetails?.price || 0).toLocaleString()}`, col4, yPosition + 4.5, { align: 'right' });
        
        yPosition += 10;
      } else {
        pdf.text("No payment schedule items available", margin, yPosition + 4);
        yPosition += 8;
      }
      
      // Terms and conditions
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Terms & Conditions", margin, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(8);
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
      
      // Use a more compact, two-column approach for terms
      const leftTerms = terms.slice(0, 4);
      const rightTerms = terms.slice(4);
      
      let leftY = yPosition;
      let rightY = yPosition;
      const colWidth = (pageWidth - (margin * 2) - 10) / 2;
      
      leftTerms.forEach((term, index) => {
        const formattedTerm = `${index + 1}. ${term}`;
        const lines = pdf.splitTextToSize(formattedTerm, colWidth);
        pdf.text(lines, margin, leftY + 4);
        leftY += lines.length * 3.5 + 1.5;
      });
      
      rightTerms.forEach((term, index) => {
        const formattedTerm = `${index + 5}. ${term}`;
        const lines = pdf.splitTextToSize(formattedTerm, colWidth);
        pdf.text(lines, margin + colWidth + 10, rightY + 4);
        rightY += lines.length * 3.5 + 1.5;
      });
      
      yPosition = Math.max(leftY, rightY) + 6;
      
      // Add signature section
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Signatures", margin, yPosition);
      yPosition += 6;
      
      // Client signature
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Client:", margin, yPosition);
      pdf.line(margin, yPosition + 10, margin + 60, yPosition + 10);
      pdf.setFontSize(8);
      pdf.text(clientDetails?.name || clientDetails?.username || "", margin, yPosition + 14);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition + 18);

      // Contractor signature
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Contractor:", pageWidth - margin - 60, yPosition);
      pdf.line(pageWidth - margin - 60, yPosition + 10, pageWidth - margin, yPosition + 10);
      pdf.setFontSize(8);
      pdf.text(contractorDetails?.name || bidDetails?.contractorname || "", pageWidth - margin - 60, yPosition + 14);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, yPosition + 18);

      // Save the PDF
      pdf.save(`${jobDetails?.title || 'Project'}_Agreement.pdf`);
      toast.success("Agreement PDF downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error(`Could not generate PDF: ${err.message}`);
      toast.info("Trying alternative print method...");
      handlePrint();
    }
  };

  // Add these state variables if not already present
  const [projectData, setProjectData] = useState(null);
  const [bidData, setBidData] = useState(null);
  const [clientData, setClientData] = useState(null);

  // In your useEffect, make sure to properly extract data from location state or fetch it
  useEffect(() => {
    // Extract data from location state or fetch it
    if (location.state) {
      const { project, bid, client } = location.state;
      
      if (project) setProjectData(project);
      if (bid) setBidData(bid);
      if (client) setClientData(client);
    } else {
      // Fetch data if not in state
      const fetchData = async () => {
        try {
          // Fetch project/job details first
          const projectResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
          setProjectData(projectResponse.data.job);
          
          // Fetch the ongoing work to get the timeline value
          // This is where we'll get the correct timeline
          const ongoingWorkResponse = await axios.get(`http://localhost:5000/api/ongoingworks/job/${jobId}`);
          
          // Log what we got for debugging
          console.log("Fetched ongoing work data:", ongoingWorkResponse.data);
          
          // Store the timeline value if available
          const timelineValue = ongoingWorkResponse.data.timeline || 
                                projectResponse.data.job?.timeline || 
                                30; // Default fallback value
          
          // Update the project data with the timeline
          setProjectData(prev => ({
            ...prev, 
            timeline: timelineValue
          }));
          
          // Fetch bid details if you have bid ID
          if (bidId) {
            const bidResponse = await axios.get(`http://localhost:5000/bids/${bidId}`);
            setBidData({
              ...bidResponse.data,
              timeline: timelineValue // Use the fetched timeline value
            });
          }
          
          // Fetch client details if you have client ID
          if (projectResponse.data?.job?.clientId) {
            const clientResponse = await axios.get(`http://localhost:5000/api/clients/${projectResponse.data.job.clientId}`);
            setClientData(clientResponse.data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load some project data");
        }
      };
      
      fetchData();
    }
  }, [location.state, jobId, bidId]);

  const calculateEndDate = (startDateString, timelineValue) => {
    try {
      // Parse the timeline value from the input (ensure it's a number)
      const timelineDays = parseInt(timelineValue) || 30;
      
      // Parse the start date (handle different formats)
      let startDate;
      if (typeof startDateString === 'string') {
        // Handle different date string formats
        if (startDateString.includes('/')) {
          // Format: DD/MM/YYYY or MM/DD/YYYY
          const parts = startDateString.split('/');
          // Assume British format DD/MM/YYYY if day appears to be <= 31
          if (parseInt(parts[0]) <= 31 && parts.length === 3) {
            startDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
          } else {
            startDate = new Date(startDateString);
          }
        } else {
          // Try standard parsing
          startDate = new Date(startDateString);
        }
      } else {
        // If it's already a Date object
        startDate = new Date(startDateString);
      }
      
      // Validate that we have a valid date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid start date:", startDateString);
        return "Invalid date";
      }
      
      // Calculate end date by adding timeline days
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + timelineDays);
      
      // Format the end date consistently
      return endDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error calculating end date:", error);
      return "Date calculation error";
    }
  };

  const handleBackNavigation = () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        // Use jwt-decode to decode the token
        const tokenData = jwtDecode(token);
        
        // Navigate based on role
        if (tokenData.role === 'Service Provider') {
          navigate('/ongoingproject');
        } else {
          // Default to client path
          navigate('/ongoing-works');
        }
      } else {
        // Default navigation if no token
        navigate('/ongoing-works');
      }
    } catch (error) {
      // If any errors in token parsing, use default navigation
      console.error("Error determining user role:", error);
      navigate('/ongoing-works');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Action buttons placed before the printable area */}
        <div className="mb-6 flex justify-end space-x-3">
          <button
            onClick={handleBackNavigation}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back 
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
                    <p className="text-sm text-gray-500">{clientDetails?.email || ''}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contractor:</h4>
                    <p className="text-md font-medium text-gray-900">{contractorDetails?.name || bidDetails?.contractorname}</p>
                    <p className="text-sm text-gray-500">{contractorDetails?.email || bidDetails?.email || ''}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Bid Amount:</h4>
                    <p className="text-md font-medium text-gray-900">LKR {parseFloat(bidDetails?.price).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Timeline:</h4>
                    <p className="text-md font-medium text-gray-900">
                      {/* Fix timeline display logic to avoid "days days" */}
                      {bidDetails?.timelineDisplay ? (
                        bidDetails.timelineDisplay  // This will use "startDate to endDate" format
                      ) : (
                        typeof bidDetails?.timeline === 'number' ? 
                        `${bidDetails.timeline} days` : // Add "days" only if we have a number
                        bidDetails?.timeline || '30 days' // Use as-is if already formatted or fallback
                      )}
                    </p>
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

                {/* Cost Breakdown Section - New Addition */}
                {bidDetails?.costBreakdown && bidDetails.costBreakdown.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown:</h4>
                    <div className="overflow-x-auto bg-gray-50 rounded">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (RS)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bidDetails.costBreakdown.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                LKR {parseFloat(item.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                              LKR {bidDetails.costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Work Schedule Section - New Addition */}
                {bidDetails?.timelineBreakdown?.workItems && bidDetails.timelineBreakdown.workItems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Work Schedule:</h4>
                    <div className="overflow-x-auto bg-gray-50 rounded">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bidDetails.timelineBreakdown.workItems.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.startDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.endDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.duration} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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