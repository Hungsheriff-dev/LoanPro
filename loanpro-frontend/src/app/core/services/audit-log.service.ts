import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private baseUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<AuditLog[]>(this.baseUrl);
  }

  getByEntity(entity: string, entityId: string) {
    return this.http.get<AuditLog[]>(
      `${this.baseUrl}/entity/${entity}/${entityId}`,
    );
  }

  getByUser(userId: string) {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/user/${userId}`);
  }
}