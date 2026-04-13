import { useRef, useState } from 'react'
import { Bell, Check, Clock } from 'lucide-react'
import { useActiveStaffCalls, useResolveStaffCall } from '../hooks/useStaffCalls'
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'

export function StaffCallPopover() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  useOnClickOutside(menuRef as any, () => setIsOpen(false))

  const { data: calls } = useActiveStaffCalls()
  const { mutate: resolve } = useResolveStaffCall()

  const activeCount = calls?.length || 0

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full ${isOpen ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        <Bell className="size-5" />
        {activeCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] font-bold text-white border-2 border-surface">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl shadow-lg border border-outline-variant overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 bg-surface-variant border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface">{t('pos.staffCalls.popoverTitle')}</h3>
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">
              {activeCount}
            </span>
          </div>
          
          <div className="max-h-[360px] overflow-y-auto">
            {activeCount === 0 ? (
              <div className="px-4 py-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
                <Bell className="size-8 opacity-20" />
                <p className="text-sm">{t('pos.staffCalls.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/50">
                {calls!.map((call) => (
                  <div key={call.id} className="p-3 hover:bg-surface-variant/30 transition-colors flex justify-between group">
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-on-surface bg-primary/10 text-primary px-1.5 rounded">
                          {t('pos.staffCalls.tableBadge', { number: call.tableNumber })}
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant">
                        {t(`pos.staffCalls.type.${call.callType}`, call.callType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                        <Clock className="size-3" />
                        {new Date(call.createdAt).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resolve(call.id)}
                      className="shrink-0 text-primary hover:bg-primary/10 self-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title={t('pos.staffCalls.resolveHint')}
                    >
                      <Check className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

