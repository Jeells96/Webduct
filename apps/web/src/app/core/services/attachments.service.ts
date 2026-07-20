import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { AttachmentDto } from '@webduct/shared';
import { API_BASE_URL } from '../api/api.config';

@Injectable({ providedIn: 'root' })
export class AttachmentsService {
  private readonly http = inject(HttpClient);

  upload(file: File, note?: string): Observable<AttachmentDto> {
    const form = new FormData();
    form.append('file', file);
    if (note) {
      form.append('note', note);
    }
    return this.http.post<AttachmentDto>(`${API_BASE_URL}/attachments`, form);
  }

  remove(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${API_BASE_URL}/attachments/${id}`);
  }
}
