'use client';
import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';

function DateRangeSelector({ date, setDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Handle clicks outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  return (
    <div ref={calendarRef} className="relative">
      <div
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex justify-between w-full p-2 border-2 border-gray-300 rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
      >
        {/* Displaying the selected date in an input */}
        <input
          type="text"
          value={date ? date.toLocaleDateString() : ''}
          readOnly
          className="w-[80px] mx-1 cursor-pointer text-gray-700"
        />
        <span className="text-md text-gray-700">
          <CalendarDays size={20} className="inline mr-2" />
        </span>
      </div>

      {/* Date picker */}
      {showCalendar && (
        <div className="absolute z-50 mt-1 bg-blue-200 shadow-lg rounded-lg p-1 border border-blue-500">
          <DatePicker
            selected={date}
            onChange={(selectedDate) => {
              setDate(selectedDate);
              setShowCalendar(false);
            }}
            inline
          />
        </div>
      )}
    </div>
  );
}

export default DateRangeSelector;

