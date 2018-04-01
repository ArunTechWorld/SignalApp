import { NgModule } from '@angular/core';
import { NotificationRecievedComponent } from './notification-recieved/notification-recieved';
import { MaploaderComponent } from './maploader/maploader';
import { TripHistoryComponent } from './trip-history/trip-history';
import { PersonaldetailsComponent } from '../pages/myfamily/components/personaldetails/personaldetails';
import { TripdetailsComponent } from './tripdetails/tripdetails';
import { GeoZoneComponent } from './geo-zone/geo-zone';
import { PlaceIconsComponent } from './geo-zone/place-icons/place-icons';
import { PlaceSearchComponent } from './geo-zone/place-search/place-search';
import { IonicModule } from 'ionic-angular';
import { ApiStatusComponent } from './api-status/api-status';
@NgModule({
  declarations: [
    ApiStatusComponent,
  ],
  imports: [
    IonicModule,
  ],
  exports: [
    ApiStatusComponent,
  ],
})
export class CustomComponentsModule { }
