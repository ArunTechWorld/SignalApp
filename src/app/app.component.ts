import { Component, ViewChild, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Nav, Platform, MenuController , Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginComponent } from '../pages/login/login';
import { AccountSetupComponent } from '../pages/account-setup/account-setup';
import { NotificationPage } from '../pages/notification/notification';
import { MyfamilyPageComponent } from '../pages/myfamily/myfamily';
import { SharedAPIProvider } from '../providers/shared/sharedAPI';
import { MyprofilePage } from '../pages/myprofile/myprofile';
import { CarListPageComponent } from '../pages/car-list/car-list';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { LoginProvider } from '../pages/login/login.provider';
import { PasswordVerificationComponent } from '../pages/myprofile/password-verification/password-verification';
import { CollisionSupportPage } from '../pages/collision-support/collision-support';
import { TripwireBreachPage } from '../pages/tripwire-breach/tripwire-breach';
import { SharedProvider } from '../providers/shared/shared';
import { ChangepasswordPage } from '../pages/changepassword/changepassword';
import { Deeplinks } from '@ionic-native/deeplinks';
import { EmergencySupportPage } from '../pages/emergency-support/emergency-support';
import { AboutSuredrivePage } from '../pages/about-suredrive/about-suredrive';
import { Network } from '@ionic-native/network';
import { ForgotPasswordComponent } from '../pages/login/forgot-password/forgot-password';
import { MapLoaderProvider } from '../providers/map-loader/map-loader';
import { CarSettingsComponent } from '../pages/car-list/components/car-settings/car-settings';

@Component({
  templateUrl: 'app.html',
})
export class LojackAppComponent {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginComponent;
  onSuccess: any;
  onError: any;

  menuOptions: Array<{ title: string, class: any, component: any , state: boolean}>;

  public selectedMenu = '';
  public networkError = this.sharedProvider.networkStatus;
  public deviceError = false;
  public isInitialLoading = this.sharedProvider.isInitialLoading;
  constructor(public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public menuCtrl: MenuController,
              public sharedAPIProvider: SharedAPIProvider,
              private nativePageTransitions: NativePageTransitions,
              private loginProvider: LoginProvider,
              public events: Events,
              public sharedProvider: SharedProvider,
              private deeplinks: Deeplinks,
              private network: Network,
              private _ngZone: NgZone,
              private mapLoaderProvider: MapLoaderProvider,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.deeplinks.route({
        '/changepassword': { 'ChangePasswordPage': true }
      }).subscribe((match) => {
        this.nav.push(ChangepasswordPage,{match});
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
      },           (nomatch) => {
     //   this.nav.push(ForgotPasswordComponent);

      });
    });

    this.initializeApp();
    // used for an example of ngFor and navigation
    this.menuOptions = [
        { title: 'Profile', class: 'my-profile', component: MyprofilePage, state: true },
      { title: 'Car Settings', class: 'car-settings', component: CarListPageComponent, state: true },
      { title: 'People', class: 'my-family', component: MyfamilyPageComponent, state: true },
       { title: 'About SureDrive™', class: 'about-suredrive', component: AboutSuredrivePage, state: true },
    //  { title: 'Collision Support', class: 'my-family', component: CollisionSupportPage, state: true },
     // { title: 'TripWire-Breach Support', class: 'my-family', component: TripwireBreachPage, state: true },
    ];
    this.menuCtrl.swipeEnable(false, 'lojackMenu');
    events.subscribe('user:logout', () => {
      this.logout();
    });
    events.subscribe('user:relogin', () => {
      this.sharedProvider.hideBusyIndicator();
      this.mapLoaderProvider.hideMapLoader();
      this.relogin();
    });
  }
  private userName = '';

  menuOpened() {
    const userInfo =  this.sharedAPIProvider.getUserInfo();
    this.userName = (userInfo) ? userInfo.response.user.firstName + ' ' + userInfo.response.user.lastName : '';
  }
// let userInfo = this.sharedAPIProvider.getUserInfo();
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.menuCtrl.enable(false, 'lojackMenu');
   // this.pregfillUserInfo();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleDefault();

      // this.splashScreen.hide();

      /******** Checking Network Connection Start *********/
      if (this.network.type === 'none') {
        this.setNetworkInfo(true);
      }

      const disconnectSubscription = this.network.onDisconnect().subscribe((x) => {
        // console.log(x.type);
        this._ngZone.run(() => {
          this.setNetworkInfo(true);
        });
      });

      const connectSubscription = this.network.onConnect().subscribe((x) => {
        // console.log(x.type);
        this._ngZone.run(() => {
          this.setNetworkInfo(false);
        });
      });

      /* const changeSubscription = this.network.onchange().subscribe((x) => {
        this._ngZone.run(() => {
          if (x.type === 'none' || x.type === 'offline' || x.type === 'unknown') {
            this.setNetworkInfo(true);
          } else {
            this.setNetworkInfo(false);
          }
        });
      }); */
      /******** Checking Network Connection End *********/
    });
  }

  setNetworkInfo(status) {
    this.isInitialLoading = this.sharedProvider.isInitialLoading;
    this.sharedProvider.networkStatus = status;
    this.networkError = this.sharedProvider.networkStatus;
    this.events.publish('network:change', status);
  }

  openPage(page, event) {

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    const options: NativeTransitionOptions = {
      direction: 'left',
      duration: 300,
      iosdelay: 200,
      androiddelay: 150,
    };
    if (page.state) {
      this.selectedMenu = page.title;
      setTimeout(() => {
        this.menuCtrl.close('lojackMenu');
        this.selectedMenu = '';
        this.nativePageTransitions.slide(options);
        switch (page.title) {
          case 'Car Settings': this.carSettings(page);
            break;
          default: this.nav.push(page.component);
            break;
        }

      },         500);
    } else {
      this.menuCtrl.close('lojackMenu');
    }
  }

  carSettings(page) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedAPIProvider.getDeviceDetails(authToken).then((deviceDetails: any) => {
      const assetList = deviceDetails.response.results;
      /*if (assetList.length > 1) {
        assetList.splice(0, 1);
      }*/
      if (assetList.length === 1) {
        this.nav.push(CarSettingsComponent , { selectedDevice: assetList[0], carCount: assetList.length });
      } else {
        this.nav.push(page.component);
      }
    });
  }
  logout() {
    this.sharedProvider.hideBusyIndicator();
    this.mapLoaderProvider.hideMapLoader();
    this.menuCtrl.close('lojackMenu');
    this.sharedProvider.updateStatusBar('login');
    this.menuCtrl.swipeEnable(false, 'lojackMenu');
    this.nav.setRoot(LoginComponent);
  }
  signOut() {
    this.loginProvider.logOut();
  }
  openEmergencySupport() {
    this.menuCtrl.close('lojackMenu');
    console.log('openeing emergency-support');
    this.nav.push(EmergencySupportPage);

  }
  relogin() {
    this.sharedProvider.hideBusyIndicator();
    this.mapLoaderProvider.hideMapLoader();
    this.menuCtrl.close('lojackMenu');
    this.sharedProvider.updateStatusBar('login');
    this.nav.setRoot(LoginComponent);
  }

}
