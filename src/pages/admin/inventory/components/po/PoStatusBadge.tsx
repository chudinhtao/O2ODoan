import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { IPurchaseOrder } from '../../types/inventory.type'

export function PoStatusBadge({ status }: { status: IPurchaseOrder['status'] }) {
  const { t } = useTranslation()
  const map: Record<string, { variant: 'success' | 'danger' | 'warning' | 'neutral'; label: string }> = {
    DRAFT:            { variant: 'warning',  label: t('admin.inventory.po.statusDraft', 'Nháp') },
    CONFIRMED:        { variant: 'neutral',  label: t('admin.inventory.po.statusConfirmed', 'Đã chốt') },
    PARTIAL_RECEIVED: { variant: 'warning',  label: t('admin.inventory.po.statusPartial', 'Nhận 1 phần') },
    COMPLETED:        { variant: 'success',  label: t('admin.inventory.po.statusCompleted', 'Hoàn thành') },
    CANCELLED:        { variant: 'danger',   label: t('admin.inventory.po.statusCancelled', 'Đã hủy') },
  }
  const info = map[status] ?? { variant: 'neutral' as const, label: status }
  return <Badge variant={info.variant}>{info.label}</Badge>
}
