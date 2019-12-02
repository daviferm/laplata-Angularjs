import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { ModalUploadService } from '../components/modal-upload/modal-upload.service';

import {
  AjustesService,
  SidebarService,
  SharedService,
  EmpleadosService,
  GetDateService,
  UsuarioService } from './service.index';
// import { UsuarioService } from './usuario/usuario.service';
import { CitasService } from 'src/app/services/citas/citas.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    AjustesService,
    SidebarService,
    SharedService,
    EmpleadosService,
    GetDateService,
    UsuarioService,
    ModalUploadService,
    CitasService
  ]
})
export class ServicesModule { }
