"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Users, Copy} from 'lucide-react';
import axios from 'axios';

export default function ReceivePaymentForm() {
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

const router = useRouter();
const searchParams = useSearchParams();
const vendorId = searchParams.get("vendorId");

useEffect(() => {
    if (vendorId) {
      // Fetch vendor details using vendorId
      axios
        .get(`/api/vendor?vendorId=${vendorId}`)
        .then((response) => {
          const data = response.data;
          setVendorName(data.vendorName || "");
          setCompanyName(data.companyName || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setPan(data.pan || "");
          setAddress1(data.address1 || "");
          setAddress2(data.address2 || "");
          setCity(data.city || "");
          setState(data.state || "");
          setCountry(data.country || "");
          setZipCode(data.zipCode || "");
          setBillingPhone(data.billingPhone || "");
          setAltName(data.altName || "");
          setAltPhone(data.altPhone || "");
          setAltEmail(data.altEmail || "");
        })
        .catch((error) => {
          console.error("Error fetching vendor details:", error.response?.data || error.message);
          alert("Error fetching vendor details. Please try again.");
        });
    }
  }, [vendorId]);
  
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
        let response;
        if (vendorId) {
          // Update existing vendor
          response = await axios.put(`/api/vendor?id=${vendorId}`, formData);       
        } else {
          // Create new vendor
          response = await axios.post("/api/vendor", formData)
        }
        console.log('Vendor saved:', response.data);
        alert(`Vendor ${vendorId ? 'updated' : 'created'} successfully!`);
        window.location.href = '/admin/vendor';
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
    <div className="w-full h-[150%] p-2 sm:py-6 bg-gray-200 dark:bg-gray-900">
    {/* main */}
    <div className="">
        {/* form */}
        <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
            <div className="my-6">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex">
                    <span>
                        <ArrowLeft size={20} className="mt-1 mx-2" />
                    </span>
                    {vendorId ? "Edit Vendor" : "Create Vendor"}
                </h2>
                <p className="ml-10 text-sm text-gray-600 dark:text-gray-400">
                    {vendorId ? "Edit the vendor details" : "Add a new Vendor"}
                </p>
            </div>
            <hr className="border-1 border-gray-300 dark:border-gray-700"/>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div className="max-w-xl lg:max-w-2xl">
                    {/* Display Name */}
                    <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                        <label className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                            Vendor Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            type="text"
                            className="lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder=""
                            autoComplete="off"
                        />
                    </div>

                    {/* Company Name */}
                    <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                            Company Name<span className="text-red-500">*</span>
                        </label>
                        <div>
                            <input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                type="text"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder=""
                                autoComplete="off"
                            />
                           
                        </div>
                    </div>

                   
                    {/* Email Address */}
                    <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                            Vendor Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoComplete="off"
                        />
                    </div>

                    {/* Phone */}
                    <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                            Vendor Phone<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            type="text"
                            className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoComplete="off"
                        />
                    </div>
                     {/* Contact Information */}
                     <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Contact Information</label>
                        <div className="flex flex-col gap-4">
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                type="text"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="First Name"
                                autoComplete="off"
                            />
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                type="text"
                                className="w-full lg:w-[500px] border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Last Name"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>
                
                {/* 3 button Navbar */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-button border-b-2 py-4 px-1 text-xs sm:text-sm font-medium ${
                                    activeTab === tab.id
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Other Details */}
                {activeTab === "other-details" && (
                <div id="other-details" className="tab-content bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">
                                PAN
                            </label>
                            <input
                                value={pan}
                                onChange={(e) => setPan(e.target.value)}
                                type="text"
                                name="pan"
                                className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 uppercase rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                minLength={10}
                                maxLength={10}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>
                )}

                {/* Address */}
                {activeTab === "address" && (
                <div id="address" className="tab-content bg-white dark:bg-gray-800 rounded-lg mt-4 p-4 md:p-6">
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Address</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Address Line 1</label>
                                <input 
                                    value={address1}
                                    onChange={(e) => setAddress1(e.target.value)}
                                    id="billingAddressLine1" 
                                    name="billingAddressLine1" 
                                    placeholder="Address Line 1" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Address Line 2</label>
                                <input 
                                    value={address2}
                                    onChange={(e) => setAddress2(e.target.value)}
                                    id="billingAddressLine2" 
                                    name="billingAddressLine2" 
                                    placeholder="Address Line 2" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">City</label>
                                <input 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    id="billingCity" 
                                    name="billingCity" 
                                    placeholder="City" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border capitalize border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">State</label>
                                <input 
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    id="billingState" 
                                    name="billingState" 
                                    placeholder="State" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border capitalize border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Country</label>
                                <input 
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    id="billingCountry" 
                                    name="billingCountry" 
                                    placeholder="Country" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border capitalize border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Zip Code</label>
                                <input 
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    id="billingZipCode" 
                                    name="billingZipCode" 
                                    placeholder="Zip Code" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Phone</label>
                                <input 
                                    value={billingPhone}
                                    onChange={(e) => setBillingPhone(e.target.value)}
                                    id="billingPhone" 
                                    name="billingPhone" 
                                    placeholder="Phone" 
                                    type="tel" 
                                    className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Alternate Contact */}
                {activeTab === "contact" && (
                <div id="contact" className="tab-content bg-white dark:bg-gray-800 rounded-lg mt-4 p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Name</label>
                            <input 
                                value={altName}
                                onChange={(e) => setAltName(e.target.value)}
                                name="contactPersonName" 
                                className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border capitalize border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Email</label>
                            <input 
                                value={altEmail}
                                onChange={(e) => setAltEmail(e.target.value)}
                                type="email" 
                                name="contactPersonEmail" 
                                className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-full md:w-48">Phone</label>
                            <input 
                                value={altPhone}
                                onChange={(e) => setAltPhone(e.target.value)}
                                type="tel" 
                                name="contactPersonPhone" 
                                className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>
                )}
                
                {/* Submit Button */}
                <div className="w-full flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 dark:bg-blue-700 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    >
                        {vendorId ? "Update" : "Submit"}
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
 