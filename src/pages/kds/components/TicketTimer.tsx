import { useEffect, useState } from 'react';
import { differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';

interface Props {
  createdAt: string;
}

export const TicketTimer = ({ createdAt }: Props) => {
  const [elapsedString, setElapsedString] = useState('00:00');
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const created = new Date(createdAt);
      
      const diffSec = differenceInSeconds(now, created);
      const diffMin = differenceInMinutes(now, created);
      
      if (diffSec < 0) {
        setElapsedString('00:00');
        setMinutes(0);
        return;
      }
      
      const m = Math.floor(diffSec / 60);
      const s = diffSec % 60;
      
      setElapsedString(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      setMinutes(diffMin);
    };

    // Calculate immediately
    calcTime();
    
    // Update every second
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // Alert colors based on delay:
  // > 15 mins: red & pulse
  // > 10 mins: orange
  // else: gray
  let colorClass = 'text-gray-600 bg-gray-100 border-gray-200';
  let iconClass = 'text-gray-500';
  
  if (minutes >= 15) {
    colorClass = 'text-red-700 bg-red-100 border-red-300 font-bold animate-pulse shadow-sm';
    iconClass = 'text-red-600';
  } else if (minutes >= 10) {
    colorClass = 'text-orange-700 bg-orange-100 border-orange-300 font-semibold shadow-sm';
    iconClass = 'text-orange-600';
  }

  return (
    <div className={`px-2.5 py-1 rounded-md text-sm border flex items-center gap-1.5 transition-colors ${colorClass}`}>
      <Clock className={`w-3.5 h-3.5 ${iconClass}`} />
      <span className="font-mono tracking-wider">{elapsedString}</span>
    </div>
  );
};
