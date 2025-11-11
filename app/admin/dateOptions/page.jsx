"use client";

import { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import dayjs from "dayjs";

const dateOptions = [
  "Today",
  "This Week",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
  "This Quarter",
  "Previous Quarter",
  "This Year",
  "Previous Year",
  "Year To Date",
  "Quarter To Date",
  "Yesterday",
  "Previous Week",
  "Previous Month",
  "Previous Fiscal Year",
  "Custom Range",
];

const getDateRange = (option) => {
  const today = dayjs();
  let startDate, endDate;

  switch (option) {
    case "Today":
      startDate = endDate = today;
      break;
    case "This Week":
      startDate = today.startOf("week");
      endDate = today;
      break;
    case "This Month":
      startDate = today.startOf("month");
      endDate = today;
      break;
    case "Last 3 Months":
      startDate = today.subtract(3, "month").startOf("month");
      endDate = today;
      break;
    case "Last 6 Months":
      startDate = today.subtract(6, "month").startOf("month");
      endDate = today;
      break;
    case "Last 12 Months":
      startDate = today.subtract(12, "month").startOf("month");
      endDate = today;
      break;
    case "This Quarter":
      startDate = today.startOf("quarter");
      endDate = today;
      break;
    case "Previous Quarter":
      startDate = today.subtract(1, "quarter").startOf("quarter");
      endDate = today.subtract(1, "quarter").endOf("quarter");
      break;
    case "This Year":
      startDate = today.startOf("year");
      endDate = today;
      break;
    case "Previous Year":
      startDate = today.subtract(1, "year").startOf("year");
      endDate = today.subtract(1, "year").endOf("year");
      break;
    case "Year To Date":
      startDate = today.startOf("year");
      endDate = today;
      break;
    case "Quarter To Date":
      startDate = today.startOf("quarter");
      endDate = today;
      break;
    case "Yesterday":
      startDate = endDate = today.subtract(1, "day");
      break;
    case "Previous Week":
      startDate = today.subtract(1, "week").startOf("week");
      endDate = today.subtract(1, "week").endOf("week");
      break;
    case "Previous Month":
      startDate = today.subtract(1, "month").startOf("month");
      endDate = today.subtract(1, "month").endOf("month");
      break;
    case "Previous Fiscal Year":
      startDate = dayjs(`${today.year() - 1}-04-01`);
      endDate = dayjs(`${today.year()}-03-31`);
      break;
    case "Custom Range":
      return "Select a date range";
    default:
      return "Select a date range";
  }

  return `${startDate.format("DD MMM YYYY")} - ${endDate.format("DD MMM YYYY")}`;
};

const DateDropdown = () => {
  const [selectedOption, setSelectedOption] = useState("Year To Date");
  const [dateRange, setDateRange] = useState(getDateRange("Year To Date"));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setDateRange(getDateRange(option));
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
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
    <div ref={dropdownRef} className="relative inline-block max-w-[170px] sm:max-w-[360px] flex flex-col sm:flex-row text-black text-left">
      <div
        className=" w-[160px] flex items-center text-sm sm:textt-md border border-gray-300 rounded-md px-2 py-2 cursor-pointer bg-white hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">{selectedOption}</span>
        <FaCalendarAlt className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full w-40 text-sm bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {dateOptions.map((option) => (
            <div
              key={option}
              className={`pl-4 py-1 cursor-pointer hover:bg-blue-500 hover:text-white ${
                selectedOption === option ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* Display selected date range */}
      <div className="m-2 text-gray-700 text-xs sm:text-sm">{dateRange}</div>
    </div>
  );
};

export default DateDropdown;
