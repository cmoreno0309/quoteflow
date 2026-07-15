import { Routes } from '@angular/router';
import { BandejaComponent } from './bandeja/bandeja.component';
import { DetalleComponent } from './detalle/detalle.component';
import { CrearComponent } from './crear/crear';

export const routes: Routes = [
  { path: '', component: BandejaComponent },
  { path: 'crear', component: CrearComponent },
  { path: 'solicitud/:id', component: DetalleComponent },
];
