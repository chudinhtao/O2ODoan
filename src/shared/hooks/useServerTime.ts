import { useState, useEffect } from 'react';
import { timeService } from '@/services/time.service';

/**
 * useServerTime Hook
 * Trả về thời gian hiện tại đã được đồng bộ với Server.
 * @param refreshMs Tần số cập nhật (mặc định 1000ms = 1 giây)
 */
export const useServerTime = (refreshMs: number = 1000) => {
  const [now, setNow] = useState<number>(timeService.getNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(timeService.getNow());
    }, refreshMs);

    return () => clearInterval(timer);
  }, [refreshMs]);

  return {
    now,
    serverTime: new Date(now),
    // Tiện ích kiểm tra xem một thời điểm đã qua chưa
    isExpired: (targetDate: string | number | Date) => {
      return timeService.parse(targetDate) <= now;
    },
    // Tiện ích tính thời gian còn lại (ms)
    getRemaining: (targetDate: string | number | Date) => {
      return Math.max(0, timeService.parse(targetDate) - now);
    },
    // Kiểm tra xem có đang nằm trong khung giờ lặp lại (Happy Hour) không
    isScheduleActive: (schedules?: any[]) => {
      if (!schedules || schedules.length === 0) return true;
      const d = new Date(now);
      const day = d.getDay(); // 0 = CN, 1 = T2...
      const currentTime = d.getHours().toString().padStart(2, '0') + ':' + 
                          d.getMinutes().toString().padStart(2, '0') + ':' + 
                          d.getSeconds().toString().padStart(2, '0');
      
      return schedules.some(s => {
        if (s.dayOfWeek !== day) return false;
        // Chuỗi s.startTime/endTime có dạng "HH:mm:ss" hoặc "HH:mm"
        const start = s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime;
        const end = s.endTime.length === 5 ? `${s.endTime}:59` : s.endTime;
        return currentTime >= start && currentTime <= end;
      });
    }
  };
};
