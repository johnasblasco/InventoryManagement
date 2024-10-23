import React, { useState, useRef, useEffect } from 'react';
import '../App.css'
import axios from 'axios';
import ReactToPrint from 'react-to-print';
import { useAdminTheme } from '../context/AdminThemeContext';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuthContext } from '../hooks/useAuthContext';
import DateRangeModal from '../components/DateRangeModal'; // Import your modal
import { HiOutlineRefresh } from "react-icons/hi";
import SalesSummary from '../components/reportsComponent/SalesSummary';
import SalesBreakdown from '../components/reportsComponent/SalesBreakdown';
import SalesByCategory from '../components/reportsComponent/SalesByCategory';
import PaymentMethods from '../components/reportsComponent/PaymentMethods';
import RefundSummary from '../components/reportsComponent/RefundSummary';
import VATSummary from '../components/reportsComponent/VATSummary';
import { jsPDF } from 'jspdf'; // Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas
import reportLogo from '../assets/reportLogo.png'; 

const SalesReport = () => {
  const { user } = useAuthContext();
  const { darkMode } = useAdminTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilter, setDateFilter] = useState('');


  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

  const handleDateFilterChange = (filter) => {
    setSelectedDate(filter); // Update the selected date filter
    if (filter === 'Custom Date') {
        setIsModalOpen(true); // Open the modal when "Custom Date" is selected
        return; // Exit the function early
    }

    const today = new Date();
    
    // Existing cases...
    switch (filter) {
        case 'Today':
            setStartDate(new Date(today.setHours(0, 0, 0, 0)));
            setEndDate(new Date(today.setHours(23, 59, 59, 999)));
            break;
        case 'This Week':
            const dayOfWeek = today.getDay();
            const startDateOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek));
            setStartDate(new Date(startDateOfWeek.setHours(0, 0, 0, 0)));
            setEndDate(new Date(today.setHours(23, 59, 59, 999)));
            break;
        case 'This Month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(startOfMonth);
            setEndDate(new Date(today.setHours(23, 59, 59, 999)));
            break;
        default:
            setStartDate(null);
            setEndDate(null);
    }
};


  const [reportIncluded, setReportIncluded] = useState({
    'Sales by Category': false,
    'Payment Method': false,
    'Refunds Summary': false,
    'VAT Summary': false,
  });


  const handleSelectedCategoryChange = (e) => {
    setSelectedCategory(e.target.value); // Update the selected category
  };



  const handleCheckboxChangeReports = (status) => {
    setReportIncluded((prevState) => ({
      ...prevState,
      [status]: !prevState[status],
    }));
  };

  const handleConfirmDates = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
    setIsModalOpen(false);
};

  // Create a ref for the content to be printed
  const componentRef = useRef();

  const fetchSales = async () => {
    try {
      const response = await axios.get('http://localhost:5555/transaction', {
        params: {
          payment_status: 'paid',
        },
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      setSalesData(response.data.data);
      setFilteredSalesData(response.data.data); // Initialize filtered data
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  useEffect(() => {
    if (!salesData.length) return;

    let filteredData = [...salesData];

    // Filter by selected category
    if (selectedCategory) {
      filteredData = filteredData.filter(item => 
        item.products.some(product => product.product.category === selectedCategory) // Assuming products have a category field
      );
    }


    if (startDate && endDate) {
      filteredData = filteredData.filter(item => {
          const transactionDate = new Date(item.transaction_date);
          return transactionDate >= startDate && transactionDate <= endDate;
      });
    }


    // Update filtered sales data state
    setFilteredSalesData(filteredData);
  }, [salesData, selectedCategory, startDate, endDate]);


const handleResetFilters = () => {
  setSelectedDate('');
  setReportIncluded({
    'Sales by Category': false,
    'Payment Method': false,
    'Refunds Summary': false,
    'VAT Summary': false,
  })
  setFilteredSalesData(salesData); // Reset filtered data
};


const handleExportPdf = () => {
  const input = componentRef.current;

  // Use html2canvas to capture the div as an image
  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');

    const imgWidth = pdf.internal.pageSize.getWidth() - 20; // Leave some margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height based on width

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save('sales-report.pdf');
  });
};


  
  return (
    <div className={`w-full h-full ${darkMode ? 'bg-light-bg' : 'bg-dark-bg'}`}>
      <DashboardNavbar />
      <div className='pt-[70px] px-6 py-4 w-full h-full'>
      <style>
          {`
            @media print {
              .print-header {
                  width: 100%;
                  border-bottom: 2px solid black;
                  padding: 10px 0;
                  gap: 20px;
              }

              .print-header img {
                  max-width: 80%; /* Adjust as necessary */
                  height: auto; /* Maintain aspect ratio */
              }

              .print-header h1 {
                  font-weight: 600;
                  font-size: 2.25rem;
                  visibility: visible;
              }

              /* Hide other elements if necessary */
              .other-elements { /* Adjust as needed */
                  display: none;
              }
            }

            @media screen {
              .print-header {
                  display: none; /* Hide on screen */
              }
            }
          `}
        </style>

      <div className='flex items-center justify-center  my-2 h-[10%]'>
      <h1 className={`w-full text-3xl font-bold ${darkMode ? 'text-light-textPrimary' : 'text-dark-textPrimary'}`}>
            Sales Report
          </h1>
          <div className='h-full w-[40%] flex items-center justify-end gap-2'>
            <ReactToPrint
                trigger={() => <button className={`text-white rounded-md w-[30%] h-[80%] ${darkMode ? 'bg-light-textSecondary' : 'bg-dark-textSecondary'}`}>Print Report</button>}
                content={() => componentRef.current}
                pageStyle="print"
                
              /> 
            
            <button className={`text-white rounded-md w-[30%] h-[80%] ${darkMode ? 'bg-light-button' : 'bg-dark-button'}`} onClick={handleExportPdf}>Export as PDF</button>
            </div>
        </div>
        <div className='flex gap-4 items-center justify-center'>
        <div className={`h-[78vh] max-h-[84%] w-[22%] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto ${darkMode ? 'bg-light-container' : 'dark:bg-dark-container'}`}>
         <div className='flex flex-col gap-6 flex-grow'>
              <div className="flex flex-col gap-4">
                <div className='flex flex-col'>
                  <label htmlFor='date' className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>Date</label>
                  <select 
                      id='date'
                      value={selectedDate}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      className={`border rounded p-2 my-1 
                        ${selectedDate === '' 
                          ? 'bg-transparent text-black border-black' 
                          : 'bg-transparent text-black'} 
                        outline-none font-semibold`}
                  >
                      <option value=''>Select Date</option>
                      <option value='Today'>Today</option>
                      <option value='This Week'>This Week</option>
                      <option value='This Month'>This Month</option>
                      <option value='Custom Date'>Custom Date</option>
                  </select>      
                </div>




                {/* Category Dropdown */}
                <div className='flex flex-col'>
                  <label htmlFor='category' className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>Product Category</label>
                  <select
                    id='category'
                    value={selectedCategory} // Set the value of the select to the state
                    onChange={handleSelectedCategoryChange} // Use the new handler
                    className={`border rounded p-2 my-1 
                      ${selectedCategory === '' 
                        ? (darkMode ? 'bg-transparent text-black border-black' : 'bg-transparent') 
                        : (darkMode 
                          ? 'bg-light-activeLink text-light-primary' 
                          : 'bg-transparent text-black')} 
                      outline-none font-semibold`}
                  >
                    <option value=''>Select Category</option>
                    <option value='Components'>Components</option>
                    <option value='Peripherals'>Peripherals</option>
                    <option value='Accessories'>Accessories</option>
                    <option value='PC Furniture'>PC Furniture</option>
                    <option value='OS & Software'>OS & Software</option>
                  </select>
                </div>

                <div className='flex flex-col gap-2 py-2 pb-8'>
                  <span className={`text-md font-semibold ${darkMode ? 'text-dark-border' : 'dark:text-light-border'}`}>Included Reports</span>
                  {Object.keys(reportIncluded).map((status) => (
                    <label key={status} className='custom-checkbox flex items-center'>
                      <input 
                        type='checkbox' 
                        checked={reportIncluded[status]} 
                        onChange={() => handleCheckboxChangeReports(status)} 
                      />
                      <span className='checkmark'></span>
                      <span className={`label-text ${darkMode ? 'text-light-textPrimary' : 'dark:text-dark-textPrimary'}`}>{status}</span>
                    </label>
                  ))}
                </div>


              </div>
            </div>

            <button
              className={`text-white py-2 px-4 rounded w-full h-[50px] flex items-center justify-center tracking-wide font-medium bg-transparent border-2 
                ${darkMode ? 'hover:bg-opacity-30 hover:bg-dark-textSecondary' : 'hover:bg-opacity-30 hover:bg-light-textSecondary'}`}
                    onClick={handleResetFilters}
              >
                <HiOutlineRefresh className={`mr-2 text-2xl ${darkMode ? 'text-dark-textSecondary' : 'text-dark-textSecondary' }`} />
                <p className={`text-lg ${darkMode ? 'text-dark-textSecondary' : 'text-dark-textSecondary' }`}>Reset Filters</p>
              </button>
          </div>

          
          
          <div className={`h-[78vh] w-[77%] overflow-auto rounded-2xl px-4 py-2 flex flex-col ${darkMode ? 'bg-light-container text-light-textPrimary' : 'bg-dark-container text-dark-textPrimary'}`}>
            <div ref={componentRef} className="sales-report-content">
                <div className="print-header flex items-center justify-center flex-col">
                  <img src={reportLogo} alt="Report Logo" className="report-logo" />
                  <h1 className="report-title">Sales Report</h1>
                </div>
                <div className="print-header flex items-center justify-start">
                  <div className='w-[50%] flex'>
                    <div className='w-[30%]  flex flex-col items-start justify-start text-gray-400'>
                      <p>DATE FILTER</p>
                      <p>GENERATED ON</p>
                    </div>
                    <div className='w-[70%]  flex items-start justify-start flex-col '>
                     <p>
                        {startDate && endDate 
                          ? `${formatDate(startDate.toLocaleDateString())} - ${formatDate(endDate.toLocaleDateString())}` 
                          : 'No Date Filter Applied'}
                      </p>
                      <p>{formatDate(new Date().toLocaleString())}</p>
                    </div>
                  </div>
                </div>


                  <SalesSummary salesData={filteredSalesData} />
                  <div className='flex flex-col gap-4'>
                  <SalesBreakdown salesData={filteredSalesData} />
                    {reportIncluded['Sales by Category'] && (<SalesByCategory salesData={filteredSalesData} />)}
                    {reportIncluded['Payment Method'] && (<PaymentMethods salesData={filteredSalesData} />)}
                    {reportIncluded['Refunds Summary'] && (<RefundSummary salesData={filteredSalesData} />)}
                    {reportIncluded['VAT Summary'] && (<VATSummary salesData={filteredSalesData} />)}
                  </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <DateRangeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={handleConfirmDates} 
      />


    </div>
  );
};

export default SalesReport;
