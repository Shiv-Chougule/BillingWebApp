'use client';
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import Sidebar from "./Sidebar/page";
import Header from "./header/page";
import { findActivePage } from '../utils/route-matcher';
import { AdminDataProvider } from '../../contexts/AdminDataContext';
import { House, ChartNoAxesCombined, IndianRupee, Users, ChartLine, ShoppingCart, User, ScrollText, ChartNoAxesColumnIncreasing, Landmark } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', iconName: 'House', exact: true },
  { name: 'Sales', href: '/admin/sales', iconName: 'ChartNoAxesCombined' },
  { name: 'Payments', href: '/admin/payments', iconName: 'IndianRupee' },
  { name: 'Customers', href: '/admin/customers', iconName: 'Users' },
  { name: 'Stocks', href: '/admin/stocks', iconName: 'ChartLine' },
  { name: 'Purchase', href: '/admin/purchase', iconName: 'ShoppingCart' },
  { name: 'Vendor', href: '/admin/vendor', iconName: 'User' },
  { name: 'Performa Invoice', href: '/admin/performaInvoice', iconName: 'ScrollText' },
  { name: 'Expenses', href: '/admin/expenses', iconName: 'ChartNoAxesColumnIncreasing' },
  { name: 'Bank', href: '/admin/bank', iconName: 'Landmark' }
];

export default function RootLayout({ children, params }) {
  const pathname = usePathname();
  const [selectedPage, setSelectedPage] = useState(() => 
    findActivePage(params.pathname || '/admin', navItems)
  );

  useEffect(() => {
    const findActivePage = () => {
      const cleanPathname = pathname.replace(/\/+$/, '');
      const exactMatch = navItems.find(item => 
        item.exact && cleanPathname === item.href
      );
      if (exactMatch) return exactMatch;
      
      const matchedItems = navItems.filter(item => 
        !item.exact && cleanPathname.startsWith(item.href)
      );
      matchedItems.sort((a, b) => b.href.length - a.href.length);
      return matchedItems[0] || navItems[0];
    };

    setSelectedPage(findActivePage());
  }, [pathname]);

  return (
    <AdminDataProvider>
      <div className="h-screen flex overflow-hidden bg-gray-200">
        <Sidebar navItems={navItems} selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="print:hidden hidden lg:flex flex-shrink-0">
            <Header selectedPage={selectedPage} />
          </div>
          <div className="h-[2000px] overflow-hidden hide-scrollbar bg-gray-200 flex-1 overflow-y-auto pt-16 lg:pt-0">
            {children}
          </div>
        </div>
      </div>
    </AdminDataProvider>
  );
}