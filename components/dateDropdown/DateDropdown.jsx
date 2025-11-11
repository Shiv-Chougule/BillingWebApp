"use client";
import React, { useState, useEffect, useRef } from 'react';
import dayjs from "dayjs";
import { Calendar, ChevronDown, Check, Sun, Moon, CalendarDays, CalendarCheck, CalendarX, CalendarPlus } from 'lucide-react';
import { useAllAdminData } from '../../hooks/useAdminData'; 

const getDateRange = (option) => {
  const today = dayjs();
  let startDate, endDate;

  switch (option) {
    case "today":
      startDate = endDate = today;
      break;
    case "yesterday":
      startDate = endDate = today.subtract(1, "day");
      break;
    case "thisWeek":
      startDate = today.startOf("week");
      endDate = today;
      break;
    case "lastWeek":
      startDate = today.subtract(1, "week").startOf("week");
      endDate = today.subtract(1, "week").endOf("week");
      break;
    case "thisMonth":
      startDate = today.startOf("month");
      endDate = today;
      break;
    case "lastMonth":
      startDate = today.subtract(1, "month").startOf("month");
      endDate = today.subtract(1, "month").endOf("month");
      break;
    case "all":
      return "All Time"; // Return a display string instead of null
    case "custom":
      return "Select a date range"; // This will be overridden when custom dates are selected
    default:
      return "Select a date range";
  }

  return `${startDate.format("DD MMM YYYY")} - ${endDate.format("DD MMM YYYY")}`;
};



const DateDropdown = ({ onDateFilterChange }) => {
    const [selectedOption, setSelectedOption] = useState('all');
    const [customDate, setCustomDate] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { dark } = useAllAdminData();
    // Initialize dateRange based on selectedOption
    const [dateRange, setDateRange] = useState(() => {
      return selectedOption === 'custom' ? 'Select a date range' : getDateRange(selectedOption);
    });
    
    const dateOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'thisWeek', label: 'This Week' },
        { value: 'lastWeek', label: 'Last Week' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Date' }
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option.value);
        setIsOpen(false);
        
        if (option.value === 'custom') {
            setDateRange('Select a date range');
        } else {
            setDateRange(getDateRange(option.value));
        }
        
        onDateFilterChange(option.value, option.value === 'custom' ? customDate : '');
    };

    const handleCustomDateChange = (e) => {
        const date = e.target.value;
        setCustomDate(date);
        setDateRange(date); // Update the displayed date range with the selected custom date
        onDateFilterChange('custom', date);
    };
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
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
      {/* Display selected date range */}
      <div className={`m-2 text-xs sm:text-sm ${
          dark ? 'text-gray-300' : 'text-gray-700'
      }`}>
          {selectedOption === 'custom' && customDate ? 
              dayjs(customDate).format("DD MMM YYYY") : 
              dateRange
          }
      </div>
      <div ref={dropdownRef} className="relative">
          <button
              type="button"
              className={`flex items-center justify-between px-4 py-2.5 w-48 border rounded-lg shadow-sm transition-all duration-150 ${
                  isOpen ? 
                      (dark ? 'border-blue-400 ring-2 ring-blue-800' : 'border-blue-500 ring-2 ring-blue-200') : 
                      (dark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
              } ${
                  dark ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={toggleDropdown}
              aria-expanded={isOpen}
              aria-haspopup="true"
          >
              <div className="flex items-center">
                  <Calendar size={16} className={`mr-2 ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                      dark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                      {dateOptions.find((f) => f.value === selectedOption)?.label || 'Select Date'}
                  </span>
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
              <div className={`absolute z-20 mt-1 w-full sm:w-56 border rounded-lg shadow-lg overflow-hidden ${
                  dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                  <div className="py-1">
                      {dateOptions.map((option) => (
                          <button
                              key={option.value}
                              className={`flex items-center w-full px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                                  selectedOption === option.value
                                      ? (dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                                      : (dark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                              }`}
                              onClick={() => handleOptionSelect(option)}
                          >
                              {option.value === 'all' && <Calendar size={16} className="mr-2" />}
                              {option.value === 'today' && <Sun size={16} className="mr-2 text-yellow-500" />}
                              {option.value === 'yesterday' && <Moon size={16} className="mr-2 text-indigo-500" />}
                              {option.value === 'thisWeek' && <CalendarDays size={16} className="mr-2 text-blue-500" />}
                              {option.value === 'lastWeek' && <CalendarDays size={16} className="mr-2 text-purple-500" />}
                              {option.value === 'thisMonth' && <CalendarCheck size={16} className="mr-2 text-green-500" />}
                              {option.value === 'lastMonth' && <CalendarX size={16} className="mr-2 text-red-500" />}
                              {option.value === 'custom' && <CalendarPlus size={16} className="mr-2 text-orange-500" />}
                              <span>{option.label}</span>
                              {selectedOption === option.value && (
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
  
      {selectedOption === 'custom' && (
          <input
              type="date"
              value={customDate}
              onChange={handleCustomDateChange}
              className={`text-xs sm:text-sm border rounded px-2 py-1 transition-colors duration-300 ${
                  dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
          />
      )}
  </div>
    );
};

export default DateDropdown;