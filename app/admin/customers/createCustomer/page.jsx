"use client";

import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft, Users, Copy} from 'lucide-react';
import axios from 'axios';


export default function ReceivePaymentForm() {
  const [activeTab, setActiveTab] = useState("other-details");
  const [customerName, setCustomerName] = useState("");
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

  const [address3, setAddress3] = useState("");
  const [address4, setAddress4] = useState("");
  const [city2, setCity2] = useState("");
  const [state2, setState2] = useState("");
  const [country2, setCountry2] = useState("");
  const [zipCode2, setZipCode2] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");

  const [altName, setAltName] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [altEmail, setAltEmail] = useState("");

  const searchParams = useSearchParams();
  const customerId = searchParams.get('id');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!customerName) newErrors.customerName = "Customer Name is required";
    if (!companyName) newErrors.companyName = "Company Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!phone) newErrors.phone = "Phone is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const copyBillingToShipping = () => {
    setAddress3(address1);
    setAddress4(address2);
    setCity2(city);
    setState2(state);
    setCountry2(country);
    setZipCode2(zipCode);
    setShippingPhone(billingPhone);
  };
  // useEffect for updating the customer
  useEffect(() => {
    const fetchCustomerData = async () => {
      if ( customerId) {
        try {
          const response = await axios.get(`/api/customers?id=${customerId}`);
          const customerData = response.data.customer;
          
          // Set all form fields with the fetched customer data
          setCustomerName(customerData.customerName || "");
          setCompanyName(customerData.companyName || "");
          setFirstName(customerData.firstName || "");
          setLastName(customerData.lastName || "");
          setEmail(customerData.email || "");
          setPhone(customerData.phone || "");
          setPan(customerData.pan || "");
          
          // Address fields
          setAddress1(customerData.address1 || "");
          setAddress2(customerData.address2 || "");
          setCity(customerData.city || "");
          setState(customerData.state || "");
          setCountry(customerData.country || "");
          setZipCode(customerData.zipCode || "");
          setBillingPhone(customerData.billingPhone || "");
          
          // Shipping address fields
          setAddress3(customerData.address3 || "");
          setAddress4(customerData.address4 || "");
          setCity2(customerData.city2 || "");
          setState2(customerData.state2 || "");
          setCountry2(customerData.country2 || "");
          setZipCode2(customerData.zipCode2 || "");
          setShippingPhone(customerData.shippingPhone || "");
          
          // Alternate contact fields
          setAltName(customerData.altName || "");
          setAltPhone(customerData.altPhone || "");
          setAltEmail(customerData.altEmail || "");
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    };
  
    fetchCustomerData();
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      return;
    }
  
    const formData = {
      customerName,
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
      address3,
      address4,
      city2,
      state2,
      country2,
      zipCode2,
      shippingPhone,
      altName,
      altPhone,
      altEmail,
    };
  
    try {
      let response;
      if ( customerId) {
        // Update existing customer
        response = await axios.put(`/api/customers?id=${customerId}`, formData);
      } else {
        // Create new customer
        response = await axios.post('/api/customers', formData);
      }
  
      console.log('Customer saved:', response.data);
      alert(`Customer ${customerId ? 'updated' : 'created'} successfully!`);
      // Redirect to customers list or show success message
      window.location.href = '/admin/customers';
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Failed to ${customerId ? 'update' : 'create'} customer: ${error.response?.data?.error || error.message}`);
    } finally {
    setIsLoading(false);
    }
  };
  
  const tabs = [
    { id: "other-details", label: "Other Details" },
    { id: "address", label: "Address" },
    { id: "contact", label: "Alternate Contact" },
  ];

  const [paymentId] = useState(`PAY-${Date.now()}`);

  return (
    <div className="w-full h-[150%] p-2 sm:py-6 bg-gray-200 dark:bg-gray-900">
      {/* main */}
      <div className="">
        {/* form */}
        <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
          <div className="my-6">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex">
              <span><ArrowLeft size={20} className="mt-1 mx-2" /></span>
              {customerId ? 'Update Customer' : 'Create Customer'}
            </h2>
            <p className="ml-10 text-sm text-gray-600 dark:text-gray-400">
              {customerId ? 'Edit existing Customer' : 'Add a new Customer'}
            </p>
          </div>
          <hr className="border-1 border-gray-300 dark:border-gray-700"/>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-w-xl lg:max-w-2xl">
              {/* Display Name */}
              <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                <label className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <div className="lg:w-[500px]">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    type="text"
                    autoComplete="off"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder=""
                    required
                  />
                  {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>
              </div>
    
              {/* Company Name */}
              <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                  Company Name<span className="text-red-500">*</span>
                </label>
                <div className="lg:w-[500px]">
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    type="text"
                    autoComplete="off"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder=""
                    required
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  <p className="hidden sm:block text-xs text-gray-700 dark:text-gray-300"></p>
                </div>
              </div>
    
              {/* Email Address */}
              <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <div className="lg:w-[500px]">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="off"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
    
              {/* Phone */}
              <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                  Phone<span className="text-red-500">*</span>
                </label>
                <div className="lg:w-[500px]">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    autoComplete="off"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Contact Information</label>
                <div className="flex flex-col gap-4 lg:w-[500px]">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="First Name"
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    autoComplete="off"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>
            {/* 3 button Navbar */}
            <div className="border-b border-gray-300 dark:border-gray-700">
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
              <div id="other-details" className="tab-content bg-white dark:bg-gray-800 rounded-lg">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center create_customer_form">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:w-48">
                      PAN
                    </label>
                    <input
                      value={pan}
                      autoComplete="off"
                      onChange={(e) => setPan(e.target.value)}
                      type="text"
                      name="pan"
                      className="w-full sm:w-auto min-w-60 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 uppercase rounded-lg text-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      minLength={10}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            )}
    
            {/* Address */}
            {activeTab === "address" && (
              <div id="address" className="tab-content bg-white dark:bg-gray-800 rounded-lg mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Address</h3>
                    {[
                      { label: "Address Line 1", value: address1, setter: setAddress1 },
                      { label: "Address Line 2", value: address2, setter: setAddress2 },
                      { label: "City", value: city, setter: setCity },
                      { label: "State", value: state, setter: setState },
                      { label: "Country", value: country, setter: setCountry },
                      { label: "Zip Code", value: zipCode, setter: setZipCode },
                      { label: "Phone", value: billingPhone, setter: setBillingPhone, type: "tel" }
                    ].map((field, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:w-48">
                          {field.label}
                        </label>
                        <input
                          value={field.value}
                          autoComplete="off"
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.label}
                          type={field.type || "text"}
                          className="w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
    
                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <h3 className="text-lg font-medium mr-4 text-gray-900 dark:text-white">Shipping Address</h3>
                      <button
                        type="button"
                        onClick={copyBillingToShipping}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
                        id="copy_address"
                      >
                        <Copy size={14} />
                        Copy from Billing
                      </button>
                    </div>
                    {[
                      { label: "Address Line 1", value: address3, setter: setAddress3 },
                      { label: "Address Line 2", value: address4, setter: setAddress4 },
                      { label: "City", value: city2, setter: setCity2 },
                      { label: "State", value: state2, setter: setState2 },
                      { label: "Country", value: country2, setter: setCountry2 },
                      { label: "Zip Code", value: zipCode2, setter: setZipCode2 },
                      { label: "Phone", value: shippingPhone, setter: setShippingPhone, type: "tel" }
                    ].map((field, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:w-48">
                          {field.label}
                        </label>
                        <input
                          value={field.value}
                          autoComplete="off"
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.label}
                          type={field.type || "text"}
                          className="w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
    
            {/* Alternate Contact */}
            {activeTab === "contact" && (
              <div id="contact" className="tab-content bg-white dark:bg-gray-800 rounded-lg mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Name", value: altName, setter: setAltName },
                    { label: "Email", value: altEmail, setter: setAltEmail, type: "email" },
                    { label: "Phone", value: altPhone, setter: setAltPhone, type: "tel" }
                  ].map((field, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:w-48">
                        {field.label}
                      </label>
                      <input
                        value={field.value}
                        autoComplete="off"
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.label}
                        type={field.type || "text"}
                        className="w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white text-sm capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
    
            {/* Submit Button */}
            <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              >
                {isLoading ? 'Processing...' : customerId ? 'Update Customer' : 'Create Customer'}
              </button>
              <Link href="">
                <button
                  className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
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
