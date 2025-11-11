'use client';
import React, {useState, useEffect} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Overview from './components/Overview';
//import Transactions from './components/Transactions';
import InvoicesView from './components/InvoicesView';
  
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "InvoicesView", label: "Invoices" },
];

function page() {
  const searchParams = useSearchParams();
  const idFromParams = searchParams.get('id');
  const [customerId, setCustomerId] = useState(idFromParams || '');
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "overview");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data?.customers || []);
        
        // If no customer is selected but we have customers, redirect to first one
        if (!customerId && data?.customers?.length > 0) {
          const firstCustomerId = data.customers[0]._id;
          setCustomerId(firstCustomerId);
          router.replace(`/admin/customers/showcustomer?id=${firstCustomerId}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [customerId, router]);  
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
              <span className='textext-sm sm:t-lg md:text-[60px] font-bold text-blue-500'>Loading...</span>
           </div>;
  }

  // Find the selected customer by ID
  const selectedCustomer = customers.find(cust => cust._id === customerId);

  if (!selectedCustomer && customers.length > 0) {
    // Handle case where customer is not found but we have customers
    const firstCustomerId = customers[0]._id;
    setCustomerId(firstCustomerId);
    router.replace(`/admin/customers/showCustomer?id=${firstCustomerId}`);
    return null;
  }

  return (
    <div className='w-full h-full bg-white dark:bg-gray-900'>
      <div className='w-full h-[860px] mx-auto grid grid-cols-10 bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800/50 overflow-auto hide-scrollbar'>
        {/* aside */}
        <div className='h-full col-span-2 border-r border-gray-300 dark:border-gray-700 overflow-auto hide-scrollbar'>
          <Aside
            customers={customers} 
            customerId={customerId} 
            setCustomerId={(id) => {
              setCustomerId(id);
              router.replace(`/admin/customers/showCustomer?id=${id}`);
            }}
            selectedCustomer={selectedCustomer}
          />
        </div>
        {/* main */}
        <div className='col-span-8'>
          {/* Nav Options */}
          <div className="border-b border-gray-300 dark:border-gray-700">
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
          {activeTab === "overview" && selectedCustomer && (
            <div id="overview" className=''>
              <Overview customer={selectedCustomer} /> 
            </div>         
          )}       
          {/* InvoicesView */}
          {activeTab === "InvoicesView" && selectedCustomer && (
            <div id="InvoicesView" className=''>
              <InvoicesView customer={selectedCustomer} /> 
            </div>         
          )}    
        </div>
      </div>
    </div>
  )
}

export default page