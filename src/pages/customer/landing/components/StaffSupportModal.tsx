import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomerCallStaff } from '../../menu/hooks/useCustomerMutations'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SuccessState } from './SuccessState'
import { SupportGrid } from './SupportGrid'

interface StaffSupportModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
}

export function StaffSupportModal({ isOpen, onClose, token }: StaffSupportModalProps) {
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState<string>('CALL')
  const [note, setNote] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const callStaffMutation = useCustomerCallStaff(token)

  const handleSubmit = async () => {
    try {
      await callStaffMutation.mutateAsync({ callType: selectedType, note })
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2500)
    } catch (error) {
      toast.error(t('customer.support.failedToCallStaff') || 'Đã có lỗi xảy ra')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-guest-bg shadow-2xl z-50 flex flex-col font-sans h-5/6 rounded-t-3xl overflow-hidden max-w-md mx-auto"
          >
            {isSuccess ? (
              <SuccessState />
            ) : (
              <>
                <div className="bg-amber-100 px-4 py-2 flex items-center justify-center border-b border-amber-200">
                  <span className="text-amber-700 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">support_agent</span>
                    {t('customer.support.quickSupport')}
                  </span>
                </div>

                <div className="flex items-center p-4 justify-between bg-guest-bg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={onClose}
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                    </Button>
                    <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{t('customer.support.callStaff')}</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 pt-2 pb-6">
                    <h3 className="text-slate-900 text-2xl font-bold leading-tight">{t('customer.support.howCanWeHelp')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('customer.support.chooseRequest')}</p>
                  </div>

                  <SupportGrid selectedType={selectedType} setSelectedType={setSelectedType} />

                  <div className="px-4 flex flex-col gap-3 pb-8">
                    <label className="text-slate-900 text-sm font-bold">{t('customer.support.additionalNote')}</label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full min-h-24 resize-none"
                      placeholder={t('customer.support.notePlaceholder')}
                    />
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 shadow-md pt-4 pb-8">
                  <Button
                    variant="guest"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={callStaffMutation.isPending}
                    className="w-full"
                  >
                    {t('customer.support.sendRequest')}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

