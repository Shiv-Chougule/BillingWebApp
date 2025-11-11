'use client';
import React, {useState, useEffect} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Overview from './components/Overview';
import Transactions from './components/Transactions';
import History from './components/History';
import { ChartNoAxesCombined, CircleUser, Users, Boxes } from 'lucide-react';
 
const tabs = [
  { id: "Overview", label: "Overview" },
  { id: "Transactions", label: "transactions" },
  // { id: "History", label: "stock Statement" },
];

function page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stockId = searchParams.get('id');
  const [stocks, setStocks] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "Overview");
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     const fetchstocks = async () => {
       try {
         const response = await fetch('/api/stocks');
         const data = await response.json();
         setStocks(data?.items || []);
         
         // If no invoice is selected but we have stocks, redirect to first one
         if (!stockId && data?.items?.length > 0) {
           router.replace(`/admin/stocks/showStock?id=${data.items[0]._id}`);
         }
       } catch (error) {
         console.error('Fetch error:', error);
         setStocks([]);
       } finally {
         setLoading(false);
       }
     };
     
     fetchstocks();
   }, [stockId, router]); 
   
 
   if (loading) {
     return <div className="flex justify-center items-center h-screen">
               <span className='textext-sm sm:t-lg md:text-[60px] font-bold text-blue-500'>Loading...</span>
            </div>;
   }
 
   // Find the selected invoice by ID
   const selectedStock = stocks.find(inv => inv._id === stockId);
   console.log('selected invoice is', selectedStock)
 

  return (
    <div className='w-full h-full bg-white dark:bg-gray-900'>
      <div className='w-full h-[860px] mx-auto grid grid-cols-10 bg-white dark:bg-gray-900 rounded-lg overflow-auto hide-scrollbar'>
        {/* aside */}
        <div className='h-full col-span-2 border-r border-gray-300 dark:border-gray-700 overflow-auto hide-scrollbar'>
          <Aside 
            products={stocks} 
            productId={stockId} 
            setProductId={(id) => router.replace(`/admin/stocks/showStock?id=${id}`)}
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
          {activeTab === "Overview" && selectedStock && (
            <div id="Overview" className='mt-8'>
              <Overview stock={selectedStock} /> 
            </div>         
          )}       
          {/* Transactions */}
          {activeTab === "Transactions" && selectedStock && (
            <div id="Transactions" className='mt-8'>
              <Transactions stock={selectedStock} /> 
            </div>         
          )}    
          {/* stock statements */}
          {/* {activeTab === "History" && selectedStock && (
            <div id="History" className='mt-8'>
              <History stock={selectedStock} /> 
            </div>         
          )}        */}
        </div>
      </div>
    </div>
  )
}

export default page