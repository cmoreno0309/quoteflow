import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SolicitudDetalle } from '../models/solicitud';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class DetalleComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  detalle = signal<SolicitudDetalle | null>(null);
  cargando = signal(true);
  procesando = signal(false);
  private id = '';

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.detalle(this.id).subscribe({
      next: (d) => { this.detalle.set(d); this.cargando.set(false); },
      error: (e) => { console.error(e); this.cargando.set(false); },
    });
  }

  decidir(decision: 'approve' | 'reject') {
    this.procesando.set(true);
    this.api.decidir(this.id, decision).subscribe({
      next: () => { this.procesando.set(false); this.cargar(); },
      error: (e) => { console.error(e); this.procesando.set(false); },
    });
  }
}
