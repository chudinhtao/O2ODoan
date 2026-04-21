import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: string
  onExpire?: () => void
  showIcon?: boolean
  className?: string
}

import { useServerTime } from '@/shared/hooks/useServerTime'

export function CountdownTimer({ endDate, onExpire, showIcon = true, className = "" }: CountdownTimerProps) {
  const { now, getRemaining } = useServerTime(1000)
  const difference = getRemaining(endDate)
  
  const hours = Math.floor(difference / (1000 * 60 * 60))
  const minutes = Math.floor((difference / 1000 / 60) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  const timeLeft = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':')

  const isExpiringSoon = difference < 3600000 && difference > 0

  useEffect(() => {
    if (difference <= 0) {
      onExpire?.()
    }
  }, [difference <= 0, onExpire])


  if (!timeLeft) return null

  return (
    <div className={`flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-md shadow-sm ${isExpiringSoon ? 'bg-red-500/90 text-white animate-pulse' : 'bg-slate-900/40 text-white border border-white/20'} ${className}`}>
      {showIcon && <Clock size={10} className={isExpiringSoon ? 'animate-spin-slow' : ''} />}
      <span>{timeLeft}</span>
    </div>
  )
}
