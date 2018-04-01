import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarLocationHomePageComponent } from './car-location-home';
import { AccSetupProvider } from '../account-setup/components/acc-setup-steps/acc-setup-provider';
import { ComponentsModule } from './components/components.module';
import { LojackMapProvider } from '../../providers/lojack-map/lojack-map';
import { CarLocationHomeProvider } from '../car-location-home/provider/car-location-home';
import { EsriLoaderService } from 'angular2-esri-loader';

import { LoginProvider } from '../../pages/login/login.provider';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { TripHistoryComponent } from '../../components/trip-history/trip-history';

import { CustomComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    CarLocationHomePageComponent,
    TripHistoryComponent,
  ],
  imports: [
    ComponentsModule,
    CustomComponentsModule,
    IonicPageModule.forChild(CarLocationHomePageComponent),
  ],
  providers: [
    AccSetupProvider,
    LojackMapProvider,
    CarLocationHomeProvider,
    EsriLoaderService,
    LoginProvider,
    SharedAPIProvider,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    CarLocationHomePageComponent,
    TripHistoryComponent,
  ],
})
export class CarLocationHomePageModule {}
