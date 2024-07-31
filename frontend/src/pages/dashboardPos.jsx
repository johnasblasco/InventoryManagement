import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../context/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GrPowerReset } from 'react-icons/gr';
import Spinner from '../components/Spinner';

const DashboardPos = () => {
  const { user } = useAuthContext();
  const { darkMode } = useTheme();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [salesOrder, setSalesOrder] = useState([]);


  useEffect(() => {
    if(user){
      fetchSalesOrders();
    }
  }, [startDate, endDate, minPrice, maxPrice, sortBy, user]);

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5555/transaction', {
        params: {
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
          minPrice,
          maxPrice,
          sortBy,
          payment_status: 'paid'  // Add payment_status filter here
        },
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setSalesOrder(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      setLoading(false);
    }
  };
  


  const handleDateFilter = (event) => {
    const selectedOption = event.target.value;
    // Implement your filtering logic here based on the selectedOption
    console.log("Selected date filter option:", selectedOption);
    // Example filtering logic
  };

  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handleMinPriceChange = (event) => setMinPrice(event.target.value);
  const handleMaxPriceChange = (event) => setMaxPrice(event.target.value);
  const handleSortByChange = (event) => setSortBy(event.target.value);
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
  };
  const handleTransactionClick = (transactionId) => {
    // Implement transaction click logic
  };



  return (
    <div className={`${darkMode ? 'bg-light-BG' : 'dark:bg-dark-BG'}`}>
      <Navbar />
      <div className='h-full px-6 pt-[70px]'>
        <h1 className={`w-full py-5 text-3xl font-bold mt-5 ${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>
          Sales Order
        </h1>
        <div className='flex gap-4'>
          <div className={`h-[76vh] w-[22%] rounded-2xl p-4 flex flex-col justify-between ${darkMode ? 'bg-light-CARD' : 'dark:bg-dark-CARD'}`}>
            <div className={`flex flex-col space-y-4 ${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>
              <div className='flex flex-col'>
                <label htmlFor='startDate'>Date</label>
                <select
                  id='startDate'
                  onChange={handleDateFilter}
                  className={`border rounded p-2 my-1 border-none text-primary outline-none ${darkMode ? 'bg-light-ACCENT text-dark-TEXT' : 'dark:bg-dark-ACCENT light:text-light-TEXT'}`}
                >
                  <option value=''>Select Option</option>
                  <option value='today'>Today</option>
                  <option value='this_week'>This Week</option>
                  <option value='this_month'>This Month</option>
                </select>
              </div>

              <label className='text-sm text-gray-500 mb-1'>DATE RANGE</label>

              <div className='flex justify-center items-center'>
                <div className='flex flex-col'>
                  <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-CARD1' : 'dark:border-dark-CARD1'}`}>
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartDateChange}
                      dateFormat='MM-dd-yyyy'
                      className='p-1 bg-transparent w-[100%] outline-none'
                      placeholderText='MM-DD-YYYY'
                    />
                  </div>
                </div>

                <span className='text-2xl text-center h-full w-full text-[#a8adb0] mx-2'>-</span>

                <div className='flex flex-col'>
                  <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-CARD1' : 'dark:border-dark-CARD1'}`}>
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      dateFormat='MM-dd-yyyy'
                      className='bg-transparent w-[100%] p-1 outline-none'
                      placeholderText='MM-DD-YYYY'
                      minDate={startDate}
                    />
                  </div>
                </div>
              </div>

              <label className='text-sm text-gray-500 mb-1'>PRICE RANGE</label>

              <div className='flex justify-center items-center'>
                <div className='flex flex-col'>
                  <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-CARD1' : 'dark:border-dark-CARD1'}`}>
                    <input
                      type='number'
                      id='minPrice'
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className='border-none px-2 py-1 text-sm bg-transparent w-[100%] outline-none'
                      min='0'
                      placeholder='Min'
                    />
                  </div>
                </div>

                <span className='text-2xl text-center h-full w-full text-[#a8adb0] mx-2'>-</span>

                <div className='flex flex-col'>
                  <div className={`w-[130px] border rounded bg-transparent border-3 pl-1 ${darkMode ? 'border-light-CARD1' : 'dark:border-dark-CARD1'}`}>
                    <input
                      type='number'
                      id='maxPrice'
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className='border-none px-2 py-1 text-sm bg-transparent w-[100%] outline-none'
                      min='0'
                      placeholder='Max'
                    />
                  </div>
                </div>
              </div>

              <div className='flex flex-col'>
                <label htmlFor='sortBy'>Sort By</label>
                <select
                  id='sortBy'
                  value={sortBy}
                  onChange={handleSortByChange}
                  className={`border rounded p-2 my-1 border-none text-primary outline-none ${darkMode ? 'bg-light-ACCENT text-dark-TEXT' : 'dark:bg-dark-ACCENT light:text-light-TEXT'}`}
                >
                  <option value=''>Select Option</option>
                  <option value='price_asc'>Price Lowest to Highest</option>
                  <option value='price_desc'>Price Highest to Lowest</option>
                  <option value='customer_name_asc'>Customer Name A-Z</option>
                  <option value='customer_name_desc'>Customer Name Z-A</option>
                  <option value='transaction_id_asc'>ID Lowest to Highest</option>
                  <option value='transaction_id_desc'>ID Highest to Lowest</option>
                </select>
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <button
                className={`text-white py-2 px-4 rounded w-full h-[50px] flex items-center justify-center tracking-wide ${darkMode ? 'bg-light-TABLE text-dark-TEXT' : 'dark:bg-dark-TABLE light:text-light-TEXT'}`}
                onClick={handleResetFilters}
              >
                <GrPowerReset className='mr-2' />
                <p>Reset Filters</p>
              </button>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className='w-[80%] h-[76vh] flex flex-col gap-4 overflow-y-auto scrollbar-custom'>
              {salesOrder.map((transaction) => (
                <div
                  key={transaction._id}
                  className={`rounded-lg p-4 flex gap-4 cursor-pointer ${darkMode ? 'bg-light-CARD' : 'dark:bg-dark-CARD'}`}
                  onClick={() => handleTransactionClick(transaction.transaction_id)}
                >
                  <div className={`flex items-center justify-center p-4 w-[15%] border-r-2 ${darkMode ? 'border-light-ACCENT' : 'dark:border-dark-ACCENT'}`}>
                    <h1 className={`${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>{transaction.transaction_id}</h1>
                  </div>
                  <div className='flex justify-between items-center w-[85%]'>
                    <div className='p-4 w-[70%] flex flex-col gap-1'>
                      {transaction.products.map((item, idx) => (
                        <p key={idx} className={`${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>
                          ({item.quantity}) {item.product.name}
                        </p>
                      ))}
                    </div>
                    <div className={`flex gap-6 w-[50%] justify-between ${darkMode ? 'text-light-TABLE' : 'dark:text-dark-TABLE'}`}>
                      <div className='flex flex-col gap-1'>
                        <p className='text-gray-400'>DATE</p>
                        <p className='text-gray-400'>CUSTOMER</p>
                        <p className='text-gray-400'>TOTAL AMOUNT</p>
                      </div>
                      <div className={`flex flex-col gap-1 ${darkMode ? 'text-light-TEXT' : 'dark:text-dark-TEXT'}`}>
                        <p className='ml-auto'>{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                        <p className='ml-auto'>{transaction.customer ? transaction.customer.name : 'None'}</p>
                        <p className='ml-auto'>₱ {transaction.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPos;