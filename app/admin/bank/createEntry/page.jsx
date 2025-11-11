"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import axios from 'axios';

// Custom hook to detect clicks outside the component
function useClickOutside(ref, callback) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, callback]);
  }

export default function ReceivePaymentForm() {
    const [transactionID, setTransactionID] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [transactionType, setTransactionType] = useState('credit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    // Use the custom hook
    useClickOutside(dropdownRef, () => {
        setShowDropdown(false);
    });

    // to show today's date by default.
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTransactionDate(today);
    }, []);

    const transactionTypes = [
        { value: 'credit', label: 'Credit(+)' },
        { value: 'debit', label: 'Debit(-)' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const itemData = {
            transactionID,
            transactionDate,
            transactionType,
            amount: parseFloat(amount),
            description
        };
    
        try {
            const response = await axios.post('/api/bank', itemData);
            console.log('Entry submitted:', response.data);
            alert('Entry submitted successfully!');
            window.location.href = '/admin/bank';
        } catch (error) {
            console.error('Error submitting Entry:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
    };

    const handleTypeSelect = (type) => {
        setTransactionType(type);
        setShowDropdown(false);
    };

    return (
        <div className="w-full h-full p-2 sm:py-6 bg-gray-200 dark:bg-gray-900">
        <div className="">
            <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
                <h2 className="text-xl font-bold my-6 text-blue-600 dark:text-blue-400 flex">
                    <span><ArrowLeft size={20} className="mt-1 mx-2" /></span>Create Entry
                </h2>
                <hr className="border-gray-300 dark:border-gray-600"/>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-xl lg:max-w-2xl">
                        {/* transaction ID */}
                        <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                            <label className="block font-medium w-full lg:w-auto">
                                Transaction ID<span className="text-red-500">*</span>
                            </label>
                            <input
                                value={transactionID}
                                onChange={(e) => setTransactionID(e.target.value)}
                                type="number"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter Transaction ID"
                            />
                        </div>
                        
                        {/* Transaction Date */}
                        <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                            <label className="block font-medium w-full lg:w-auto">
                                Transaction Date<span className="text-red-500">*</span>
                            </label>
                            <input
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                type="date"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        {/* Custom Transaction Type Dropdown */}
                        <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                            <label className="block font-medium w-full lg:w-auto">
                                Transaction Type
                            </label>
                            <div ref={dropdownRef} className="relative w-full lg:w-[500px]">
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {transactionTypes.find(t => t.value === transactionType)?.label || 'Select'}
                                    <ChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`} />
                                </button>
                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-500 rounded-lg shadow-lg">
                                        {transactionTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                onClick={() => handleTypeSelect(type.value)}
                                                className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer ${
                                                    transactionType === type.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                            >
                                                {type.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
    
                        {/* Amount */}
                        <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                            <label className="block font-medium w-full lg:w-auto">
                                Amount<span className="text-red-500">*</span>
                            </label>
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter Amount"
                            />
                        </div>
                        
                        {/* Description */}
                        <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-start justify-between">
                            <label className="block font-medium w-full lg:w-auto mt-2">
                                Description<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="6"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter Description"
                            />
                        </div>
                    </div>
                    <hr className="border-gray-300 dark:border-gray-600"/>
    
                    {/* Submit Button */}
                    <div className="w-full flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 dark:bg-blue-700 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                            Save
                        </button>
                        <Link href="">
                            <button
                                className="border-2 mx-2 sm:mx-4 border-gray-200 dark:border-gray-600 text-black dark:text-gray-300 p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
                            >
                                Close
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
}