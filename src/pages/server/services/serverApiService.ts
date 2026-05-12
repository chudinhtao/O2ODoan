import httpClient from '@/services/interceptor';
import { IApiResponse as ApiResponse } from '@/shared/types/IApiResponse';
import {
  ServerKpiResponse,
  ServeItemsRequest,
  StaffCallResponse,
  TicketDeliveryDto,
} from '../types/server.types';

class ServerApiService {
  private readonly baseUrl = '/orders/server';
  private readonly tablesUrl = '/tables';

  // ===== Deliveries =====
  async getPendingDeliveries(zones?: string[]): Promise<TicketDeliveryDto[]> {
    const params = zones && zones.length > 0 ? { zones: zones.join(',') } : {};
    const res = await httpClient.get<ApiResponse<TicketDeliveryDto[]>>(`${this.baseUrl}/deliveries`, { params });
    return res.data.data;
  }

  async serveItems(request: ServeItemsRequest): Promise<string> {
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/deliveries/serve`, request);
    return res.data.data;
  }

  async claimDelivery(request: ServeItemsRequest): Promise<string> {
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/deliveries/claim`, request);
    return res.data.data;
  }

  async unclaimDelivery(request: ServeItemsRequest): Promise<string> {
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/deliveries/unclaim`, request);
    return res.data.data;
  }

  async unserveItems(request: ServeItemsRequest): Promise<string> {
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/deliveries/unserve`, request);
    return res.data.data;
  }

  // ===== Staff Calls =====
  async getActiveCalls(zones?: string[]): Promise<StaffCallResponse[]> {
    const params = zones && zones.length > 0 ? { zones: zones.join(',') } : {};
    const res = await httpClient.get<ApiResponse<StaffCallResponse[]>>(`${this.baseUrl}/calls`, { params });
    return res.data.data;
  }

  async acceptCall(callId: string, userName?: string): Promise<string> {
    const headers = userName ? { 'X-User-Name': userName } : {};
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/calls/${callId}/accept`, {}, { headers });
    return res.data.data;
  }

  async resolveCall(callId: string): Promise<string> {
    const res = await httpClient.put<ApiResponse<string>>(`${this.baseUrl}/calls/${callId}/resolve`);
    return res.data.data;
  }

  // ===== KPI & Zones =====
  async getKpiToday(): Promise<ServerKpiResponse> {
    const res = await httpClient.get<ApiResponse<ServerKpiResponse>>(`${this.baseUrl}/kpi/today`);
    return res.data.data;
  }

  async getDistinctZones(): Promise<string[]> {
    const res = await httpClient.get<ApiResponse<string[]>>(`${this.tablesUrl}/zones`);
    return res.data.data;
  }
}

export const serverApiService = new ServerApiService();
