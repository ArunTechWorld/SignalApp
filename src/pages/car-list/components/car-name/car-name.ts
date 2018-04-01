import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { CarListProvider } from '../../car-list.provider';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import * as _ from 'lodash';
import { rightAnimationOptions } from '../../../../helper/utils';

/**
 * Generated class for the CarNameComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-car-name',
  templateUrl: 'car-name.html',
})
export class CarNameComponent {
  @ViewChild('carName') carName;
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private sharedAPIProvider: SharedAPIProvider,
    private carListProvider: CarListProvider,
    private events: Events,
    private nativePageTransitions: NativePageTransitions) {
    console.log('Hello CarNameComponent Component');
    this.selectedDevice = navParams.get('selectedDevice');
    if (this.checkCarName()) {
      this.assetName = _.clone(this.selectedDevice.asset.name);
      this.isValidName = true;
    }
    this.getPlaceHolder();
  }

  private selectedDevice;
  private assetName = '';
  private placeHolder = '';
  private isValidName = false;
  private errorMessage = '';

  ionViewDidLoad() {
    this.inputFocus();
  }

  ionViewDidLeave() {
    this.assetName = undefined;
    this.placeHolder = undefined;
    this.isValidName = false;
    this.errorMessage = undefined;
  }

  inputFocus() {
    setTimeout(() => {
      this.carName.setFocus();
    },         150);
  }

  checkCarName() {
    return this.selectedDevice.asset.name !== '';
  }

  getPlaceHolder() {
    // console.log(this.checkCarName());
    if (this.selectedDevice.asset.name !== '') {
      this.placeHolder = _.clone(this.selectedDevice.asset.name);
    } else {
      this.placeHolder = this.selectedDevice.asset.year + ' ' + this.selectedDevice.asset.make + ' ' + this.selectedDevice.asset.model;
    }
  }

  moveToPreviousPage() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
  }

  showRemoveIcon(event) {
    if (this.assetName !== '') {
      this.isValidName = true;
      this.errorMessage = '';
    } else {
      this.isValidName = false;
      this.errorMessage = 'Please enter car name';
    }
    this.getPlaceHolder();
  }

  hideRemoveIcon() {
    this.isValidName = false;
    this.assetName = '';
    this.errorMessage = 'Please enter car name';
    this.inputFocus();
    this.getPlaceHolder();
    if (!this.checkCarName()) {
      this.selectedDevice.asset.name = this.selectedDevice.asset.vin;
    }
  }

  saveCarName() {
    if (this.assetName !== '' && this.assetName !== this.selectedDevice.asset.name) {
      this.selectedDevice.asset.name = this.assetName;
      console.log(this.selectedDevice.asset);
      this.carListProvider.updateAsset(this.selectedDevice.asset).then((res: any) => {
        this.selectedDevice = res.response.results[0];
        this.carNameUpdated();
      },                                                               (err) => {
        this.handleError(err);
      });
    }
  }

  carNameUpdated() {
    this.navCtrl.pop().then(() => {
      // Trigger custom event and pass data to be send back
      this.events.publish('custom-user-events', { selectedDevice: this.selectedDevice });
      this.events.publish('assets:refesh', { selectedAsset: this.selectedDevice });
    });
  }

  handleError = (response) => {
    if (response.status !== 401) {
      this.errorMessage = this.sharedAPIProvider.getErrorMessage(response);
    } else {
      this.errorMessage = '';
    }
  }

}
