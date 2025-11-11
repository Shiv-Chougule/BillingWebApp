// components/vendorInfoCard.jsx
import { Pencil, UserRound, CreditCard, MapPinHouse } from 'lucide-react';
import Link from 'next/link';

export default function vendorInfoCard({vendor}) {
  return (
    <div className="w-full py-8 bg-white dark:bg-gray-900 text-black dark:text-white p-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400"><UserRound/></span> Vendor Information
        </h2>
        <Link
          href={`/admin/vendor/createVendor?vendorId=${vendor._id}`}
        > 
            <button className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline">
                <Pencil className="w-4 h-4" />
                Edit Details
            </button>
        </Link>
      </div>
    
      {/* Vendor Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded transition-all duration-300 ease-in-out hover:shadow-md dark:hover:shadow-gray-700 hover:scale-[1.02]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Vendor Name</p>
            <p className="text-gray-900 dark:text-white">{vendor.vendorName}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded transition-all duration-300 ease-in-out hover:shadow-md dark:hover:shadow-gray-700 hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Company Name</p>
          <p className="text-gray-900 dark:text-white">{vendor.companyName}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded transition-all duration-300 ease-in-out hover:shadow-md dark:hover:shadow-gray-700 hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
          <p className="text-gray-900 dark:text-white">{vendor.firstName} {vendor.lastName} </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded transition-all duration-300 ease-in-out hover:shadow-md dark:hover:shadow-gray-700 hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
          <p className="text-gray-900 dark:text-white">{vendor.email}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded transition-all duration-300 ease-in-out hover:shadow-md dark:hover:shadow-gray-700 hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
          <p className="text-gray-900 dark:text-white">{vendor.phone}</p>
        </div>
      </div>
    
      {/* Billing & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg flex items-center gap-2 mb-2">
            <span className="text-blue-600 dark:text-blue-400"><CreditCard/></span> Billing Address
          </h3>
          <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-800 p-8 rounded space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <p>City : <span className='text-black dark:text-white'> {vendor.city} </span></p>
            <p>State : <span className='text-black dark:text-white'> {vendor.state} </span></p>
            <p>Country : <span className='text-black dark:text-white'> {vendor.country} </span></p>
            <p>Zip Code : <span className='text-black dark:text-white'> {vendor.zipCode} </span></p>
            <p>Phone : <span className='text-black dark:text-white'> {vendor.phone} </span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
