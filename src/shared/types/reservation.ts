export interface IReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  adultCount?: number;
  childrenCount?: number;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  depositAmount: number;
  preOrderDraft: string | null;
  note: string | null;
  assignedTableNumbers: number[];
  refundStatus?: string;
}

export interface IReservationRequest {
  customerName: string;
  customerPhone: string;
  partySize: number;
  adultCount?: number;
  childrenCount?: number;
  bookingTime: string;
  note?: string;
  preOrderDraft?: string;
  depositAmount?: number;
}

export interface IUpdateReservationRequest {
  customerName?: string;
  customerPhone?: string;
  partySize?: number;
  adultCount?: number;
  childrenCount?: number;
  bookingTime?: string;
  note?: string;
  preOrderDraft?: string;
  depositAmount?: number;
}

export interface IAssignTableRequest {
  tableIds: string[];
}

export interface ICancelReservationRequest {
  reason?: string;
  status?: 'CANCELLED' | 'NO_SHOW';
  refundStatus?: string;
}

export interface IPreOrderDraftOption {
  optionId: string;
  name?: string;
}

export interface IPreOrderDraftItem {
  menuItemId: string;
  quantity: number;
  options: IPreOrderDraftOption[];
  note?: string;
}

export interface IPreOrderItemState {
  item: { id: string; name: string; basePrice: number };
  qty: number;
  opts: IPreOrderDraftOption[];
  note?: string;
}
