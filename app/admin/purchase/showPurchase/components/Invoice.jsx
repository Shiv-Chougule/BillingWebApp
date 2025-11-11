import React, {useState, useEffect} from "react";
import axios from 'axios';
import { toWords } from 'number-to-words';

const purchase = ({purchases, purchaseID}) => {
    
    const purchase = purchases.find(inv => inv._id === purchaseID);
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

    if (!purchase) {
        return <div className="text-center p-8">No purchase selected</div>;
    }

    if (loading) {
        return <div className="text-center p-8">Loading purchase details...</div>;
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
     const itemsWithCalculations = purchase.items.map(item => {
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
  const calculatedTotal = calculatedSubTotal + (purchase.adjustment || 0);
  const amountInWords = toWords(calculatedTotal || 0);

    return (
        <div className="w-full h-full mx-auto bg-white border-1 text-black p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="w-32 h-16 bg-gray-100 flex items-center justify-center border border-gray-50">
                        <img src="#" alt="company logo" />
                    </div>
                </div>
                <div className="text-right text-xs">
                    <h2 className="text-xl font-bold">Company Name</h2>
                    <p>Kora</p>
                    <p>Bengaluru Karnataka [IND] – India</p>
                    <p>Pin Code: 999999</p>
                    <p>Email: admin@main.com</p>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold">Purchase Invoice</h1>
            <hr className="border-2 border-gray-400 mb-1"/>

            {/* purchase Info */}
            <div className="bg-gray-300 p-2 flex justify-between text-sm">
                <div>
                    <p>purchase No: {purchase.purchaseOrder}</p>
                </div>
                <div className="text-right">
                    <p>purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p>Due Date: {new Date(purchase.dueDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="p-2 mb-4 border-1 border-gray-300 text-xs">
                <p className="text-sm">Terms of Delivery:</p>
            </div>

            {/* Bill To */}
            <div className="w-[50%] mb-4 border-1 border-gray-300">
                <div className="text-sm border-b border-gray-300 px-2"><p>Bill To</p></div>
                <p className="text-blue-600 font-medium m-2">{purchase.vendor?.vendorName}</p>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full text-sm text-left border border-gray-300">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="border-x border-gray-300 px-4 py-2">#</th>
                            <th className="border-x border-gray-300 px-4 py-2">Items Description</th>
                            <th className="border-x border-gray-300 px-4 py-2">HSN Code</th>
                            <th className="border-x border-gray-300 px-4 py-2">Qty</th>
                            <th className="border-x border-gray-300 px-4 py-2">Rate</th>
                            <th colSpan="2" className="border-x text-center border-gray-300 px-4 py-2">GST</th>
                            <th className="border-x border-gray-300 px-4 py-2">Amount</th>
                        </tr>
                        <tr className="border border-gray-300">
                            <th colSpan="5"></th>
                            <th className="text-center border-l border-gray-300">%</th>
                            <th className="text-center border-x border-gray-300">Amt</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsWithCalculations.map((item, index) => (
                            <tr key={item._id} className="border-b border-gray-300">
                                <td className="border-x border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.name}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.hsnCode.toLocaleString()}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.quantity}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.price.toLocaleString()}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.gst}%</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.gstAmount.toLocaleString()}</td>
                                <td className="border-x border-gray-300 px-4 py-2">{item.itemTotal.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between">
                {/* Notes and Totals */}
                <div className="mb-4">
                    <p className="">Notes</p>
                    <p>Thanks for your business.</p>
                </div>
                {/* final amount */}
                <div className="w-[50%] flex flex-col">
                <div className="flex justify-between border-b border-gray-300">
                        <span>Sub Total : </span>
                        <span>{calculatedSubTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300">
                        <span>Adjustment : </span>
                        <span>{purchase.adjustment?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-300">
                        <span>Total : </span>
                        <span>{calculatedTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Total in words */}
            <div className="mt-4">
                <p className="italic">Total in words: <br /> {amountInWords} only</p>
            </div>
            {/* sign */}
            <div className="w-full mt-12 flex justify-end">
                <div className="w-[240px]">
                    <hr className="border-1 mt-6 border-gray-400"/>
                    <span className="mt-2 text-sm text-gray-600">Authorized Signature</span> <br />
                </div>
            </div>
        </div>
    );
};

export default purchase;