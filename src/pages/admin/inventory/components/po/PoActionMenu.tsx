import { useTranslation } from 'react-i18next'
import { Eye, CheckCircle, PackageCheck, Ban, SquareCheckBig, Pencil } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { IPurchaseOrder } from '../../types/inventory.type'

interface PoActionMenuProps {
  po: IPurchaseOrder
  onView: () => void
  onReceive: () => void
  onEdit: () => void
  onConfirm: () => void
  onForceComplete: () => void
  onCancel: () => void
}

export default function PoActionMenu({ po, onView, onEdit, onReceive, onConfirm, onForceComplete, onCancel }: PoActionMenuProps) {
  const { t } = useTranslation()

  const baseItems = [
    { label: t('admin.inventory.po.actionView', 'Xem chi tiết'), onClick: onView, icon: <Eye className="w-4 h-4" /> },
  ]

  const draftItems = [
    { label: t('common.edit', 'Sửa'), onClick: onEdit, icon: <Pencil className="w-4 h-4" /> },
    { label: t('admin.inventory.po.actionConfirm', 'Chốt phiếu (Gửi NCC)'), onClick: onConfirm, icon: <CheckCircle className="w-4 h-4" /> },
    { label: t('admin.inventory.po.actionCancel', 'Hủy phiếu'), onClick: onCancel, icon: <Ban className="w-4 h-4" />, variant: 'danger' as const },
  ]

  const confirmedItems = [
    { label: t('admin.inventory.po.actionReceive', 'Nhận hàng'), onClick: onReceive, icon: <PackageCheck className="w-4 h-4" /> },
    { label: t('admin.inventory.po.actionCancel', 'Hủy phiếu'), onClick: onCancel, icon: <Ban className="w-4 h-4" />, variant: 'danger' as const },
  ]

  const partialItems = [
    { label: t('admin.inventory.po.actionReceiveMore', 'Nhận hàng tiếp'), onClick: onReceive, icon: <PackageCheck className="w-4 h-4" /> },
    { label: t('admin.inventory.po.actionForceComplete', 'Đóng phiếu (Chốt thiếu)'), onClick: onForceComplete, icon: <SquareCheckBig className="w-4 h-4" />, variant: 'danger' as const },
  ]

  const actionsByStatus: Record<string, typeof baseItems> = {
    DRAFT:            [...baseItems, ...draftItems],
    CONFIRMED:        [...baseItems, ...confirmedItems],
    PARTIAL_RECEIVED: [...baseItems, ...partialItems],
    COMPLETED:        baseItems,
    CANCELLED:        baseItems,
  }

  const items = actionsByStatus[po.status] ?? baseItems

  return <DropdownMenu items={items} />
}
