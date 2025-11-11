"use client";

import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = Boolean(id);
  const router = useRouter();

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState('');
  const [HSNCode, setHSNCode] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Refs for dropdowns
  const categoryDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  // Use the custom hook for each dropdown
  useClickOutside(categoryDropdownRef, () => setShowCategoryDropdown(false));
  useClickOutside(typeDropdownRef, () => setShowTypeDropdown(false));
  useClickOutside(accountDropdownRef, () => setShowAccountDropdown(false));

  const {
    register,
    formState: { errors },
  } = useForm();

  // Data for dropdown options
  const categories = [
    { value: '', label: 'Select' },
    { value: 'product', label: 'Product' },
    { value: 'services', label: 'Services' }
  ];

  const measurementTypes = [
    { value: '', label: 'Select' },
    { value: 'Units', label: 'Units' },
    { value: 'kilogram', label: 'Kilogram(KG)' },
    { value: 'liter', label: 'Liter(L)' },
    { value: 'meter', label: 'Meter(m)' },
    { value: 'box', label: 'Box' },
    { value: 'bag', label: 'Bag' },
    { value: 'packet', label: 'Packet' },
    { value: 'piece', label: 'Piece' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'gallon', label: 'Gallon' },
    { value: 'ounce', label: 'Ounce(OZ)' },
    { value: 'pound', label: 'Pound(lb)' }
  ];

  const accounts = [
    { value: '', label: 'Select' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'raw materials', label: 'Raw Materials' },
    { value: 'finished goods', label: 'Finished Goods' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchItemData = async () => {
        try {
          const response = await axios.get(`/api/stocks?id=${id}`);
          const item = response.data.item || response.data;
          
          // Set form values from fetched data
          setCategory(item.category || '');
          setName(item.name || '');
          setQuantity(item.quantity || 1);
          setType(item.type || '');
          setHSNCode(item.HSNCode || '');
          setItemCode(item.itemCode || '');
          setSellingPrice(item.sellingPrice || '');
          setAccount(item.account || '');
        } catch (error) {
          console.error('Error fetching item data:', error);
          alert('Failed to load item data');
        } finally {
          setLoading(false);
        }
      };

      fetchItemData();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemData = {
      category,
      name,
      quantity: parseFloat(quantity),
      type,
      HSNCode,
      itemCode,
      sellingPrice: parseFloat(sellingPrice),
      purchasePrice: 0,
      account
    };

      try {
      if (isEditMode) {
        // Update existing item
        const response = await axios.put(`/api/stocks?id=${id}`, itemData);
        console.log('Item updated:', response.data);
        alert('Item updated successfully!');
      } else {
        // Create new item
        const response = await axios.post('/api/stocks', itemData);
        console.log('Item submitted:', response.data);
        alert('Item submitted successfully!');
      }
      window.location.href = '/admin/stocks';
    } catch (error) {
      console.error('Error submitting item:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };
  if (loading) {
    return (
      <div className="w-full h-full p-2 sm:py-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-blue-600 dark:text-blue-400 font-bold">Loading item data...</div>
      </div>
    );
  }
  return (
    <div className="w-full h-full p-2 sm:py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
        <h2 className="text-xl font-bold my-6 text-blue-600 dark:text-blue-400 flex">
          <span><ArrowLeft size={20} className="mt-1 mx-2" /></span>
          {isEditMode ? 'Edit Item' : 'Create Item'}
        </h2>
        <hr className="border-gray-300 dark:border-gray-700" />
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="max-w-xl lg:max-w-2xl">
            
            {/* Category Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">Category</label>
              <div ref={categoryDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.find(c => c.value === category)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-600 rounded-lg shadow-lg">
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value);
                          setShowCategoryDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-gray-900 dark:text-white ${
                          category === cat.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                        }`}
                      >
                        {cat.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="off"
                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter item name"
              />
            </div>

            {/* Quantity */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">
                Quantity<span className="text-red-500">*</span>
              </label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                autoComplete="off"
                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter Quantity"
              />
            </div>

            {/* Type Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">Type</label>
              <div ref={typeDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {measurementTypes.find(t => t.value === type)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-600 rounded-lg shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
                    {measurementTypes.map((measurement) => (
                      <div
                        key={measurement.value}
                        onClick={() => {
                          setType(measurement.value);
                          setShowTypeDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-gray-900 dark:text-white ${
                          type === measurement.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                        }`}
                      >
                        {measurement.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* HSN Code */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">HSN Code</label>
              <input
                value={HSNCode}
                onChange={(e) => setHSNCode(e.target.value)}
                type="text"
                autoComplete="off"
                placeholder="Enter HSN code"
                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Item Code */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">Item Code</label>
              <input
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                type="text"
                autoComplete="off"
                placeholder="Enter item code"
                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Selling Price */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">
                Selling Price<span className="text-red-500">*</span>
              </label>
              <input
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                type="number"
                step="0.01"
                autoComplete="off"
                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter selling price"
              />
            </div>

            {/* Account Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto text-gray-700 dark:text-gray-300">
                Account<span className="text-red-500">*</span>
              </label>
              <div ref={accountDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {accounts.find(a => a.value === account)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showAccountDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-600 rounded-lg shadow-lg">
                    {accounts.map((acc) => (
                      <div
                        key={acc.value}
                        onClick={() => {
                          setAccount(acc.value);
                          setShowAccountDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-gray-900 dark:text-white ${
                          account === acc.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                        }`}
                      >
                        {acc.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Submit Button */}
          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-700 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition">
              Submit
            </button>
            <Link href="">
              <button
                className="border-2 mx-2 sm:mx-4 border-gray-200 dark:border-gray-600 text-black dark:text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
              >Close</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 