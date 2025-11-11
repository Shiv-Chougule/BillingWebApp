'use client';
import React from 'react'
import { Phone } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Instagram } from 'lucide-react';

function page() {
  return (
    <div className='w-full h-auto p-2 py-10 bg-gray-500 flex justify-center items-center'>
      <div className='w-[800px] h-[1132px] p-2 flex flex-col bg-white border-2 border-gray-800 '>
        {/* header */}
        <div className='w-full border-1 border-gray-400 grid grid-cols-6 '>
            {/* Studio name */}
            <div className='col-span-4 h-[140px] '>
                <h1 className='text-black font-medium text-center m-2 text-6xl'>
                    PATIL'S STUDIO
                </h1>
                <p className='text-gray-800 text-center'>Photography, videography and more.</p>
                <div className='w-full text-black flex justify-center gap-4 mt-2'>
                    <div className='flex gap-2'><Phone size={20} /> <span>9999999999</span></div>
                    <div className='flex gap-2'><Mail size={20} /> <span>shiv@gmail.com</span></div>
                </div>
                <hr className='mx-2 border-1 border-gray-600'/>
            </div>
            {/* picture */}
            <div className='col-span-2 row-span-2'>
            <img src="/images/photographer1.jpg" alt="img" height="300" width="300" />

            </div>
            {/* customer details */}
            <div className='col-span-4 h-[100px] text-black text-lg p-2 flex flex-col justify-evenly'>
                <p>Name:</p>
                <p>Invoice No:</p>
                <p>Date:</p>
            </div>
        </div>
        {/* main */}
        <div className='h-[800px] border-1 border-gray-400 '>
            <h1 className='text-black text-center my-2 text-4xl'>INVOICE</h1>
            {/* table */}
            <div className='px-2'>
            <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-blue-50 md:py-2 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Item Details</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Discount</th>
                <th className="px-4 py-2 text-left ">Amount</th>
              </tr>
            </thead>
            <tbody>
                <tr className="text-black text-sm">
                  <td className="h-[50px] w-full p-2 border-1 ">
                    <p>here you can write the product description</p>
                  </td>
                  <td className="h-[50px] w-full p-2 border-1 ">
                    <p>787878786767</p>
                  </td>
                  <td className="h-[50px] w-full p-2 border-1 ">
                    <p>787878786686</p>
                  </td>
                  <td className="h-[50px] w-full p-2 border-1 ">
                    <p>787878867677</p>
                  </td>
                  <td className="h-[50px] w-full p-2 border-1 ">
                    <p>78787878668</p>
                  </td>
                </tr>
            </tbody>
          </table>
            </div>
            <hr className='mt-4 mx-2 border-2 border-gray-400'/>
            <div className='w-full text-black flex justify-end items-center'>
                <div className='w-[50%] m-2 p-2 text-lg'>
                    <span>Payment Status :</span>
                    <span>Paid/Pending</span>
                </div>
                <div className='w-[50%] m-2 p-2 text-lg '>
                    <span>Total Ammount : </span>
                    <span>

                    </span>
                </div>
            </div>
        </div>
        {/* footer */}
        <div>
            {/* studio address */}
            <div></div>
            {/* toatl ammount */}
            <div></div>
        </div>
      </div>
    </div>
  )
}

export default page
