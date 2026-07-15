import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud, SolicitudDetalle } from '../models/solicitud';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api';

  listarSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/solicitudes`);
  }

  detalle(id: string): Observable<SolicitudDetalle> {
    return this.http.get<SolicitudDetalle>(`${this.base}/solicitudes/${id}`);
  }

  decidir(id: string, decision: 'approve' | 'reject'): Observable<any> {
    return this.http.post(`${this.base}/solicitudes/${id}/decision`, { decision });
  }

  crear(clienteRef: string, texto: string): Observable<any> {
    return this.http.post(`${this.base}/solicitudes`, { clienteRef, texto });
  }

}
