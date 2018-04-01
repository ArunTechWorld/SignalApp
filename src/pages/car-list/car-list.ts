import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { MyFamilyProvider } from '../myfamily/myfamily.provider';
import { CarSettingsComponent } from './components/car-settings/car-settings';
import * as _ from 'lodash';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { lojackPhone, leftAnimationOptions, rightAnimationOptions } from '../../helper/utils';

/**
 * Generated class for the CarListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name: 'car-list',
  segment: 'car-list',
})
@Component({
  selector: 'app-page-car-list',
  templateUrl: 'car-list.html',
})
export class CarListPageComponent {
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private sharedAPIProvider: SharedAPIProvider,
    private myFamilyProvider: MyFamilyProvider,
    private nativePageTransitions: NativePageTransitions,
    private events: Events,
  ) {
    this.lojackPhone = lojackPhone;
    events.subscribe('custom-user-events', (paramsVar) => {
      console.log(paramsVar);
      this.getcarList();
    });
  }

  private carList: any[] = [];
  private loginUserobject;
  private authToken;
  private userIsAdmin = false;
  private errorMessage = '';
  private lojackPhone;

  ionViewDidLoad() {
    console.log('ionViewDidLoad CarListPage');
    const loginUserData = this.sharedAPIProvider.getUserInfo();
    if (loginUserData !== undefined) {
      this.loginUserobject = loginUserData.response.user;
      this.authToken = loginUserData.response.authToken;
      const adminRole = this.myFamilyProvider.checkAdminRole(this.loginUserobject.roles);
      this.userIsAdmin = adminRole !== undefined ? true : false;
      this.getcarList();
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave CarListPage');
    this.errorMessage = undefined;
  }

  goToHome() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
  }

  getcarList() {
    this.sharedAPIProvider.getAssets(this.authToken).then((res) => {
      this.setcarData(res);
      this.errorMessage = '';
    },                                                    (err) => {
      console.log(err);
      if (err.status !== 401) {
        this.errorMessage = this.sharedAPIProvider.getErrorMessage(err);
      } else {
        this.errorMessage = '';
      }
    });
  }

  setcarData(res) {
    const assetList = res.response.results;
    // assetList.splice(0, 1);
    // if (assetList.length === 1) {
    //   this.navCtrl.push(CarSettingsComponent, { selectedDevice: assetList[0], carCount: assetList.length });
    // } else {
    //   this.carList = assetList;
    // }
    this.carList = assetList;
  }

  checkCarName(car) {
    return car.asset.name === car.asset.vin;
  }

  carDetails(device) {
    const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(CarSettingsComponent, { selectedDevice: device });
  }

  call() {
    console.log('call lojack');
  }
}
