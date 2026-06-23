import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Package, Ruler, FolderTree, Truck, ChefHat, 
  ClipboardList, ClipboardCheck, Activity, ShieldAlert, 
  AlertTriangle, BarChart3, MapPin, ArrowRightLeft
} from 'lucide-react'
import ItemsTab from '../components/ItemsTab'
import AnalyticsTab from '../components/AnalyticsTab'
import UomTab from '../components/UomTab'
import LocationTab from '../components/LocationTab'
import CategoryTab from '../components/CategoryTab'
import SupplierTab from '../components/SupplierTab'
import RecipeTab from '../components/RecipeTab'
import PurchaseOrderTab from '../components/PurchaseOrderTab'
import StocktakeTab from '../components/StocktakeTab'
import TransactionsTab from '../components/TransactionsTab'
import ExpiringStockTab from '../components/ExpiringStockTab'
import LowStockTab from '../components/LowStockTab'
import TransferTab from '../components/TransferTab'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { Select } from '@/shared/components/ui/Select'

const TABS = [
  { key: 'analytics',    icon: <BarChart3 className="w-4 h-4" />,     labelKey: 'admin.inventory.tabs.analytics', fallback: 'Tổng quan' },
  { key: 'items',         icon: <Package className="w-4 h-4" />,       labelKey: 'admin.inventory.tabs.items', fallback: 'Mặt hàng' },
  { key: 'locations',     icon: <MapPin className="w-4 h-4" />,        labelKey: 'admin.inventory.tabs.locations', fallback: 'Khu vực lưu trữ' },
  { key: 'uoms',          icon: <Ruler className="w-4 h-4" />,         labelKey: 'admin.inventory.tabs.uoms', fallback: 'Đơn vị tính' },
  { key: 'categories',    icon: <FolderTree className="w-4 h-4" />,    labelKey: 'admin.inventory.tabs.categories', fallback: 'Danh mục' },
  { key: 'suppliers',     icon: <Truck className="w-4 h-4" />,         labelKey: 'admin.inventory.tabs.suppliers', fallback: 'Nhà cung cấp' },
  { key: 'recipes',       icon: <ChefHat className="w-4 h-4" />,       labelKey: 'admin.inventory.tabs.recipes', fallback: 'Công thức' },
  { key: 'po',            icon: <ClipboardList className="w-4 h-4" />, labelKey: 'admin.inventory.tabs.po', fallback: 'Nhập hàng' },
  { key: 'transfer',      icon: <ArrowRightLeft className="w-4 h-4" />,labelKey: 'admin.inventory.tabs.transfer', fallback: 'Chuyển kho' },
  { key: 'stocktake',     icon: <ClipboardCheck className="w-4 h-4" />,labelKey: 'admin.inventory.tabs.stocktake', fallback: 'Kiểm kê' },
  { key: 'transactions',  icon: <Activity className="w-4 h-4" />,      labelKey: 'admin.inventory.tabs.transactions', fallback: 'Lịch sử' },
  { key: 'expiring',      icon: <AlertTriangle className="w-4 h-4" />, labelKey: 'admin.inventory.tabs.expiring', fallback: 'Cận date' },
  { key: 'low-stock',     icon: <ShieldAlert className="w-4 h-4" />,   labelKey: 'admin.inventory.tabs.lowStock', fallback: 'Sắp hết' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function InventoryPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('analytics')
  const [navParams, setNavParams] = useState<any>(null)

  const handleNavigate = (tab: string, params?: any) => {
    setActiveTab(tab as TabKey)
    setNavParams(params || null)
  }

  const activeTabInfo = TABS.find(tab => tab.key === activeTab)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
      <AdminPageHeader
        title={t('admin.inventory.title', 'Quản lý Kho')}
        description={t('admin.inventory.desc', 'Quản lý nguyên vật liệu, công thức, nhập hàng và kiểm kê kho.')}
        actions={
          <div className="w-64">
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
              options={TABS.map(tab => ({
                value: tab.key,
                label: t(tab.labelKey, tab.fallback)
              }))}
              icon={activeTabInfo?.icon}
              className="!bg-white !border-slate-200 !rounded-xl shadow-sm font-bold text-slate-700"
            />
          </div>
        }
      />

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 md:px-6 pb-6">
        <div className="flex-1 flex flex-col min-h-0 pt-6 overflow-hidden">
          <div className="max-w-[2000px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeTab === 'analytics' && <div className="flex-1 overflow-y-auto custom-scrollbar"><AnalyticsTab onNavigate={handleNavigate} /></div>}
            {activeTab === 'items' && <ItemsTab />}
            {activeTab === 'locations' && <LocationTab />}
            {activeTab === 'uoms' && <UomTab />}
            {activeTab === 'categories' && <CategoryTab />}
            {activeTab === 'suppliers' && <SupplierTab />}
            {activeTab === 'recipes' && <RecipeTab />}
            {activeTab === 'po' && <PurchaseOrderTab navParams={navParams} />}
            {activeTab === 'transfer' && <TransferTab />}
            {activeTab === 'stocktake' && <StocktakeTab />}
            {activeTab === 'transactions' && <TransactionsTab navParams={navParams} />}
            {activeTab === 'expiring' && <ExpiringStockTab onNavigate={handleNavigate} />}
            {activeTab === 'low-stock' && <LowStockTab onNavigate={handleNavigate} />}
          </div>
        </div>
      </div>
    </div>
  )
}
