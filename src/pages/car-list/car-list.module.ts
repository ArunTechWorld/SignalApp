import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarListPageComponent } from './car-list';
import { CarListProvider } from './car-list.provider';
import { CarSettingsComponent } from './components/car-settings/car-settings';
import { CarNameComponent } from './components/car-name/car-name';

import { RequestServiceComponent } from './components/request-service/request-service';
import { RequestNotificationComponent } from './components/request-service/request-notification/request-notification';
import { DateCustomChooserComponent } from './components/request-service/date-custom-chooser/date-custom-chooser';
import { TimeCustomChooserComponent } from './components/request-service/time-custom-chooser/time-custom-chooser';
import { SpeedSettingsComponent } from './components/speed-settings/speed-settings';

import { CustomComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    CarListPageComponent,
    CarSettingsComponent,
    CarNameComponent,
    RequestServiceComponent,
    DateCustomChooserComponent,
    TimeCustomChooserComponent,
    RequestNotificationComponent,
    SpeedSettingsComponent,
  ],
  imports: [
    IonicPageModule.forChild(CarListPageComponent),
    CustomComponentsModule,
  ],
  providers: [
    CarListProvider,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    CarListPageComponent,
    CarSettingsComponent,
    CarNameComponent,
    RequestServiceComponent,
    DateCustomChooserComponent,
    TimeCustomChooserComponent,
    RequestNotificationComponent,
    SpeedSettingsComponent
  ],
})
export class CarListPageModule {}
