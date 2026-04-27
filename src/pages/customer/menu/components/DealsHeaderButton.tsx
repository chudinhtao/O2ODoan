import { Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomerActivePromotions } from '../hooks/useCustomerQueries'

interface DealsHeaderButtonProps {
  onClick: () => void
}

export function DealsHeaderButton({ onClick }: DealsHeaderButtonProps) {
  const { data: bundles } = useCustomerActivePromotions('BUNDLE')

  const count = bundles?.length || 0

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={onClick}
          className="relative h-10 px-3 shrink-0 flex items-center gap-1.5 justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-600 border border-orange-200 shadow-sm active:scale-90 transition-all font-black text-xs"
        >
          <Gift size={16} strokeWidth={2.5} />
          <span>{count} Ưu đãi</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
