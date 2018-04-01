import { CommonModule } from '@angular/common';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CarDetailsDrawerComponent } from './car-details-drawer/car-details-drawer';
import { CarSliderCardComponent } from './car-slider-card/car-slider-card';
import { DragCarDetailsComponent } from './drag-car-details/drag-car-details';
import { ChartModule} from 'angular2-highcharts';
//import * as highcharts from 'Highcharts';

@NgModule({
  declarations: [
    CarDetailsDrawerComponent,
    CarSliderCardComponent,
    DragCarDetailsComponent,
    
  ],
  imports: [
    CommonModule,
    ChartModule.forRoot('highcharts'),
  ],
  exports: [
    CarDetailsDrawerComponent,
    DragCarDetailsComponent,
    CarSliderCardComponent,
    
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ComponentsModule { }
