'use client';
import react, {useState, useEffect} from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateRangeSelector from '../dateInput/page';
import { z } from 'zod';

// Form validation schema
const formSchema = z.object({
  customerName: z.string().min(1, 'customer name is required'),
  invoiceNumber: z.string().min(1, 'invoiceNo is required'),
  salesperson: z.string().min(1, 'salesperson name is required'),
  orderNumber: z.string().email('Order number required'),
  country: z.string().min(1, 'Country is required'),
  subject: z.string().min(1, 'subject is required'),
  city: z.string().min(1, 'City is required'),
  businessType: z.string().min(1, 'Industry type is required'),
  gstin: z.string().min(1, 'GSTIN/UID is required'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().min(1, 'State is required'),
  terms: z.string().min(1, 'this is required'),
  isGstRegistered: z.enum(['Yes', 'No']),
});

export default function AccountForm() {
  const [selectedDate, setSelectedDate] = useState(new Date()); 
const [selectedDueDate, setSelectedDueDate] = useState(new Date()); // Default to today
const [items, setItems] = useState([
  { id: 1, name: '', quantity: 1, price: 0, discount: 0 }
]);
const [adjustment, setAdjustment] = useState(0);

const handleChange = (index, field, value) => {
  const updatedItems = [...items];

  if (field === 'name') {
    updatedItems[index][field] = value || ''; // Ensure name is always a string
  } else {
    let parsedValue = parseFloat(value);
    updatedItems[index][field] = isNaN(parsedValue) ? 0 : parsedValue; // Ensure numeric fields are numbers
  }

  setItems(updatedItems);
};

const handleAddItem = () => {
  setItems([...items, { id: Date.now(), name: '', quantity: 1, price: 0, discount: 0 }]);
};

const handleDeleteItem = (id) => {
  setItems(items.filter(item => item.id !== id));
};

const calculateAmount = (item) => {
  const quantity = isNaN(item.quantity) ? 0 : item.quantity;
  const price = isNaN(item.price) ? 0 : item.price;
  const discount = isNaN(item.discount) ? 0 : item.discount;

  const discountedPrice = price - (price * (discount / 100));
  return quantity * discountedPrice;
};

// Prevent NaN in calculations
const subTotal = items.reduce((sum, item) => sum + calculateAmount(item), 0) || 0;
const total = subTotal + (isNaN(adjustment) ? 0 : parseFloat(adjustment)) || 0;
  
    const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
    alert('Form submitted successfully!');
  };

  return (
    <div className='w-full h-full bg-gray-50 pt-6'>
    <div className="max-w-6xl mx-auto p-2 sm:p-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-2 sm:mb-4 text-2xl text-center font-bold text-gray-800 ">Create Invoice</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information Section */}
        <section className="space-y-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
          <div className='w-full flex flex-col gap-2 sm:gap-8'>
              {/* Customer Name */}
              <div className=''>
                <label htmlFor="customerName" className="block text-md font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="search or select a Customer"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>
              {/* Subject */}
              <div className='w-full'>
                  <label htmlFor="subject" className="block text-md font-medium text-gray-700 mb-1">
                    Subject(Optional)
                  </label>
                  <input
                    id="subject"
                    {...register('subject')}
                    placeholder="let your customer know what this Invoice is about"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
              </div>
              
          </div>
          <div className='w-full flex flex-col gap-2 sm:gap-8'>
                
                {/* Invoice date */}
                <div className='w-full sm:mt-2'>
                    <p className='text-md text-gray-700'>Invoice Date</p>
                    <div>
                        <DateRangeSelector date={selectedDate} setDate={setSelectedDate} />
                    </div>
                </div>
                {/* Due date */}
                <div className='w-full'>
                    <p className='text-md text-gray-700'>Due Date</p>
                    <div>
                        <DateRangeSelector date={selectedDueDate} setDate={setSelectedDueDate} />
                    </div>
                </div>
                
          </div>
        </section>
        <section className='text-black'>
          <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-blue-100 md:py-2 text-sm text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Item Details</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Discount</th>
                <th className="px-4 py-2 text-left ">Amount</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="min-w-[300px] border-2 border-gray-300 rounded px-2 py-1 w-full"
                      value={item.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      placeholder="Enter item"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      className="border-2 border-gray-300 rounded px-2 py-1 w-20"
                      value={item.quantity}
                      onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="border-2 border-gray-300 rounded px-2 py-1 w-24"
                      value={item.price}
                      onChange={(e) => handleChange(index, 'price', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="border-2 border-gray-300 rounded px-2 py-1 w-20"
                      value={item.discount}
                      onChange={(e) => handleChange(index, 'discount', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    ₹{calculateAmount(item).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-red-600">
                    <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* add another item */}
          <div className='bg-blue-50 p-4 '>
              <div
                onClick={handleAddItem}
                className=" text-blue-600 hover:underline">
                + Add another Item
              </div>
            </div>
          </div>
          
          <div className='flex justify-end w-full'>
            {/* final total Ammount */}
            <div className="mt-6 w-[400px] h-[150px] p-4 text-sm sm:text-md shadow-lg border-1 border-gray-300 rounded-lg pt-4 text-right space-y-2">
              <div className='flex justify-between'>
                <span className="">Sub Total:</span> ₹{subTotal.toFixed(2)}
              </div>
              <div className='flex flex-wrap justify-between'>
                <span className="">Adjustment:</span>
                <input
                  type="number"
                  className=" py-1 px-2 w-[80px] sm:w-[100px] border-2 border-gray-300 rounded"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value || 0)}
                />
                ₹{total.toFixed(2)}
              </div>
              <hr className='border-2 border-gray-300'/>
              <div className="flex justify-between text-sm sm:text-lg font-medium">
                <span>Total:</span> ₹{total.toFixed(2)}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className='w-full flex justify-end'>
          <Link href='/admin/pdfInvoice'>
            <button
              type="submit"
              className=" bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
              Create Invoice
            </button>
          </Link>
          {/* Close Button */}
          <Link href="/admin/sales">
            <button
              type="close"
              className=" ml-2 sm:ml-4 bg-gray-50 border-1 border-gray-300 hover:text-gray-800 text-blue-600 font-medium py-2 px-4 rounded-md transition duration-300">
              Close
            </button>
          </Link>
        </div>
      </form>
    </div>
    </div>
  );
}