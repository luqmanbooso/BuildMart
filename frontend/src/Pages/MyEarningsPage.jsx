import React, { useState, useEffect } from 'react';
import { FaChartLine, FaMoneyBillWave, FaHourglassHalf, FaClipboardList, FaFileDownload, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import ContractorUserNav from '../components/ContractorUserNav';
import Footer from '../components/Footer'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MyEarningsPage = () => {
  const [currentUser, setCurrentUser] = useState({ id: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    totalPending: 0,
    ongoingWorks: [],
    milestones: []
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTab, setSelectedTab] = useState('summary');
  const [reportCriteria, setReportCriteria] = useState({
    period: 'all',
    type: 'earnings',
    status: 'all'
  });
  const [reportData, setReportData] = useState([]);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          setCurrentUser({ id: userId });
        } else {
          const decoded = jwtDecode(token);
          const id = decoded.id || decoded._id || decoded.userId;
          setCurrentUser({ id });
          
          if (id) localStorage.setItem('userId', id);
        }
      } else {
        setError('You must be logged in to view earnings');
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Authentication error. Please log in again.');
    }
  }, []);

  // Fetch earnings data 
  useEffect(() => {
    if (!currentUser.id) return;
    
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/api/ongoingworks/contractor/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Process the data
        processEarningsData(response.data);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError('Failed to load your earnings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [currentUser.id]);

  const processEarningsData = (ongoingWorks) => {
    let totalEarned = 0;
    let totalPending = 0;
    let allMilestones = [];
    
    // Prepare data for charts
    const projectLabels = [];
    const earnedAmounts = [];
    const pendingAmounts = [];

    // Process each ongoing work
    ongoingWorks.forEach(work => {
      // Add total earned from this work
      totalEarned += work.totalAmountPaid || 0;
      
      // Add total pending from this work
      totalPending += work.totalAmountPending || 0;
      
      // Process milestones
      if (work.milestones && work.milestones.length > 0) {
        work.milestones.forEach(milestone => {
          allMilestones.push({
            ...milestone,
            jobTitle: work.jobId?.title || 'Unnamed Job',
            jobId: work.jobId?._id || work.jobId,
            clientId: work.clientId,
            workId: work._id
          });
        });
      }
      
      // Add data for charts
      projectLabels.push(work.jobId?.title || 'Unnamed Job');
      earnedAmounts.push(work.totalAmountPaid || 0);
      pendingAmounts.push(work.totalAmountPending || 0);
    });

    // chart data
    setChartData({
      labels: projectLabels,
      datasets: [
        {
          label: 'Earned',
          data: earnedAmounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Pending',
          data: pendingAmounts,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }
      ]
    });

    //processed data
    setEarnings({
      totalEarned,
      totalPending,
      ongoingWorks,
      milestones: allMilestones
    });
  };

  // line chart
  const prepareEarningsOverTimeData = () => {
    const completedMilestones = earnings.milestones
      .filter(m => m.completedAt)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    
    // Prepare data
    const timeLabels = [];
    const cumulativeAmounts = [];
    let runningTotal = 0;
    
    completedMilestones.forEach(milestone => {
      const date = new Date(milestone.completedAt).toLocaleDateString();
      timeLabels.push(date);
      runningTotal += milestone.actualAmountPaid || parseInt(milestone.amount) || 0;
      cumulativeAmounts.push(runningTotal);
    });
    
    return {
      labels: timeLabels,
      datasets: [
        {
          label: 'Cumulative Earnings',
          data: cumulativeAmounts,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.1
        }
      ]
    };
  };
  
  // Filter milestones based on selected timeframe
  const filteredMilestones = () => {
    if (selectedTimeframe === 'all') return earnings.milestones;
    
    const now = new Date();
    let startDate;
    
    switch (selectedTimeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return earnings.milestones;
    }
    
    return earnings.milestones.filter(milestone => {
      if (milestone.completedAt) {
        const completionDate = new Date(milestone.completedAt);
        return completionDate >= startDate && completionDate <= now;
      }
      return false;
    });
  };

  // generate reports based on criteria
  const generateReport = () => {
    let filteredData = [];
    const { period, type, status } = reportCriteria;
    
    // Filter by period
    let startDate = null;
    const now = new Date();
    
    if (period !== 'all') {
      startDate = new Date();
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
    }

    if (type === 'earnings') {
      //earnings report
      filteredData = earnings.milestones.filter(milestone => {
        // Filter by period
        if (startDate && milestone.completedAt) {
          const completionDate = new Date(milestone.completedAt);
          if (completionDate < startDate) return false;
        }
        
        // Filter by status
        if (status !== 'all' && milestone.status !== status) return false;
        
        return true;
      }).map(milestone => ({
        projectName: milestone.jobTitle,
        milestoneName: milestone.name,
        status: milestone.status,
        amount: milestone.actualAmountPaid || parseInt(milestone.amount) || 0,
        completedDate: milestone.completedAt ? new Date(milestone.completedAt).toLocaleDateString() : 'Not completed'
      }));
    } else if (type === 'projects') {
      // Generate projects report
      filteredData = earnings.ongoingWorks.filter(work => {
        // Filter by status
        if (status !== 'all' && work.jobStatus !== status) return false;
        return true;
      }).map(work => ({
        projectName: work.jobId?.title || 'Unnamed Job',
        status: work.jobStatus,
        totalEarned: work.totalAmountPaid || 0,
        totalPending: work.totalAmountPending || 0,
        startDate: work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Unknown',
        completionDate: work.completionDate ? new Date(work.completionDate).toLocaleDateString() : 'Not completed'
      }));
    }
    
    setReportData(filteredData);
    setIsReportGenerated(true);
  };

  // Function to export as CSV
  const exportAsCSV = () => {
    if (!reportData.length) return;
    
    // Get headers from first object
    const headers = Object.keys(reportData[0]);
    
    // Convert data to CSV format
    let csvContent = headers.join(',') + '\n';
    
    reportData.forEach(item => {
      const row = headers.map(header => {
        // Handle commas and quotes in the data
        const cell = String(item[header]).replace(/"/g, '""');
        return `"${cell}"`;
      }).join(',');
      csvContent += row + '\n';
    });
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_report_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    if (!reportData.length) return;

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(22, 160, 133);
      doc.setFont('helvetica', 'bold');
      doc.text('BuildMart', 14, 15);
      
      // Add report title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`${reportCriteria.type === 'earnings' ? 'Earnings' : 'Projects'} Report`, 14, 25);
      
      // Add report details
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
      doc.text(`Period: ${reportCriteria.period === 'all' ? 'All Time' : 
               reportCriteria.period === 'week' ? 'Last 7 Days' : 
               reportCriteria.period === 'month' ? 'Last 30 Days' : 
               reportCriteria.period === 'quarter' ? 'Last 3 Months' : 'Last Year'}`, 14, 40);

      // Format data for table
      const headers = Object.keys(reportData[0]).map(header => 
        header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      );
      
      const data = reportData.map(item => 
        Object.values(item).map(value => 
          typeof value === 'number' ? `LKR ${value.toLocaleString()}` : value
        )
      );
      
      import('jspdf-autotable').then(({ default: autoTable }) => {
        autoTable(doc, {
          head: [headers],
          body: data,
          startY: 45, 
          theme: 'striped',
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        doc.save(`BuildMart_${reportCriteria.type}_report_${new Date().toISOString().slice(0,10)}.pdf`);
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ContractorUserNav/>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        <br /><br /><br /><br />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Earnings</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaMoneyBillWave className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-800">LKR {earnings.totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Pending Earnings Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <FaHourglassHalf className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-800">LKR {earnings.totalPending.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Projects Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaClipboardList className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-gray-800">{earnings.ongoingWorks.filter(w => w.jobStatus !== 'Completed').length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6">
            <button 
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === 'summary' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTab('summary')}
            >
              Earnings Summary
            </button>
            <button 
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === 'milestones' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTab('milestones')}
            >
              Milestone Payments
            </button>
            <button 
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === 'reports' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedTab('reports');
                setIsReportGenerated(false);
              }}
            >
              Reports
            </button>
          </nav>
        </div>

        {/* Timeframe Filter - Only show for summary and milestones tabs */}
        {selectedTab !== 'reports' && (
          <div className="mb-6 flex justify-end">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        )}

        {/* Content based on selected tab */}
        {selectedTab === 'summary' ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Earnings Summary</h3>
            </div>
            
            {/*Chart implementation */}
            <div className="p-6" style={{ height: '350px' }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Project Earnings Breakdown'
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount (LKR)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Projects'
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* Add earnings over time line chart */}
            <div className="px-6 pb-6 pt-2" style={{ height: '350px' }}>
              <h4 className="text-md font-medium text-gray-800 mb-4">Earnings Over Time</h4>
              <Line
                data={prepareEarningsOverTimeData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `LKR ${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount (LKR)'
                      },
                      ticks: {
                        callback: function(value) {
                          return 'LKR ' + value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* Projects Summary */}
            <div className="px-6 py-5">
              <h4 className="text-md font-medium text-gray-800 mb-4">Project Earnings</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earned</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earnings.ongoingWorks.map((work) => (
                      <tr key={work._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {work.jobId?.title || 'Unnamed Job'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${work.jobStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                             work.jobStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                             work.jobStatus === 'On Hold' ? 'bg-yellow-100 text-yellow-800' : 
                             'bg-gray-100 text-gray-800'}
                          `}>
                            {work.jobStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          LKR {work.totalAmountPaid?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          LKR {work.totalAmountPending?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : selectedTab === 'milestones' ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Milestone Payments</h3>
            </div>
            
            {filteredMilestones().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Amount</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Paid</th>
                      <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMilestones().map((milestone, idx) => (
                      <tr key={`${milestone.workId}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {milestone.jobTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{milestone.name}</div>
                          {milestone.description && (
                            <div className="text-xs text-gray-500 mt-1">{milestone.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          LKR {parseInt(milestone.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {milestone.status === 'Completed' ? 
                            <span className="font-medium text-green-600">
                              LKR {milestone.actualAmountPaid?.toLocaleString() || '0'}
                            </span> : 
                            <span className="text-gray-400">-</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                             milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                             'bg-yellow-100 text-yellow-800'}
                          `}>
                            {milestone.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {milestone.completedAt ? 
                            new Date(milestone.completedAt).toLocaleDateString() : 
                            <span className="text-gray-400">-</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No milestone payments found for the selected timeframe.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Generate Reports</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Report Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                  <select
                    value={reportCriteria.period}
                    onChange={(e) => setReportCriteria({...reportCriteria, period: e.target.value})}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportCriteria.type}
                    onChange={(e) => setReportCriteria({...reportCriteria, type: e.target.value})}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="earnings">Earnings Report</option>
                    <option value="projects">Projects Report</option>
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={reportCriteria.status}
                    onChange={(e) => setReportCriteria({...reportCriteria, status: e.target.value})}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    {reportCriteria.type === 'projects' && <option value="On Hold">On Hold</option>}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={generateReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaChartLine className="mr-2" />
                  Generate Report
                </button>
                
                {isReportGenerated && reportData.length > 0 && (
                  <button
                    onClick={exportAsPDF}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaFilePdf className="mr-2" />
                    Export as PDF
                  </button>
                )}
              </div>
              
              {isReportGenerated && (
                <>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    {reportCriteria.type === 'earnings' ? 'Earnings Report' : 'Projects Report'}
                  </h4>
                  
                  {reportData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            {Object.keys(reportData[0]).map((header, idx) => (
                              <th 
                                key={idx} 
                                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.map((item, idx) => (
                            <tr key={idx}>
                              {Object.values(item).map((value, valueIdx) => (
                                <td key={valueIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {typeof value === 'number' ? (
                                    valueIdx === 0 ? value : `LKR ${value.toLocaleString()}`
                                  ) : (
                                    value
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No data found matching your criteria.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyEarningsPage;