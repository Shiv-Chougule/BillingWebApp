'use client';
import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, Check, List, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useAllAdminData } from '../../hooks/useAdminData';

function FilterDropdown({ selectedStatus, setSelectedStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { dark } = useAllAdminData(); 
  
  const filters = [
    { value: 'all', label: 'all' },
    { value: 'paid', label: 'paid' },
    { value: 'pending', label: 'pending' },
    { value: 'cancelled', label: 'cancelled' },
    { value: 'overdue', label: 'overdue' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterSelect = (filter) => {
    setSelectedStatus(filter.value); // Update the parent state
    setIsOpen(false);
  };

   useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  return (
    <div ref={dropdownRef} className="relative">
    <button
        type="button"
        className={`flex items-center justify-between px-4 py-2.5 w-36 border rounded-lg shadow-sm transition-all duration-150 ${
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
            <Filter size={16} className={`mr-2 ${
                dark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
                dark ? 'text-gray-200' : 'text-gray-700'
            }`}>
                {filters.find((f) => f.value === selectedStatus)?.label || 'All Statuses'}
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
        <div className={`absolute z-20 mt-1 w-36 border rounded-lg shadow-lg overflow-hidden ${
            dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="py-1">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        className={`flex items-center w-full px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                            selectedStatus === filter.value
                                ? (dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                                : (dark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                        }`}
                        onClick={() => handleFilterSelect(filter)}
                    >
                        {filter.value === 'all' && <List size={16} className="mr-2" />}
                        {filter.value === 'paid' && <CheckCircle size={16} className="mr-2 text-green-500" />}
                        {filter.value === 'pending' && <Clock size={16} className="mr-2 text-yellow-500" />}
                        {filter.value === 'overdue' && <AlertTriangle size={16} className="mr-2 text-red-500" />}
                        {filter.value === 'cancelled' && <XCircle size={16} className="mr-2 text-gray-500" />}
                        <span>{filter.label}</span>
                        {selectedStatus === filter.value && (
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
}

export default FilterDropdown;
