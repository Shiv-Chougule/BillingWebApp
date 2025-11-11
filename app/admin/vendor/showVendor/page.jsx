'use client';
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Overview from './components/Overview';
import Transactions from './components/Transactions';
//import VendorStatement from './components/History';
import { User } from 'lucide-react';
  
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  // { id: "vendorStatement", label: "Vendor Statement" },
];

function page() {
    const searchParams = useSearchParams();
    const idFromParams = searchParams.get('id');
    const [vendorId, setVendorId] = useState(idFromParams || '');
    const [vendors, setVendors] = useState([]);
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || "overview");
    const router = useRouter();
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchVendors = async () => {
        try {
          const response = await fetch('/api/vendor');
          const data = await response.json();
          setVendors(data?.vendors || []);
          
          // If no vendor is selected but we have vendors, redirect to first one
          if (!vendorId && data?.vendors?.length > 0) {
            const firstVendorId = data.vendors[0]._id;
            setVendorId(firstVendorId);
            router.replace(`/admin/vendor/showVendor?id=${firstVendorId}`);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          setVendors([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVendors();
    }, [vendorId, router]); 
    
     // Find the selected vendor by ID
     const selectedVendor = vendors.find(cust => cust._id === vendorId);
  
     if (!selectedVendor && vendors.length > 0) {
       // Handle case where vendor is not found but we have vendors
       const firstVendorId = vendors[0]._id;
       setVendorId(firstVendorId);
       router.replace(`/admin/vendors/showvendor?id=${firstVendorId}`);
       return null;
     }

     if (loading) {
      return <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
                <span className='text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
             </div>;
    }
    
    return (
      <div className='w-full h-full bg-white dark:bg-gray-900'>
        <div className='w-full h-[700px] col-span-8 mx-auto grid grid-cols-9 bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800'>
            {/* aside */}
            <div className='border-b border-r border-gray-300 dark:border-gray-700 col-span-2 overflow-auto hide-scrollbar'>
              <Aside 
                  vendors={vendors} 
                  vendorId={vendorId} 
                  setVendorId={(id) => {
                    setVendorId(id);
                    router.replace(`/admin/vendor/showVendor?id=${id}`);
                  }}
                  selectedVendor={selectedVendor}
              />
            </div>
            {/* main */}
            <div className='col-span-7 border-b-gray-300 dark:border-b-gray-700'>
              {/* Nav Options */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-button border-b-2 py-4 px-1 text-sm font-medium ${
                        activeTab === tab.id
                        ? "border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      >
                      {tab.label}
                    </button>
                  ))}                
                </nav>
              </div>  
              {/* Overview */}
              {activeTab === "overview" && (
                <div id="overview" className=''>
                   <Overview vendor={selectedVendor} /> 
                </div>         
              )}       
               {/* Transactions */}
              {activeTab === "transactions" && (
                <div id="transactions" className=''>
                   <Transactions vendor={selectedVendor} /> 
                </div>         
              )}    
              {/* vendorStatement */}
              {/* {activeTab === "vendorStatement" && (
                <div id="vendorStatement" className=''>
                   <VendorStatement /> 
                </div>         
              )}     */}
            </div>
        </div>
      </div>
    )
}

export default page
