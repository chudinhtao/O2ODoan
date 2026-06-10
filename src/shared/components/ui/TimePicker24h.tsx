import React, { forwardRef, useState, useEffect, useRef } from 'react';

export interface TimePicker24hProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

const TimeListbox = ({ value, options, onChange }: { value: string, options: string[], onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cuộn tới phần tử đang được chọn khi mở
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="appearance-none bg-transparent border-none outline-none cursor-pointer hover:text-primary focus:text-primary focus:bg-primary/5 px-1 py-1 rounded-lg text-center w-12 transition-all flex justify-center items-center"
      >
        {value}
      </button>
      
      {isOpen && (
        <ul className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 w-16 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <li key={opt} className="px-1.5 py-0.5">
                <button
                  type="button"
                  ref={isSelected ? activeRef : null}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-center py-2 text-sm font-bold rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-primary text-white shadow-md shadow-primary/30' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const TimePicker24h = forwardRef<HTMLInputElement, TimePicker24hProps>(
  ({ value = '08:00', onChange, error, className, ...props }, ref) => {
    const [hours, setHours] = useState('08');
    const [minutes, setMinutes] = useState('00');

    useEffect(() => {
      if (value) {
        const [h, m] = value.split(':');
        setHours(h || '08');
        setMinutes(m || '00');
      }
    }, [value]);

    const handleHoursChange = (h: string) => {
      setHours(h);
      if (onChange) onChange(`${h}:${minutes}`);
    };

    const handleMinutesChange = (m: string) => {
      setMinutes(m);
      if (onChange) onChange(`${hours}:${m}`);
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
      <div 
        className={`flex items-center justify-center gap-1 w-full px-2 py-1.5 bg-slate-50 hover:bg-slate-100/80 border ${
          error ? 'border-rose-500' : 'border-slate-200'
        } rounded-xl text-base font-black text-slate-700 focus-within:ring-4 focus-within:ring-primary/20 focus-within:border-primary/50 focus-within:bg-white transition-all shadow-sm ${className || ''}`}
      >
        <TimeListbox value={hours} options={hourOptions} onChange={handleHoursChange} />
        
        <span className="text-slate-300 font-black select-none -translate-y-[1px]">:</span>
        
        <TimeListbox value={minutes} options={minuteOptions} onChange={handleMinutesChange} />
        
        {/* Hidden input to hold the actual value for react-hook-form */}
        <input 
          type="hidden" 
          value={`${hours}:${minutes}`} 
          ref={ref} 
          {...props} 
        />
      </div>
    );
  }
);

TimePicker24h.displayName = 'TimePicker24h';

export default TimePicker24h;
