import sys

file_path = r'd:\srcDOAN\frontend\src\pages\pos\order-detail\views\OrderDetailPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''{cancelItemState.status === 'PREPARING' || cancelItemState.status === 'DONE' 
                ? ' ' + t('pos.orderDetail.cancelItem.desc2', 'Món này đã được bếp xử lý, VUI LÒNG NHẬP LÝ DO:') 
                : ' ' + t('pos.orderDetail.cancelItem.desc3', 'Vui lòng nhập lý do huỷ:')}
            </p>'''

replacement = '''{cancelItemState.status === 'PREPARING' || cancelItemState.status === 'DONE' 
                ? ' ' + t('pos.orderDetail.cancelItem.desc2', 'Món này đã được bếp xử lý, VUI LÒNG NHẬP LÝ DO:') 
                : ' ' + t('pos.orderDetail.cancelItem.desc3', 'Vui lòng nhập lý do huỷ:')}
            </p>

            <div className="mb-4 bg-surface-variant p-3 rounded-md">
              <label className="block text-sm font-bold text-on-surface mb-2">
                Trạng thái thực tế tại Bếp (Quan trọng cho Kho)
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="kitchenStatus" 
                    value="PENDING"
                    className="w-4 h-4 text-primary focus:ring-primary border-outline"
                    checked={cancelItemState.status === 'PENDING'}
                    onChange={(e) => setCancelItemState(prev => prev ? {...prev, status: e.target.value} : null)}
                  />
                  <span className="text-sm">Bếp chưa làm (Hoàn tiền kho)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="kitchenStatus" 
                    value="DONE"
                    className="w-4 h-4 text-primary focus:ring-primary border-outline"
                    checked={cancelItemState.status !== 'PENDING'}
                    onChange={(e) => setCancelItemState(prev => prev ? {...prev, status: e.target.value} : null)}
                  />
                  <span className="text-sm text-danger font-medium">Đã/Đang làm (Tính vào Hao hụt)</span>
                </label>
              </div>
            </div>'''

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully added Radio buttons to Cancel Item Modal.")
else:
    print("Target string not found in OrderDetailPage.tsx.")
