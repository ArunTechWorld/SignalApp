import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { HttpGeneralService } from './http/http-general.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  declarations: [],
  providers: [
    HttpGeneralService,
  ],
})
export class CoreModule { }
