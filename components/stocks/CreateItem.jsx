"use client";

import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from 'react';
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

export default function CreatItem({onClose}) {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState('');
  const [HSNCode, setHSNCode] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [account, setAccount] = useState('');
  
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
      account
    };

    try {
      const response = await axios.post('/api/stocks', itemData);
      console.log('Item submitted:', response.data);
      alert('Item submitted successfully!');
      if(onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting item:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };
  
  return (
    <div className="max-w-[100%] mx-auto p-2 sm:py-6 bg-gray-50  shadow-md rounded-lg">
      <div className="my-6">
        <h2 className="text-xl font-bold my-6 text-blue-600 flex">
          <span><ArrowLeft size={20} className="mt-1 mx-2" /></span>Create Item
        </h2>
        <hr className="border-gray-300" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-w-xl lg:max-w-2xl">
            
            {/* Category Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">Category</label>
              <div ref={categoryDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 rounded-lg px-3 py-2 text-left"
                >
                  {categories.find(c => c.value === category)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-400 rounded-lg shadow-lg">
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value);
                          setShowCategoryDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                          category === cat.value ? 'bg-blue-50 text-blue-600' : ''
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
              <label className="block font-medium w-full lg:w-auto">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                placeholder="Enter item name"
              />
            </div>

            {/* Quantity */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">
                Quantity<span className="text-red-500">*</span>
              </label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                placeholder="Enter Quantity"
              />
            </div>

            {/* Type Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">Type</label>
              <div ref={typeDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 rounded-lg px-3 py-2 text-left"
                >
                  {measurementTypes.find(t => t.value === type)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {measurementTypes.map((measurement) => (
                      <div
                        key={measurement.value}
                        onClick={() => {
                          setType(measurement.value);
                          setShowTypeDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                          type === measurement.value ? 'bg-blue-50 text-blue-600' : ''
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
              <label className="block font-medium w-full lg:w-auto">HSN Code</label>
              <input
                value={HSNCode}
                onChange={(e) => setHSNCode(e.target.value)}
                type="text"
                placeholder="Enter HSN code"
                className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            {/* Item Code */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">Item Code</label>
              <input
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                type="text"
                placeholder="Enter item code"
                className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            {/* Selling Price */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">
                Selling Price<span className="text-red-500">*</span>
              </label>
              <input
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                type="number"
                step="0.01"
                className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                placeholder="Enter selling price"
              />
            </div>

            {/* Account Dropdown */}
            <div className="my-4 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <label className="block font-medium w-full lg:w-auto">
                Account<span className="text-red-500">*</span>
              </label>
              <div ref={accountDropdownRef} className="relative w-full lg:w-[500px]">
                <button
                  type="button"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="w-full flex items-center justify-between border-2 border-gray-200 rounded-lg px-3 py-2 text-left"
                >
                  {accounts.find(a => a.value === account)?.label || 'Select'}
                  <ChevronDown className={`transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showAccountDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-400 rounded-lg shadow-lg">
                    {accounts.map((acc) => (
                      <div
                        key={acc.value}
                        onClick={() => {
                          setAccount(acc.value);
                          setShowAccountDropdown(false);
                        }}
                        className={`px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                          account === acc.value ? 'bg-blue-50 text-blue-600' : ''
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
          <hr className="border-gray-300" />

          {/* Submit Button */}
          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 transition">
              Submit
            </button>
            <Link href="">
              <button
                onClick={onClose}
                className="border-2 mx-2 sm:mx-4 border-gray-200 text-black p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 transition"
              >Close</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}