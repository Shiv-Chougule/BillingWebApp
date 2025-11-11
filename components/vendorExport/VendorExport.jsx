"use client";

import React, { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Upload, FileText } from "lucide-react";
import { exportToCSV, exportToXLSX, exportToPDF } from '../../utils/vendorExportUtils';
import { useAllAdminData } from '../../hooks/useAdminData';

const Dropdown = ({ options, onSelect, exportData, exportFileName = "Vendor-entries", filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { dark } = useAllAdminData();

  const handleSelect = (option) => {
    setIsOpen(false);
    if (onSelect) onSelect(option);
    
    // Handle export functionality
    if (option.label.includes('Export') && exportData) {
      const format = option.label.toLowerCase().split(' ')[1]; // pdf, csv, or xlsx
      handleExport(format);
    }
  };

  const handleExport = async (format) => {
    try { 
      switch (format) {
        case 'pdf':
          exportToPDF(exportData, exportFileName, filters);
          console.log('filters:', filters);
          console.log('data:', exportData);
          break;
        case 'csv':
          exportToCSV(exportData, exportFileName);
          break;
        case 'xlsx':
          exportToXLSX(exportData, exportFileName);
          break;
        default:
          console.warn('Unknown export format:', format);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
     <div className="relative inline-block text-left" ref={dropdownRef}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-md border border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <EllipsisVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        
          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 md:-left-38 md:right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-blue-500 dark:border-blue-400 rounded-md shadow-lg z-50">
              {options.map((option, index) => (
                option.label && (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    onClick={() => handleSelect(option)}
                  >
                    {option.icon && React.cloneElement(option.icon, {
                      className: "w-4 h-4 text-gray-600 dark:text-gray-400"
                    })}
                    <span className="ml-2">{option.label}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
  );
};

export default Dropdown;