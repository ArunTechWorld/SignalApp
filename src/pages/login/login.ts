import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { AccSetupStepsComponent } from '../../pages/account-setup/components/acc-setup-steps/acc-setup-steps';
import { focusinput } from '../../providers/shared/focus.directive';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import { MapLoaderProvider } from '../../providers/map-loader/map-loader';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { AccSetupProvider } from '../../pages/account-setup/components/acc-setup-steps/acc-setup-provider';
import { SharedProvider } from '../../providers/shared/shared';
import { ForgotPasswordComponent } from '../login/forgot-password/forgot-password';
import { AccountSetupComponent } from '../../pages/account-setup/account-setup';
import { GeoZoneComponent } from '../../components/geo-zone/geo-zone';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ENV } from '../../environments/environment';
import { Network } from '@ionic-native/network';
import { StorageProvider } from '../../providers/storage/storage';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { LoginProvider } from './login.provider';
@IonicPage()
@Component({
  selector: 'app-login',
  templateUrl: 'login.html',
})
export class LoginComponent {
  isValidEmail = false;
  public userInput = { email: '', password: '' };
  public errorMessage;
  public errorMessageInput = false;
  public firstTimeLogin = false;
  public passwordType = 'password';
  @ViewChild('userName') userName;
  constructor(public navCtrl: NavController, public loginProvider: LoginProvider,
              public mapLoaderProvider: MapLoaderProvider,
              public sharedAPIProvider: SharedAPIProvider,
              public accSetupProvider: AccSetupProvider,
              public sharedProvider: SharedProvider,
              public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public network: Network,
              public alertCtrl: AlertController,
              public storageProvider: StorageProvider,
            ) {

    this.initializeApp();
  }

