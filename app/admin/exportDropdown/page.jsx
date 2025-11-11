"use client";

import { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Upload, FileText } from "lucide-react";
import { exportToCSV, exportToXLSX, exportToPDF } from '../../../utils/bankExportUtils';

const Dropdown = ({ options, onSelect, exportData, exportFileName = "bank-entries", filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        className="w-[36px] h-[36px] flex items-center justify-center rounded-md border border-blue-500"
      >
        <EllipsisVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 md:-left-38 md:right-0 mt-2 w-48 bg-white border border-blue-500 rounded-md shadow-lg z-50">
          {options.map((option, index) => (
            option.label && (
              <div
                key={index}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option.icon}
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