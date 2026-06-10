import json

en_path = r'd:\srcDOAN\frontend\src\config\locales\en.json'

with open(en_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

res = data['pos']['reservations']

# Translate remaining Vietnamese in pos.reservations
res['status']['ALL'] = "All Status"

res['action']['viewDetail'] = "View Details"

res['preorder']['title'] = "Pre-order Items"
res['preorder']['add'] = "Add Item"
res['preorder']['empty'] = "No items selected"
res['preorder']['added'] = "Added to reservation!"
res['preorder']['selectItem'] = "Select Pre-order Item"

res['createNew'] = "Create New Reservation"

res['form']['customer_name'] = "Customer Name"
res['form']['placeholder']['name'] = "Ex: John Doe"
res['form']['placeholder']['phone'] = "Ex: 0912345678"
res['form']['placeholder']['deposit'] = "Ex: 500000"
res['form']['placeholder']['note'] = "Ex: Need baby chair, allergy..."
res['form']['phone'] = "Phone Number"
res['form']['booking_time'] = "Arrival Time"
res['form']['deposit'] = "Deposit Amount (VND)"
res['form']['emptyIfNoDeposit'] = "(Leave empty if no deposit)"
res['form']['note'] = "Notes"
res['form']['partySize'] = "Party Size"

res['detailTitle'] = "Reservation Details"
res['deposit'] = "Deposit"

res['refund']['refunded'] = "Refunded"
res['refund']['pending'] = "Pending Refund"
res['refund']['none'] = "No Refund"
res['refund']['not_required'] = "Not Required (No-show)"

res['edit'] = "Edit"
res['no_show'] = "No Show"
res['cancel'] = "Cancel"
res['confirm_cancel'] = "Confirm Cancellation"
res['cancel_reason_placeholder'] = "Enter cancellation reason (optional)..."
res['refund_status'] = "Refund Status"
res['back'] = "Back"
res['confirm'] = "Confirm"
res['unassigned'] = "Unassigned"
res['allDay'] = "All Day"
res['noEvents'] = "No reservations."
res['createSuccess'] = "Reservation created successfully!"
res['view_list'] = "List View"
res['view_map'] = "Map View"
res['title'] = "Reservations"
res['description'] = "Manage table reservations, table assignments, and service status"
res['create'] = "Create Reservation"
res['search'] = "Search by name, phone..."

# Fix the single quote typo in page_info in BOTH en and vi
res['page_info'] = "Page {{page}} / {{total}} (Total {{count}})"

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Also fix page_info in vi.json
vi_path = r'd:\srcDOAN\frontend\src\config\locales\vi.json'
with open(vi_path, 'r', encoding='utf-8') as f:
    vi_data = json.load(f)
vi_data['pos']['reservations']['page_info'] = "Trang {{page}} / {{total}} (Tổng {{count}})"
with open(vi_path, 'w', encoding='utf-8') as f:
    json.dump(vi_data, f, ensure_ascii=False, indent=2)

print("Translated en.json successfully.")
