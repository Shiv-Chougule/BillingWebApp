import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Funnel, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { useAllAdminData } from '../../hooks/useAdminData'; 

const SortDropdown = ({ onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Latest');
  const dropdownRef = useRef(null);
  const { dark } = useAllAdminData();

  const options = [
    { value: 'latest', label: 'latest' },
    { value: 'oldest', label: 'oldest' },
    { value: 'amount-high', label: 'amount-high' },
    { value: 'amount-low', label: 'amount-low' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);
    onSortChange(option.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
    <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2.5 w-36 border rounded-lg shadow-sm transition-all duration-150 ${
            isOpen ? 
                (dark ? 'border-blue-400 ring-2 ring-blue-800' : 'border-blue-500 ring-2 ring-blue-200') : 
                (dark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
        } ${
            dark ? 'bg-gray-800' : 'bg-white'
        }`}
    >
        <div className="flex items-center">
            <Funnel size={16} className={`mr-2 ${
                dark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
                dark ? 'text-gray-200' : 'text-gray-700'
            }`}>Sort By</span>
        </div>
        <ChevronDown 
            size={18}
            className={`ml-2 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
            } ${
                dark ? 'text-gray-400' : 'text-gray-500'
            }`}
        />
    </button>

    {isOpen && (
        <div className={`absolute z-10 mt-1 w-36 border rounded-lg shadow-lg overflow-hidden ${
            dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="py-1">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleOptionClick(option)}
                        className={`flex items-center w-full px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                            selectedOption === option.label
                                ? (dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                                : (dark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                        }`}
                    >
                        {option.value === 'latest' && <ArrowUp size={16} className="mr-2 text-green-500" />}
                        {option.value === 'oldest' && <ArrowDown size={16} className="mr-2 text-green-500" />}
                        {option.value === 'amount-high' && <TrendingUp size={16} className="mr-2 text-green-500" />}
                        {option.value === 'amount-low' && <TrendingDown size={16} className="mr-2 text-green-500" />}
                        <span>{option.label}</span>
                        {selectedOption === option.label && (
                            <Check size={16} className={`ml-auto ${
                                dark ? 'text-blue-400' : 'text-blue-500'
                            }`} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )}
</div>
  );
};

export default SortDropdown; 