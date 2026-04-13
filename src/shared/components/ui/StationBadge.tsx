import React from 'react'

export type StationType = 'HOT' | 'COLD' | 'DRINK' | string | undefined | null

interface StationBadgeProps {
  station: StationType
  className?: string
}

export const StationBadge: React.FC<StationBadgeProps> = ({ station, className = '' }) => {
  if (station === 'HOT') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-orange-50 text-orange-600 border border-orange-100 whitespace-nowrap w-fit ${className}`}>
        <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
        Bếp Nóng
      </span>
    )
  }

  if (station === 'COLD') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap w-fit ${className}`}>
        <span className="material-symbols-outlined text-[14px]">ac_unit</span>
        Bếp Lạnh
      </span>
    )
  }

  if (station === 'DRINK') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-purple-50 text-purple-600 border border-purple-100 whitespace-nowrap w-fit ${className}`}>
        <span className="material-symbols-outlined text-[14px]">local_cafe</span>
        Pha Chế
      </span>
    )
  }

  return (
    <span className={`text-slate-400 ${className}`}>—</span>
  )
}
