import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CreateOrderDto,
  OrderDto,
  OrderSummaryDto,
  OrderValidationResultDto,
} from '@webduct/shared';
import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly api = inject(ApiService);

  validate(body: CreateOrderDto): Observable<OrderValidationResultDto> {
    return this.api.post<OrderValidationResultDto>('/orders/validate', body);
  }
  create(body: CreateOrderDto): Observable<OrderDto> {
    return this.api.post<OrderDto>('/orders', body);
  }
  get(id: string): Observable<OrderDto> {
    return this.api.get<OrderDto>(`/orders/${id}`);
  }
  summary(id: string): Observable<OrderSummaryDto> {
    return this.api.get<OrderSummaryDto>(`/orders/${id}/summary`);
  }
}
