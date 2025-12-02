'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface DeliveryDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDaysFromNow?: number; // Minimum days from today for delivery
}

export default function DeliveryDatePicker({
  selectedDate,
  onDateSelect,
  minDaysFromNow = 1, // Default: delivery starts from tomorrow
}: DeliveryDatePickerProps) {
  const t = useTranslations();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Get days in month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentMonth, currentYear]);

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentMonth, currentYear]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  // Check if a date is selectable
  const isDateSelectable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDaysFromNow);
    minDate.setHours(0, 0, 0, 0);
    
    return date >= minDate;
  };

  // Check if date is selected
  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  // Check if date is today
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    if (isDateSelectable(day)) {
      const newDate = new Date(currentYear, currentMonth, day);
      onDateSelect(newDate);
    }
  };

  // Navigate to previous month (only if not past month)
  const goToPreviousMonth = () => {
    if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      return; // Don't go before current month
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if can go to previous month
  const canGoPrevious = !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  // Format month name
  const monthNames = [
    t('delivery.months.january'),
    t('delivery.months.february'),
    t('delivery.months.march'),
    t('delivery.months.april'),
    t('delivery.months.may'),
    t('delivery.months.june'),
    t('delivery.months.july'),
    t('delivery.months.august'),
    t('delivery.months.september'),
    t('delivery.months.october'),
    t('delivery.months.november'),
    t('delivery.months.december'),
  ];

  // Day names
  const dayNames = [
    t('delivery.days.sun'),
    t('delivery.days.mon'),
    t('delivery.days.tue'),
    t('delivery.days.wed'),
    t('delivery.days.thu'),
    t('delivery.days.fri'),
    t('delivery.days.sat'),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-center">{t('delivery.title')}</h3>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="font-medium text-lg">
          {monthNames[currentMonth]} {currentYear}
        </span>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleDateClick(day)}
                disabled={!isDateSelectable(day)}
                className={`w-full h-full rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${isDateSelected(day)
                    ? 'bg-[#D6B884] text-white'
                    : isToday(day)
                    ? 'bg-gray-200 text-gray-900'
                    : isDateSelectable(day)
                    ? 'hover:bg-[#F5E6C8] text-gray-900'
                    : 'text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-[#FAF3E0] rounded-lg text-center">
          <span className="text-sm text-gray-600">{t('delivery.selectedDate')}:</span>
          <p className="font-semibold text-[#8B7355]">
            {selectedDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
      )}

      {/* Hint */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        {t('delivery.hint')}
      </p>
    </div>
  );
}
