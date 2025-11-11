'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAllAdminData } from '../../../hooks/useAdminData'; 
import { 
  House, 
  ChartNoAxesCombined, 
  IndianRupee, 
  Users, 
  ChartLine, 
  ShoppingCart, 
  User, 
  ScrollText, 
  ChartNoAxesColumnIncreasing, 
  Landmark, 
  Menu, 
  X,
  Moon,
  Sun 
} from 'lucide-react';


const iconComponents = {
  House,
  ChartNoAxesCombined,
  IndianRupee,
  Users,
  ChartLine,
  ShoppingCart,
  User,
  ScrollText,
  ChartNoAxesColumnIncreasing,
  Landmark
};

const Sidebar = ({ navItems, selectedPage, setSelectedPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
    const { dark, setTheme } = useAllAdminData();

  // Get dark state from context
  // const { dark } = useAllAdminData();

  const getIcon = (iconName) => {
    const icons = {
      'House': House,
      'ChartNoAxesCombined': ChartNoAxesCombined,
      'IndianRupee': IndianRupee,
      'Users': Users,
      'ChartLine': ChartLine,
      'ShoppingCart': ShoppingCart,
      'User': User,
      'ScrollText': ScrollText,
      'ChartNoAxesColumnIncreasing': ChartNoAxesColumnIncreasing,
      'Landmark': Landmark
    };
    
    return icons[iconName] || House;
  };

  const checkIsActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || 
           (pathname.startsWith(`${item.href}/`) && pathname !== `${item.href}/`);
  };

  const navItemsWithActiveState = navItems.map(item => ({
    ...item,
    isActive: checkIsActive(item),
    Icon: getIcon(item.iconName)
  }));

  // Theme-based styles
  const sidebarBg = dark ? 'bg-gray-900' : 'bg-slate-800';
  const sidebarText = dark ? 'text-gray-100' : 'text-white';
  const borderColor = dark ? 'border-gray-700' : 'border-cyan-800';
  const hoverBg = dark ? 'hover:bg-gray-700' : 'hover:bg-cyan-800';
  const activeBg = dark ? 'bg-blue-700' : 'bg-blue-600';
  const mobileHeaderBg = dark ? 'bg-gray-800' : 'bg-white';
  const mobileHeaderText = dark ? 'text-white' : 'text-gray-900';
  const mobileButtonBg = dark ? 'bg-gray-700' : 'bg-white';
  const mobileButtonHoverBg = dark ? 'bg-gray-600' : 'bg-gray-100';
  const mobileButtonText = dark ? 'text-gray-100' : 'text-gray-900';
  const mobileButtonBorder = dark ? 'border-gray-600' : 'border-gray-200';

  const handleThemeToggle = () => {
    setTheme(); // This will call the setTheme function from your context
  };

  const renderNavItem = (item) => (
    <li key={item.name}>
      <Link
        href={item.href}
        onClick={() => {
          setSelectedPage(item);
          setIsOpen(false);
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-300 ${
          item.isActive 
            ? `${activeBg} text-white shadow-lg` 
            : `${hoverBg} ${sidebarText}`
        }`}
        aria-current={item.isActive ? 'page' : undefined}
      >
        <item.Icon size={20} className="min-w-[20px]" />
        <span className="ml-3">{item.name}</span>
      </Link>
    </li>
  );

  const Icon = iconComponents[selectedPage?.iconName] || House;

  return (
    <>
      {/* Mobile Header with Toggle */}
      <div className={`print:hidden fixed lg:hidden top-0 left-0 w-full h-16 ${mobileHeaderBg} shadow-sm z-[1000] transition-colors duration-300`}>
        <button
          className={`absolute top-4 left-4 p-2 h-10 w-10 ${mobileButtonBg} ${mobileButtonText} rounded-lg shadow-md ${mobileButtonHoverBg} flex items-center justify-center border ${mobileButtonBorder} transition-colors duration-300`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`flex items-center justify-end h-full ${mobileHeaderText}`}>
          <div className='flex mr-4'>
            <Icon size={24} />
            <span className="ml-2 text-xl">{selectedPage?.name || ' '}</span>
          </div>
          <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-full transition-colors duration-300 ${
                dark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={`print:hidden lg:hidden fixed inset-y-0 left-0 z-[999] w-64 ${sidebarBg} ${sidebarText} transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className={`flex items-center justify-center h-17 p-4 border-b ${borderColor}`}>
          <h1 className="text-xl font-bold">My App</h1>
        </div>

        <nav className="p-2 h-[calc(100vh-4rem)] overflow-y-auto">
          <ul className="space-y-2">
            {navItemsWithActiveState.map(renderNavItem)}
          </ul>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`print:hidden hidden border-r-1 lg:flex lg:flex-col h-full w-64 ${sidebarBg} ${sidebarText} transition-colors duration-300`}>
        <div className={`flex items-center justify-center h-17 p-4 border-b ${borderColor}`}>
          <h1 className="text-xl font-bold">My App</h1>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItemsWithActiveState.map(renderNavItem)}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;