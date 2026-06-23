import { ReactNode } from "react"
import { Menu } from "lucide-react"

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 sticky top-0 shadow-sm w-full gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-mobile-nav'))}
          className="md:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-base sm:text-xl font-bold font-display text-slate-800 leading-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden md:block truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
