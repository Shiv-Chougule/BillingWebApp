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
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [description, setDescription] = useState('');
    const [invoiceID, setInvoiceID] = useState('');
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);
    
    // Dropdown states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);

    // Use the custom hook
    useClickOutside(dropdownRef1, () => {
        setShowCategoryDropdown(false);
    });
    
    useClickOutside(dropdownRef2, () => {
        setShowPaymentMethodDropdown(false);
    });
    
    // to show today's date by default.
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    // Category options
    const categoryOptions = [
        { value: 'office', label: 'Office Expenses' },
        { value: 'travel', label: 'Travel & Transportation' },
        { value: 'food', label: 'Food & Beverages' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'salary', label: 'Salary & Wages' },
        { value: 'stocks purchases', label: 'Stocks purchases' }
    ];

    // Payment method options
    const paymentMethodOptions = [
        { value: 'card', label: 'Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const itemData = {
            category,
            date,
            amount: parseFloat(amount),
            paymentMethod,
            description,
            invoiceID
        };
    
        try {
            const response = await axios.post('/api/expenses', itemData);
            console.log('Item submitted:', response.data);
            alert('Item submitted successfully!');
            window.location.href = '/admin/expenses';
        } catch (error) {
            console.error('Error submitting item:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
    };

    const handleCategorySelect = (value) => {
        setCategory(value);
        setShowCategoryDropdown(false);
    };

    const handlePaymentMethodSelect = (value) => {
        setPaymentMethod(value);
        setShowPaymentMethodDropdown(false);
    };

    const {
        register,
        formState: { errors },
    } = useForm();

    const [paymentId] = useState(`PAY-${Date.now()}`);

    const onSubmit = (data) => {
        console.log("Form Data Submitted:", data);
    };

    return (
        <div className="w-full h-full p-2 sm:py-6 bg-gray-200 dark:bg-gray-900">
            {/* main */}
            <div className="">
                {/* form */}
                <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
                    <h2 className="text-xl font-bold my-6 text-blue-600 dark:text-blue-400 flex">
                        <span><ArrowLeft size={20} className="mt-1 mx-2" /></span>Create Expenses
                    </h2>
                    <hr className="border-gray-300 dark:border-gray-700"/>
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div className="max-w-xl lg:max-w-2xl">
                            {/* Payment Date */}
                            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                                    Date<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    type="date"
                                    className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    autoComplete="off"
                                />
                            </div>
                            
                            {/* Category Dropdown */} 
                            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                                <label className="block font-medium text-gray-900 dark:text-gray-100 w-full lg:w-auto">
                                    Category
                                </label>
                                <div ref={dropdownRef1} className="relative w-full lg:w-[500px]">
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {categoryOptions.find(c => c.value === category)?.label || 'Select a category'}
                                        <ChevronDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showCategoryDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-600 rounded-lg shadow-lg">
                                            {categoryOptions.map((categoryOption) => (
                                                <div
                                                    key={categoryOption.value}
                                                    onClick={() => handleCategorySelect(categoryOption.value)}
                                                    className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-gray-900 dark:text-white ${
                                                        category === categoryOption.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                                                    }`}
                                                >
                                                    {categoryOption.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                                    Amount<span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        type="number"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter Amount"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            
                            {/* Payment Method Dropdown */}
                            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
                                <label className="block font-medium text-gray-900 dark:text-gray-100 w-full lg:w-auto">
                                    Payment Method<span className="text-red-500">*</span>
                                </label>
                                <div ref={dropdownRef2} className="relative w-full lg:w-[500px]">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                                        className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {paymentMethodOptions.find(p => p.value === paymentMethod)?.label || 'Select payment mode'}
                                        <ChevronDown className={`transition-transform ${showPaymentMethodDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showPaymentMethodDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-600 rounded-lg shadow-lg">
                                            {paymentMethodOptions.map((method) => (
                                                <div
                                                    key={method.value}
                                                    onClick={() => handlePaymentMethodSelect(method.value)}
                                                    className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-gray-900 dark:text-white ${
                                                        paymentMethod === method.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                                                    }`}
                                                >
                                                    {method.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                                    Description<span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="6"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter Description"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            
                            {/* Invoice ID */}
                            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                                    Invoice ID<span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        value={invoiceID}
                                        onChange={(e) => setInvoiceID(e.target.value)}
                                        type="number"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter Invoice ID (if applicable)"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="border-gray-300 dark:border-gray-700"/>

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
                                    className="border-2 mx-2 sm:mx-4 border-gray-200 dark:border-gray-600 text-black dark:text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
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