export interface IKdsTicketItem {
  id: string; // The UUID representing kds_ticket_item id
  itemId: string; // the original order ticket item id
  itemName: string;
  quantity: number;
  status: 'PENDING' | 'PREPARING' | 'DONE' | 'SERVED' | 'CANCELLED' | 'RETURNED';
  station: string;
  note?: string;
  options?: string[];
}

export interface IKdsTicket {
  id: string; // UUID of kds_ticket
  ticketId: string; // UUID from order service ticket
  orderId: string;
  tableNumber: number | null;
  status: 'PENDING' | 'PREPARING' | 'DONE' | 'SERVED' | 'CANCELLED' | 'RETURNED';
  createdAt: string; // ISO String
  note?: string;
  items: IKdsTicketItem[];
}
