import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IoCaretBackOutline } from "react-icons/io5";
import ReactToPrint from 'react-to-print';
import axios from 'axios';
import { API_DOMAIN } from "../utils/constants";

const ReplacementReceipt = ({ rma, newSerialNumber, oldSerialNumber, onClose }) => {
    const { darkMode } = useTheme();
    const componentRef = useRef();
    const [customer, setCustomer] = useState(null);
    const baseURL = API_DOMAIN;

    useEffect(() => {
        const fetchCustomer = async () => {
          try {
            const response = await axios.get(`${baseURL}/customer/${rma.customerID}`); // Adjust the URL as needed
            setCustomer(response.data);
          } catch (error) {
            console.error('Error fetching customer data:', error);
          }
        };
    
        fetchCustomer();
      }, [rma.customerID]);



    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50`}>
            <div className={`h-full w-full rounded-md flex items-end justify-center shadow-md ${darkMode ? "text-light-textPrimary bg-light-bg" : "text-dark-textPrimary bg-dark-bg"}`}>

                    <style>
                {`
                    @media print {
                    .print-flex {
                        display: flex;
                        width: 100%;
                    }
                    
                    .print-label {
                        width: 40%;
                        font-weight: bold;
                    }
                    
                    .print-value {
                        width: 60%;
                        font-weight: normal;
                    }

                    .no-print {
                        display: none !important; /* Hide elements marked as no-print */
                    }
                    }
                `}
                </style>

                <div className='flex items-center justify-between w-full h-[10%] top-0 py-4 fixed z-50 px-6 bg-white'>
                    <button className={`flex gap-2 items-center rounded-md hover:underline`} onClick={onClose}>
                        <IoCaretBackOutline /> Back to RMA
                    </button>
                    <div className='flex gap-4 items-end justify-center'>
                        <ReactToPrint
                            trigger={() => (
                                <button className={`py-2 px-4 rounded-md text-white ${darkMode ? 'bg-light-primary' : 'bg-light-primary'}`}>
                                    Print Receipt
                                </button>
                            )}
                            content={() => componentRef.current}
                        />
                    </div>
                </div>
                <div className={`w-full h-[90%] flex items-center justify-center overflow-y-auto ${darkMode ? 'text-light-textPrimary border-light-border bg-light-container' : 'text-light-textPrimary  border-gray-600 bg-dark-container'}`}>
                    <div className={`w-full h-full items-center flex flex-col justify-start p-4 rounded-md`}>
                        <div ref={componentRef} className={`flex flex-col w-full h-full justify-start gap-4 rounded-lg px-6`}>
                            {/* Company Information */}
                            <div className='flex w-full items-center justify-between border-b-2 border-black py-4'>
                                <p className='text-4xl font-semibold text-center w-full'>Refund Receipt</p>
                            </div>

                            <div className='flex w-full items-center justify-between border-b-2 border-black'>
                                <div className='text-left mb-6'>
                                    <h2 className='font-bold'>Irig Computer Trading</h2>
                                    <p>23 Gen. Tinio St. Bgy 85, Caloocan, Philippines</p>
                                    <p>Tel. No. 8-364-6039</p>
                                    <p>CP. No. 0923-444-1030</p>
                                    <p>irigcomputers@gmail.com</p>
                                </div>

                                <div className='text-right mb-6'>
                                    <h2 className='text-2xl font-bold'>Invoice No:</h2>
                                    <p className='text-xl font-bold'>{rma.transaction}</p>
                                    <p>Issued date:</p>
                                    <p className='font-bold'>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className='w-full flex justify-start items-center border-b-2 border-black pb-4'>
                                <div>
                                <h4 className='font-bold'>Billed to</h4>
                                <p>{customer?.name || 'N/A'}</p>
                                <p>{customer?.address || 'N/A'}</p>
                                <p>{customer?.email || 'N/A'}</p>
                                <p>{customer?.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className='w-full flex flex-col justify-start items-center pb-4'>
                                <h2 className='text-2xl font-bold w-full text-start pb-4'>Replacement Info</h2>

                                <div className={`w-full flex flex-col border-b-2 border-black pb-4 gap-1`}>
                                    <div className='flex w-[60%]'>
                                        <p className={`print-label font-bold w-[25%] ${darkMode ? 'text-light-texPrimary' : 'text-dark-texPrimary'}`}>Product Name:</p>
                                        <p className='print-value font-semibold text-start w-[70%]'>{rma.product}</p>
                                    </div>
                                    <div className='flex w-[60%]'>
                                        <p className={`print-label font-bold w-[25%] ${darkMode ? 'text-light-texPrimary' : 'text-dark-texPrimary'}`}>New Serial Number:</p>
                                        <p className='print-value font-semibold text-start w-[70%]'>{newSerialNumber}</p>
                                    </div>
                                    <div className='flex w-[60%]'>
                                        <p className={`print-label font-bold w-[25%] ${darkMode ? 'text-light-texPrimary' : 'text-dark-texPrimary'}`}>Replaced Serial Number:</p>
                                        <p className='print-value font-semibold text-start w-[70%]'>{oldSerialNumber}</p>
                                    </div>
                                    <div className='flex w-[60%]'>
                                        <p className={`print-label font-bold w-[25%] ${darkMode ? 'text-light-texPrimary' : 'text-dark-texPrimary'}`}>Cashier:</p>
                                        <p className='print-value font-semibold text-start w-[70%]'>{rma.cashier}</p>
                                    </div>
                                    <div className='flex w-[60%]'>
                                        <p className={`print-label font-bold w-[25%] ${darkMode ? 'text-light-texPrimary' : 'text-dark-texPrimary'}`}>Product Price:</p>
                                        <p className='print-value font-semibold text-start w-[60%]'>₱ {rma.product_price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplacementReceipt;
