import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'
import { Target, Package, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
  bundleArray: UseFieldArrayReturn<PromotionFormValues, 'bundleItems'>
  categories: any[]
  menuItems: any[]
}

export function TargetBundleSection({ form, bundleArray, categories, menuItems }: Props) {
  const { register, watch, formState: { errors } } = form
  const currentScope = watch('scope')

  if (currentScope === 'ORDER') return null

  return (
    <div className={`rounded-2xl shadow-sm border-2 p-6 space-y-5 ${
      currentScope === 'BUNDLE' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
    }`}>
      <h3 className={`text-base font-bold flex items-center gap-2 ${
        currentScope === 'BUNDLE' ? 'text-amber-800' : 'text-slate-800'
      }`}>
        {currentScope === 'BUNDLE' ? (
          <><Package className="w-5 h-5 text-amber-500" /> Cấu hình Bundle/Combo</>
        ) : (
          <><Target className="w-5 h-5 text-primary" /> Món/Danh mục áp dụng (Target)</>
        )}
      </h3>

      {currentScope === 'PRODUCT' && (
        <div className="flex gap-4">
          <select 
            {...register('targetType')} 
            className="w-1/3 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          >
            <option value="GLOBAL">Tất cả menu</option>
            <option value="CATEGORY">Theo danh mục</option>
            <option value="ITEM">Theo món cụ thể</option>
          </select>

          {watch('targetType') === 'CATEGORY' && (
            <select 
              {...register('targetId')} 
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {watch('targetType') === 'ITEM' && (
            <select 
              {...register('targetId')} 
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="">-- Chọn món ăn --</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {currentScope === 'BUNDLE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-700">Ví dụ: MUA 2 Trà Sữa (BUY) + ĐƯỢC 1 Bánh ngọt (GET) giá 0đ</p>
            <Button 
              type="button" 
              onClick={() => bundleArray.append({ itemId: '', quantity: 1, role: 'BUY' })} 
              className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white !rounded-lg border-none shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm món
            </Button>
          </div>

          <div className="space-y-3">
            {bundleArray.fields.length === 0 && (
              <div className="p-6 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl text-center">
                <Package className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-amber-700">Chưa có món nào, vui lòng thêm món vào Combo.</p>
              </div>
            )}
            
            {bundleArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 bg-white border border-amber-100 rounded-xl shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <select 
                      {...register(`bundleItems.${index}.role` as const)} 
                      className="w-[110px] shrink-0 h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                    >
                      <option value="BUY">🛒 MUA</option>
                      <option value="GET">🎁 TẶNG/GIẢM</option>
                    </select>

                    <select 
                      {...register(`bundleItems.${index}.itemId` as const)} 
                      className="flex-1 min-w-0 h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                    >
                      <option value="">-- Chọn món --</option>
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>

                    <div className="w-[90px] shrink-0 relative flex items-center border border-slate-200 rounded-lg bg-white focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-hidden h-10">
                      <span className="text-xs font-bold text-slate-400 pl-3">SL:</span>
                      <input
                        type="number"
                        {...register(`bundleItems.${index}.quantity` as const, { valueAsNumber: true })}
                        className="w-full h-full bg-transparent px-2 text-sm outline-none font-semibold text-slate-700"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>
                  {errors.bundleItems?.[index]?.itemId && (
                    <p className="text-xs text-red-500 ml-1">{errors.bundleItems[index]?.itemId?.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => bundleArray.remove(index)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50 rounded-lg transition-colors border border-slate-100 mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
