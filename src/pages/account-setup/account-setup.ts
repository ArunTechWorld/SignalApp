import { Component, ElementRef, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { AccSetupStepsComponent } from './components/acc-setup-steps/acc-setup-steps';
import { LoginComponent } from '../../pages/login/login';
import { LoginProvider } from '../../pages/login/login.provider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedProvider } from '../../providers/shared/shared';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { AccSetupProvider } from '../../pages/account-setup/components/acc-setup-steps/acc-setup-provider';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the AccountSetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'app-account-setup',
  templateUrl: 'account-setup.html',
})
export class AccountSetupComponent {
  public Carname: any;
  public res: any;
  public options: any;
  public apiUrl = 'https://dduryva5d8.execute-api.us-east-1.amazonaws.com/qa/';
  public authToken: string;
  public devicedetail: string;
  public userInfo: any;
  public Url: SafeResourceUrl;
  public iframeUrl;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loginProvider: LoginProvider,
    public http: HttpClient,
    public sharedProvider: SharedProvider,
    public accountSetupProvider: AccSetupProvider,
    public alertCtrl: AlertController,
    public sharedapiProvider: SharedAPIProvider,
    public element: ElementRef,
    public renderer: Renderer,
    public platform: Platform,
    private sanitizer: DomSanitizer,
  ) {
    this.iframeUrl = this.sharedapiProvider.getUserInfo().response.eulaUrl;
    console.log(this.iframeUrl);
    this.Url = sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
  }

  private username: string;
  private password: string;
  private error: string;
  private loading = false;
  private loginResponse: string;



  ionViewDidLoad() {
    console.log('insode acoountsetUp');
    // this.res = this.loginProvider.getUserInfo();
    // this.username = this.res.response.user.username;
    // const authToken = this.res.response.authToken;
    // //  this.Carname='Xiaopings LMU3030';
    // this.accountSetupProvider.getdevicedetails(authToken).then((res) => {
    //   this.devicedetails(res);
    // }, (err) => {
    //   // this.loginApiFailureRes(err);
    // });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    const platformHeight = this.platform.height() - 210;
    const openingSlider = this.element.nativeElement.querySelector('#termsFrame');
    console.log('openingSlider');
    console.log(openingSlider.offsetHeight);
    this.renderer.setElementStyle(openingSlider, 'height', platformHeight + 'px');
        // this.initializeSteps();
  }

  moveToPreviousPage() {
    this.navCtrl.push(LoginComponent);
  }

  start() {
    this.navCtrl.push(AccSetupStepsComponent);
  }

  devicedetails(devicedetailres) {
    this.Carname = devicedetailres.response.results[0].device.name;
  }

  termsConditionsPopUp() {
    const alert = this.alertCtrl.create({
      title: 'To use the app, please accept the terms and conditions.',
      buttons: [
        {
          text: 'Decline',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.navCtrl.setRoot(LoginComponent);
          },
        },
        {
          text: 'Accept',
          handler: () => {
            console.log('Buy clicked');
            this.acceptTnC();
          },
        },
      ],
    });
    alert.present();
  }

  accountSetupSuccess() {
    setTimeout(() => {
      this.navCtrl.setRoot(CarLocationHomePageComponent);
    },         500);
  }

  acceptTnC() {
    this.authToken = this.sharedapiProvider.getUserInfo().response.authToken;
    console.log(this.userInfo);
    this.accountSetupProvider.updateTnc(this.authToken).then((res) => {
      this.loginProvider.setUserInfo(res);
      this.accountSetupSuccess();
      console.log('response after accepting eula');
      console.log(res);
    },                                                       (err) => {
      this.sharedapiProvider.getErrorMessage(err);
    });
  }

}
