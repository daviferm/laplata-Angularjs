import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Pendiente de revisar
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Formulários
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Rutas
import { PAGES_ROUTES } from './pages.routes';

import { SharedModule } from '../shared/shared.module';

import { PagesComponent } from './pages.component';
import { CalendarComponent } from './calendar/calendar.component';
import { SemanaComponent } from './calendar/semana/semana.component';
import { MesComponent } from './calendar/mes/mes.component';
import { DiaComponent } from './calendar/dia/dia.component';
import { AjustesComponent } from './ajustes.component';
import { NuevoPacienteComponent } from './nuevo-paciente/nuevo-paciente.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProfileComponent } from './profile/profile.component';
import { ModalUploadComponent } from '../components/modal-upload/modal-upload.component';
import { EditUsuarioComponent } from '../components/edit-usuario/edit-usuario.component';
import { CambiarPasswordComponent } from '../components/cambiar-password/cambiar-password.component';
import { MedicosComponent } from './medicos/medicos.component';
import { NuevaCitaComponent } from '../components/nueva-cita/nueva-cita.component';

// Pipes Modulo
import { PipesModule } from '../pipes/pipes.module';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { PacienteComponent } from './paciente/paciente.component';

// Angular Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE } from '@angular/material';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
    declarations: [
        PagesComponent,
        CalendarComponent,
        SemanaComponent,
        MesComponent,
        DiaComponent,
        AjustesComponent,
        NuevoPacienteComponent,
        UsuariosComponent,
        ProfileComponent,
        ModalUploadComponent,
        EditUsuarioComponent,
        CambiarPasswordComponent,
        MedicosComponent,
        NuevaCitaComponent,
        WhatsappComponent,
        PacienteComponent
    ],
    exports: [],
    imports: [
        SharedModule,
        PAGES_ROUTES,
        CommonModule,
        BrowserAnimationsModule,
        PipesModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        DragDropModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule
    ],
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'es-SP'},
    ]
})


export class PagesModule {}