import { NgModule } from '@angular/core';
import { ImagenPipe } from './imagen.pipe';
import { IdPipe } from './id.pipe';
import { DatePipe } from './date.pipe';
import { FechaPipe } from './fecha.pipe';



@NgModule({
  imports: [ ],
  declarations: [
    ImagenPipe,
    IdPipe,
    DatePipe,
    FechaPipe
  ],
  exports: [
    ImagenPipe,
    IdPipe,
    DatePipe,
    FechaPipe
  ]
})
export class PipesModule { }
