import { Clock } from 'lucide-react';
import { useServerTime } from '@/shared/hooks/useServerTime';

interface Props {
  createdAt: string;
}

export const TicketTimer = ({ createdAt }: Props) => {
  const { now } = useServerTime(1000);
  const created = new Date(createdAt).getTime();
  const diffSec = Math.max(0, Math.floor((now - created) / 1000));
  const minutes = Math.floor(diffSec / 60);
  
  const m = Math.floor(diffSec / 60);
  const s = diffSec % 60;
  const elapsedString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;


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
