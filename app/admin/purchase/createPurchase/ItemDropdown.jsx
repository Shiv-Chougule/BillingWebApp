import React, { useRef, useEffect } from 'react';
//import { Portal } from './Portal'; // Make sure to export Portal from your main file
import { ChevronDown, X, Plus } from 'lucide-react';
import ReactDOM from 'react-dom';
import Link from 'next/link';

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const ItemDropdown = ({
  item,
  index,
  searchStockQuery,
  setSearchStockQuery,
  toggleStockDropdown,
  handleClearStockSelection,
  handleStockSelect,
  filteredStocks,
  inputRefs,
  dropdownRefs
}) => {
  // Positioning effect
  useEffect(() => {
    if (!item.isStockDropdownOpen || item.selectedStock) return;

    const updatePosition = () => {
      const inputEl = inputRefs.current[index];
      const dropdownEl = dropdownRefs.current[index];
      
      if (!inputEl || !dropdownEl) return;
      
      const inputRect = inputEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Set dropdown width (match input width)
      dropdownEl.style.width = `${inputRect.width}px`;
      
      // Position horizontally (align with input)
      let left = inputRect.left;
      if (left + inputRect.width > viewportWidth) {
        left = viewportWidth - inputRect.width - 16;
      }
      dropdownEl.style.left = `${left}px`;
      
      // Position vertically (prefer below, show above if not enough space)
      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      
      if (spaceBelow > 200 || spaceBelow > spaceAbove) {
        dropdownEl.style.top = `${inputRect.bottom + window.scrollY + 4}px`;
        dropdownEl.style.bottom = 'auto';
      } else {
        dropdownEl.style.top = 'auto';
        dropdownEl.style.bottom = `${viewportHeight - inputRect.top + window.scrollY + 4}px`;
      }
    };

    updatePosition();

    const handleScrollResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [item.isStockDropdownOpen, item.selectedStock, index, inputRefs, dropdownRefs]);

  return (
    <div className="relative">
      {item.selectedStock ? (
        <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
          <span className="text-gray-900 dark:text-white">{item.selectedStock.name}</span>
          <button 
            type="button" 
            onClick={() => handleClearStockSelection(item.id)}
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            autoComplete='off'
            value={searchStockQuery}
            onChange={(e) => {
              setSearchStockQuery(e.target.value);
              toggleStockDropdown(item.id, true);
            }}
            onFocus={() => toggleStockDropdown(item.id, true)}
            placeholder="Search or select Item"
            className='min-w-72 sm:w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
          />
          <button 
            type="button" 
            onClick={() => toggleStockDropdown(item.id)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            <ChevronDown size={20} />
          </button>
        </>
      )}
      
      {item.isStockDropdownOpen && !item.selectedStock && (
        <Portal>
          <div 
            ref={(el) => {
              if (el) {
                dropdownRefs.current[index] = el;
              }
            }}
            className="fixed z-[1001] bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl flex flex-col"
            style={{ maxHeight: '240px' }}
          >
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-grow hide-scrollbar">
              {filteredStocks.length > 0 ? (
                <ul>
                  {filteredStocks.map((stock) => (
                    <li
                      key={stock.id}
                      className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white"
                      onClick={() => handleStockSelect(stock, item.id)}
                    >
                      <div>
                        <p className="font-medium">{stock.name}</p>
                        {stock.sellingPrice && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Selling Price: ₹{stock.sellingPrice}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  No items found
                </div>
              )}
            </div>

            {/* Sticky "Create new item" link at the bottom */}
            <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-gray-600">
              <Link
                href={`/admin/stocks/createStock`}
                className="w-full text-left px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-500 flex items-center justify-left gap-2"
                onClick={() => toggleStockDropdown(item.id, false)}
              >
                <Plus size={16} />
                Create new item 
              </Link>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};