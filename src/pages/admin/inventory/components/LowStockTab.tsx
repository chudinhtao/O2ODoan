import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldAlert, PackageSearch } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { inventoryService } from '../services/inventory.service'
import { ILowStockItemResponse } from '../types/inventory.type'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { Badge } from '@/shared/components/ui/Badge'
import { toast } from 'sonner'
import { IPurchaseSuggestion } from '../types/inventory.type'
import { useTranslation } from 'react-i18next'
import CategoryAsyncSelect from '@/shared/components/inventory/CategoryAsyncSelect'
import { ExportButton } from '@/shared/components/ExportButton'

interface LowStockTabProps {
  onNavigate?: (tab: string, params?: any) => void
}

export default function LowStockTab({ onNavigate }: LowStockTabProps) {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'reports', 'low-stock'],
    queryFn: () => inventoryService.getLowStockItems(),
    staleTime: 60_000,
  })

  const items: ILowStockItemResponse[] = data || []
  
  const filteredItems = items.filter(item => {
    if (categoryId && item.categoryId !== categoryId) return false
    if (!keyword) return true
    const k = keyword.toLowerCase()
    return (
      item.itemName.toLowerCase().includes(k) || 
      item.itemSku.toLowerCase().includes(k)
    )
  })

  const paginatedData = filteredItems.slice(page * pageSize, (page + 1) * pageSize)

  const columns: ColumnDef<ILowStockItemResponse>[] = [
    {
      header: t('admin.inventory.lowStock.colItem', 'Nguyên liệu'),
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.itemName}</span>
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{item.itemSku}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.lowStock.colCurrent', 'Tồn thực tế'),
      align: 'right',
      cell: (item) => {
        const pct = item.safetyStock > 0 ? (item.currentStock / item.safetyStock) * 100 : 0
        const isCritical = pct === 0
        return (
          <div className="flex flex-col items-end">
            <span className={`font-bold text-lg ${isCritical ? 'text-red-600' : 'text-orange-500'}`}>
              {item.currentStock.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">{item.uomName}</span>
          </div>
        )
      }
    },
    {
      header: t('admin.inventory.lowStock.colSafety', 'Mức an toàn'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-600">{item.safetyStock.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 uppercase font-medium">{item.uomName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.lowStock.colReorder', 'Cần nhập thêm'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-primary">+{item.reorderAmount.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 uppercase font-medium">{item.uomName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.lowStock.colLevel', 'Mức độ'),
      align: 'center',
      cell: (item) => {
        const pct = item.safetyStock > 0 ? (item.currentStock / item.safetyStock) * 100 : 0
        if (pct === 0) return <Badge variant="danger">{t('admin.inventory.lowStock.statusOutOfStock', 'Hết hàng')}</Badge>
        if (pct < 50) return <Badge variant="warning">{t('admin.inventory.lowStock.statusDanger', 'Nguy hiểm')}</Badge>
        return <Badge variant="neutral">{t('admin.inventory.lowStock.statusLow', 'Thấp')}</Badge>
      }
    },
    {
      header: '',
      align: 'right',
      cell: (item) => (
        <Button 
          size="sm" 
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => {
            const suggestion: IPurchaseSuggestion = {
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              currentStock: item.currentStock,
              safetyStock: item.safetyStock,
              suggestedQuantity: item.reorderAmount,
              supplierId: null,
              supplierName: t('admin.inventory.lowStock.noSupplier', 'Chưa có NCC'),
              uomId: '', // Placeholder since it's not provided by API
              uomName: item.uomName
            }
            if (onNavigate) {
              onNavigate('po', { suggestion })
            } else {
              toast.info(t('admin.inventory.lowStock.toastRedirect', 'Tính năng đang được tích hợp. Sẽ tự động chuyển sang tab Nhập hàng.'))
            }
          }}
        >
          {t('admin.inventory.lowStock.btnReorder', 'Nhập Hàng')}
        </Button>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.lowStock.title', 'Cảnh báo Tồn kho thấp')}
        </h2>
        <div className="flex items-center gap-2">
        
          <ExportButton
            data={filteredItems.map(item => ({
              ...item,
              costPrice: item.avgCostPrice || 0,
              reorderValue: (item.reorderAmount || 0) * (item.avgCostPrice || 0),
              status: item.currentStock === 0 
                ? t('admin.inventory.lowStock.statusOutOfStock', 'Hết hàng') 
                : (item.currentStock / item.safetyStock) * 100 < 50 
                  ? t('admin.inventory.lowStock.statusDanger', 'Nguy hiểm') 
                  : t('admin.inventory.lowStock.statusLow', 'Thấp')
            }))}
            fileName={t('admin.inventory.lowStock.exportFileName', 'Canh_bao_ton_kho_thap')}
            sheetName="TonKhoThap"
            headers={{
              'itemName': t('admin.inventory.lowStock.colItem', 'Tên nguyên liệu'),
              'itemSku': t('admin.inventory.item.colSku', 'Mã SKU'),
              'categoryName': t('admin.inventory.item.colCategory', 'Danh mục'),
              'currentStock': t('admin.inventory.lowStock.colCurrent', 'Tồn kho hiện tại'),
              'safetyStock': t('admin.inventory.lowStock.colSafety', 'Mức an toàn'),
              'uomName': t('admin.inventory.item.colUom', 'Đơn vị'),
              'reorderAmount': t('admin.inventory.lowStock.colReorder', 'Cần nhập thêm'),
              'costPrice': t('admin.inventory.item.colCostPrice', 'Giá vốn'),
              'reorderValue': t('admin.inventory.lowStock.reorderValue', 'Giá trị cần nhập'),
              'status': t('admin.inventory.lowStock.colLevel', 'Mức độ cảnh báo')
            }}
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4 animate-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {t('admin.inventory.lowStock.alertPrefix', 'Có')}{' '}
            <span className="font-bold">{items.length}</span>{' '}
            {t('admin.inventory.lowStock.alertSuffix', 'mặt hàng đang ở mức tồn kho thấp/nguy hiểm. Vui lòng lập phiếu nhập kho sớm.')}
          </p>
        </div>
      )}

      <DataTable<ILowStockItemResponse>
        columns={columns}
        data={paginatedData.map(item => ({ ...item, id: item.itemId }))}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        searchValue={keyword}
        onSearchChange={(val) => { setKeyword(val); setPage(0) }}
        filters={
          <div className="w-44">
            <CategoryAsyncSelect
              value={categoryId}
              onChange={setCategoryId}
              label=""
              placeholder={t('admin.inventory.lowStock.allCategories', 'Tất cả nhóm')}
              className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
            />
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(filteredItems.length / pageSize),
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: filteredItems.length,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(0)
          }
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <PackageSearch className="w-12 h-12 mb-3 opacity-20 text-green-500" />
            <p className="text-lg font-bold text-slate-600">{t('admin.inventory.lowStock.emptyTitle', 'Tuyệt vời! Tất cả nguyên liệu đủ hàng.')}</p>
          </div>
        }
      />
    </div>
  )
}
