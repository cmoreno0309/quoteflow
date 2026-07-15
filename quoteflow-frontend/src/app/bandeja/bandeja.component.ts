import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Solicitud } from '../models/solicitud';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bandeja',
  imports: [RouterLink],
  templateUrl: './bandeja.component.html',
  styleUrl: './bandeja.component.css',
})
export class BandejaComponent implements OnInit {
  private api = inject(ApiService);
  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.api.listarSolicitudes().subscribe({
      next: (data) => { this.solicitudes.set(data); this.cargando.set(false); },
      error: (err) => { console.error(err); this.cargando.set(false); },
    });
  }
}
