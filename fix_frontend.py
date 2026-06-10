import sys
import re

f1 = r'd:\srcDOAN\frontend\src\pages\admin\inventory\components\PurchaseOrderTab.tsx'
with open(f1, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace('min-w-[180px]', 'min-w-48')
content = content.replace('<button className="p-1 rounded hover:bg-slate-100 transition-colors">', '<Button variant="ghost" size="icon" className="size-8">')
content = content.replace('</button>', '</Button>')

content = content.replace('>Mã PO<', '>{t(\'admin.inventory.po.colCode\', \'Mã PO\')}<')
content = content.replace('>Loại<', '>{t(\'admin.inventory.po.colType\', \'Loại\')}<')
content = content.replace('>Nhà cung cấp<', '>{t(\'admin.inventory.po.colSupplier\', \'Nhà cung cấp\')}<')
content = content.replace('>Trạng thái<', '>{t(\'admin.inventory.po.colStatus\', \'Trạng thái\')}<')
content = content.replace('>Tổng tiền<', '>{t(\'admin.inventory.po.colTotal\', \'Tổng tiền\')}<')
content = content.replace('>Ngày tạo<', '>{t(\'admin.inventory.po.colDate\', \'Ngày tạo\')}<')
content = content.replace('>Thao tác<', '>{t(\'admin.inventory.po.colActions\', \'Thao tác\')}<')

content = content.replace('>Nguyên liệu<', '>{t(\'admin.inventory.po.colItem\', \'Nguyên liệu\')}<')
content = content.replace('>Mã lô<', '>{t(\'admin.inventory.po.colBatch\', \'Mã lô\')}<')
content = content.replace('>Hạn sử dụng<', '>{t(\'admin.inventory.po.colExpiry\', \'Hạn sử dụng\')}<')
content = content.replace('>Số lượng<', '>{t(\'admin.inventory.po.colQty\', \'Số lượng\')}<')
content = content.replace('>Đơn giá<', '>{t(\'admin.inventory.po.colPrice\', \'Đơn giá\')}<')
content = content.replace('>Thành tiền<', '>{t(\'admin.inventory.po.colAmount\', \'Thành tiền\')}<')

content = content.replace('>Không có chi tiết hàng hóa<', '>{t(\'admin.inventory.po.noItems\', \'Không có chi tiết hàng hóa\')}<')
content = content.replace('>Chưa có phiếu nhập kho nào<', '>{t(\'admin.inventory.po.empty\', \'Chưa có phiếu nhập kho nào\')}<')
content = content.replace('Bấm "Lập Phiếu Nhập" để tạo mới.', '{t(\'admin.inventory.po.emptyDesc\', \'Bấm Lập Phiếu Nhập để tạo mới.\')}')

with open(f1, 'w', encoding='utf-8') as file:
    file.write(content)

f2 = r'd:\srcDOAN\frontend\src\pages\admin\inventory\components\ItemsTab.tsx'
with open(f2, 'r', encoding='utf-8') as file:
    content2 = file.read()

content2 = content2.replace('<button className="p-1 rounded hover:bg-slate-100 transition-colors">', '<Button variant="ghost" size="icon" className="size-8">')
content2 = content2.replace('</button>', '</Button>')
content2 = content2.replace('>Giá vốn<', '>{t(\'admin.inventory.item.colCostPrice\', \'Giá vốn\')}<')
content2 = content2.replace('>Tồn kho<', '>{t(\'admin.inventory.item.colStock\', \'Tồn kho\')}<')

content2 = content2.replace('>Thông tin cơ bản<', '>{t(\'admin.inventory.item.basicInfo\', \'Thông tin cơ bản\')}<')
content2 = content2.replace('<span>Mã SKU:</span>', '<span>{t(\'admin.inventory.item.sku\', \'Mã SKU\')}:</span>')
content2 = content2.replace('<span>Phân loại:</span>', '<span>{t(\'admin.inventory.item.type\', \'Phân loại\')}:</span>')
content2 = content2.replace('<span>Nhóm hàng:</span>', '<span>{t(\'admin.inventory.item.category\', \'Nhóm hàng\')}:</span>')
content2 = content2.replace('<span>Trạng thái:</span>', '<span>{t(\'admin.inventory.item.status\', \'Trạng thái\')}:</span>')

content2 = content2.replace('>Đang hoạt động<', '>{t(\'admin.inventory.item.active\', \'Đang hoạt động\')}<')
content2 = content2.replace('>Ngừng hoạt động<', '>{t(\'admin.inventory.item.inactive\', \'Ngừng hoạt động\')}<')

content2 = content2.replace('>Chỉ số Tồn kho<', '>{t(\'admin.inventory.item.stockIndexes\', \'Chỉ số Tồn kho\')}<')
content2 = content2.replace('<span>Tồn hiện tại:</span>', '<span>{t(\'admin.inventory.item.currentStock\', \'Tồn hiện tại\')}:</span>')
content2 = content2.replace('<span>Tồn an toàn:</span>', '<span>{t(\'admin.inventory.item.safetyStock\', \'Tồn an toàn\')}:</span>')
content2 = content2.replace('<span>Mức cảnh báo:</span>', '<span>{t(\'admin.inventory.item.warningLevel\', \'Mức cảnh báo\')}:</span>')
content2 = content2.replace('>Sắp hết hàng<', '>{t(\'admin.inventory.item.lowStock\', \'Sắp hết hàng\')}<')
content2 = content2.replace('>Đủ hàng<', '>{t(\'admin.inventory.item.inStock\', \'Đủ hàng\')}<')

content2 = content2.replace('>Chi phí (Tham khảo)<', '>{t(\'admin.inventory.item.costRef\', \'Chi phí (Tham khảo)\')}<')
content2 = content2.replace('<span>Giá vốn TB:</span>', '<span>{t(\'admin.inventory.item.avgCostPrice\', \'Giá vốn TB\')}:</span>')
content2 = content2.replace('<span>ĐVT chuẩn:</span>', '<span>{t(\'admin.inventory.item.baseUom\', \'ĐVT chuẩn\')}:</span>')
content2 = content2.replace('<span>Giá trị tồn:</span>', '<span>{t(\'admin.inventory.item.stockValue\', \'Giá trị tồn\')}:</span>')

content2 = content2.replace('>Chi tiết Lô hàng<', '>{t(\'admin.inventory.item.batchDetails\', \'Chi tiết Lô hàng\')}<')
content2 = content2.replace('>Mã lô<', '>{t(\'admin.inventory.item.batchId\', \'Mã lô\')}<')
content2 = content2.replace('>Hạn sử dụng<', '>{t(\'admin.inventory.item.expiryDate\', \'Hạn sử dụng\')}<')
content2 = content2.replace('>Trạng thái HSD<', '>{t(\'admin.inventory.item.expiryStatus\', \'Trạng thái HSD\')}<')

content2 = content2.replace('>Đã hết hạn<', '>{t(\'admin.inventory.item.expired\', \'Đã hết hạn\')}<')
content2 = content2.replace('>Sắp hết hạn<', '>{t(\'admin.inventory.item.expiringSoon\', \'Sắp hết hạn\')}<')
content2 = content2.replace('>Bình thường<', '>{t(\'admin.inventory.item.normal\', \'Bình thường\')}<')

with open(f2, 'w', encoding='utf-8') as file:
    file.write(content2)
