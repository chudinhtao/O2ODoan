import {  useState , useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, RefreshCw, AlertTriangle, Power, Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/shared/components/ui/Table'
import { useInventoryItems, useFormatUom } from '../hooks/useInventoryQueries'
import { useItemMutations } from '../hooks/useInventoryMutations'
import { IInventoryItem, ITEM_TYPE } from '../types/inventory.type'
import ItemFormModal from './ItemFormModal'
import UomConversionModal from './UomConversionModal'
import InventoryKillSwitchModal from './InventoryKillSwitchModal'
import CategoryAsyncSelect from '@/shared/components/inventory/CategoryAsyncSelect'
import ItemTypeSelect from '@/shared/components/inventory/ItemTypeSelect'
import { ExportButton } from '@/shared/components/ExportButton'

export default function ItemsTab() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<IInventoryItem | null>(null)
  const [conversionItem, setConversionItem] = useState<IInventoryItem | null>(null)
  
  const [killSwitchItem, setKillSwitchItem] = useState<IInventoryItem | null>(null)
  const [killSwitchMode, setKillSwitchMode] = useState<'lock' | 'unlock'>('lock')

  const [categoryId, setCategoryId] = useState<string>('')
  const [itemType, setItemType] = useState<string>('')

  const { data, isLoading } = useInventoryItems({ 
    keyword: keyword || undefined, 
    isActive: showInactive ? false : true, 
    categoryId: categoryId || undefined,
    type: itemType || undefined,
    page, 
    size: pageSize 
  })
  const { toggle } = useItemMutations()
  const { formatQty } = useFormatUom()

  const handleOpenAdd = () => {
    setEditItem(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: IInventoryItem) => {
    setEditItem(item)
    setIsModalOpen(true)
  }

  const typeLabel: Record<string, string> = {
    [ITEM_TYPE.RAW]: t('admin.inventory.item.typeRaw'),
    [ITEM_TYPE.RETAIL]: t('admin.inventory.item.typeRetail'),
    [ITEM_TYPE.CONSUMABLE]: t('admin.inventory.item.typeConsumable'),
  }

  const columns: ColumnDef<IInventoryItem>[] = [
    {
      header: t('admin.inventory.item.colSku'),
      accessorKey: 'sku',
      className: 'font-mono text-[10px] text-slate-400',
    },
    {
      header: t('admin.inventory.item.colName'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <Package className="size-4" />
          </div>
          <span className="font-bold text-slate-900">{item.name}</span>
        </div>
      ),
    },
    {
      header: t('admin.inventory.item.colType'),
      cell: (item) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
          {typeLabel[item.type] ?? item.type}
        </span>
      ),
    },
    {
      header: t('admin.inventory.item.colCategory'),
      cell: (item) => <span className="text-slate-600">{item.category?.name ?? '—'}</span>,
    },
    {
      header: t('admin.inventory.item.colStock'),
      cell: (item) => {
        const isLowStock = item.currentStock <= item.safetyStock
        const hasExpiredBatch = item.batches?.some(b => b.expiryDate && new Date(b.expiryDate) < new Date())
        
        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? 'font-bold text-red-600' : 'font-bold text-emerald-600'}>
              {formatQty(item.id, item.currentStock ?? 0, item.baseUom?.name || '')}
            </span>
            {hasExpiredBatch && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          </div>
        )
      },
    },
    {
      header: t('admin.inventory.item.colCostPrice'),
      align: 'right',
      cell: (item) => <span className="font-medium text-slate-700">{item.avgCostPrice?.toLocaleString()} đ</span>,
    },
    {
      header: t('admin.inventory.item.colStatus'),
      cell: (item) => (
        <Badge variant={item.active ? 'success' : 'neutral'}>
          {item.active ? t('admin.inventory.item.statusActive') : t('admin.inventory.item.statusInactive')}
        </Badge>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (item) => (
        <DropdownMenu 
          items={[
            { label: t('admin.inventory.item.editInfo'), onClick: () => handleOpenEdit(item), icon: <Pencil className="w-4 h-4" /> },
            { label: t('admin.inventory.item.convertUnit'), onClick: () => setConversionItem(item), icon: <RefreshCw className="w-4 h-4" /> },
            ...(item.currentStock > 0 ? [{ 
              label: t('admin.inventory.killSwitch.lockAction', 'Báo Hết Khẩn Cấp'), 
              onClick: () => {
                setKillSwitchItem(item);
                setKillSwitchMode('lock');
              }, 
              icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
            }] : [{ 
              label: t('admin.inventory.killSwitch.unlockAction', 'Mở Lại Nguyên Liệu'), 
              onClick: () => {
                setKillSwitchItem(item);
                setKillSwitchMode('unlock');
              }, 
              icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
            }]),
            { 
              label: item.active ? t('admin.inventory.item.deactivate') : t('admin.inventory.item.activate'), 
              onClick: () => toggle.mutate(item.id), 
              icon: <Power className="w-4 h-4" />,
              variant: item.active ? 'danger' : 'default'
            }
          ]}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.item.title')}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowInactive(!showInactive);
              setPage(0);
            }}
            className={`!rounded-lg ${showInactive ? 'bg-slate-100 text-slate-700' : ''}`}
          >
            {showInactive ? t('admin.inventory.item.backToActive', 'Xem đang hoạt động') : t('admin.inventory.item.viewInactive', 'Xem mục ngưng hoạt động')}
          </Button>
          <ExportButton
            data={(data?.content || []).map(item => ({
              ...item,
              safetyStock: item.safetyStock,
              costPrice: item.avgCostPrice,
              totalValue: (item.currentStock ?? 0) * (item.avgCostPrice ?? 0),
              locationNames: Array.from(new Set(item.batches?.map(b => b.locationName).filter(Boolean) || [])).join(', ') || 'Kho hệ thống',
              isActive: item.active ? t('admin.inventory.item.statusActive') : t('admin.inventory.item.statusInactive')
            }))}
            fileName={t('admin.inventory.items.exportFileName', 'Danh_muc_nguyen_lieu')}
            sheetName="NguyenLieu"
            headers={{
              'name': t('admin.inventory.item.colName', 'Tên nguyên liệu'),
              'sku': t('admin.inventory.item.colSku', 'Mã SKU'),
              'category.name': t('admin.inventory.item.colCategory', 'Danh mục'),
              'baseUom.name': t('admin.inventory.item.colUom', 'Đơn vị tính'),
              'currentStock': t('admin.inventory.item.colStock', 'Tồn kho hiện tại'),
              'safetyStock': t('admin.inventory.item.safetyStock', 'Tồn tối thiểu'),
              'costPrice': t('admin.inventory.item.colCostPrice', 'Giá vốn'),
              'totalValue': t('admin.inventory.item.totalValue', 'Tổng giá trị tồn kho'),
              'locationNames': t('admin.inventory.item.locationNames', 'Khu vực lưu trữ'),
              'type': t('admin.inventory.item.colType', 'Loại'),
              'isActive': t('admin.inventory.item.colStatus', 'Trạng thái')
            }}
          />
          <Button size="sm" onClick={handleOpenAdd} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.item.addNew')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        searchPlaceholder={t('admin.inventory.item.search')}
        searchValue={keyword}
        onSearchChange={(val) => { setKeyword(val); setPage(0); }}
        filters={
          <div className="flex items-center gap-2">
            <div className="w-48">
              <CategoryAsyncSelect
                value={categoryId}
                onChange={(val) => { setCategoryId(val); setPage(0); }}
                label=""
                placeholder={t('admin.inventory.item.allCategories')}
                className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
              />
            </div>
            <div className="w-40">
              <ItemTypeSelect
                value={itemType}
                onChange={(val) => { setItemType(val); setPage(0); }}
                label=""
                placeholder={t('admin.inventory.item.allTypes')}
                className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
              />
            </div>
          </div>
        }
        renderExpansion={(item) => (
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t('admin.inventory.item.batches.title')}
              </span>
              <Badge variant="neutral" className="text-[9px]">
                {t('admin.inventory.item.batches.count', { count: item.batches?.length || 0 })}
              </Badge>
            </div>
            {item.batches && item.batches.filter(b => b.currentStock !== 0).length > 0 ? (
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="!bg-transparent hover:!bg-transparent border-b border-slate-100">
                    <TableHead className="!h-8 text-[10px] font-bold text-slate-400">Khu vực lưu trữ</TableHead>
                    <TableHead className="!h-8 text-[10px] font-bold text-slate-400">{t('admin.inventory.item.batches.colLot')}</TableHead>
                    <TableHead className="!h-8 text-[10px] font-bold text-slate-400">{t('admin.inventory.item.batches.colExpiry')}</TableHead>
                    <TableHead className="!h-8 text-[10px] font-bold text-slate-400 text-right">{t('admin.inventory.item.batches.colStock')}</TableHead>
                    <TableHead className="!h-8 text-[10px] font-bold text-slate-400 text-center">{t('admin.inventory.item.batches.colStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.batches.filter(b => b.currentStock !== 0).map((batch) => {
                    const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date()
                    const isNegative = batch.currentStock < 0
                    return (
                      <TableRow key={batch.id} className="!bg-transparent hover:!bg-slate-50/50 border-b border-slate-50 last:border-0">
                        <TableCell className="py-2 text-[11px] text-slate-600 font-medium">
                          {batch.locationName || 'Kho Hệ Thống'}
                        </TableCell>
                        <TableCell className="py-2 font-mono text-[11px] font-bold text-slate-700">
                          {batch.lotNumber === 'N/A' ? <span className="text-orange-600 font-sans">{t('admin.inventory.item.batches.outOfSync', 'Lệch kho (Chờ xử lý)')}</span> : batch.lotNumber}
                        </TableCell>
                        <TableCell className="py-2 text-[11px] text-slate-600">
                          {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : '—'}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <span className={`text-[11px] font-bold ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
                            {isNegative && '-'}{formatQty(item.id, Math.abs(batch.currentStock), item.baseUom?.name || '')}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {isNegative ? (
                             <Badge variant="danger" className="px-1.5 py-0 text-[9px]">
                               {t('admin.inventory.item.batches.statusNegative', 'Âm kho')}
                             </Badge>
                          ) : isExpired ? (
                            <Badge variant="danger" className="px-1.5 py-0 text-[9px]">
                              {t('admin.inventory.item.batches.statusExpired')}
                            </Badge>
                          ) : (
                            <Badge variant="success" className="px-1.5 py-0 text-[9px]">
                              {t('admin.inventory.item.batches.statusStable')}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">{t('admin.inventory.item.batches.empty')}</p>
              </div>
            )}
          </div>
        )}
        pagination={{
          currentPage: page,
          totalPages: data?.totalPages ?? 0,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: data?.totalElements ?? 0,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(0)
          }
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.item.empty')}</p>
            <p className="text-sm mt-1">{t('admin.inventory.item.emptyDesc')}</p>
          </div>
        }
      />

      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editItem={editItem}
      />

      {conversionItem && (
        <UomConversionModal
          isOpen={!!conversionItem}
          onClose={() => setConversionItem(null)}
          item={conversionItem}
        />
      )}

      {killSwitchItem && (
        <InventoryKillSwitchModal
          isOpen={!!killSwitchItem}
          onClose={() => setKillSwitchItem(null)}
          item={killSwitchItem}
          mode={killSwitchMode}
        />
      )}
    </div>
  )
}
