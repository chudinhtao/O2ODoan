import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/Button';
import { DatePicker } from '@/shared/components/ui/DatePicker';
import { ChevronLeft, ChevronRight, Calendar, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onChangeDate: (date: Date) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const SchedulerHeader: React.FC<Props> = ({ 
  currentDate, 
  onPrevWeek, 
  onNextWeek, 
  onToday,
  onChangeDate,
  isFullscreen,
  onToggleFullscreen
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm gap-3">
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/50 shadow-inner">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 !rounded-lg hover:bg-white hover:shadow-sm" onClick={onPrevWeek}>
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <div className="w-px h-3 bg-slate-200 self-center mx-1" />
          <Button variant="ghost" size="sm" className="h-7 text-xs font-bold px-3 !rounded-lg hover:bg-white hover:shadow-sm text-slate-700" onClick={onToday}>
            {t('common.today', 'Hôm nay')}
          </Button>
          <div className="w-px h-3 bg-slate-200 self-center mx-1" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 !rounded-lg hover:bg-white hover:shadow-sm" onClick={onNextWeek}>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <DatePicker 
            value={currentDate} 
            onChange={onChangeDate} 
            label={t('admin.staff.select_date', 'Chọn ngày trong tuần') as string} 
          />
          {onToggleFullscreen && (
            <>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2.5 !rounded-lg transition-all ${isFullscreen ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                onClick={onToggleFullscreen}
                title={isFullscreen ? t('admin.staff.minimize', "Thu nhỏ") : t('admin.staff.maximize', "Phóng to toàn màn hình")}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-bold text-[10px] uppercase tracking-wider hidden sm:block">{t('admin.staff.minimize_text', 'Thu nhỏ')}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-bold text-[10px] uppercase tracking-wider hidden sm:block">{t('admin.staff.maximize_text', 'Toàn màn hình')}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerHeader;
