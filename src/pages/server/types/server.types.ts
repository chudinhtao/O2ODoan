export interface TicketDeliveryDto {
  tableNumber: number;
  tableId: string;
  zone: string | null;
  items: DeliveryItem[];
}

export interface DeliveryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  station: string;
  status: string;
  readyAt: string;
  unitPrice: number;
  note: string | null;
  isUrgent: boolean;
  deliveryAlertSent?: boolean;
}

export interface ServeItemsRequest {
  itemIds: string[];
}

export interface StaffCallResponse {
  id: string;
  sessionId: string;
  tableId: string;
  tableNumber: number | null;
  callType: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  acceptedBy: string | null;
  acceptedAt: string | null;
  message?: string;
  isSpilloverSent?: boolean;
}

export interface ServerKpiResponse {
  totalServed: number;
  totalResolved: number;
  avgResponseSeconds: number;
  avgDeliverySeconds: number;
}
