import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CrewDto,
  CustomFieldDefDto,
  JobDto,
  UserDto,
  UserGroupDto,
} from '@webduct/shared';
import { ApiService } from '../api/api.service';

export interface ShippingOptionDto {
  value: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly api = inject(ApiService);

  jobs(): Observable<JobDto[]> {
    return this.api.get<JobDto[]>('/jobs');
  }
  users(role?: string): Observable<UserDto[]> {
    return this.api.get<UserDto[]>('/users', { role });
  }
  userGroups(): Observable<UserGroupDto[]> {
    return this.api.get<UserGroupDto[]>('/user-groups');
  }
  crews(): Observable<CrewDto[]> {
    return this.api.get<CrewDto[]>('/crews');
  }
  shippingOptions(): Observable<ShippingOptionDto[]> {
    return this.api.get<ShippingOptionDto[]>('/shipping-options');
  }
  customFields(scope = 'ORDER'): Observable<CustomFieldDefDto[]> {
    return this.api.get<CustomFieldDefDto[]>('/custom-fields', { scope });
  }
}