  private loadingSuccess = false;
  private animateClass = 0;
  private isRequiredToShowSpinner = false;
  showPassword() {
    this.passwordType = (this.passwordType === 'text') ? this.passwordType = 'password' : this.passwordType = 'text';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    // this.userName.setFocus();
    // let temp =localStorage.getItem('loginInfo');
    // if(temp){
    //   this.userInput = JSON.parse(temp);
    //  this.signIn();
    //   // this.navCtrl.push(GeoZoneComponent);
    // }
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      console.log('is App false');
    } else {
      console.log('is App true');
    }
    if (ENV.isWebBuild) {
      this.animateLoadingScreen();
    }
  }

  animateLoadingScreen() {
    this.animateClass = 1;
    const storedCredentials = this.storageProvider.get('loginInfo'); // localStorage.getItem('loginInfo');
    console.log('storedCredentials');
    console.log(storedCredentials);
    if (storedCredentials) {
      this.userInput = JSON.parse(storedCredentials);
      this.signIn(0);
    } else {
      this.animateClass = 2;
      this.loadingSuccess = true;
    }
    // setTimeout(() => {
    //      document.getElementById('secondPin').style.bottom = '100px';
    //     document.getElementById('secondPin').style.transitionDuration = '.5s';
    // }, 100);
    this.animateMarkerPins(0);
  }
  animateMarkerPins(id) {
    const fisrtPin: any = (document.getElementById('fisrtPin')) ? document.getElementById('fisrtPin') : '';
    const secondPin: any = (document.getElementById('secondPin')) ? document.getElementById('secondPin') : '';
    const thirdPin: any = (document.getElementById('thirdPin')) ? document.getElementById('thirdPin') : '';
    setTimeout(() => {
      if (thirdPin) { thirdPin.style.display = 'inline-block'; }
      setTimeout(() => {
        // document.getElementById('myProgress').style.bottom = '560px';
        if (thirdPin) {
          thirdPin.style.marginTop = '20px';
          thirdPin.style.transitionDuration = '.5s';
        }
      }, 100);
      setTimeout(() => {
        if (secondPin) {
          secondPin.style.display = 'inline-block';
        }
        // document.getElementById('myProgress').style.bottom = '549px';
        setTimeout(() => {
          if (secondPin) {
            secondPin.style.marginTop = '30px';
            secondPin.style.transitionDuration = '.5s';
          }
        }, 100);
        setTimeout(() => {
          if (fisrtPin) {
            fisrtPin.style.display = 'inline-block';
            setTimeout(() => {
              fisrtPin.style.marginTop = '15px';
              fisrtPin.style.transitionDuration = '.5s';
              if (id === 0) { this.animateClass = 2; }
            }, 100);
          }
        }, 1500);
      }, 1000);
    }, 500);
  }

  initializeApp() {
    console.log('in login page initializeApp');
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // this.lojackAppComponent.initialLoading = false;
      console.log('in login page platform ready');
      this.splashScreen.hide();
      this.storageProvider.init();
      setTimeout(() => {
        console.log('in login page platform verifyNetwork');
        this.verifyNetwork();
      },         2000);
    });
  }

  verifyNetwork() {
    if (this.network.type === 'none') {
      console.log('in login page platform no network');
      this.animateClass = 1;
      this.animateMarkerPins(1);
      this.showNetworkError();
    } else {
      console.log('in login page platform if network');
      this.sharedProvider.isInitialLoading = false;
      this.animateLoadingScreen();
      //  this.lojackAppComponent.initialLoading = false;
      console.log('login screen');
    }
  }
  showNetworkError() {
    const alert = this.alertCtrl.create({
      title: '',
      message: 'We had an issue connecting to our network.',
      cssClass: 'initial-network-alert',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Retry',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
            this.verifyNetwork();
          },
        },
      ],
    });
    alert.present();
  }

  move() {
    // var elem = document.getElementById("myBar");
    // var width = 1;
    // var id = setInterval(frame, 100);
    // function frame() {
    // if (width >= 100) {
    //   clearInterval(id);
    // } else {
    //   width++;
    //   elem.style.width = width + '%';
    // }
    // }
  }

  signIn(id) {
    this.errorMessageInput = false;
    this.validateForm('email');
    const requestObj = {
      username: this.userInput.email,
      password: this.userInput.password,
      useAuthToken: true,
    };
    // apiuser Sure@123
    this.isRequiredToShowSpinner = (id === 0) ? false : true;
    if (this.isRequiredToShowSpinner) { this.sharedProvider.showBusyIndicator(); }
    this.loginProvider.login(requestObj).then((res) => {
      this.loginApiSuccessRes(res);

    },                                        (err) => {

      this.loginApiFailureRes(err);
    });
  }

  loginApiSuccessRes(response) {
    this.errorMessage = '';
    this.loadDeviceDetails(response);
    this.loginProvider.setUserInfo(response);
    this.sharedAPIProvider.setUserInfo(response);
    // localStorage.setItem('loginInfo', JSON.stringify(this.userInput));
    this.storageProvider.set('loginInfo', this.userInput);
    let requestBody = {
      "login":true
    }
    this.loginProvider.enableAlerts(requestBody).then((res)=>{
      console.log(res)
    },(err)=>{
      console.log(err);
    });
  }

  loadDeviceDetails(response) {
    // this.sharedProvider.showBusyIndicator();
    this.sharedAPIProvider.getDeviceDetails(response.response.authToken).then((deviceDetails) => {
      this.accSetupProvider.setDeviceDetails(deviceDetails);
      this.sharedAPIProvider.setDeviceDetails(deviceDetails);
      this.navigateToNextPage(response);
    },                                                                        (err) => {
      this.navigateToNextPage(response);
    });
  }

  navigateToNextPage(response) {
    this.sharedProvider.hideBusyIndicator();
    if (response.response.user.passwordUpdated === true && response.response.user.eulaAccepted === true) {
      this.navCtrl.setRoot(CarLocationHomePageComponent);
      // this.navCtrl.push(AccSetupStepsComponent);
    } else if (response.response.user.passwordUpdated === true && response.response.user.eulaAccepted === false) {
      this.navCtrl.push(AccountSetupComponent);

    } else {
      this.navCtrl.push(AccSetupStepsComponent);
    }
  }

  loginApiFailureRes(response) {
    this.sharedProvider.hideBusyIndicator();
    this.errorMessageInput = true;
    this.animateClass = 2;
    this.loadingSuccess = true;
    switch (response.status) {
      case 401: this.errorMessage = 'Incorrect username or password'; // response.error.response.errors[0];
        break;
      default: this.errorMessage = 'Server is not responding, please try again'; break;
    }
  }

  validateForm(field:  string,  event ?:  any) {
    this.errorMessageInput =  false;
    this.errorMessage =  '';
    const emailPattern =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    switch (field) {
      case 'email':
        const  newVal  = (event)  ?  event.target.value  : this.userInput.email;
        this.isValidEmail  = emailPattern.test(newVal);
        break;
      case  'emailError':
        const  newVal1  =  (event)  ?  event.target.value  :  this.userInput.email;
        this.errorMessage  =  (newVal1  &&  !emailPattern.test(newVal1))  ?  'Incorrect email format'  :  '';
        break;
      default:  break;
    }
  }

  forgotpassword() {
    this.navCtrl.setRoot(ForgotPasswordComponent);
  }

}
