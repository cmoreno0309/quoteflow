import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-crear',
  imports: [FormsModule, RouterLink],
  templateUrl: './crear.html',
  styleUrl: './crear.css',
})
export class CrearComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  clienteRef = signal('');
  texto = signal('');
  enviando = signal(false);
  error = signal('');

  enviar() {
    if (!this.clienteRef().trim() || !this.texto().trim()) {
      this.error.set('Completa el cliente y el mensaje.');
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.api.crear(this.clienteRef(), this.texto()).subscribe({
      next: (res) => {
        this.enviando.set(false);
        // al crear, vamos directo al detalle de la nueva solicitud
        this.router.navigate(['/solicitud', res.id]);
      },
      error: (e) => {
        console.error(e);
        this.enviando.set(false);
        this.error.set('No se pudo crear la solicitud.');
      },
    });
  }
}
