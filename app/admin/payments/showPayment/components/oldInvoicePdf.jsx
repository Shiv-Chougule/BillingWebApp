import React, {useState, useEffect} from "react";
import axios from 'axios';
import { toWords } from 'number-to-words';
import { Download, Printer } from 'lucide-react';

const paymentPdf = ({payments, paymentID}) => {
     
  const payment = payments.find(inv => inv._id === paymentID);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      const fetchItems = async () => {
        try {
          const response = await axios.get('/api/stocks');
          setStocks(response.data.items || []);
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchItems();
  }, []);

  if (!payment) {
      return <div className="text-center p-8">No payment selected</div>;
  }

  if (loading) {
      return <div className="text-center p-8">Loading payment details...</div>;
  }
    // Function to find HSN code by item name
    const findHsnCode = (itemName) => {
      const stockItem = stocks.find(stock => stock.name === itemName);
      return stockItem ? stockItem.HSNCode : 'N/A';
  };
  // Function to calculate GST amount for each item
  const calculateGST = (price, quantity, gstRate) => {
      return (price * quantity) * (gstRate / 100);
  };
   // Calculate values for each item
   const itemsWithCalculations = payment.items.map(item => {
    const itemSubTotal = item.price * item.quantity;
    const gstAmount = calculateGST(item.price, item.quantity, item.gst);
    const itemTotal = itemSubTotal + gstAmount;
    const hsnCode = findHsnCode(item.name);
    
    return {
        ...item,
        itemSubTotal,
        gstAmount,
        itemTotal,
        hsnCode
    };
});

// Calculate overall totals
const calculatedSubTotal = itemsWithCalculations.reduce((sum, item) => sum + item.itemTotal, 0);
const calculatedTotal = calculatedSubTotal + (payment.adjustment || 0);
const amountInWords = toWords(calculatedTotal || 0);
    return (
      <div className="w-full mx-auto bg-white shadow-md p-6 mt-10 text-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Dell</h1>
          <p className="text-sm">Kora, Bengaluru , Karnataka</p>
          <p className="text-sm">[IND] - India - | admin@dell.com</p>
        </div>
        
        <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Payment Receipt</h2>
        <div className="flex justify-end space-x-2 mb-4">
          <button className="flex gap-1 border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-100"><Printer size={16} /> Print</button>
          <button className="flex gap-1 border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-100"><Download size={16} /> Download</button>
        </div>
        </div>
        <hr className="mb-4 border-2 border-gray-300" />
        <div className="flex justify-between text-sm my-6">
          <div>
            <p className="flex flex-col gap-2">
              <span className="">Receipt No:</span>{" "}
              <span className=" text-black">PAY-250327202411</span>
            </p>
          </div>
          <div>
            <p>Receipt Name : </p>
          </div>
          <div>
            <p className="flex flex-col gap-2 text-black">
              <span className="text-gray-800">Date:</span>{" "}
              2025-03-27T14:54:11.431Z
            </p>
          </div>
        </div>
  
        <div className="border border-gray-300 rounded ">
          <div className="bg-gray-50 border-b border-gray-300 p-3 font-semibold">Payment Details</div>
          <div className="p-3 space-y-6 text-sm">
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Received</span>
              <span className="font-semibold">
                United States Dollar (USD) - $ 12.0
              </span>
            </div>
            <hr className="border-gray-300"/>
            <div className="flex justify-between mb-4">
              <span>Amount in words:</span>
              <span className="italic">-</span>
            </div>
          </div>
        </div>
  
        <div className="flex justify-between mt-16 text-sm text-center">
          <div className="w-1/2">
            <hr className="mb-1 mx-4 border-1 border-gray-300" />
            <p>Authorized Signatory</p>
          </div>
          <div className="w-1/2">
            <hr className="mb-1 mx-4 border-1 border-gray-300" />
            <p>Recipient's Signature</p>
          </div>
        </div>
        <hr className="border-gray-300 mt-8 mb-2"/>
        <p className="text-center text-xs">This is a computer generated receipt and does not require physical signature.</p>
      </div>
    );
};

export default paymentPdf;
