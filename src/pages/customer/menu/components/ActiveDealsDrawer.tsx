import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Info, ChevronRight, Sparkles } from 'lucide-react'
import { useCustomerActivePromotions } from '../hooks/useCustomerQueries'
import { Skeleton } from '@/shared/components/ui/Skeleton'

interface ActiveDealsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectBundle: (bundle: any) => void
}

export function ActiveDealsDrawer({ isOpen, onClose, onSelectBundle }: ActiveDealsDrawerProps) {
  const { data: bundles, isLoading } = useCustomerActivePromotions('BUNDLE')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-[#f8fafc] rounded-t-[32px] overflow-hidden flex flex-col max-h-[85vh] min-h-[50vh]"
      >
        <div className="shrink-0 flex justify-center pt-3 pb-2 bg-white">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pb-4 pt-2 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Gift size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">
                Ưu đãi của bạn
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {bundles?.length || 0} Combo đang diễn ra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
             <div className="space-y-3">
               <Skeleton className="w-full h-[110px] rounded-2xl" />
               <Skeleton className="w-full h-[110px] rounded-2xl" />
             </div>
          ) : bundles && bundles.length > 0 ? (
            bundles.map((bundle: any) => (
              <div 
                key={bundle.id}
                onClick={() => {
                  onClose()
                  setTimeout(() => onSelectBundle(bundle), 100) // Delay slight to allow close anim
                }}
                className="group cursor-pointer w-full bg-gradient-to-br from-[#ff7a00] to-[#ff5000] p-[1px] rounded-2xl shadow-sm relative overflow-hidden active:scale-[0.98] transition-all"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
                  <Sparkles className="size-24" />
                </div>
                
                <div className="bg-white/95 backdrop-blur-md rounded-[15px] p-3.5 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-md shrink-0">Combo</span>
                      <p className="text-sm font-black text-slate-800">{bundle.name}</p>
                    </div>
                    
                    {bundle.description ? (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {bundle.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                        Bấm để xem nhiệm vụ và thu thập các món trong Combo này nhé!
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                      <Info className="size-3" />
                      <span>Chiết khấu tự động</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-orange-100 flex items-center gap-1 text-orange-600 font-bold text-[11px] group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      Làm nhiệm vụ <ChevronRight size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
               <Gift className="size-12 mb-3 opacity-20" />
               <p className="text-sm font-semibold">Chưa có ưu đãi nào</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
