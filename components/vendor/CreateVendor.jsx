"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from 'next/link';
import { ArrowLeft, Users, Copy} from 'lucide-react';
import axios from 'axios';

export default function CreateVendor({ onClose }) {
const [activeTab, setActiveTab] = useState("other-details");
const [vendorName, setVendorName] = useState("");
const [companyName, setCompanyName] = useState("");
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [pan, setPan] = useState("");

const [address1, setAddress1] = useState("");
const [address2, setAddress2] = useState("");
const [city, setCity] = useState("");
const [state, setState] = useState("");
const [country, setCountry] = useState("");
const [zipCode, setZipCode] = useState("");
const [billingPhone, setBillingPhone] = useState("");

const [altName, setAltName] = useState("");
const [altPhone, setAltPhone] = useState("");
const [altEmail, setAltEmail] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = {
      vendorName,
      companyName,
      firstName,
      lastName,
      email,
      phone,
      pan,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      billingPhone,
      altName,
      altPhone,
      altEmail,
    };
  
    try {
        const response = await axios.post('/api/vendor', formData);
        console.log('vendor saved:', response.data);
        alert('Vendor submitted successfully!');
      } catch (error) {
        console.error('Error submitting vendor:', error.response?.data || error.message);
      }
  };
  
  const tabs = [
    { id: "other-details", label: "Other Details" },
    { id: "address", label: "Address" },
    { id: "contact", label: "Alternate Contact" },
  ];

  const {
    formState: { errors },
  } = useForm();

  const [paymentId] = useState(`PAY-${Date.now()}`);

  const onSubmit = (data) => {
    console.log("Form Data Submitted:", data);
  };

  return (

                <div className="w-[100%] mx-auto p-2 sm:p-6 bg-white text-gray-700 shadow-md rounded-lg">
                        <div className="my-6">
                            <h2 className="text-xl font-bold text-blue-600 flex"><span><ArrowLeft size={20} className="mt-1 mx-2" /></span>Create Vendor </h2>
                            <p className="ml-10 text-sm text-gray-600"> Add a new Vendor</p> 
                        </div>
                        <hr className="border-1 border-gray-300"/>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="max-w-xl lg:max-w-2xl">
                                {/* Display Name */}
                                <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className=" mb-1 font-medium">
                                    Vendor Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                    type="text"
                                    className="lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                    placeholder=""
                                />
                                </div>

                                {/* Company Name */}
                                <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium">
                                    Company Name<span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        type="text"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                        placeholder=""
                                    />
                                    <p className="hidden sm:block text-xs text-gray-700"> <span className="mx-2 lg: mx-4">outstanding Invoices</span><span className="mx-2 lg: mx-4">Amount</span><span className="mx-2 lg: mx-4">Receive Payment</span></p>
                                </div>
                                </div>

                                {/* Contact Information */}
                                <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium">Contact Information</label>
                                <div className="flex flex-col gap-4">
                                    <input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        type="text"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                        placeholder="First Name"
                                    />
                                    <input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        type="text"
                                        className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                        placeholder="Last Name"
                                    />
                                </div>
                                </div>

                                {/* Email Address */}
                                <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium">
                                    Vendor Email Address<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="text"
                                    className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                />
                                </div>

                                {/* Phone */}
                                <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                                <label className="block mb-1 font-medium">
                                    Vendor Phone<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    type="text"
                                    className="w-full lg:w-[500px] border-2 border-gray-200 rounded-lg px-3 py-2"
                                />
                                </div>
                            </div>
                            {/* 3 button Navbar */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {tabs.map((tab) => (
                                        <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`tab-button border-b-2 py-4 px-1 text-sm font-medium ${
                                            activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                        >
                                        {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            {/* Other Details */}
                            {activeTab === "other-details" && (
                            <div id="other-details" className="tab-content bg-white rounded-lg">
                                {/* ...Your PAN input and layout here... */}
                                <div className="space-y-6">
                                <div className="w-1/2 flex items-center create_customer_form">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 w-48">
                                    PAN
                                    </label>
                                    <input
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value)}
                                    type="text"
                                    name="pan"
                                    className="w-1/2 px-3 py-2 bg-white border border-gray-300 uppercase rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    minLength={10}
                                    maxLength={10}
                                    />
                                </div>
                                </div>
                            </div>
                            )}

                            {/* Address */}
                            {activeTab === "address" && (
                                <div id="address" className="tab-content bg-white rounded-lg mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Billing Address</h3>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Address Line 1</label>
                                            <input 
                                                value={address1}
                                                onChange={(e) => setAddress1(e.target.value)}
                                                id="billingAddressLine1" 
                                                name="billingAddressLine1" 
                                                placeholder="Address Line 1" 
                                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Address Line 2</label>
                                            <input 
                                                value={address2}
                                                onChange={(e) => setAddress2(e.target.value)}
                                                id="billingAddressLine2" 
                                                name="billingAddressLine2" 
                                                placeholder="Address Line 2" 
                                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">City</label>
                                            <input 
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                id="billingCity" 
                                                name="billingCity" 
                                                placeholder="City" 
                                                className="w-1/2 px-3 py-2 bg-white border capitalize  border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">State</label>
                                            <input 
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                id="billingState" 
                                                name="billingState" 
                                                placeholder="State" 
                                                className="w-1/2 px-3 py-2 bg-white border capitalize  border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Country</label>
                                            <input 
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                id="billingCountry" 
                                                name="billingCountry" 
                                                placeholder="Country" 
                                                className="w-1/2 px-3 py-2 bg-white border capitalize  border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Zip Code</label>
                                            <input 
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                id="billingZipCode" 
                                                name="billingZipCode" 
                                                placeholder="Zip Code" 
                                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Phone</label>
                                            <input 
                                                value={billingPhone}
                                                onChange={(e) => setBillingPhone(e.target.value)}
                                                id="billingPhone" 
                                                name="billingPhone" 
                                                placeholder="Phone" 
                                                type="tel" 
                                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}
                            
                            {/* Alternate Contact */}
                            {activeTab === "contact" && (
                                <div id="contact" className="tab-content bg-white rounded-lg mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Name</label>
                                    <input 
                                        value={altName}
                                        onChange={(e) => setAltName(e.target.value)}
                                        name="contactPersonName" 
                                        className="w-1/2 px-3 py-2 bg-white border capitalize  border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Email</label>
                                    <input 
                                        value={altEmail}
                                        onChange={(e) => setAltEmail(e.target.value)}
                                        type="email" 
                                        name="contactPersonEmail" 
                                        className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-48 mb-1">Phone</label>
                                    <input 
                                        value={altPhone}
                                        onChange={(e) => setAltPhone(e.target.value)}
                                        type="tel" 
                                        name="contactPersonPhone" 
                                        className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                </div>
                            </div>
                            )}
                            
                            {/* Submit Button */}
                            <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 transition">
                                Submit
                            </button>
                            <button
                                onClick={onClose}
                                className="border-2 mx-2 sm:mx-4 border-gray-200 text-black p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 transition"
                                >Close
                            </button>
                            </div>
                        </form>
                </div>
  );
}
