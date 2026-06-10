import * as React from "react"
import { createPortal } from "react-dom"
import { MoreHorizontal } from "lucide-react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

export interface DropdownMenuItem {
  label: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  icon?: React.ReactNode
}

interface DropdownMenuProps {
  trigger?: React.ReactNode
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })
  const [openUp, setOpenUp] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const updateCoords = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const showUp = spaceBelow < 200 // If less than 200px below, open up
      setOpenUp(showUp)

      const menuWidth = 224 // w-56 is 14rem = 224px
      
      // Calculate top/left relative to viewport since we use position: fixed inside Portal
      const top = showUp
        ? rect.top - 8 
        : rect.bottom + 8

      const left = align === 'right'
        ? rect.right - menuWidth
        : rect.left

      setCoords({ top, left })
    }
  }, [align])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = document.getElementById("dropdown-portal-menu")
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        (!menuElement || !menuElement.contains(event.target as Node))
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      updateCoords()
      document.addEventListener("mousedown", handleClickOutside)
      // Capturing scroll event helps track scroll inside any container
      window.addEventListener("scroll", updateCoords, true)
      window.addEventListener("resize", updateCoords)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", updateCoords, true)
      window.removeEventListener("resize", updateCoords)
    }
  }, [isOpen, updateCoords])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const showUp = spaceBelow < 200
      setOpenUp(showUp)

      const menuWidth = 224
      const top = showUp ? rect.top - 8 : rect.bottom + 8
      const left = align === 'right' ? rect.right - menuWidth : rect.left

      setCoords({ top, left })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div ref={triggerRef} onClick={handleToggle} className="cursor-pointer">
        {trigger || (
          <button title={t('common.actions', 'Thao tác')} className="flex items-center text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <MoreHorizontal className="size-5" />
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <div 
          id="dropdown-portal-menu"
          style={{
            position: 'fixed',
            top: openUp ? undefined : `${coords.top}px`,
            bottom: openUp ? `${window.innerHeight - coords.top}px` : undefined,
            left: `${coords.left}px`,
            width: '14rem', // w-56
          }}
          className={clsx(
            "z-[999] rounded-xl bg-white shadow-xl border border-slate-200 focus:outline-none py-1 animate-in fade-in zoom-in-95 duration-100"
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                item.onClick()
                setIsOpen(false)
              }}
              className={clsx(
                "flex w-full items-center px-4 py-2 text-sm gap-2 transition-colors text-left",
                item.variant === 'danger' 
                  ? "text-red-600 hover:bg-red-50" 
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
