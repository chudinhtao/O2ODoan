import { ReactNode } from 'react'
import { StaffCallPopover } from '@/pages/pos/table-map/components/StaffCallPopover'

interface PosHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  hideStaffCall?: boolean
}

export function PosHeader({ title, subtitle, actions, hideStaffCall }: PosHeaderProps) {
  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-outline-variant/30 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-2xl font-black font-headline text-on-surface tracking-tight flex items-center">
          {title}
        </div>
        {subtitle && (
          <div className="flex flex-wrap gap-2 sm:border-l sm:border-outline-variant/30 sm:pl-4">
            {subtitle}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {!hideStaffCall && (
          <div className="flex items-center justify-center bg-surface border border-outline-variant/30 rounded-lg px-2 h-9">
            <StaffCallPopover />
          </div>
        )}
        {actions}
      </div>
    </header>
  )
}
