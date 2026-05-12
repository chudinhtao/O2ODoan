import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, PlusCircle, Check } from 'lucide-react'
import { ICart, IMenuItem } from '../types'
import { customerService } from '../services/customerService'

interface BundleMissionDrawerProps {
  isOpen: boolean
  onClose: () => void
  bundle: any
  cart: ICart | undefined
  onQuickAdd: (item: IMenuItem) => void
}

export function BundleMissionDrawer({
  isOpen,
  onClose,
  bundle,
  cart,
  onQuickAdd
}: BundleMissionDrawerProps) {
  const [itemsInfo, setItemsInfo] = useState<Record<string, IMenuItem>>({})

  useEffect(() => {
    if (!bundle || !isOpen) return
    const fetchItemsInfo = async () => {
      const newInfo: Record<string, IMenuItem> = {}
      for (const bi of bundle.bundleItems) {
        if (!itemsInfo[bi.itemId]) {
          try {
            newInfo[bi.itemId] = await customerService.getItemDetails(bi.itemId)
          } catch (e) {}
        }
      }
      setItemsInfo(prev => ({ ...prev, ...newInfo }))
    }
    fetchItemsInfo()
  }, [bundle, isOpen])

  if (!isOpen || !bundle) return null

  // Calculate mission progress
  const cartItemCounts: Record<string, number> = {}
  cart?.items.forEach(ci => {
    cartItemCounts[ci.menuItemId] = (cartItemCounts[ci.menuItemId] || 0) + ci.quantity
  })

  // Deep copy for consuming available quantity during render
  const availableQty = { ...cartItemCounts }

  let allCompleted = true
  const tasks = bundle.bundleItems.map((bi: any) => {
    const required = bi.quantity
    const available = availableQty[bi.itemId] || 0
    const allocated = Math.min(required, available)
    
    // Consume the assigned quantity so same-item promos don't double dip
    availableQty[bi.itemId] = available - allocated
    
    const isCompleted = allocated >= required
    if (!isCompleted) allCompleted = false
    
    return { ...bi, qtyInCart: allocated, isCompleted }
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="shrink-0 flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="px-6 pb-4 shrink-0 flex items-start flex-col gap-2">
              <div className="flex w-full justify-between items-center mb-1">
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-black uppercase rounded-lg">
                  Nhiệm vụ Combo
                </span>
                <button
                  onClick={onClose}
                  className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">
                {bundle.name}
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Hãy thu thập đủ các món dưới đây vào giỏ hàng để giải mã ưu đãi này nhé!
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 pb-8">
              {tasks.map((task: any) => {
                const item = itemsInfo[task.itemId]
                return (
                  <div 
                    key={task.itemId}
                    className={`
                      relative rounded-2xl border-2 p-3 flex items-center gap-3 transition-all duration-300
                      ${task.isCompleted ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-orange-200'}
                    `}
                  >
                    {/* Item Image */}
                    <div className="size-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                      {item?.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-300">
                           No Image
                         </div>
                      )}
                      
                      {/* Check Overlay */}
                      <AnimatePresence>
                        {task.isCompleted && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 bg-emerald-500/80 backdrop-blur-[2px] flex items-center justify-center"
                          >
                            <CheckCircle2 className="size-6 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          {task.role === 'BUY' ? 'Món mua' : (task.role === 'GET' ? 'Món tặng' : 'Món bắt buộc')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">
                        {item ? item.name : <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${task.isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((task.qtyInCart / task.quantity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-black ${task.isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {task.qtyInCart}/{task.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!task.isCompleted && item && (
                      <button 
                        onClick={() => onQuickAdd(item)}
                        className="shrink-0 size-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-all active:scale-95"
                      >
                        <PlusCircle size={20} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            
            {allCompleted && (
              <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 shrink-0">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-black mb-3">
                  <Check className="size-5" />
                  <span>Nhiệm vụ hoàn tất!</span>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Tuyệt vời
                </button>
              </div>
            )}
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
