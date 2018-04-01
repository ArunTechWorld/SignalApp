import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { CoreModule } from './core/core.module';

import { LojackAppComponent } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PersonaldetailsComponent } from '../pages/myfamily/components/personaldetails/personaldetails';
import { LoginPageModule } from '../pages/login/login.module';
import { AccountSetupModule } from '../pages/account-setup/account-setup.module';
import { MyfamilyPageModule } from '../pages/myfamily/myfamily.module';
import { MyprofilePageModule } from '../pages/myprofile/myprofile.module';
import { AddPersonComponent } from '../pages/myfamily/components/addperson/addperson';
import { CarListPageModule } from '../pages/car-list/car-list.module';
import { LoginProvider } from '../pages/login/login.provider';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';

import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AccSetupStepsComponent } from '../pages/account-setup/components/acc-setup-steps/acc-setup-steps';
import { SharedProvider } from '../providers/shared/shared';
import { Network } from '@ionic-native/network';

import { CarLocationHomePageModule } from '../pages/car-location-home/car-location-home.module';

import { NotificationPageModule } from '../pages/notification/notification.module';
import { NotificationPage } from '../pages/notification/notification';
import { PushNotificationsProvider } from '../providers/push-notifications/push-notifications';
import { NotificationRecievedComponent } from '../components/notification-recieved/notification-recieved';
import { MapLoaderProvider } from '../providers/map-loader/map-loader';
import { MaploaderComponent } from '../components/maploader/maploader';
import { LojackMapProvider } from '../providers/lojack-map/lojack-map';
import { ChartModule } from 'angular2-highcharts';
import * as Highcharts from 'highcharts';
import { MyprofilePage } from '../pages/myprofile/myprofile';
import { TooltipAlertComponent } from '../pages/car-location-home/components/tooltip-alert/tooltip-alert';
import { CollisionSupportPage } from '../pages/collision-support/collision-support';
import { CollisionSupportPageModule } from '../pages/collision-support/collision-support.module';

import { Push } from '@ionic-native/push';
import { Pro } from '@ionic/pro';
import { TripwireBreachPage } from '../pages/tripwire-breach/tripwire-breach';
import { TripwireBreachPageModule } from '../pages/tripwire-breach/tripwire-breach.module';
import { CollisionImpactTooltipComponent } from '../pages/collision-support/collision-impact-tooltip/collision-impact-tooltip';

// These are the imports required for the code below,
// feel free to merge into existing imports.


import { GeoZoneComponent } from '../components/geo-zone/geo-zone';
import { PlaceIconsComponent } from '../components/geo-zone/place-icons/place-icons';
import { PlaceSearchComponent } from '../components/geo-zone/place-search/place-search';
import { TermsAndConditionsComponent } from '../pages/about-suredrive/terms-and-conditions/terms-and-conditions';
import { StorageProvider } from '../providers/storage/storage';

import { SpinnerComponent } from '../components/spinner/spinner';

const IonicPro = Pro.init('7f13ee17', {
  appVersion: '0.0.1',
});

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure 
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    IonicPro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}
// your interceptor file
import { MyHttpLogInterceptor } from './http.interceptor';

import { SharedAPIProvider } from '../providers/shared/sharedAPI';
import { PasswordVerificationComponent } from '../pages/myprofile/password-verification/password-verification';
import { TripdetailsComponent } from '../components/tripdetails/tripdetails';
import { CollisionDetailsComponent } from '../pages/collision-support/collision-details/collision-details';

import { ApiStatusProvider } from '../components/api-status/api-status.provider';
import { ChangepasswordPageModule } from '../pages/changepassword/changepassword.module';
import { EmergencySupportPage } from '../pages/emergency-support/emergency-support';

import { Deeplinks } from '@ionic-native/deeplinks';
import { AboutSuredrivePage } from '../pages/about-suredrive/about-suredrive';
import { DateTimeProvider } from '../providers/date-time/date-time';


@NgModule({
  declarations: [
    LojackAppComponent,
    HomePage,
    AccSetupStepsComponent,
    AddPersonComponent,
    PasswordVerificationComponent,
    PersonaldetailsComponent,
    NotificationPage,
    NotificationRecievedComponent,
    MaploaderComponent,
    TripdetailsComponent,
    MyprofilePage,
    TooltipAlertComponent,
    GeoZoneComponent,
    PlaceIconsComponent,
    PlaceSearchComponent,
    CollisionDetailsComponent,
    CollisionImpactTooltipComponent,
    EmergencySupportPage,
    AboutSuredrivePage,
    TermsAndConditionsComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    LoginPageModule,
    AccountSetupModule,
    MyfamilyPageModule,
    MyprofilePageModule,
    CarListPageModule,
    HttpClientModule,
    CoreModule,
    CarLocationHomePageModule,
    CollisionSupportPageModule,
    TripwireBreachPageModule,
    ChangepasswordPageModule,
    ChartModule.forRoot(Highcharts),
    // IonicModule.forRoot(LojackAppComponent),
    IonicModule.forRoot(LojackAppComponent, {
      animate: false,
      platforms: {
        ios: {
          statusbarPadding: true,
        },
      },
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [IonicApp],
  entryComponents: [
    LojackAppComponent,
    HomePage,
    AccSetupStepsComponent,
    AddPersonComponent,
    PersonaldetailsComponent,
    NotificationPage,
    NotificationRecievedComponent,
    MaploaderComponent,
    PasswordVerificationComponent,
    TripdetailsComponent,
    TooltipAlertComponent,
   // TripwireBreachPage,
    GeoZoneComponent,
    PlaceIconsComponent,
    PlaceSearchComponent,
    CollisionDetailsComponent,
    CollisionImpactTooltipComponent,
    EmergencySupportPage,
    AboutSuredrivePage,
    TermsAndConditionsComponent,
    SpinnerComponent,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    IonicErrorHandler,
    { provide: HTTP_INTERCEPTORS, useClass: MyHttpLogInterceptor , multi: true},
    { provide: ErrorHandler, useClass: MyErrorHandler },
    LoginProvider,
    SharedProvider,
    PushNotificationsProvider,
    MapLoaderProvider,
    LojackMapProvider,
    SharedAPIProvider,
    ApiStatusProvider,
    NativePageTransitions,
    Push,
    Deeplinks,
    StorageProvider,
    DateTimeProvider,
  ],
})
export class AppModule { }
