import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './Button';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="flex flex-col cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[15px] text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">
            {format(value, 'dd/MM/yyyy')}
          </span>
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </Button>
            <span className="font-bold text-slate-800 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isSelected = isSameDay(day, value);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDayToday = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(day);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-center h-10 w-full rounded-xl text-sm font-semibold cursor-pointer transition-all
                    ${!isCurrentMonth ? 'text-slate-300 hover:bg-slate-50' : 'text-slate-700 hover:bg-slate-100'}
                    ${isSelected ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20' : ''}
                    ${isDayToday && !isSelected ? 'border-2 border-primary/20 text-primary' : ''}
                  `}
                >
                  {format(day, dateFormat)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
