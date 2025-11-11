import React from 'react';
import { Moon, Sun } from 'lucide-react';
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
  CircleUser
} from 'lucide-react';
import { useAllAdminData } from '../../../hooks/useAdminData'; // Adjust path as needed

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

function Header({ selectedPage }) {
  const Icon = iconComponents[selectedPage?.iconName] || House;
  
  // Get dark state from context
  const { dark, setTheme } = useAllAdminData();

  // Theme-based styles
  const headerBg = dark ? 'bg-gray-800' : 'bg-white';
  const headerText = dark ? 'text-white' : 'text-gray-800';
  const financialYearText = dark ? 'text-gray-300' : 'text-black';

  const handleThemeToggle = () => {
    setTheme(); // This will call the setTheme function from your context
  };
  return (
    <div className={`print:hidden w-full ${headerBg} transition-colors duration-300 border-b-1`}>
      {/* Only show desktop header - mobile header is handled by Sidebar */}
      <div className="flex justify-between items-center p-4">
        <div className={`flex items-center font-bold ${headerText}`}>
          <Icon size={24} />
          <span className="ml-2 text-xl">{selectedPage?.name || ' '}</span>
        </div>
        <div className={financialYearText}>
          <span>Financial Year: April 2025 - March 2026</span>
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
  );
}

export default Header;