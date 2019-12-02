import { Routes, RouterModule } from '@angular/router';
import { LoginGuardGuard } from '../services/gards/login-guard.guard';

import { PagesComponent } from './pages.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AjustesComponent } from './ajustes.component';
import { NuevoPacienteComponent } from './nuevo-paciente/nuevo-paciente.component';
import { ProfileComponent } from './profile/profile.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { MedicosComponent } from './medicos/medicos.component';

import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { PacienteComponent } from './paciente/paciente.component';


const pagesRoutes: Routes = [
    {
        'path': '',
        component: PagesComponent,
        canActivate: [ LoginGuardGuard ],
        children: [
          {'path': 'calendario/:dia/:mes/:year', component: CalendarComponent, data: { titulo: 'Calendario' } },
          {'path': 'pacientes', component: UsuariosComponent, data: { titulo: 'Mantenimiento de pacientes' } },
          {'path': 'paciente/:id', component: PacienteComponent, data: { titulo: 'Perfil de paciente' } },
          {'path': 'nuevopaciente', component: NuevoPacienteComponent, data: { titulo: 'Nuevo paciente' }},
          {'path': 'ajustes', component: AjustesComponent, data: { titulo: 'Ajustes' }},
          {'path': 'perfil/:id', component: ProfileComponent, data: { titulo: 'Perfil de Usuario' }},
          {'path': 'medicos', component: MedicosComponent, data: { titulo: 'Mantenimiento empleado' }},
          {'path': 'whatsapp', component: WhatsappComponent, data: { titulo: 'Recordar citas' }},
          {'path': '', pathMatch: 'full', redirectTo: 'calendario/undefined/undefined/undefined' }
        ]
      },
];
// forChild se usa cuando son rutas dentro de otras rutas
export const PAGES_ROUTES = RouterModule.forChild( pagesRoutes );

