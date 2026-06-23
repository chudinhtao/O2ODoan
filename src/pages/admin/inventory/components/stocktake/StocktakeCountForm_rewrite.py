import re

file_path = "d:\\srcDOAN\\frontend\\src\\pages\\admin\\inventory\\components\\stocktake\\StocktakeCountForm.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
if "ChevronDown" not in content:
    content = content.replace("Check, X, Save } from 'lucide-react'", "Check, X, Save, ChevronDown, ChevronRight } from 'lucide-react'")

# Add state
if "showZeroItems" not in content:
    content = content.replace("const [confirmFinalize, setConfirmFinalize] = useState(false)", 
                              "const [confirmFinalize, setConfirmFinalize] = useState(false)\n  const [showZeroItems, setShowZeroItems] = useState(false)")

# Replace the tbody logic
old_tbody = """            <tbody className="divide-y divide-surface-dim">
              {sortedItems.map((item) => {
                const sysQty = item.systemQuantity || 0
                const countQty = counts[item.id] || 0
                const diff = countQty - sysQty
                const showDiff = isCompleted ? item.variance : diff

                return (
                  <tr key={item.id} className="hover:bg-surface-container/20">
                    <td className="px-4 py-3 font-medium text-on-surface truncate max-w-[200px]">
                      {item.itemName}
                      {item.itemSku && <div className="text-xs text-on-surface-variant font-normal">{item.itemSku}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-orange-600 font-sans font-bold">{item.lotNumber && item.lotNumber !== 'N/A' ? item.lotNumber : t('admin.inventory.item.batches.outOfSync', 'Lệch kho (Chờ xử lý)')}</div>
                      <div className="text-xs text-on-surface-variant">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '---'}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-on-surface-variant font-medium">
                      {sysQty}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCompleted ? (
                        <span className="font-bold">{item.countedQuantity}</span>
                      ) : (
                        <NumberInput
                          value={counts[item.id]}
                          onChange={(e) => setCounts(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          min={0}
                          step={0.01}
                          className="text-center font-bold text-primary max-w-[120px] mx-auto"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${showDiff > 0 ? 'text-green-600' : showDiff < 0 ? 'text-red-500' : 'text-on-surface-variant'}`}>
                        {showDiff > 0 ? `+${showDiff}` : showDiff}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCompleted ? (
                        <span className="text-on-surface-variant">{item.adjustmentReason || '-'}</span>
                      ) : (
                        <Input
                          placeholder={t('admin.inventory.stocktake.reasonPh', 'VD: Cân sai...')}
                          value={reasons[item.id] || ''}
                          onChange={(e) => setReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="min-w-[150px]"
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>"""

new_tbody = """            <tbody className="divide-y divide-surface-dim">
              {(() => {
                const activeItems = sortedItems.filter(i => (i.systemQuantity || 0) !== 0);
                const zeroItems = sortedItems.filter(i => (i.systemQuantity || 0) === 0);
                
                const renderRow = (item: any) => {
                  const sysQty = item.systemQuantity || 0
                  const countQty = counts[item.id] || 0
                  const diff = countQty - sysQty
                  const showDiff = isCompleted ? item.variance : diff

                  return (
                    <tr key={item.id} className={`hover:bg-surface-container/20 ${sysQty === 0 ? 'bg-surface-container/5' : ''}`}>
                      <td className="px-4 py-3 font-medium text-on-surface truncate max-w-[200px]">
                        {item.itemName}
                        {item.itemSku && <div className="text-xs text-on-surface-variant font-normal">{item.itemSku}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-orange-600 font-sans font-bold">{item.lotNumber && item.lotNumber !== 'N/A' ? item.lotNumber : t('admin.inventory.item.batches.outOfSync', 'Lệch kho (Chờ xử lý)')}</div>
                        <div className="text-xs text-on-surface-variant">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '---'}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-on-surface-variant font-medium">
                        {sysQty}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isCompleted ? (
                          <span className="font-bold">{item.countedQuantity}</span>
                        ) : (
                          <NumberInput
                            value={counts[item.id]}
                            onChange={(e) => setCounts(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                            min={0}
                            step={0.01}
                            className="text-center font-bold text-primary max-w-[120px] mx-auto"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${showDiff > 0 ? 'text-green-600' : showDiff < 0 ? 'text-red-500' : 'text-on-surface-variant'}`}>
                          {showDiff > 0 ? `+${showDiff}` : showDiff}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isCompleted ? (
                          <span className="text-on-surface-variant">{item.adjustmentReason || '-'}</span>
                        ) : (
                          <Input
                            placeholder={t('admin.inventory.stocktake.reasonPh', 'VD: Cân sai...')}
                            value={reasons[item.id] || ''}
                            onChange={(e) => setReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="min-w-[150px]"
                          />
                        )}
                      </td>
                    </tr>
                  )
                }

                return (
                  <>
                    {activeItems.map(renderRow)}
                    
                    {zeroItems.length > 0 && (
                      <>
                        <tr className="bg-surface-container border-t-2 border-surface-dim hover:bg-surface-container cursor-pointer" onClick={() => setShowZeroItems(!showZeroItems)}>
                          <td colSpan={6} className="px-4 py-3 text-sm font-bold text-on-surface-variant flex items-center gap-2">
                            {showZeroItems ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {t('admin.inventory.stocktake.zeroStockSection', 'Các lô đã hết (có biến động gần đây)')} ({zeroItems.length})
                          </td>
                        </tr>
                        {showZeroItems && zeroItems.map(renderRow)}
                      </>
                    )}
                  </>
                );
              })()}
            </tbody>"""

if old_tbody in content:
    content = content.replace(old_tbody, new_tbody)
    print("Replaced old tbody logic successfully.")
else:
    print("Could not find old tbody logic.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
