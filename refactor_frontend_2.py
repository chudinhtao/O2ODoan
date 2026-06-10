import sys

# 1. Update order.service.ts
svc_file = r'd:\srcDOAN\frontend\src\pages\admin\orders\services\order.service.ts'
with open(svc_file, 'r', encoding='utf-8') as f:
    svc_content = f.read()

svc_content = svc_content.replace(
    "cancelItem(orderId: string, itemId: string, reason?: string)",
    "cancelItem(orderId: string, itemId: string, reason?: string, kitchenStatus?: string)"
)
svc_content = svc_content.replace(
    "`/orders/${orderId}/items/${itemId}/cancel`, { reason }",
    "`/orders/${orderId}/items/${itemId}/cancel`, { reason, kitchenStatus }"
)

with open(svc_file, 'w', encoding='utf-8') as f:
    f.write(svc_content)

# 2. Update usePosOrder.ts
hook_file = r'd:\srcDOAN\frontend\src\pages\pos\order-detail\hooks\usePosOrder.ts'
with open(hook_file, 'r', encoding='utf-8') as f:
    hook_content = f.read()

hook_content = hook_content.replace(
    "mutationFn: ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason?: string }) =>",
    "mutationFn: ({ orderId, itemId, reason, kitchenStatus }: { orderId: string, itemId: string, reason?: string, kitchenStatus?: string }) =>"
)
hook_content = hook_content.replace(
    "orderService.cancelItem(orderId, itemId, reason),",
    "orderService.cancelItem(orderId, itemId, reason, kitchenStatus),"
)

with open(hook_file, 'w', encoding='utf-8') as f:
    f.write(hook_content)

# 3. Update OrderDetailPage.tsx
page_file = r'd:\srcDOAN\frontend\src\pages\pos\order-detail\views\OrderDetailPage.tsx'
with open(page_file, 'r', encoding='utf-8') as f:
    page_content = f.read()

page_content = page_content.replace(
    "{ orderId: order.id, itemId: cancelItemState.itemId, reason: cancelItemState.reason },",
    "{ orderId: order.id, itemId: cancelItemState.itemId, reason: cancelItemState.reason, kitchenStatus: cancelItemState.status },"
)

with open(page_file, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Frontend TS files updated successfully!")
